import db from '../db/index.js';
import { AccessPermission } from '../constants/enums.js';

/**
 * Check if a user has any access to a todo list (either as owner or shared access)
 *
 * @param {number} userId
 * @param {number} listId
 * @returns {Promise<boolean>}
 */
export const hasListAccess = async (userId, listId) => {
  const result = await db.query(
    `SELECT 1 
     FROM todo_lists tl
     LEFT JOIN todo_list_access tla ON tl.id = tla.list_id AND tla.user_id = $1
     WHERE tl.id = $2 AND (tl.owner_id = $1 OR tla.user_id = $1)`,
    [userId, listId]
  );

  return result.rowCount > 0;
};

/**
 * Check if a user has edit permission for a todo list (either as owner or with EDIT permission)
 *
 * @param {number} userId
 * @param {number} listId
 * @returns {Promise<boolean>}
 */
export const hasListEditPermission = async (userId, listId) => {
  const result = await db.query(
    `SELECT 1
     FROM todo_lists tl
     LEFT JOIN todo_list_access tla ON tl.id = tla.list_id AND tla.user_id = $1
     WHERE tl.id = $2 AND (tl.owner_id = $1 OR (tla.user_id = $1 AND tla.permission = $3))`,
    [userId, listId, AccessPermission.EDIT]
  );

  return result.rowCount > 0;
};

/**
 * Check if a user is the owner of a todo list
 *
 * @param {number} userId
 * @param {number} listId
 * @returns {Promise<boolean>}
 */
export const isListOwner = async (userId, listId) => {
  const result = await db.query(
    'SELECT 1 FROM todo_lists WHERE id = $1 AND owner_id = $2',
    [listId, userId]
  );

  return result.rowCount > 0;
};

/**
 * Get a user's access permission for a specific todo list
 *
 * @param {number} userId
 * @param {number} listId
 * @returns {Promise<Object|null>}
 */
export const getUserListAccess = async (userId, listId) => {
  const result = await db.query(
    'SELECT permission FROM todo_list_access WHERE list_id = $1 AND user_id = $2',
    [listId, userId]
  );
  return result.rowCount > 0 ? result.rows[0] : null;
};
