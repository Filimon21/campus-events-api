# Campus Events API

## About the Project

The Campus Events API is a backend application I developed as part of my Module 4 backend assignment.

The purpose of this project is to provide an API for managing campus events and their related sessions. Users can view events, search and filter them, check upcoming events, and retrieve session information. Creating a new event is protected by an API key.

While building this project, I worked with important NestJS backend concepts, including middleware, guards, interceptors, pipes, and DTO validation. I also implemented filtering, sorting, and pagination to make the event endpoints more useful.

## Technologies Used

- Node.js
- NestJS
- TypeScript
- Express
- class-validator
- class-transformer
- RxJS

## Project Structure

The main source code is organized as follows:

```text
src/
├── common/
│   ├── api-key/
│   │   └── api-key.guard.ts
│   ├── logger/
│   │   └── logger.middleware.ts
│   └── logging/
│       └── logging.interceptor.ts
│
├── events/
│   ├── dto/
│   │   ├── create-event.dto.ts
│   │   └── events-query.dto.ts
│   ├── interfaces/
│   │   ├── event.interface.ts
│   │   └── session.interface.ts
│   ├── events.controller.ts
│   ├── events.module.ts
│   └── events.service.ts
│
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

## Getting Started

Follow these steps to run the project on your computer.

### 1. Requirements

Make sure you have installed:

- Node.js
- npm
- Git

### 2. Clone the repository

```bash
git clone https://github.com/Filimon21/campus-events-api
```

Move into the project directory:

```bash
cd campus-events-api
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run start:dev
```

The API will run at:

```text
http://localhost:3000/api
```

The application uses in-memory data, so the sample events are stored in the service rather than in a database. Newly created events are not permanently saved when the server restarts.

## API Endpoints

The following endpoints are available.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api` | Check the base API route |
| GET | `/api/events` | Retrieve all events |
| GET | `/api/events/upcoming` | Retrieve upcoming events |
| GET | `/api/events/:id` | Retrieve one event |
| GET | `/api/events/:id/sessions` | Retrieve sessions for an event |
| GET | `/api/events/:id/sessions/:sessionId` | Retrieve one session |
| POST | `/api/events` | Create a new event (API key required) |
| GET | `/api/events/test-number/:id` | Demonstrate ParseIntPipe |

## Filtering, Sorting and Pagination

I implemented filtering, sorting, and pagination in the events endpoint.

### Filtering

Events can be filtered by category, location, and publication status.

Example:

```text
GET /api/events?category=technology
```

```text
GET /api/events?location=Main%20Campus
```

```text
GET /api/events?isPublished=true
```

### Sorting

Events can be sorted by title or event date.

The `order` parameter controls whether the results appear in ascending or descending order.

Example:

```text
GET /api/events?sortBy=title&order=asc
```

### Pagination

Pagination uses the `page` and `limit` parameters.

Example:

```text
GET /api/events?page=1&limit=2
```

The API returns the event data together with pagination information, including:

- Total number of matching events
- Current page
- Number of events per page
- Total number of pages

Filtering and sorting are applied before pagination. This means the API first selects matching events, sorts them, and then returns the requested page.

## Creating a New Event

To create an event, send a POST request to:

```text
POST /api/events
```

The endpoint requires an API key in the request header:

```text
x-api-key: campus-events-secret
```

Example JSON body:

```json
{
  "title": "Web Development Workshop",
  "description": "A practical workshop about modern web development.",
  "location": "Main Campus",
  "eventDate": "2026-12-25T09:00:00.000Z",
  "category": "technology",
  "isPublished": true
}
```

The API validates the submitted information before creating the event.

**Note:** The API key shown above is a demonstration key for this coursework project, not a production security secret.

## Module 4 Concepts Implemented

This assignment helped me understand how NestJS handles incoming requests and how different components work together.

### 1. Middleware

I created a request logger middleware.

It records the request method, URL, and timestamp whenever a request reaches the application.

Example log:

```text
[2026-11-24T12:22:30.228Z] GET /api/events
```

### 2. Guards

I implemented an `ApiKeyGuard` to protect the event creation endpoint.

The guard checks the `x-api-key` request header. If the key is missing or incorrect, the API returns an Unauthorized response (401).

If the key is correct, the request is allowed to continue.

### 3. Interceptors

I created a `LoggingInterceptor` and registered it globally.

It records information before and after successful request handling, including the time taken to process the request.

Example:

```text
Before: GET /api/events
After: GET /api/events - 70ms
```

### 4. Pipes and Validation

I configured a global `ValidationPipe` in `main.ts`.

The configuration includes:

- `transform: true`
- `whitelist: true`
- `forbidNonWhitelisted: true`

I also created DTOs using `class-validator` to validate event information and query parameters.

For example, the event title must be a non-empty string, the event date must be a valid ISO 8601 date string, and the publication status must be a boolean.

I also demonstrated `ParseIntPipe` through the numeric test endpoint.

## Understanding the Request Lifecycle

The application demonstrates the main NestJS request lifecycle:

1. Middleware receives the incoming request and logs its details.
2. Guards check whether the request is allowed.
3. Interceptors run before controller execution.
4. Pipes validate and transform incoming data.
5. The controller receives the validated request and calls the service.
6. The service performs the requested operation and returns the result.
7. The interceptor records the response processing time.

This helped me understand how NestJS separates different responsibilities instead of putting all the logic inside a controller.

## Testing the API

I tested the endpoints using PowerShell and HTTP requests.

The following tests were performed:

| Test | Expected Result |
|---|---|
| Retrieve all events | 200 OK |
| Retrieve upcoming events | 200 OK |
| Filter events by category | Matching events returned |
| Create event without API key | 401 Unauthorized |
| Create event with invalid data | 400 Bad Request |
| Create event with valid API key and valid data | Event created |
| Test ParseIntPipe with a number | Number accepted |
| Test ParseIntPipe with invalid text | 400 Bad Request |

I also checked the backend terminal to confirm that middleware and interceptor logs appeared when requests were made.

## Current Limitations

This project is a learning assignment, so there are some limitations:

- Event and session data are stored in memory.
- There is no permanent database connection.
- The API key is a fixed demonstration key.
- Authentication and user account management are not implemented.

These are areas that could be improved in a future version.

## What I Learned

Working on this project gave me practical experience with the NestJS backend architecture.

I gained a better understanding of how middleware, guards, interceptors, pipes, and DTO validation work together. I also improved my understanding of REST API endpoints, request handling, filtering, sorting, and pagination.

The most useful part of this assignment was implementing and testing each concept rather than only reading about it.

---

**Project:** Campus Events API  
**Module:** Module 4 – Backend Development  
**Developer:** Filimon Berhe
