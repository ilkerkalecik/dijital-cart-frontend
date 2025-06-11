// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import type { SigninResponseDto } from '../api'; // Adjust the path to where SigninResponseDto is defined
 // Adjust the path to where SigninResponseDto is defined

// Remove the local interface as it conflicts with the imported type

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.login(email, password) as { data: SigninResponseDto };
      const { success, message, token } = res.data;

      if (!success) {
        setError(message || 'Giriş başarısız. Lütfen tekrar deneyiniz.');
        return;
      }

      localStorage.setItem('token', token);
      navigate('/home');
    } catch {
      setError('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl mb-4">Giriş Yap</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Giriş başarısız
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
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
