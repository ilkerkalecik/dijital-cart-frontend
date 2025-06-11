import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { User } from '../api';

export const HomePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    api.getAllUsers().then(res => setUsers(res.data));
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {users.map(u => (
        <div key={u.id} className="border p-4 rounded shadow">
          <h3 className="text-lg font-semibold">{u.name} {u.surname}</h3>
          <p>{u.job}</p>
          <button
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
            onClick={() => {
              // Şu anki kullanıcı ID’sini sakla, sohbet sayfası ihtiyaç duyacak
              localStorage.setItem('chatWith', u.id.toString());
              nav(`/chat/${u.id}`);
            }}
          >
            İletişime Geç
          </button>
        </div>
      ))}
    </div>
  );
};
