import React from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  user: {
    id: number;
    name: string;
    surname: string;
    email: string;
    bio?: string;
    job?: string;
    profilFoto?: string | null;
  };
  photoSrc?: string;
};

export const UserCard: React.FC<Props> = ({ user, photoSrc }) => {
  const nav = useNavigate();

  // Öncelikle blob URL, yoksa profilFoto yolu
  const imgSrc = photoSrc || (user.profilFoto ? `http://localhost:8080${user.profilFoto}` : '');

  return (
    <div className="border rounded-lg p-4 shadow-md flex items-center space-x-4">
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={`${user.name} ${user.surname}`}
          className="w-16 h-16 rounded-full object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          <span className="text-xl">?</span>
        </div>
      )}
      <div className="flex-1">
        <h2 className="text-xl font-semibold">
          {user.name} {user.surname}
        </h2>
        <p className="text-sm text-gray-600">{user.email}</p>
        {user.job && <p className="mt-1 text-gray-800">{user.job}</p>}
        {user.bio && <p className="mt-1 text-gray-700">{user.bio}</p>}
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => nav(`/chat/${user.id}`)}
        >
          İletişime Geç
        </button>
      </div>
    </div>
  );
};
