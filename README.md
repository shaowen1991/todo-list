# todo-list

**Basic Infra Setup & Tech Choices: https://github.com/shaowen1991/todo-list/issues/1**

### Directory Structure

```
├── client/                   # React frontend with Vite
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── assets/           # Assets
│   │   ├── context/          # Reusable context
│   │   ├── utils/            # Reusable utils
│   │   ├── App.jsx           # Base app component with router
│   │   └── main.jsx          # App entry point
│   ├── tests/                # Tests files
│   ├── index.html
│   └── package.json
├── server/                   # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── constants/
│   │   ├── db/               # Database client
│   │   ├── app.js            # Initialize the Express application
│   │   └── index.js          # Entry point to start Express server
│   ├── tests/                # Tests files
│   └── package.json
└── .github/workflows/        # CI YAML
```
