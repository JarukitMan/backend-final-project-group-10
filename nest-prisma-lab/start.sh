#!/bin/sh
npx prisma db push --accept-data-loss
npx prisma generate
npm run build
node dist/src/main
