import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShareIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import ListCard from '../components/ListCard';
import TodoItem from '../components/TodoItem';
import UserCard from '../components/UserCard';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import clsx from 'clsx';
import { TASK_STATUS, PRIORITY } from '../constants/enums';
import { STYLE_CONFIGS } from '../constants/displays';

export default function TodoLists() {
  const { listId } = useParams();
  const listIdParam = Number(listId);
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [todos, setTodos] = useState([]);
  const [usersWithAccess, setUsersWithAccess] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // side effects and fetches
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const listsData = await api.get('/api/todo-lists');
        // display the owner's username as 'me' in lists that the user owns
        listsData.forEach((list) => {
          if (list?.owner_id === user?.id) list.owner_username = 'me';
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
        const todosData = await api.get(`/api/todo-lists/${listIdParam}/todos`);
        setTodos(todosData?.todos);
        setUsersWithAccess(
          todosData?.accessibleUsers?.reduce((acc, curr) => {
            // exclude the user himself from the list of users with access
            if (curr?.user_id !== user.id) acc.push(curr);
            return acc;
          }, [])
        );

        if (todosData?.owner?.owner_id === user?.id) {
          const requestsData = await api.get(
            `/api/todo-lists/${listIdParam}/access/requests`
          );
          setAccessRequests(requestsData);
        } else {
          setAccessRequests([]);
        }
      } catch (error) {
        // TODO: handle No permission to access this list, redirect to /request-access route
        console.error('Error fetching todos and access requests:', error);
      }
    };

    fetchTodosAndAccessRequests();
  }, [listIdParam, user?.id]);

  // handlers
  const toggleStatus = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const togglePriority = (priority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  const handleAddList = () => {
    // logic to add a new list
    console.log('Add new list');
  };

  const handleAddTodo = () => {
    // logic to add a new todo
    console.log('Add new todo');
  };

  const handleEditTodo = (id) => {
    // logic to edit a todo
    console.log('Edit todo', id);
  };

  const handleDeleteTodo = (id) => {
    // logic to delete a todo
    console.log('Delete todo', id);
  };

  const handleAcceptRequest = (id) => {
    console.log('Accept request', id);
  };

  const handleShareList = () => {
    console.log('Share list');
  };

  const handleUserOptions = (id) => {
    console.log('User options', id);
  };

  // component renderers
  const renderNewListButton = () => {
    return (
      <button
        onClick={handleAddList}
        className={clsx(
          'flex w-full cursor-pointer items-center justify-center',
          'rounded-md border border-gray-300 bg-white p-3',
          'text-sm font-bold text-gray-700 hover:bg-gray-50'
        )}
      >
        <span className="flex items-center">
          <span className="mr-1">+</span> New List
        </span>
      </button>
    );
  };

  const renderTodoListsSidebar = () => {
    if (!lists.length) {
      return (
        <div className="relative flex h-full flex-col">
          <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-2xl text-gray-300 select-none">No lists</p>
          </div>
          <div className="absolute right-0 bottom-0 left-0 z-10 border-t border-gray-200 bg-white p-2">
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
        <div className="absolute right-0 bottom-0 left-0 z-10 border-t border-gray-200 bg-white p-2">
          {renderNewListButton()}
        </div>
      </div>
    );
  };

  const renderTodosGridSubheader = () => {
    return (
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        {/* status and priority dropdowns */}
        <div className="flex space-x-2">
          {!!todos.length && (
            <>
              <div className="relative">
                <button
                  className={clsx(
                    'cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2',
                    'text-sm font-medium text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  Status
                  <ChevronDownIcon className="-mr-1 ml-1 inline-block h-3 w-3" />
                </button>

                {showStatusDropdown && (
                  <div
                    className={clsx(
                      'absolute left-0 z-10 mt-2 w-48',
                      'origin-top-left rounded-md',
                      'border border-gray-200 bg-white py-1 shadow-lg'
                    )}
                  >
                    <div className="px-3 py-2">
                      {Object.values(TASK_STATUS).map((status) => (
                        <label
                          key={status}
                          className="flex items-center space-x-2 py-1"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-800 focus:ring-blue-500"
                            checked={selectedStatuses.includes(status)}
                            onChange={() => toggleStatus(status)}
                          />
                          <span
                            className={clsx(
                              'inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold',
                              STYLE_CONFIGS.STATUS[status].bgColor,
                              STYLE_CONFIGS.STATUS[status].textColor
                            )}
                          >
                            {STYLE_CONFIGS.STATUS[status].label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  className={clsx(
                    'cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2',
                    'text-sm font-medium text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                >
                  Priority
                  <ChevronDownIcon className="-mr-1 ml-1 inline-block h-3 w-3" />
                </button>

                {showPriorityDropdown && (
                  <div
                    className={clsx(
                      'absolute left-0 z-10 mt-2 w-48',
                      'origin-top-left rounded-md',
                      'border border-gray-200 bg-white py-1 shadow-lg'
                    )}
                  >
                    <div className="px-3 py-2">
                      {Object.values(PRIORITY).map((priority) => (
                        <label
                          key={priority}
                          className="flex items-center space-x-2 py-1"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-800 focus:ring-blue-500"
                            checked={selectedPriorities.includes(priority)}
                            onChange={() => togglePriority(priority)}
                          />
                          <span
                            className={clsx(
                              'inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold',
                              STYLE_CONFIGS.PRIORITY[priority].bgColor,
                              STYLE_CONFIGS.PRIORITY[priority].textColor
                            )}
                          >
                            {STYLE_CONFIGS.PRIORITY[priority].label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* share and add todo buttons */}
        <div className="flex items-center">
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
          <button
            onClick={handleAddTodo}
            className={clsx(
              'ml-4 inline-flex cursor-pointer items-center rounded-md',
              'border-0 bg-blue-100 px-6 py-2 text-sm font-bold',
              'text-blue-800 hover:bg-blue-200'
            )}
          >
            <span className="mr-1">+</span> New
          </button>
        </div>
      </div>
    );
  };

  const renderGridHeaderCell = (text = '', options = { canSort: false }) => {
    return (
      <div className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
        <span className="flex items-center whitespace-nowrap">
          {text}
          {options.canSort && <ChevronUpDownIcon className="ml-1 h-4 w-4" />}
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

    const gridTemplateColumns = '15% 35% 10% 10% 10% 10% 10%';

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
            {renderGridHeaderCell('Title', { canSort: true })}
            {renderGridHeaderCell('Description')}
            {renderGridHeaderCell('Due Date', { canSort: true })}
            {renderGridHeaderCell('Status', { canSort: true })}
            {renderGridHeaderCell('Priority', { canSort: true })}
            {renderGridHeaderCell('Created At')}
            {renderGridHeaderCell('')}
          </div>

          {/* grid rows */}
          <div className="divide-y divide-gray-200 border-b border-gray-200 bg-white">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onEdit={handleEditTodo}
                onDelete={handleDeleteTodo}
                gridTemplateColumns={gridTemplateColumns}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTodos = () => {
    if (!listIdParam)
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <p className="text-2xl text-gray-300 select-none">
            Select or create a todo list first
          </p>
        </div>
      );

    return (
      <div className="flex h-full flex-col">
        <div className="flex-shrink-0">{renderTodosGridSubheader()}</div>
        <div className="flex-1 overflow-auto">{renderTodosGrid()}</div>
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
                  onOptions={handleUserOptions}
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
