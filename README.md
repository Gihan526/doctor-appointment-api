# Doctor Appointment API

NestJS API for managing doctors and appointment bookings.

## Tech Stack

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Manual migrations

## Features

- Create and list doctors
- Daily appointment capacity per doctor
- Book appointments with token numbers
- Skip Sundays when searching appointment dates
- Search up to 3 days for availability
- Cancel appointments
- List appointments
- Request validation with DTOs

## Database Config

The app expects PostgreSQL with this config:

```txt
host: localhost
port: 5432
username: postgres
password: postgres
database: doctor_appointment_db
```

Create the database before running migrations:

```sql
CREATE DATABASE doctor_appointment_db;
```

## Setup

Install dependencies:

```bash
npm install
```

Run migrations:

```bash
npm run migration:run
```

Start the app:

```bash
npm run start:dev
```

API runs on:

```txt
http://localhost:3000
```

## Scripts

```bash
npm run start:dev
npm run build
npm test
npm run migration:run
npm run migration:revert
npm run migration:show
```

## Main Endpoints

### Doctors

```txt
POST /doctors
GET /doctors
GET /doctors/:id
```

Create doctor body:

```json
{
  "name": "Dr. Perera",
  "specialization": "General Physician",
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDurationMinutes": 15,
  "dailyCapacity": 30
}
```

### Appointments

```txt
POST /doctors/:doctorId/appointments
GET /appointments
GET /appointments/:appointmentId
GET /doctors/:doctorId/appointments
PATCH /appointments/:appointmentId/cancel
```

Book appointment body:

```json
{
  "patientName": "Gihan",
  "patientMobile": "0771234567"
}
```

Cancel appointment:

```txt
PATCH /appointments/1/cancel
```

## Notes

- `synchronize` is disabled.
- Database changes must be added with manual migrations.
- PostgreSQL data is not stored in the project folder.
