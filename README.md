# Contribution Guide

Make a new fork and open a new pull request every time you add a new feature with a `feat/...` name.
When fixing something, do the same but under a `fix/...` name.
I will review and merge the branches myself.

When committing, please describe what you are doing and prefix the commit message with `fix:` or `feat:` or `chore:`.
If possible, keep commit tasks isolated. For example, when you modify the .env file and when you modify the Prisma Schema, seperate the commits.

# Deployment
We have deployed our server at [the server provided by Aj. Wudhichart](http://10.34.112.171:3000/). You can check it out there.

## Docker (Preferred)

make sure you have access to docker hub and run `docker compose up --build`. You may add a `-d` flag to detach from the process.

## Non-Docker

Dependencies: Bourne shell, NPM (Node Package Manager), NodeJS, MariaDB

1. Create a database `ICTHotel` in MariaDB.
2. Run MariaDB and make sure it is listening to port 3306
3. Put the link to the database in the `nest-prisma-lab/.env` file in this format: `DATABASE_URL=mysql://{username}:{password}@{database_link}:3306/ICTHotel?allowPublicKeyRetrieval=true`. Replace the bracketed words with the real strings.
4. run this script:
    ```
    cd nest-prisma-lab
    npm install
    sh start.sh
    ```
    If you want to use some other port that isn't port 3000, you can choose to set an environment variable `PORT` to something else with `export PORT={whatever} sh start.sh`.
