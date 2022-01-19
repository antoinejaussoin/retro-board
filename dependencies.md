# Dependencies

## Deps to not update

### Backend

- Chalk: 4.1.2 (until TypeScript supports ESM imports)
- node-fetch: 2.6.1 (same reason)
- @types/node-fetch: 2.5.12
- redis 3.1.2 (new version incompatible with express-redis)
- passport 0.5.0 (new version breaks set user)

### Frontend

- flag-icon-css (3.5.0)
- react-markdown (6.0.3)
- react-router-dom (5.3.0)