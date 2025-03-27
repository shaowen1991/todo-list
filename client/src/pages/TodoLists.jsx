import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import {
  ShareIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import ListCard from '../components/ListCard';
import TodoItem from '../components/TodoItem';
import UserCard from '../components/UserCard';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import clsx from 'clsx';
import {
  ACCESS_PERMISSION,
  FILTER_PARAM_KEYS,
  FILTER_TYPES,
  PRIORITY,
  REQUEST_STATUS,
  SORT_BY_PARAMS,
  SORT_BY_TYPES,
  TODO_STATUS,
} from '../constants/enums';
import { STYLE_CONFIGS } from '../constants/displays';

const oneWeekLater = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
};

export default function TodoLists() {
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const { listId } = useParams();
  const listIdParam = Number(listId);
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [todos, setTodos] = useState([]);
  const [usersWithAccess, setUsersWithAccess] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const selectedStatus = queryParams.get(FILTER_PARAM_KEYS.TODO_STATUS);
  const selectedPriority = queryParams.get(FILTER_PARAM_KEYS.PRIORITY);
  const selectedSortBy = queryParams.get('sortBy');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showNewListEditor, setShowNewListEditor] = useState(false);
  const [showTodoEditor, setShowTodoEditor] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [editorTodoId, setEditorTodoId] = useState('');
  const [editorTodoTitle, setEditorTodoTitle] = useState('');
  const [editorTodoDescription, setEditorTodoDescription] = useState('');
  const [editorTodoDueDate, setEditorTodoDueDate] = useState(oneWeekLater);
  const [editorTodoStatus, setEditorTodoStatus] = useState(
    TODO_STATUS.NOT_STARTED
  );
  const [editorTodoPriority, setEditorTodoPriority] = useState(PRIORITY.P1);
  const [isNewTodoEditorMode, setIsNewTodoEditorMode] = useState(false);
  const isUserHasEditPermission = usersWithAccess?.some(
    (userWithAccess) =>
      userWithAccess.user_id === user?.id &&
      userWithAccess.permission === ACCESS_PERMISSION.EDIT
  );

  const resetNewListEditor = () => {
    setNewListTitle('');
    setNewListDescription('');
  };

  const resetTodoEditor = useCallback(() => {
    setEditorTodoId('');
    setEditorTodoTitle('');
    setEditorTodoDescription('');
    setEditorTodoDueDate(oneWeekLater);
    setEditorTodoStatus(TODO_STATUS.NOT_STARTED);
    setEditorTodoPriority(PRIORITY.P1);
  }, []);

  // socket io connection on mount and listIdParam changes
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL);

    socketRef.current.on('connect', () => {
      // join the current list room if listIdParam exists
      if (listIdParam) {
        socketRef.current.emit('joinList', listIdParam);
      }
    });

    socketRef.current.on('todoCreated', (newTodo) => {
      setTodos((prevTodos) => [newTodo, ...prevTodos]);
    });

    socketRef.current.on('todoUpdated', (updatedTodo) => {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        )
      );
    });

    return () => {
      if (socketRef.current) {
        // join the current list room if listIdParam exists
        if (listIdParam) {
          socketRef.current.emit('leaveList', listIdParam);
        }
        socketRef.current.disconnect();
      }
    };
  }, [listIdParam]);

  // side effects and fetches
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const listsData = await api.get('/api/todo-lists');
        // display the owner's username as 'me' in lists that the user owns
        listsData.forEach((list) => {
          if (list?.owner_id === user?.id) list.owner_username += ' (me)';
        });
        setLists(listsData);
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    };

    fetchLists();
  }, [user?.id]);

  useEffect(() => {
    if (!listIdParam) return;

    const fetchTodosAndAccessRequests = async () => {
      try {
        const queryParamsString = queryParams.toString()
          ? `?${queryParams.toString()}`
          : '';
        const todosData = await api
          .get(`/api/todo-lists/${listIdParam}/todos${queryParamsString}`)
          .catch((error) => {
            // if the user does not have access to the list, redirect to the request access page
            if (error.status === 403) {
              navigate(`/todo-lists/${listIdParam}/request-access`);
            }
            throw error;
          });

        setTodos(todosData?.todos);
        setUsersWithAccess(
          todosData?.accessibleUsers?.reduce((acc, curr) => {
            // set the owner to true if the user is the owner of the list
            acc.push({
              ...curr,
              isOwner: curr?.user_id === todosData?.owner?.owner_id,
            });
            return acc;
          }, [])
        );

        if (todosData?.owner?.owner_id === user?.id) {
          const requestsData = await api.get(
            `/api/todo-lists/${listIdParam}/access/requests?status=${REQUEST_STATUS.PENDING}`
          );
          setAccessRequests(requestsData);
        } else {
          setAccessRequests([]);
        }

        setShowTodoEditor(false);
        resetTodoEditor();
      } catch (error) {
        // TODO: handle No permission to access this list, redirect to /request-access route
        console.error('Error fetching todos and access requests:', error);
      }
    };

    fetchTodosAndAccessRequests();
  }, [listIdParam, user?.id, queryParams, resetTodoEditor, navigate]);

  // handlers
  const handleSelectFilter = (filterType, optionKey) => {
    const updatedQueryParams = new URLSearchParams(queryParams);
    let queryParamKey, setShowDropdown;

    switch (filterType) {
      case FILTER_TYPES.TODO_STATUS:
        queryParamKey = FILTER_PARAM_KEYS.TODO_STATUS;
        setShowDropdown = setShowStatusDropdown;
        break;
      case FILTER_TYPES.PRIORITY:
        queryParamKey = FILTER_PARAM_KEYS.PRIORITY;
        setShowDropdown = setShowPriorityDropdown;
        break;
      default:
        break;
    }

    if (optionKey) {
      updatedQueryParams.set(queryParamKey, optionKey);
    } else {
      // option key is null set by show all button, remove it from the query params
      updatedQueryParams.delete(queryParamKey);
    }

    const queryParamsString = updatedQueryParams.toString()
      ? `?${updatedQueryParams.toString()}`
      : '';

    navigate(`/todo-lists/${listIdParam}${queryParamsString}`, {
      replace: true,
    });

    setShowDropdown(false);
  };

  const handleResetFilters = () => {
    navigate(`/todo-lists/${listIdParam}`, { replace: true });
    setShowPriorityDropdown(false);
    setShowStatusDropdown(false);
  };

  const handleSelectSort = (sortType) => {
    const updatedQueryParams = new URLSearchParams(queryParams);
    const queryParam = SORT_BY_PARAMS[sortType];

    if (selectedSortBy !== queryParam) {
      updatedQueryParams.set('sortBy', queryParam);
    } else {
      updatedQueryParams.delete('sortBy');
    }

    const queryParamsString = updatedQueryParams.toString()
      ? `?${updatedQueryParams.toString()}`
      : '';

    navigate(`/todo-lists/${listIdParam}${queryParamsString}`, {
      replace: true,
    });
  };

  const handleOpenNewListEditor = () => {
    setShowNewListEditor(true);
    resetNewListEditor();
  };

  const handleAddList = async () => {
    try {
      const newListData = await api.post('/api/todo-lists', {
        title: newListTitle,
        description: newListDescription,
      });

      setLists((prevLists) => [
        { ...newListData, owner_username: `${user.username} (me)` },
        ...prevLists,
      ]);
      setShowNewListEditor(false);
      resetNewListEditor();
      navigate(`/todo-lists/${newListData.id}`);
    } catch (error) {
      console.error('Error adding list:', error);
    }
  };

  const handleOpenTodoEditor = (todo, { isNewTodoEditorMode = false }) => {
    setIsNewTodoEditorMode(isNewTodoEditorMode);
    setShowTodoEditor(true);

    if (isNewTodoEditorMode) {
      resetTodoEditor();
    } else {
      // populate the todo data for edit mode
      setEditorTodoId(todo.id);
      setEditorTodoTitle(todo.title);
      setEditorTodoDescription(todo.description);
      setEditorTodoDueDate(todo.due_date?.split('T')[0]);
      setEditorTodoStatus(todo.status);
      setEditorTodoPriority(todo.priority);
    }
  };

  const handleSubmitTodoEditor = async () => {
    const apiMethod = isNewTodoEditorMode ? 'post' : 'put';
    const todoIdParam = isNewTodoEditorMode ? '' : editorTodoId;

    try {
      const newTodoData = await api[apiMethod](
        `/api/todo-lists/${listIdParam}/todos/${todoIdParam}`,
        {
          title: editorTodoTitle,
          description: editorTodoDescription,
          dueDate: editorTodoDueDate,
          status: editorTodoStatus,
          priority: editorTodoPriority,
        }
      );

      if (isNewTodoEditorMode) {
        // add the new todo to the top of the list
        setTodos((prevTodos) => [newTodoData, ...prevTodos]);
        // emit socket event for todo creation
        socketRef.current.emit('todoCreated', newTodoData);
      } else {
        // update the todo in the list
        setTodos((prevTodos) =>
          prevTodos.map((prevTodo) =>
            prevTodo.id === editorTodoId ? newTodoData : prevTodo
          )
        );
        // emit socket event for todo update
        socketRef.current.emit('todoUpdated', newTodoData);
      }

      setShowTodoEditor(false);
      resetTodoEditor();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleDeleteTodo = () => {
    // TODO: handle delete todo, need server side implementation
  };

  const handleAcceptRequest = async (userId, requestedPermission) => {
    try {
      await api.put(
        `/api/todo-lists/${listIdParam}/access/requests/${userId}`,
        {
          status: REQUEST_STATUS.ACCEPTED,
        }
      );

      // update requests and users with access states without refetching the data
      const acceptedRequestUser = accessRequests.find(
        (accessRequest) => accessRequest.user_id === userId
      );
      setAccessRequests((prevAccessRequests) =>
        prevAccessRequests.filter(
          (accessRequest) => accessRequest.user_id !== userId
        )
      );
      setUsersWithAccess((prevUsersWithAccess) => [
        {
          permission: requestedPermission,
          user_id: acceptedRequestUser.user_id,
          username: acceptedRequestUser.username,
        },
        ...prevUsersWithAccess,
      ]);
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleShareList = () => {
    const shareUrl = `${window.location.origin}/todo-lists/${listIdParam}/request-access`;

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setShowShareTooltip(true);
        setTimeout(() => {
          setShowShareTooltip(false);
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
      });
  };

  const handleUserWithAccessOptions = () => {
    // TODO: handle user with access options
  };

  // component renderers
  const renderNewListButton = () => {
    const shouldBeDisabled =
      showNewListEditor && (!newListTitle || !newListDescription);

    return (
      <button
        onClick={showNewListEditor ? handleAddList : handleOpenNewListEditor}
        className={clsx(
          'flex w-full cursor-pointer items-center justify-center',
          'rounded-md border border-gray-300 bg-white px-3 py-2',
          'text-sm font-bold text-gray-700 hover:bg-gray-50',
          showNewListEditor &&
            '!border-0 !bg-blue-100 !text-blue-800 hover:!bg-blue-200',
          shouldBeDisabled && 'cursor-not-allowed opacity-50'
        )}
        disabled={shouldBeDisabled}
      >
        <span className="flex items-center">
          {showNewListEditor ? (
            'Create'
          ) : (
            <>
              <span className="mr-1">+</span> New List
            </>
          )}
        </span>
      </button>
    );
  };

  const renderNewListEditor = () => {
    return (
      <div className="relative bg-white">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-800">
            Create New List
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowNewListEditor(false)}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form className="mb-4 space-y-4">
          {/* title input */}
          <div>
            <label
              htmlFor="list-title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              id="list-title"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder=""
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
            />
          </div>

          {/* description text area */}
          <div>
            <label
              htmlFor="list-description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="list-description"
              rows={4}
              className="mt-1 mb-6 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder=""
              style={{ resize: 'none' }}
              value={newListDescription}
              onChange={(e) => setNewListDescription(e.target.value)}
            />
          </div>
        </form>
      </div>
    );
  };

  const renderTodoListsSidebar = () => {
    if (!lists.length) {
      return (
        <div className="relative flex h-full flex-col">
          <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-2xl text-gray-300 select-none">No lists</p>
          </div>
          <div className="absolute right-0 bottom-0 left-0 z-10 border-t border-gray-200 bg-white p-4">
            {showNewListEditor && renderNewListEditor()}
            {renderNewListButton()}
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex h-full flex-col">
        <div className="absolute inset-0 overflow-y-auto pb-16">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
        <div className="absolute right-0 bottom-0 left-0 z-10 border-t border-gray-200 bg-white p-4">
          {showNewListEditor && renderNewListEditor()}
          {renderNewListButton()}
        </div>
      </div>
    );
  };

  const renderFilterDropdown = (filterType) => {
    let optionKeys,
      styleConfig,
      label,
      selectedOption,
      showDropdown,
      setShowDropdown;

    switch (filterType) {
      case FILTER_TYPES.TODO_STATUS:
        optionKeys = TODO_STATUS;
        styleConfig = STYLE_CONFIGS.TODO_STATUS;
        label = 'Status';
        selectedOption = selectedStatus;
        showDropdown = showStatusDropdown;
        setShowDropdown = setShowStatusDropdown;
        break;
      case FILTER_TYPES.PRIORITY:
        optionKeys = PRIORITY;
        styleConfig = STYLE_CONFIGS.PRIORITY;
        label = 'Priority';
        selectedOption = selectedPriority;
        showDropdown = showPriorityDropdown;
        setShowDropdown = setShowPriorityDropdown;
        break;
      default:
        break;
    }

    return (
      <div className="relative">
        <button
          className={clsx(
            'cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2',
            'text-sm font-medium hover:bg-gray-50',
            selectedOption
              ? `${styleConfig[selectedOption].textColor} border-blue-500`
              : 'text-gray-700'
          )}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {styleConfig[selectedOption]?.label || label}
          <ChevronDownIcon className="-mr-1 ml-1 inline-block h-3 w-3" />
        </button>

        {showDropdown && (
          <div
            className={clsx(
              'absolute left-0 z-10 mt-2 w-48',
              'origin-top-left rounded-md',
              'border border-gray-200 bg-white py-1 shadow-lg'
            )}
          >
            <div className="px-3 py-2">
              {Object.values(optionKeys).map((optionKey) => (
                <button
                  key={optionKey}
                  className="mb-2 flex w-full cursor-pointer items-center rounded-md px-2 py-1 hover:bg-gray-100"
                  onClick={() => handleSelectFilter(filterType, optionKey)}
                >
                  <span
                    className={clsx(
                      'inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold',
                      styleConfig[optionKey].bgColor,
                      styleConfig[optionKey].textColor
                    )}
                  >
                    {styleConfig[optionKey].label}
                  </span>
                </button>
              ))}
              <div className="mt-1 border-t border-gray-100 pt-2">
                <button
                  onClick={() => handleSelectFilter(filterType, null)}
                  className="flex w-full cursor-pointer items-center rounded-md px-2 py-1 hover:bg-gray-100"
                >
                  <span className="inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                    Show all
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTodosGridSubheader = () => {
    return (
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        {/* status and priority dropdowns */}
        <div className="flex items-center space-x-2">
          <>
            {renderFilterDropdown('TODO_STATUS')}
            {renderFilterDropdown('PRIORITY')}

            {(selectedStatus || selectedPriority) && (
              <button
                onClick={handleResetFilters}
                className={clsx(
                  'ml-2 rounded-md border border-transparent px-4 py-2',
                  'text-sm font-medium text-gray-900 hover:bg-gray-50'
                )}
              >
                Reset
              </button>
            )}
          </>
        </div>

        {/* share and add todo buttons */}
        <div className="flex items-center">
          <div className="flex items-center">
            {showShareTooltip && (
              <span className="mr-2 text-sm text-green-800">Link copied!</span>
            )}
            <button
              onClick={handleShareList}
              className={clsx(
                'cursor-pointer rounded-full p-1',
                'text-gray-500 hover:text-blue-800'
              )}
              title="Share"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>
          {isUserHasEditPermission && (
            <button
              onClick={() =>
                handleOpenTodoEditor(null, { isNewTodoEditorMode: true })
              }
              className={clsx(
                'ml-4 inline-flex cursor-pointer items-center rounded-md',
                'box-border border-0 bg-blue-100 px-6 py-2 text-sm font-bold',
                'text-blue-800 hover:bg-blue-200'
              )}
            >
              <span className="mr-1">+</span> New
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderGridHeaderCell = (text = '', sortType) => {
    return (
      <div
        className={clsx(
          'px-4 py-3 text-left text-sm font-medium tracking-wider text-gray-500 select-none',
          sortType && 'cursor-pointer hover:text-gray-700',
          SORT_BY_PARAMS[sortType] === selectedSortBy && '!text-blue-800'
        )}
        onClick={() => {
          if (sortType) handleSelectSort(sortType);
        }}
      >
        <span className="flex items-center whitespace-nowrap">
          {text}
          {sortType && <ChevronUpDownIcon className="ml-1 h-4 w-4" />}
        </span>
      </div>
    );
  };

  const renderTodosGrid = () => {
    if (!todos.length) {
      return (
        <div className="flex h-3/4 w-full items-center justify-center p-4">
          <p className="text-2xl text-gray-300 select-none">No items</p>
        </div>
      );
    }

    const gridTemplateColumns = '15% 35% 10% 10% 10% 12% 8%';

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* grid header */}
          <div
            className={clsx(
              'grid grid-cols-7 border-b border-gray-200 bg-gray-50',
              'min-w-[1000px]'
            )}
            style={{ gridTemplateColumns }}
          >
            {renderGridHeaderCell('Title', SORT_BY_TYPES.TITLE)}
            {renderGridHeaderCell('Description')}
            {renderGridHeaderCell('Due Date', SORT_BY_TYPES.DUE_DATE)}
            {renderGridHeaderCell('Status', SORT_BY_TYPES.TODO_STATUS)}
            {renderGridHeaderCell('Priority', SORT_BY_TYPES.PRIORITY)}
            {renderGridHeaderCell('Created At', SORT_BY_TYPES.CREATED_AT)}
            {renderGridHeaderCell('')}
          </div>

          {/* grid rows */}
          <div className="divide-y divide-gray-200 border-b border-gray-200 bg-white">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                showActions={isUserHasEditPermission}
                onEdit={() =>
                  handleOpenTodoEditor(todo, { isNewTodoEditorMode: false })
                }
                onDelete={handleDeleteTodo}
                gridTemplateColumns={gridTemplateColumns}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTodoEditor = () => {
    return (
      <div className="relative border-t border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-800">
            {isNewTodoEditorMode ? 'Create New Todo' : 'Edit Todo'}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowTodoEditor(false)}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex w-3/4 flex-col">
              {/* title */}
              <div className="mb-4">
                <label
                  htmlFor="todo-title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id="todo-title"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={editorTodoTitle}
                  onChange={(e) => setEditorTodoTitle(e.target.value)}
                />
              </div>

              {/* description */}
              <div className="flex flex-grow flex-col">
                <label
                  htmlFor="todo-description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="todo-description"
                  rows={4}
                  className="mt-1 block w-full flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm"
                  style={{ resize: 'none' }}
                  value={editorTodoDescription}
                  onChange={(e) => setEditorTodoDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex w-1/4 flex-col">
              {/* due date */}
              <div className="mb-4">
                <label
                  htmlFor="todo-due-date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Due Date
                </label>
                <input
                  id="todo-due-date"
                  type="date"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={editorTodoDueDate}
                  onChange={(e) => setEditorTodoDueDate(e.target.value)}
                />
              </div>

              {/* status dropdown */}
              <div className="mb-4">
                <label
                  htmlFor="todo-status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="todo-status"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm"
                  value={editorTodoStatus}
                  onChange={(e) => setEditorTodoStatus(e.target.value)}
                >
                  {Object.values(TODO_STATUS).map((status) => (
                    <option key={status} value={status}>
                      {STYLE_CONFIGS.TODO_STATUS[status]?.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* priority dropdown */}
              <div className="mt-auto">
                <label
                  htmlFor="todo-priority"
                  className="block text-sm font-medium text-gray-700"
                >
                  Priority
                </label>
                <select
                  id="todo-priority"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm"
                  value={editorTodoPriority}
                  onChange={(e) => setEditorTodoPriority(e.target.value)}
                >
                  {Object.values(PRIORITY).map((priority) => (
                    <option key={priority} value={priority}>
                      {STYLE_CONFIGS.PRIORITY[priority]?.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-1/4">
              <button
                type="button"
                className={clsx(
                  'ml-1 w-full rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-200',
                  !editorTodoTitle && 'cursor-not-allowed opacity-50'
                )}
                onClick={handleSubmitTodoEditor}
                disabled={!editorTodoTitle}
              >
                {isNewTodoEditorMode ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  const renderTodos = () => {
    if (!listIdParam)
      return (
        <div className="relative flex h-full flex-col">
          <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-2xl text-gray-300 select-none">
              Select or create a todo list first
            </p>
          </div>
          {showTodoEditor && (
            <div className="absolute right-0 bottom-0 left-0 z-10">
              {renderTodoEditor()}
            </div>
          )}
        </div>
      );

    return (
      <div className="relative flex h-full flex-col">
        <div className="absolute inset-0 flex flex-col overflow-hidden">
          <div className="flex-shrink-0">{renderTodosGridSubheader()}</div>
          <div className="flex-1 overflow-auto">{renderTodosGrid()}</div>
        </div>
        {showTodoEditor && (
          <div className="absolute right-0 bottom-0 left-0 z-10">
            {renderTodoEditor()}
          </div>
        )}
      </div>
    );
  };

  const renderAccessControlSideBar = () => {
    if (!accessRequests.length && !usersWithAccess.length) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-2xl text-gray-300 select-none">No users</p>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto">
        {/* access requests section */}
        {accessRequests.length > 0 && (
          <div className="border-b border-gray-200">
            <h3 className="sticky top-0 z-10 bg-white p-3 text-sm font-semibold text-gray-700">
              Access Requests
            </h3>
            <div className="space-y-2 p-3">
              {accessRequests.map((request) => (
                <UserCard
                  key={request.user_id}
                  user={request}
                  isRequest={true}
                  onAccept={handleAcceptRequest}
                />
              ))}
            </div>
          </div>
        )}

        {/* users with access section */}
        {usersWithAccess.length > 0 && (
          <div>
            <h3 className="sticky top-0 z-10 bg-white p-3 text-sm font-semibold text-gray-700">
              Users with Access
            </h3>
            <div className="space-y-2 p-3">
              {usersWithAccess.map((user) => (
                <UserCard
                  key={user.user_id}
                  user={user}
                  onOptions={handleUserWithAccessOptions}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="flex flex-1 overflow-hidden">
        <div className="flex h-full w-1/5 min-w-[240px] flex-col border-r border-gray-200">
          {renderTodoListsSidebar()}
        </div>

        <div className="h-full min-w-[500px] flex-1 overflow-auto bg-white">
          {renderTodos()}
        </div>

        <div className="h-full w-1/6 min-w-[250px] overflow-auto border-l border-gray-200 bg-white">
          {renderAccessControlSideBar()}
        </div>
      </main>
    </div>
  );
}
