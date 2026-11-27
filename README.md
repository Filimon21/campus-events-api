# Campus Events API

A RESTful backend API built with NestJS and TypeScript for managing campus events. It includes JWT authentication, user registration, login, refresh-token rotation, protected routes, validation, filtering, sorting, and pagination.

## Technologies Used

- Node.js
- NestJS
- TypeScript
- Passport.js
- JSON Web Tokens (JWT)
- Argon2 password hashing
- class-validator
- Swagger / OpenAPI

## Features

### Authentication
- User registration
- Email and password validation
- Secure password hashing with Argon2
- User login
- JWT access tokens
- JWT refresh tokens
- Refresh-token rotation
- Logout and refresh-token invalidation
- Global JWT authentication guard
- Public route decorator

### Events
- Create and retrieve events
- Retrieve upcoming events
- Retrieve event sessions
- Filtering, sorting, and pagination
- Request validation

## Project Structure

```text
campus-events-api/
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── logger/
│   │   └── logging/
│   ├── events/
│   │   ├── dto/
│   │   ├── events.controller.ts
│   │   ├── events.module.ts
│   │   └── events.service.ts
│   ├── users/
│   │   ├── interfaces/
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
├── .env.example
├── .gitignore
├── package.json
└── README.md