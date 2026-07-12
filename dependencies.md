# Dependencies

## Runtime baseline

- **Node 24 LTS** (`.nvmrc`, CI `setup-node`, Docker `node:24-alpine`)

## Deps to not update

### Backend

- passport 0.5.0 (newer versions, including 0.5.2, break set user when using Docker, but not locally)
- redis 3.1.2 (v4+ requires rewriting connect-redis session store and Socket.IO client creation; deferred from the conservative upgrade path)

### Marketing

- React 18 (React 19 breaks the unmaintained UI kit: react-scrollspy, react-stickynode, styled-system stack, etc.)
- Stay on Pages Router (no App Router migration this pass)

### Maintenance

- No `package.json` — static nginx only; no npm dependency upgrades

## Deferred majors

- Express 5
- TypeORM 1.x (currently on 0.3.x)
- redis v4 + connect-redis rewrite
- shortid → uuid (session IDs use shortid; changing format needs a coordinated migration)
- Marketing React 19 / Next 16+
- Docs React 19 (Docusaurus still on React 18)
