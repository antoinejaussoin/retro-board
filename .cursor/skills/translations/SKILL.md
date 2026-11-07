---
name: translations
description: >-
  Keep Retrospected locale files in sync. Use whenever adding, renaming, or
  editing user-facing strings, translation keys, en-GB.json, i18n, or any file
  under frontend/src/translations/locales.
---

# Translations

When adding something in the translation file (en-GB), always, always, add them on the other languages as well (translate).

## Files

`frontend/src/translations/locales/en-GB.json` is the source. Every other JSON file in that directory is a locale and must get the same keys in the same change.

## Rules

- Translate the value. Do not copy the English sentence into the other files.
- Keep interpolation placeholders exactly as written (`{{type}}`, `{{number}}`, and any others). Do not translate or rename them.
- Place each new key beside the same neighbours as in en-GB.
- Do not leave a new key as `null`. Older keys in a locale may already be `null`; new keys still get a real translation.
