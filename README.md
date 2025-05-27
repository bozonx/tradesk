# tradesk
App for trade and strategies

```bash
DATABASE_URL=file:dev.db npx prisma migrate dev --name init

DATABASE_URL=file:dev.db npx prisma generate
DATABASE_URL=file:dev.db npx prisma db pull
DATABASE_URL=file:dev.db yarn prisma:seed
```