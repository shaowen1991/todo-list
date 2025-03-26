import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  FILTER_PARAM_KEYS,
  FILTER_TYPES,
  PRIORITY,
  SORT_BY_PARAMS,
  SORT_BY_TYPES,
  TODO_STATUS,
} from '../constants/enums';
import { STYLE_CONFIGS } from '../constants/displays';

export default function TodoLists() {
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
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

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
        const queryParamsString = queryParams.toString()
          ? `?${queryParams.toString()}`
          : '';
        const todosData = await api.get(
          `/api/todo-lists/${listIdParam}/todos${queryParamsString}`
        );

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
  }, [listIdParam, user?.id, queryParams]);

  // handlers
  const handleSelectOption = (filterType, optionKey) => {
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
    setNewListTitle('');
    setNewListDescription('');
  };

  const handleAddList = async () => {
    try {
      const newListData = await api.post('/api/todo-lists', {
        title: newListTitle,
        description: newListDescription,
      });

      setLists([{ ...newListData, owner_username: 'me' }, ...lists]);
      setShowNewListEditor(false);
      setNewListTitle('');
      setNewListDescription('');
    } catch (error) {
      console.error('Error adding list:', error);
    }
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

  const handleUserWithAccessOptions = (id) => {
    // TODO: handle user with access options
    console.log('User options', id);
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
                  onClick={() => handleSelectOption(filterType, optionKey)}
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
                  onClick={() => handleSelectOption(filterType, null)}
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
              'box-border border-0 bg-blue-100 px-6 py-2 text-sm font-bold',
              'text-blue-800 hover:bg-blue-200'
            )}
          >
            <span className="mr-1">+</span> New
          </button>
        </div>
      </div>
    );
  };

  const renderGridHeaderCell = (text = '', sortType) => {
    return (
      <div
        className={clsx(
          'px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none',
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

    const gridTemplateColumns = '15% 35% 12% 10% 10% 10% 8%';

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
