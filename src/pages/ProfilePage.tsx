import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { User } from '../api';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    bio: '',
    job: ''
  });

  useEffect(() => {
    (async () => {
      const { data: id } = await api.getCurrentUserId();
      const { data } = await api.getUserById(id) as { data: User };
      setUser(data);
      setForm({
        name: data.name,
        surname: data.surname,
        email: data.email,
        password: '',
        bio: data.bio || '',
        job: data.job || ''
      });
    })();
  }, []);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateUser(
      form.name,
      form.surname,
      form.email,
      form.password,
      form.bio,
      form.job
    );
    alert('Güncellendi');
  };

  const logout = async () => {
    await api.logout();
    localStorage.removeItem('token');
    nav('/login');
  };

  if (!user) return <div>Yükleniyor...</div>;

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-2xl mb-4">Profilim</h1>
      <form onSubmit={handle} className="flex flex-col gap-2">
        <input
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          value={form.surname}
          onChange={e => setForm({ ...form, surname: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Yeni Şifre"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="İş"
          value={form.job}
          onChange={e => setForm({ ...form, job: e.target.value })}
          className="border p-2 rounded"
        />
        <textarea
          placeholder="Bio"
          value={form.bio}
          onChange={e => setForm({ ...form, bio: e.target.value })}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-green-500 text-white py-2 rounded">
          Kaydet
        </button>
      </form>
      <button onClick={logout} className="mt-4 text-red-500">
        Çıkış Yap
      </button>
    </div>
  );
};
