#!/bin/sh
npx prisma db push --accept-data-loss
npm run build
node dist/src/main
