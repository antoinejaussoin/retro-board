//! Print a hardcoded licence entry for `licence.rs`.
//!
//! Usage: hardcode-licence <company> [licence-key]

#[path = "../crypto.rs"]
#[allow(dead_code)]
mod crypto;

fn main() {
    let mut args = std::env::args().skip(1);
    let Some(company) = args
        .next()
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty())
    else {
        eprintln!(
            "No company name provided. Please provide the company name as the first argument."
        );
        std::process::exit(1);
    };
    let key = args
        .next()
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
    let hash = match crypto::hash_password(&key) {
        Ok(hash) => hash,
        Err(error) => {
            eprintln!("could not hash the licence key: {error}");
            std::process::exit(1);
        }
    };
    let encrypted_owner = crypto::encrypt_cryptojs(&company, &key);
    println!("Building hardcoded licence for company: {company}");
    println!("Licence key to communicate to them: {key}");
    println!(
        "Copy the following object to the HARDCODED list in backend/crates/server/src/licence.rs:"
    );
    println!();
    println!("    Hardcoded {{");
    println!("        hash: \"{hash}\",");
    println!("        encrypted_owner: \"{encrypted_owner}\",");
    println!("    }},");
}

#[cfg(test)]
mod tests {
    use super::crypto;

    #[test]
    fn generated_entry_roundtrips() {
        let key = "licence-key";
        let company = "Acme";
        let hash = crypto::hash_password(key).expect("bcrypt accepts this key");
        let encrypted = crypto::encrypt_cryptojs(company, key);
        assert!(crypto::verify_password(key, &hash).expect("hash is well formed"));
        assert_eq!(crypto::decrypt_cryptojs(&encrypted, key), company);
    }
}
