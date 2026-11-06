//! Password hashing compatible with bcryptjs, and CryptoJS AES passphrase mode.

use base64::{engine::general_purpose::STANDARD, Engine};
use cipher::{block_padding::Pkcs7, BlockDecryptMut, BlockEncryptMut, KeyIvInit};
use hmac::{Hmac, Mac};
use md5::{Digest, Md5};
use sha2::Sha256;

type Aes256CbcEnc = cbc::Encryptor<aes::Aes256>;
type Aes256CbcDec = cbc::Decryptor<aes::Aes256>;

/// Hash a password the way `bcryptjs.genSalt` + `hash` does (cost 10).
///
/// # Errors
/// Returns an error when the bcrypt implementation rejects the input.
pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    bcrypt::hash(password, 10)
}

/// Compare a password with a bcryptjs hash (`$2a$` or `$2b$`).
///
/// # Errors
/// Returns an error when the hash is malformed.
pub fn verify_password(password: &str, hash: &str) -> Result<bool, bcrypt::BcryptError> {
    bcrypt::verify(password, hash)
}

/// Encrypt with CryptoJS `AES.encrypt(clear, key).toString()` (OpenSSL salted format).
#[must_use]
pub fn encrypt_cryptojs(clear: &str, passphrase: &str) -> String {
    let mut salt = [0u8; 8];
    rand::RngCore::fill_bytes(&mut rand::thread_rng(), &mut salt);
    let (key, iv) = evp_bytes_to_key(passphrase.as_bytes(), &salt);
    let encrypted = Aes256CbcEnc::new_from_slices(&key, &iv)
        .expect("aes-256 key and iv lengths")
        .encrypt_padded_vec_mut::<Pkcs7>(clear.as_bytes());
    let mut out = b"Salted__".to_vec();
    out.extend_from_slice(&salt);
    out.extend_from_slice(&encrypted);
    STANDARD.encode(out)
}

/// Decrypt a CryptoJS AES string. Returns an empty string when the payload is invalid,
/// matching CryptoJS's empty-string result on failure.
#[must_use]
pub fn decrypt_cryptojs(encrypted: &str, passphrase: &str) -> String {
    let Ok(bytes) = STANDARD.decode(encrypted) else {
        return String::new();
    };
    if bytes.len() < 16 || &bytes[..8] != b"Salted__" {
        return String::new();
    }
    let salt = &bytes[8..16];
    let (key, iv) = evp_bytes_to_key(passphrase.as_bytes(), salt);
    Aes256CbcDec::new_from_slices(&key, &iv)
        .expect("aes-256 key and iv lengths")
        .decrypt_padded_vec_mut::<Pkcs7>(&bytes[16..])
        .ok()
        .and_then(|plain| String::from_utf8(plain).ok())
        .unwrap_or_default()
}

fn evp_bytes_to_key(password: &[u8], salt: &[u8]) -> ([u8; 32], [u8; 16]) {
    let mut derived = Vec::with_capacity(48);
    let mut previous = Vec::new();
    while derived.len() < 48 {
        let mut hasher = Md5::new();
        hasher.update(&previous);
        hasher.update(password);
        hasher.update(salt);
        previous = hasher.finalize().to_vec();
        derived.extend_from_slice(&previous);
    }
    let mut key = [0u8; 32];
    let mut iv = [0u8; 16];
    key.copy_from_slice(&derived[..32]);
    iv.copy_from_slice(&derived[32..48]);
    (key, iv)
}

/// `cookie-signature` HMAC, returned as `{value}.{base64-without-padding}`.
#[must_use]
pub fn sign_cookie(value: &str, secret: &str) -> String {
    let mut mac = Hmac::<Sha256>::new_from_slice(secret.as_bytes()).expect("hmac accepts any key");
    mac.update(value.as_bytes());
    let digest = mac.finalize().into_bytes();
    let encoded = STANDARD.encode(digest);
    let encoded = encoded.trim_end_matches('=');
    format!("{value}.{encoded}")
}

/// Recover the session id from an `s:{id}.{sig}` cookie value.
#[must_use]
pub fn unsign_session(cookie_value: &str, secret: &str) -> Option<String> {
    let signed = cookie_value.strip_prefix("s:")?;
    let (sid, sig) = signed.rsplit_once('.')?;
    let expected = sign_cookie(sid, secret);
    let expected_sig = expected.rsplit_once('.')?.1;
    if subtle_eq(sig.as_bytes(), expected_sig.as_bytes()) {
        Some(sid.to_owned())
    } else {
        None
    }
}

fn subtle_eq(left: &[u8], right: &[u8]) -> bool {
    if left.len() != right.len() {
        return false;
    }
    let mut diff = 0u8;
    for (a, b) in left.iter().zip(right) {
        diff |= a ^ b;
    }
    diff == 0
}

/// Stripe webhook signature (`t=...,v1=...`).
#[must_use]
pub fn stripe_signature_valid(
    payload: &[u8],
    header: &str,
    secret: &str,
    tolerance_secs: i64,
) -> bool {
    let mut timestamp = None;
    let mut signatures = Vec::new();
    for part in header.split(',') {
        let Some((key, value)) = part.split_once('=') else {
            continue;
        };
        match key {
            "t" => timestamp = value.parse::<i64>().ok(),
            "v1" => signatures.push(value.to_owned()),
            _ => {}
        }
    }
    let Some(timestamp) = timestamp else {
        return false;
    };
    let now = chrono::Utc::now().timestamp();
    if (now - timestamp).abs() > tolerance_secs {
        return false;
    }
    let mut mac = Hmac::<Sha256>::new_from_slice(secret.as_bytes()).expect("hmac key");
    mac.update(format!("{timestamp}.").as_bytes());
    mac.update(payload);
    let expected = hex::encode(mac.finalize().into_bytes());
    signatures
        .iter()
        .any(|sig| subtle_eq(sig.as_bytes(), expected.as_bytes()))
}

#[cfg(test)]
mod tests {
    use super::{decrypt_cryptojs, encrypt_cryptojs, sign_cookie, unsign_session};

    #[test]
    fn cryptojs_roundtrip() {
        let encrypted = encrypt_cryptojs("Retrospected", "licence-key");
        assert!(encrypted.starts_with("U2FsdGVkX1"));
        assert_eq!(decrypt_cryptojs(&encrypted, "licence-key"), "Retrospected");
    }

    #[test]
    fn session_cookie_roundtrip() {
        let secret = "changeme-4.11.5";
        let signed = format!("s:{}", sign_cookie("abc123", secret));
        assert_eq!(unsign_session(&signed, secret).as_deref(), Some("abc123"));
        assert!(unsign_session("s:abc123.nope", secret).is_none());
    }
}
