# Todo List

Tech Stack: React, React Router, Tailwind, Node.js, Express, PostgreSQL, and Socket.IO

Basic Infra Setup & Tech Choices: https://github.com/shaowen1991/todo-list/issues/1

## Features

- User authentication (register, login, logout)
- Role-base access control
- Create and view todo lists
- Add, update, and mark todos as complete
- Real-time todo updates using Socket.IO
- Share todo lists with other users
- Filter and sort todos by priority, status, and due date
- Responsive UI
- CI Pipeline with GitHub Actions
- Containerized and orchestrated with Docker and Ngnix

## File Structure

```
todo-list/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React contexts
│   │   ├── utils/            # Helper functions and API client
│   │   ├── App.jsx           # Base app component with router
│   │   └── main.jsx          # App entry point
│   ├── tests/                # Tests files
│   ├── Dockerfile            # Client Docker configuration
│   ├── nginx.conf            # Nginx configuration for production
│   └── package.json          # Frontend dependencies
├── server/                   # Express backend
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── services/         # Helper services
│   │   ├── constants/        # Common values
│   │   ├── db/               # Database client
│   │   ├── app.js            # Express application setup
│   │   └── index.js          # Server entry point with Socket.io
│   ├── tests/                # Tests files
│   ├── Dockerfile            # Server Docker configuration
│   ├── init.sql              # Database initialization script
│   └── package.json          # Backend dependencies
├── docker-compose.yml        # Docker services configuration
├── README.docker.md          # Docker setup instructions
└── .github/workflows/        # CI YAML
```

## Architecture

## API endpoints

#### List Management

- `GET /api/todo-lists/` - Retrieve all todo lists accessible to the user (owned or shared)
- `GET /api/todo-lists/:listId` - Retrieve a todo list by ID
- `POST /api/todo-lists/` - Create a new todo list

#### Todo Management

- `GET /api/todo-lists/:listId/todos` - Get all todos from a specific list
- `POST /api/todo-lists/:listId/todos` - Create a new todo in a specific list
- `GET /api/todo-lists/:listId/todos/:todoId` - Retrieve a specific todo
- `PUT /api/todo-lists/:listId/todos/:todoId` - Update a specific todo

#### Access Control

- `GET /api/todo-lists/:listId/access/requests` - Get all access requests for a todo list
- `POST /api/todo-lists/:listId/access/requests` - Create a new access request for a list
- `PUT /api/todo-lists/:listId/access/requests/:userId` - Accept an access request from a specific user

**Note: All routes require authentication via the authRequired middleware.**

## Database Schema

## Docker Setup

This repository contains Docker configurations for running the todo list application with client, server, and PostgreSQL database.

#### Prerequisites

- Docker and Docker Compose installed on your machine
- Git to clone the repository

#### Getting Started

1. Navigate to the project directory:

```bash
cd todo-list
```

2. Start the application using Docker Compose:

```bash
docker-compose up -d
```

This will build and start all services in detached mode.

3. Access the application:
   - Web UI: http://localhost
   - API: http://localhost:4000
   - Database: localhost:5432 (PostgreSQL)

#### Environment Variables

The Docker setup uses default environment variables defined in the docker-compose.yml.

#### Stopping the Application

To stop the application:

```bash
docker-compose down
```

To stop the application and remove volumes (deletes all data):

```bash
docker-compose down -v
```

#### Development

For development purposes, you can view logs in real-time:

```bash
docker-compose logs -f
```

To rebuild containers after making changes:

```bash
docker-compose up -d --build
```

## Local Development

If you prefer to develop without Docker, follow these steps to set up the application locally.

#### Prerequisites

- Node.js (v18+, prefer v20)
- PostgreSQL (v15+, prefer v17)
- npm or yarn

#### Database Setup

1. Install and start PostgreSQL on your local machine
2. Create a new database:
   ```sql
   CREATE DATABASE todo_db;
   ```
3. Set up the database with the initial schema:
   ```bash
   psql -U postgres -d todo_db -f server/init.sql
   ```

#### Server Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory:

   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todo_db
   SESSION_SECRET=any-random-string-for-development
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the server:

   ```bash
   node src/index.js
   ```

   For development with auto-reload, you can use nodemon:

   ```bash
   npx nodemon src/index.js
   ```

#### Client Setup

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

#### Running Tests

Client Tests

```bash
cd client
npm test
```

Server Tests

```bash
cd server
npm test
```
