'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import api from '@/lib/api'; // your axios instance
import { AxiosError } from 'axios';

export default function UpdatePhone() {
  const { user } = useUser();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsError(false);

    try {
      const { data } = await api.put('/sellers/update-phone', {
        clerkId: user?.id,
        phone,
      });

      setMessage(data.message);
    } catch (err: AxiosError<{ message: string }>) {
      setIsError(true);
      setMessage(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Update Your Phone Number</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="tel"
          placeholder="+254700000000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Phone'}
        </button>
      </form>
      {message && (
        <p style={{ color: isError ? 'red' : 'green' }}>{message}</p>
      )}
    </div>
  );
}