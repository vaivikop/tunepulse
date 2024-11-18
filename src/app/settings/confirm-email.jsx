import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const ConfirmEmail = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (token) {
      // Confirm email via API call with the token
      const confirmEmail = async () => {
        try {
          setLoading(true);
          const response = await axios.post('/api/confirm-email', { token });
          setMessage(response.data.message);
          setIsConfirmed(true);
        } catch (error) {
          console.error('Error confirming email:', error);
          setMessage('Failed to confirm email.');
        } finally {
          setLoading(false);
        }
      };
      confirmEmail();
    }
  }, [token]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-white mb-4">Confirm Email</h2>
      {loading && <p className="text-gray-400">Confirming email...</p>}
      {message && <p className="text-green-500">{message}</p>}
      {isConfirmed && (
        <button
          onClick={() => router.push('/settings')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Go to Settings
        </button>
      )}
    </div>
  );
};

export default ConfirmEmail;
