import express from 'express';
import authRequired from '../middleware/authRequired.js';
import {
  getLists,
  getListTodos,
  getListTodo,
  createList,
  createListTodo,
  updateListTodo,
  createListAccessRequest,
  updateListAccessRequest,
  getListAccessRequests,
} from '../controllers/todo-lists.js';

const router = express.Router();

// apply auth middleware to all routes
router.use(authRequired);

// lists routes
router.get('/', getLists);
router.post('/', createList);

// list-specific routes
router.get('/:listId/todos', getListTodos);
router.post('/:listId/todos', createListTodo);
router.get('/:listId/todos/:todoId', getListTodo);
router.put('/:listId/todos/:todoId', updateListTodo);

// access permission routes
router.get('/:listId/access/requests', getListAccessRequests);
router.post('/:listId/access/requests', createListAccessRequest);
router.put('/:listId/access/requests/:userId', updateListAccessRequest);

export default router;
