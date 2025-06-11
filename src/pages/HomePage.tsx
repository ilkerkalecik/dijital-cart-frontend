// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { UserCard } from '../components/UserCard';
import { ProfileSection } from '../components/ProfileSection';
import type { User } from '../api';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [tab, setTab] = useState<'users' | 'profile'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [photoBlobs, setPhotoBlobs] = useState<Record<number, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await api.getAllUsers();
      setUsers(data);

      const blobs: Record<number, string> = {};
      await Promise.all(
        data.map(async u => {
          if (u.profilFoto) {
            try {
              const blob = await api.getUserPhoto(u.profilFoto);
              blobs[u.id] = URL.createObjectURL(blob);
            } catch (err) {
              console.error('Fotoğraf yüklenemedi:', err);
            }
          }
        })
      );
      setPhotoBlobs(blobs);
    })();

    return () => {
      Object.values(photoBlobs).forEach(URL.revokeObjectURL);
    };
  }, []);


  const handleLogout = async () => {
    await api.logout();
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 mr-2 rounded ${tab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Kullanıcılar
          </button>
          <button
            onClick={() => setTab('profile')}
            className={`px-4 py-2 rounded ${tab === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Profilim
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Çıkış Yap
        </button>
      </div>

      {tab === 'users' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {users.map(u => (
            <UserCard key={u.id} user={u} photoSrc={photoBlobs[u.id]} />
          ))}
        </div>
      ) : (
        <ProfileSection />
      )}
    </div>
  );
};
