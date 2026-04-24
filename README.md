# Overview

This program is a back-end server of a hotel booking application. It can handle booking, booking cancellation, room lookup,
checking out all rooms, checking out specific rooms, storing user and admin information, storing notifications for users,
registering new users and admins, editing rooms and bookings, and provide a health check + a healthy amount of logging.

It is implemented in TypeScript in the NestJS framework, making it a modular service somewhere between microservices and monoliths.
We also have provided a Dockerfile, docker-compose.yml, and .gitlab-ci.yml for simple deployment.

# Examples

Connecting to the `/docs` page should contain all examples. Here are a few of them.

Req:
```
POST /rooms

{
  "name": "Simple Room",
  "description": "Simple room with only basic amenities.",
  "capacity": 1,
  "price_per_night": 1,
  "image_url": "/room_2.png",
  "is_active": true
}
```

Res:
```
{
  "name": "Simple Room",
  "description": "Simple room with only basic amenities.",
  "capacity": 1,
  "price_per_night": 1,
  "image_url": "/room_2.png",
  "is_active": true
}
```

Req:
```
POST /booking/book


{
  "room_id": 1,
  "start_date": "2027-12-24T00:00:00.000Z",
  "end_date": "2028-11-24T00:00:00.000Z"
}
```

Res:
```
{
  "room_id": 1,
  "start_date": "2027-12-24T00:00:00.000Z",
  "end_date": "2028-11-24T00:00:00.000Z"
}
```

Req:
```
GET /rooms/{1}
```

Res:
```
{
  "id": 1,
  "name": "Simple Room",
  "description": "Simple room with only basic amenities.",
  "capacity": 1,
  "price_per_night": 1,
  "image_url": "/room_2.png",
  "is_active": true
}
```

