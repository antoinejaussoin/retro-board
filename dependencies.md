# Dependencies

## Deps to not update

### Backend

- Chalk: 4.1.2 (until TypeScript supports ESM imports)
- node-fetch: 2.6.7 (same reason)
- @types/node-fetch: 2.5.12
- redis 3.1.2 (new version incompatible with express-redis)
- passport 0.5.0 (new version, including 0.5.2 breaks set user when using Docker, but not locally)
