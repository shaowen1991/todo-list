import db from '../db/index.js';
import HttpStatus from '../constants/httpStatus.js';
import {
  TodoStatus,
  AccessPermission,
  TodoPriority,
  RequestStatus,
} from '../constants/enums.js';
import {
  hasListAccess,
  hasListEditPermission,
  isListOwner,
  getUserListAccess,
} from '../services/permissionService.js';
import {
  isTodoExistingInList,
  isListExisting,
} from '../services/existsService.js';

/**
 * Helper function to add a parameterized condition to a SQL query
 *
 * @param {Array} conditions - array to store SQL condition strings
 * @param {Array} queryParams - array of parameter values that will be updated with columnValue
 * @param {string} columnName - database column name to filter on
 * @param {any} columnValue - value to filter the column by
 * @example
 *
 * conditions = [], queryParams = [listId]
 * addCondition(conditions, queryParams, 'status', 'ACTIVE');
 *
 * Result: conditions = ["status = $2"], queryParams = [listId, "ACTIVE"]
 * Final query: "SELECT * FROM todos WHERE list_id = $1 AND status = $2"
 */
const addCondition = (conditions, queryParams, columnName, columnValue) => {
  queryParams.push(columnValue);
  const paramIndex = queryParams.length;
  conditions.push(`${columnName} = $${paramIndex}`);
};

/**
 * Get all todo lists that the user can access
 * Can be filtered with ?owned=true to show only owned lists
 * GET /api/todo-lists/
 */
const getLists = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { owned } = req.query;

    // if owned=true query param is provided, return only owned lists
    if (owned === 'true') {
      const result = await db.query(
        'SELECT * FROM todo_lists WHERE owner_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      return res.json(result.rows);
    }

    // otherwise, return all lists the user can access (has EDIT or VIEW permission)
    const query = `
      SELECT tl.*, tla.permission, u.username as owner_username
      FROM todo_list_access tla
      JOIN todo_lists tl ON tla.list_id = tl.id
      JOIN users u ON tl.owner_id = u.id
      WHERE tla.user_id = $1
        AND tla.permission IN ('${AccessPermission.EDIT}', '${AccessPermission.VIEW}')
      ORDER BY tl.created_at DESC
    `;

    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Server error' });
  }
};

/**
 * Get todos from a specific list with optional filtering and sorting
 * GET /api/todo-lists/:listId/todos
 */
const getListTodos = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { listId } = req.params;
    const {
      status,
      priority,
      dueDate,
      sortBy = 'due_date',
      sortDir = 'asc',
    } = req.query;

    // check if the user has permission to access this list
    const hasAccess = await hasListAccess(userId, listId);

    if (!hasAccess) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ error: 'No permission to access this list' });
    }

    // build the query with filters
    const baseQuery = `
      SELECT t.id, t.title, t.description, t.due_date, t.status, t.priority
      FROM todos t
      JOIN todo_lists tl ON t.list_id = tl.id
      WHERE t.list_id = $1
    `;

    const conditions = [];
    const queryParams = [listId];

    if (status) {
      addCondition(conditions, queryParams, 't.status', status);
    }

    if (priority) {
      addCondition(conditions, queryParams, 't.priority', priority);
    }

    if (dueDate) {
      addCondition(conditions, queryParams, 't.due_date', dueDate);
    }

    // construct final query with conditions
    let query = baseQuery;
    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    // sorting
    const validSortColumns = [
      'due_date',
      'status',
      'title',
      'priority',
      'created_at',
    ];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'due_date';
    const direction = sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY t.${sortColumn} ${direction}`;

    // combine owner and access information queries to reduce DB calls
    const metadataQuery = `
      SELECT 
        (SELECT json_build_object('owner_id', tl.owner_id, 'username', u.username) 
         FROM todo_lists tl 
         JOIN users u ON tl.owner_id = u.id 
         WHERE tl.id = $1) as owner,
        (SELECT json_agg(json_build_object('user_id', u.id, 'username', u.username, 'permission', tla.permission)) 
         FROM todo_list_access tla
         JOIN users u ON tla.user_id = u.id
         WHERE tla.list_id = $1) as accessible_users
    `;

    // run queries in parallel
    const [todosResult, metadataResult] = await Promise.all([
      db.query(query, queryParams),
      db.query(metadataQuery, [listId]),
    ]);

    const metadata = metadataResult.rows[0];

    const result = {
      todos: todosResult.rows,
      owner: metadata.owner,
      accessibleUsers: metadata.accessible_users || [],
    };

    res.json(result);
  } catch (err) {
    console.error('Error:', err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Server error' });
  }
};

/**
 * Get a specific todo by ID
 * GET /api/todo-lists/:listId/todos/:todoId
 */
const getListTodo = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { listId, todoId } = req.params;

    // check if the user has permission to access this todo
    const result = await db.query(
      `SELECT t.*, tl.owner_id,
              CASE WHEN tl.owner_id = $1 THEN '${AccessPermission.EDIT}'
                   ELSE tla.permission END AS permission
       FROM todos t
       JOIN todo_lists tl ON t.list_id = tl.id
       LEFT JOIN todo_list_access tla ON tl.id = tla.list_id AND tla.user_id = $1
       WHERE t.id = $2 AND t.list_id = $3 AND (tl.owner_id = $1 OR tla.user_id = $1)`,
      [userId, todoId, listId]
    );

    if (result.rowCount === 0) {
      return res.status(HttpStatus.NOT_FOUND).json({
        error:
          'Todo not found, does not belong to the specified list, or no access permission',
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error:', err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Server error' });
  }
};

/**
 * Create a new todo list
 * POST /api/todo-lists/
 */
const createList = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { title, description } = req.body;

    if (!title) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Title is required' });
    }

    try {
      await db.query('BEGIN');

      // create the list
      const createListResult = await db.query(
        'INSERT INTO todo_lists (owner_id, title, description) VALUES ($1, $2, $3) RETURNING *',
        [userId, title, description || '']
      );

      const newList = createListResult.rows[0];

      // also create an access entry with EDIT permission for the owner
      await db.query(
        'INSERT INTO todo_list_access (list_id, user_id, permission) VALUES ($1, $2, $3)',
        [newList.id, userId, AccessPermission.EDIT]
      );

      await db.query('COMMIT');

      res.status(HttpStatus.CREATED).json(newList);
    } catch (err) {
      // Rollback on error
      await db.query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error:', err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Server error' });
  }
};

/**
 * Create a new todo in a list
 * POST /api/todo-lists/:listId/todos
 */
const createListTodo = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { listId } = req.params;
    const { title, description, dueDate, status, priority } = req.body;

    if (!title) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Title is required' });
    }

    // check edit permission
    const hasEditPermission = await hasListEditPermission(userId, listId);

    if (!hasEditPermission) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ error: 'No edit permission for this list' });
    }

    const result = await db.query(
      `INSERT INTO todos 
        (list_id, title, description, due_date, status, priority) 
       VALUES 
        ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        listId,
        title,
        description || '',
        dueDate || null,
        status || TodoStatus.NOT_STARTED,
        priority || TodoPriority.P1,
      ]
    );

    res.status(HttpStatus.CREATED).json(result.rows[0]);
  } catch (err) {
    console.error('Error:', err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Server error' });
  }
};