# Deployment/Running in Development
It's running on a Docker container on the server which is running Ubuntu.
We used Gitlab runners to SSH into the server, build the Docker image via `docker compose up --build -d` and leave it running.
We have deployed our server at [the server provided by Aj. Wudhichart](http://10.34.112.171/api/).
You can check it out there.

## Docker (Preferred)

make sure you have access to docker hub and run `docker compose up --build`. You may add a `-d` flag to detach from the process.

## Non-Docker

Dependencies: Bourne shell, NPM (Node Package Manager), NodeJS, MariaDB

1. Create a database `ICTHotel` in MariaDB.
2. Run MariaDB and make sure it is listening to port 3306
3. Put the link to the database in the `nest-prisma-lab/.env` file in this format: `DATABASE_URL=mysql://{username}:{password}@{database_link}:3306/ICTHotel?allowPublicKeyRetrieval=true`. Replace the bracketed words with the real strings.
4. Put the **SECRET** used to generate tokens in the JWT_SECRET environment variable in `nest-prisma-lab/.env`. `JWT_SECRET=YourSecretKey`
5. run this script:
    ```
    cd nest-prisma-lab
    npm install
    sh start.sh
    ```
    If you want to use some other port that isn't port 3000, you can choose to set an environment variable `PORT` to something else with `export PORT={whatever} sh start.sh`.

# Testing

Just run `npm run test` after you've set up the environment. That being starting the server according to the deployment instructions and stopping it.
I've included the command in the start.sh script, so it should run immediately on docker compose. Here are the expected results.

```
app-1    | > nest-prisma-lab@0.0.1 test
app-1    | > jest
app-1    | 
app-1    | PASS src/app.controller.spec.ts
app-1    | PASS src/prisma/prisma.service.spec.ts
app-1    | PASS src/booking/booking.service.spec.ts
app-1    | PASS src/roles/roles.guard.spec.ts
app-1    | PASS src/search/search.service.spec.ts
app-1    | PASS src/notifications/notifications.controller.spec.ts
app-1    | PASS src/notifications/notifications.service.spec.ts
app-1    | [Nest] 268  - 04/22/2026, 4:45:11 PM   ERROR [RoomsService] Oh no! cannot create room. Room with name Deluxe Room already exists
app-1    | [Nest] 268  - 04/22/2026, 4:45:11 PM   ERROR [RoomsService] Failed to update room 999: Record to update not found.
app-1    | [Nest] 268  - 04/22/2026, 4:45:11 PM   ERROR [RoomsService] Failed to delete room 999: Record to delete not found.
app-1    | [Nest] 271  - 04/22/2026, 4:45:11 PM   ERROR [AuthService] NotAcceptableException: Duplicate username
app-1    |     at AuthService.register (/app/src/auth/auth.service.ts:17:13)
app-1    |     at Object.<anonymous> (/app/src/auth/auth.service.spec.ts:61:7) {
app-1    |   response: {
app-1    |     message: 'Duplicate username',
app-1    |     error: 'Not Acceptable',
app-1    |     statusCode: 406
app-1    |   },
app-1    |   status: 406,
app-1    |   options: {}
app-1    | }
app-1    | PASS src/rooms/rooms.service.spec.ts
app-1    | PASS src/rooms/rooms.controller.spec.ts
app-1    | PASS src/booking/booking.controller.spec.ts
app-1    | PASS src/auth/auth.controller.spec.ts
app-1    | PASS src/search/search.controller.spec.ts
app-1    | PASS src/rooms/rooms.controller.integration.spec.ts
app-1    | PASS src/booking/booking.controller.integration.spec.ts
app-1    | [Nest] 271  - 04/22/2026, 4:45:11 PM   ERROR [AuthService] NotFoundException: User Not Found
app-1    |     at AuthService.login (/app/src/auth/auth.service.ts:27:24)
app-1    |     at Object.<anonymous> (/app/src/auth/auth.service.spec.ts:86:7) {
app-1    |   response: {
app-1    |     message: 'User Not Found',
app-1    |     error: 'Not Found',
app-1    |     statusCode: 404
app-1    |   },
app-1    |   status: 404,
app-1    |   options: {}
app-1    | }
app-1    | [Nest] 271  - 04/22/2026, 4:45:12 PM   ERROR [AuthService] UnauthorizedException: Incorrect Password
app-1    |     at AuthService.login (/app/src/auth/auth.service.ts:33:18)
app-1    |     at Object.<anonymous> (/app/src/auth/auth.service.spec.ts:97:7) {
app-1    |   response: {
app-1    |     message: 'Incorrect Password',
app-1    |     error: 'Unauthorized',
app-1    |     statusCode: 401
app-1    |   },
app-1    |   status: 401,
app-1    |   options: {}
app-1    | }
app-1    | PASS src/auth/auth.service.spec.ts
app-1    | 
app-1    | Test Suites: 15 passed, 15 total
app-1    | Tests:       64 passed, 64 total
app-1    | Snapshots:   0 total
app-1    | Time:        3.074 s
app-1    | Ran all test suites.
```

for e2e run npm run test:e2e
 PASS  test/search.e2e-spec.ts
 PASS  test/notifications.e2e-spec.ts
 PASS  test/app.e2e-spec.ts
[Nest] 43913  - 04/24/2026, 12:51:10 PM   ERROR [RoomsService] Failed to update room 999999: Room with id 999999 not found
 PASS  test/rooms.e2e-spec.ts (5.202 s)
[Nest] 43911  - 04/24/2026, 12:51:10 PM   ERROR [AuthService] NotAcceptableException: Duplicate username
    at AuthService.register (/Users/rcpearl/Documents/GitHub/backend-final-project-group-10/nest-prisma-lab/src/auth/auth.service.ts:17:13)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at AuthController.register (/Users/rcpearl/Documents/GitHub/backend-final-project-group-10/nest-prisma-lab/src/auth/auth.controller.ts:25:12) {
  response: {
    message: 'Duplicate username',
    error: 'Not Acceptable',
    statusCode: 406
  },
  status: 406,
  options: {}
}
[Nest] 43911  - 04/24/2026, 12:51:11 PM   ERROR [AuthService] UnauthorizedException: Incorrect Password
    at AuthService.login (/Users/rcpearl/Documents/GitHub/backend-final-project-group-10/nest-prisma-lab/src/auth/auth.service.ts:33:18)
    at AuthController.login (/Users/rcpearl/Documents/GitHub/backend-final-project-group-10/nest-prisma-lab/src/auth/auth.controller.ts:45:12) {
  response: {
    message: 'Incorrect Password',
    error: 'Unauthorized',
    statusCode: 401
  },
  status: 401,
  options: {}
}
[Nest] 43911  - 04/24/2026, 12:51:11 PM   ERROR [AuthService] NotFoundException: User Not Found
    at AuthService.login (/Users/rcpearl/Documents/GitHub/backend-final-project-group-10/nest-prisma-lab/src/auth/auth.service.ts:27:24)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at AuthController.login (/Users/rcpearl/Documents/GitHub/backend-final-project-group-10/nest-prisma-lab/src/auth/auth.controller.ts:45:12) {
  response: {
    message: 'User Not Found',
    error: 'Not Found',
    statusCode: 404
  },
  status: 404,
  options: {}
}
 PASS  test/auth.e2e-spec.ts (6.246 s)
 PASS  test/booking.e2e-spec.ts (6.782 s)

Test Suites: 6 passed, 6 total
Tests:       30 passed, 30 total
Snapshots:   0 total
Time:        7.576 s
Ran all test suites.

# Contribution Guide

Make a new fork and open a new pull request every time you add a new feature with a `feat/...` name.
When fixing something, do the same but under a `fix/...` name.
I will review and merge the branches myself.

When committing, please describe what you are doing and prefix the commit message with `fix:` or `feat:` or `chore:`.
If possible, keep commit tasks isolated. For example, when you modify the .env file and when you modify the Prisma Schema, seperate the commits.

