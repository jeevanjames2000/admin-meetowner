import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Label from '../../components/form/Label';
import { fetchAllTokens, notifyAllUsers, notifySingleUser } from '../../store/slices/notifySlice';
import { AppDispatch, RootState } from '../../store/store';



const Notify :React.FC= () => {
  const [mode, setMode] = useState<'single' | 'multiple'>('multiple');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { users, loading: usersLoading, error: usersError } = useSelector((state: RootState) => state.notify);

  useEffect(() => {
    if (mode === 'single') {
      dispatch(fetchAllTokens());
    } else {
      setSelectedUser(null);
      setError(null);
    }
  }, [dispatch, mode]);

  useEffect(() => {
  
    if (usersError) {
      setError(usersError);
    } else if (users.length === 0 && !usersLoading && mode === 'single') {
      setError('No users found.');
    } else {
      setError(null);
    }
  }, [users, usersLoading, usersError, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'multiple') {
        await dispatch(notifyAllUsers({ title, message })).unwrap();
      } else if (mode === 'single' && selectedUser) {
     
        await dispatch(notifySingleUser({ user_id: selectedUser, title, message })).unwrap();
      } else {
        throw new Error('Please select a user.');
      }

      setTitle('');
      setMessage('');
      setSelectedUser(null);
    } catch (err: any) {
    
      toast.error(err.message || 'Error sending notification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-full mx-auto bg-white p-6 rounded-xl shadow-lg space-y-4"
    >
      <p className="text-xl font-semibold">Send Push Notification</p>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded-md">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="send to">Send To</Label>
        <select
          id="send to"
          value={mode}
          onChange={(e) => setMode(e.target.value as 'single' | 'multiple')}
          className="w-full border rounded-md px-3 py-2"
        >
          <option value="multiple">All Users</option>
          <option value="single">Single User</option>
        </select>
      </div>

      {mode === 'single' && (
        <div>
          <Label htmlFor="order">Select User</Label>
          {usersLoading ? (
            <div className="text-gray-500">Loading users...</div>
          ) : (
            <select
              id="order"
              value={selectedUser ?? ''}
              onChange={(e) => setSelectedUser(e.target.value ? Number(e.target.value) : null)}
              className="w-full border rounded-md px-3 py-2"
              disabled={users.length === 0}
            >
              <option value="" disabled>
                {users.length === 0 ? 'No users available' : 'Select user'}
              </option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.name} (ID: {user.user_id})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="title">Title</Label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border rounded-md px-3 py-2"
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="w-full border rounded-md px-3 py-2"
          rows={4}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#1D3A76] text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
        disabled={loading || (mode === 'single' && !selectedUser)}
      >
        {loading ? 'Sending...' : 'Send Notification'}
      </button>
    </form>
  );
};

export default Notify;