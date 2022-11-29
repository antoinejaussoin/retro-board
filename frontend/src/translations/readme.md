# How to deal with translations

## Install the Crowdin CLI

https://support.crowdin.com/cli-tool/

- `brew tap crowdin/crowdin`
- `brew install crowdin@3`

## Set authentication

On the home directory (`~/`):

- `crowdin init`

## Download and upload translations

- `crowdin download`
- `crowdin push translations`

## Push a new source

- `crowdin push sources`


# Workflow

- Login to [Crowdin](https://crowdin.com/project/retrospected)
- Optional: if the token is expired, change it in `~/.crowdin.yml` (and get it [here](https://crowdin.com/settings#api-key))
- Upload the latest sources (the English translation): `crowdin push sources`
- Upload the translations (in case they were modified somewhere else): `crowdin push translations`
- Then on the website, choose `Pre-translation` > `Translate via MT`, then select `Crowdin Translate` and `Target Languages`, `Files`.
- This should have translated most languages. For the remaining ones (Hungarian and Chinese Trad): do the same with Google Translate
- Manually check French translations and approve them: On the French line, click on the arrow on the right and do `Proof Read`.
- Download the translated files: `crowdin download`
