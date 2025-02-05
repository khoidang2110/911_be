Zalo OA Scheduled Messaging Backend
Overview
This project is a backend service that schedules messages to be sent to customers via Zalo Official Account (OA). It stores access tokens and messages in a database and ensures messages are sent at the scheduled time.

Features
✅ Schedule messages to be sent via Zalo OA
✅ Store Zalo OA access tokens securely in the database
✅ Save scheduled messages in the database
✅ Automatically reload scheduled messages when the backend restarts
✅ Handle Zalo API authentication and token refresh

Tech Stack
Backend: Node.js (NestJS/Express.js)
Database: PostgreSQL (Prisma ORM)
Scheduling: Node.js cron
