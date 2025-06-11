import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.signup(name, surname, email, password);
    nav('/login');
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl mb-4">Kayıt Ol</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          placeholder="Ad"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          placeholder="Soyad"
          value={surname}
          onChange={e => setSurname(e.target.value)}
          className="border p-2 rounded"
        />
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
        <button type="submit" className="bg-blue-500 text-white py-2 rounded">
          Kayıt Ol
        </button>
      </form>
      <p className="mt-4">
        Zaten hesabın var mı?{' '}
        <Link to="/login" className="text-blue-600">
          Giriş Yap
        </Link>
      </p>
    </div>
  );
};
