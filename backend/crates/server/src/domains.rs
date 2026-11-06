//! A practical subset of freemail's free and disposable domain lists.

const FREE: &[&str] = &[
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.co.uk",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "msn.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
    "gmx.com",
    "gmx.net",
    "mail.com",
    "yandex.com",
    "yandex.ru",
    "zoho.com",
    "fastmail.com",
    "pm.me",
    "hey.com",
    "mailinator.com",
    "guerrillamail.com",
    "10minutemail.com",
    "tempmail.com",
    "trashmail.com",
    "dispostable.com",
    "yopmail.com",
];

#[must_use]
pub fn is_valid(domain: &str) -> bool {
    let domain = domain.trim().trim_start_matches('@').to_ascii_lowercase();
    !domain.is_empty() && !FREE.iter().any(|item| *item == domain)
}