/**
 * Update a todo
 * PUT /api/todo-lists/:listId/todos/:todoId
 */
const updateListTodo = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { listId, todoId } = req.params;
    const { title, description, dueDate, status, priority } = req.body;

    // check edit permission and todo existence in parallel
    const [hasEditPermission, todoExists] = await Promise.all([
      hasListEditPermission(userId, listId),
      isTodoExistingInList(todoId, listId),
    ]);

    // check edit permission
    if (!hasEditPermission) {
      return res.status(HttpStatus.FORBIDDEN).json({
        error: 'No edit permission for this list',
      });
    }

    // check todo exists and belongs to list
    if (!todoExists) {
      return res.status(HttpStatus.NOT_FOUND).json({
        error: 'Todo not found or does not belong to the specified list',
      });
    }

    // build dynamic update query
    const conditions = [];
    const queryParams = [todoId];

    if (title !== undefined) {
      addCondition(conditions, queryParams, 'title', title);
    }

    if (description !== undefined) {
      addCondition(conditions, queryParams, 'description', description);
    }

    if (dueDate !== undefined) {
      addCondition(conditions, queryParams, 'due_date', dueDate);
    }

    if (status !== undefined) {
      addCondition(conditions, queryParams, 'status', status);
    }

    if (priority !== undefined) {
      addCondition(conditions, queryParams, 'priority', priority);
    }

    if (conditions.length === 0) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE todos 
      SET ${conditions.join(', ')} 
      WHERE id = $1 
      RETURNING *
    `;

    const result = await db.query(query, queryParams);

    if (result.rowCount === 0) {
      return res.status(HttpStatus.NOT_FOUND).json({ error: 'Todo not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error:', err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Server error' });
  }
};

/**
 * Request access to a todo list
 * POST /api/todo-lists/:listId/access/requests
 */
const createListAccessRequest = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { listId } = req.params;
    const { permission } = req.body;

    if (
      !permission ||
      ![AccessPermission.EDIT, AccessPermission.VIEW].includes(permission)
    ) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: `Valid permission (${AccessPermission.EDIT} or ${AccessPermission.VIEW}) is required`,
      });
    }

    // check if the list exists
    const isListValid = await isListExisting(listId);
    if (!isListValid) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ error: 'Todo list not found' });
    }

    // check if the user is the owner
    const isOwner = await isListOwner(userId, listId);
    if (isOwner) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'You already own this list' });
    }

    // check if user already has access
    const existingAccess = await getUserListAccess(userId, listId);
    if (existingAccess) {
      return res.status(HttpStatus.CONFLICT).json({
        error: 'You already have access to this list',
        currentPermission: existingAccess.permission,
      });
    }

    // check if there's already a pending request
    const pendingCheck = await db.query(
      'SELECT requested_permission, status FROM todo_list_access_requests WHERE list_id = $1 AND user_id = $2',
      [listId, userId]
    );

    // if no existing request, create a new one
    if (pendingCheck.rowCount === 0) {
      await db.query(
        'INSERT INTO todo_list_access_requests (list_id, user_id, requested_permission, status) VALUES ($1, $2, $3, $4)',
        [listId, userId, permission, RequestStatus.PENDING]
      );

      return res.status(HttpStatus.CREATED).json({
        message: 'Access request submitted. Waiting for approval.',
      });
    }

    // handle existing request based on status
    const existingRequest = pendingCheck.rows[0];

    // if already pending, return conflict
    if (existingRequest.status === RequestStatus.PENDING) {
      return res.status(HttpStatus.CONFLICT).json({
        error: 'Access request already pending',
        requestedPermission: existingRequest.requested_permission,
      });
    }

    // for any other status (like ACCEPTED)
    return res.status(HttpStatus.CONFLICT).json({
      error: 'Cannot create a new request with the current status',
      currentStatus: existingRequest.status,
    });
  } catch (err) {
    console.error('Error:', err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Server error' });
  }
};

/**
 * Update the status of an access request (accept only)
 * PUT /api/todo-lists/:listId/access/requests/:userId
 */
const updateListAccessRequest = async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const { listId, userId } = req.params;
    const { status } = req.body;

    // validate status - only ACCEPTED is allowed
    if (!status || status !== RequestStatus.ACCEPTED) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: `Valid status (${RequestStatus.ACCEPTED}) is required`,
      });
    }

    // check if current user is the list owner
    const isOwner = await isListOwner(currentUserId, listId);

    if (!isOwner) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ error: 'Only the list owner can update access requests' });
    }

    // first check if the request exists using the compound primary key
    const existingRequest = await db.query(
      'SELECT user_id, requested_permission FROM todo_list_access_requests WHERE user_id = $1 AND list_id = $2',
      [userId, listId]
    );

    if (existingRequest.rowCount === 0) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ error: 'Access request not found' });
    }

    const { user_id, requested_permission } = existingRequest.rows[0];

    try {
      await db.query('BEGIN');

      // update request status using the compound primary key
      await db.query(
        'UPDATE todo_list_access_requests SET status = $1 WHERE user_id = $2 AND list_id = $3',
        [status, userId, listId]
      );

      // grant access since the request is accepted
      await db.query(
        `INSERT INTO todo_list_access (list_id, user_id, permission)
         VALUES ($1, $2, $3)
         ON CONFLICT (list_id, user_id) 
         DO UPDATE SET permission = $3`,
        [listId, user_id, requested_permission]
      );

      await db.query('COMMIT');

      return res.json({
        message: 'Access request accepted and permission granted',
        status,
        userId,
        listId,
      });
    } catch (err) {
      // rollback on error
      await db.query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error:', err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Server error' });
  }
};

/**
 * Get access requests for a list owned by the current user
 * Can be filtered by status: PENDING, ACCEPTED
 * GET /api/todo-lists/:listId/access/requests
 */
const getListAccessRequests = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { listId } = req.params;
    const { status } = req.query;

    // check if current user is the list owner
    const isOwner = await isListOwner(userId, listId);

    if (!isOwner) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ error: 'Only the list owner can view access requests' });
    }

    // validate status if provided
    if (
      status &&
      ![RequestStatus.PENDING, RequestStatus.ACCEPTED].includes(status)
    ) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: `Invalid status. Must be one of: ${RequestStatus.PENDING}, ${RequestStatus.ACCEPTED}`,
      });
    }

    // base query with optional status filter
    let query = `
      SELECT tlar.list_id, tlar.user_id, tlar.requested_permission, 
             tlar.status, tlar.created_at, u.username 
      FROM todo_list_access_requests tlar
      JOIN users u ON tlar.user_id = u.id
      WHERE tlar.list_id = $1
    `;

    const queryParams = [listId];

    // add status filter if provided
    if (status) {
      query += ` AND tlar.status = $2`;
      queryParams.push(status);
    }

    // always sort by most recent first
    query += ` ORDER BY tlar.created_at DESC`;

    const requests = await db.query(query, queryParams);

    res.json(requests.rows);
  } catch (err) {
    console.error('Error:', err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Server error' });
  }
};

export {
  getLists,
  getListTodos,
  getListTodo,
  createList,
  createListTodo,
  updateListTodo,
  createListAccessRequest,
  updateListAccessRequest,
  getListAccessRequests,
};
