# Dependencies

## Deps to not update

### Backend

- passport 0.5.0 (newer versions, including 0.5.2, break set user when using Docker, but not locally)
- redis 3.1.2 (v4+ requires rewriting connect-redis session store and Socket.IO client creation; deferred from the conservative upgrade path)

## Deferred majors

- Express 5
- TypeORM 1.x (currently on 0.3.x)
- redis v4 + connect-redis rewrite
- shortid → uuid (session IDs use shortid; changing format needs a coordinated migration)
