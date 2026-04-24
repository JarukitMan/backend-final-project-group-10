#!/bin/sh
npx prisma db push --accept-data-loss
npx prisma generate
npm run test
npm run test:e2e
npm run build
node dist/src/main
