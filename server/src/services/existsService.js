import db from '../db/index.js';

/**
 * Check if a todo exists in a specific list
 *
 * @param {number} todoId
 * @param {number} listId
 * @returns {Promise<boolean>}
 */
export const isTodoExistingInList = async (todoId, listId) => {
  const result = await db.query(
    'SELECT 1 FROM todos WHERE id = $1 AND list_id = $2',
    [todoId, listId]
  );
  return result.rowCount > 0;
};

/**
 * Check if a todo list exists
 *
 * @param {number} listId
 * @returns {Promise<boolean>}
 */
export const isListExisting = async (listId) => {
  const result = await db.query('SELECT 1 FROM todo_lists WHERE id = $1', [
    listId,
  ]);
  return result.rowCount > 0;
};
