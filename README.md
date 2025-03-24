# todo-list

**Basic Infra Setup & Tech Choices: https://github.com/shaowen1991/todo-list/issues/1**

### Directory Structure ###
```
├── client/            # React frontend with Vite
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── assets/         # Page assets
│   │   ├── App.jsx        # Base app component with router
│   │   ├── App.css      # Base app style
│   │   └── ... 
│   ├── public/        # Build files
│   ├── index.html
│   └── package.json
├── server/            # Express backend 
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── constants/
│   │   ├── db/        # Database client
│   │   ├── app.js        # Initialize the Express application
│   │   └── index.js       # Entry point to start Express server
│   ├── tests/
│   └── package.json
└── ...
```
