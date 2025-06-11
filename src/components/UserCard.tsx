import React from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  user: {
    id: number;
    name: string;
    surname: string;
    bio?: string;
    job?: string;
  };
};

export const UserCard: React.FC<Props> = ({ user }) => {
  const nav = useNavigate();
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h2 className="text-xl font-semibold">
        {user.name} {user.surname}
      </h2>
      <p>{user.job}</p>
      <p>{user.bio}</p>
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => nav(`/messages/${user.id}`)}
      >
        İletişime Geç
      </button>
    </div>
  );
};
