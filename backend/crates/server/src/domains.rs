//! Free and disposable email domains from the `freemail` lists.
//! A domain is rejected when its registered domain is on either list.

use std::collections::HashSet;
use std::sync::OnceLock;

const FREE: &str = include_str!("../data/freemail/free.txt");
const DISPOSABLE: &str = include_str!("../data/freemail/disposable.txt");

fn blocked() -> &'static HashSet<&'static str> {
    static SET: OnceLock<HashSet<&'static str>> = OnceLock::new();
    SET.get_or_init(|| {
        FREE.lines()
            .chain(DISPOSABLE.lines())
            .map(str::trim)
            .filter(|line| !line.is_empty())
            .collect()
    })
}

/// `true` when the domain is not a free or disposable mailbox provider.
#[must_use]
pub fn is_valid(domain: &str) -> bool {
    let domain = domain.trim().trim_start_matches('@').to_ascii_lowercase();
    if domain.is_empty() {
        return false;
    }
    let registered = psl::domain(domain.as_bytes())
        .and_then(|name| std::str::from_utf8(name.as_bytes()).ok())
        .unwrap_or(domain.as_str())
        .to_ascii_lowercase();
    !blocked().contains(registered.as_str())
}

#[cfg(test)]
mod tests {
    use super::is_valid;

    #[test]
    fn rejects_free_and_disposable_domains() {
        assert!(!is_valid("gmail.com"));
        assert!(!is_valid("Mail.Gmail.com"));
        assert!(!is_valid("yopmail.com"));
        assert!(is_valid("retrospected.com"));
    }
}
