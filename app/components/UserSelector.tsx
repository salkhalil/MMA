'use client';

import { User } from '@/types';

interface UserSelectorProps {
  users: User[];
  currentUserId: number;
  onUserChange: (userId: number) => void;
}

export default function UserSelector({ users, currentUserId, onUserChange }: UserSelectorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-100">
      <label htmlFor="user-select" className="block text-base font-semibold text-gray-900 mb-3">
        👤 Who are you?
      </label>
      <select
        id="user-select"
        value={currentUserId}
        onChange={(e) => onUserChange(Number(e.target.value))}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 font-medium text-gray-900"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}

