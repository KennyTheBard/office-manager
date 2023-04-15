# office-manager

## Components

### Datasource

For data source i'm using PostgreSQL and connect to it through `pg` driver and `sequelize` ORM.

The schema is defined in `migrations/` which could also host migration files for `sequelize-cli` if needed.

For development, the database is running in a Docker container, using the `docker-compose.yml` file.

### GraphQL

For GraphQL i have `apollo` for the server and `type-graphql` for the schema & resolvers.

### Testing

There are some tests written for the `getAvailableRooms` and `getRoomSchedule` functions, using `jest`.

### Linting

For linting i'm using `gts` because i find those styling standards reasonable and easier to follow.

### Containerization

For containerization i've written a `Dockerfile` that is used to build the image of the app in `docker-compose.prod.yml`.

```bash
docker compose -f docker-compose.prod.yml up
# force build in case there are some changes
docker compose -f docker-compose.prod.yml up --build
```

### Workflows

There are 2 workflows right now running for pushes and PR on master, one for linting and one for running tests.

## Technical decisions

Those are mostly assumptions not all are enforced and/or validated.

- `startingHours` and `closingHours` from `rooms` table are represented as minutes from the last midnight
- every time interval is expected to be defined over a single day
- API clients are trustworthy, as there is no authentication
