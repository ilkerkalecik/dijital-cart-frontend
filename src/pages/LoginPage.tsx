import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const res = await api.login(email, password) as unknown as { data: { token: string } };
      localStorage.setItem('token', res.data.token);
      nav('/profile');
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl mb-4">Giriş Yap</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-green-500 text-white py-2 rounded">
          Giriş
        </button>
      </form>
      <p className="mt-4">
        Hesabın yok mu?{' '}
        <Link to="/signup" className="text-blue-600">
          Kayıt Ol
        </Link>
      </p>
    </div>
  );
};
