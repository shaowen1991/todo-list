import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import clsx from 'clsx';
import { ACCESS_PERMISSION } from '../constants/enums';

const RequestAccess = () => {
  const navigate = useNavigate();
  const { listId } = useParams();
  const listIdParam = Number(listId);
  const { user } = useAuth();
  const [list, setList] = useState(null);
  const [permission, setPermission] = useState(ACCESS_PERMISSION.VIEW);
  const [errorMsg, seterrorMsg] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const listData = await api.get(`/api/todo-lists/${listIdParam}`);
        setList(listData);

        // if the user is already in the accessibleUsers list, navigate to the list
        const isUserAccessible = listData?.accessibleUsers.find(
          (accessibleUser) => accessibleUser.user_id === user.id
        );
        if (isUserAccessible) navigate(`/todo-lists/${listIdParam}`);
      } catch (err) {
        console.error('Error fetching list:', err);
        if (err?.error) seterrorMsg(err.error);
      }
    };

    fetchList();
  }, [listIdParam, user.id, navigate]);

  const handleRequestAccess = async () => {
    try {
      seterrorMsg(null);
      await api.post(`/api/todo-lists/${listIdParam}/access/requests`, {
        permission,
      });
      navigate('/');
    } catch (err) {
      console.error('Error requesting access:', err);
      if (err?.error) seterrorMsg(err.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg space-y-8 rounded-lg bg-white p-8 shadow">
        <div>
          <h1 className="text-2xl font-bold">
            Request Access to "{list?.title}"
          </h1>

          <p className="mt-2 text-sm text-gray-900">
            {list?.description}, owned by{' '}
            <span className="font-semibold">{list?.owner_username}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-md bg-red-100 p-3 text-sm text-red-800">
            {errorMsg}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="permission"
              className="block text-sm font-medium text-gray-700"
            >
              Access Type
            </label>
            <select
              id="permission"
              name="permission"
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              required
              className={clsx(
                'mt-1 block h-10 w-full rounded-md border border-gray-300',
                'px-3 py-2'
              )}
            >
              <option value={ACCESS_PERMISSION.VIEW}>Viewer</option>
              <option value={ACCESS_PERMISSION.EDIT}>Editor</option>
            </select>
          </div>

          <div className="mt-8 flex justify-between space-x-24">
            <button
              type="button"
              onClick={() => navigate('/')}
              className={clsx(
                'w-1/2 cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2',
                'text-sm font-medium text-gray-700 hover:bg-gray-50'
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleRequestAccess}
              className={clsx(
                'flex h-10 w-1/2 items-center justify-center rounded-md',
                'cursor-pointer border border-transparent bg-blue-100 px-4 text-sm font-medium',
                'text-blue-800 hover:bg-blue-200'
              )}
            >
              Send Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestAccess;
