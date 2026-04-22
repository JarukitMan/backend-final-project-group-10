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

# Contribution Guide

Make a new fork and open a new pull request every time you add a new feature with a `feat/...` name.
When fixing something, do the same but under a `fix/...` name.
I will review and merge the branches myself.

When committing, please describe what you are doing and prefix the commit message with `fix:` or `feat:` or `chore:`.
If possible, keep commit tasks isolated. For example, when you modify the .env file and when you modify the Prisma Schema, seperate the commits.

