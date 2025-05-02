import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Label from '../../components/form/Label';

interface User {
  user_id: number;
  name: string;
}

const Notify = () => {
  const [mode, setMode] = useState<'single' | 'multiple'>('multiple');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'single') {
      setUsersLoading(true);
      setError(null);
      axios
        .get('https://api.meetowner.in/user/v1/getAllTokens')
        .then((res) => {
          // Adjust based on API response structure
          const userData = Array.isArray(res.data) ? res.data : res.data?.data || [];
          if (userData.length === 0) {
            setError('No users found.');
          } else {
            setUsers(userData);
          }
        })
        .catch((err) => {
          console.error('Error fetching users:', err);
          setError('Failed to load users. Please try again.');
        })
        .finally(() => {
          setUsersLoading(false);
        });
    } else {
      // Clear users when switching to 'multiple'
      setUsers([]);
      setSelectedUser(null);
      setError(null);
    }
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'multiple') {
        await axios.post('https://api.meetowner.in/user/v1/notify-all', { title, message });
      } else if (mode === 'single' && selectedUser) {
        await axios.post('https://api.meetowner.in/user/v1/notify-user', {
          user_id: selectedUser,
          title,
          message,
        });
      } else {
        throw new Error('Please select a user.');
      }
      alert('Notification sent!');
       toast.success("Notification sent!");
      setTitle('');
      setMessage('');
      setSelectedUser(null);
    } catch (err: any) {
      console.error('Error sending notification:', err);
      alert(err.message || 'Failed to send notification.');
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
         <Label htmlFor='send to'>Send To</Label>
      
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
          <Label htmlFor='order'>Select User</Label>
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
         <Label htmlFor='title'>Title</Label>
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
         <Label htmlFor='message'>Message</Label>

     
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