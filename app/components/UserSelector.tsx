'use client';

import { User } from '@/types';

interface UserSelectorProps {
  users: User[];
  currentUserId: number;
  onUserChange: (userId: number) => void;
}

export default function UserSelector({ users, currentUserId, onUserChange }: UserSelectorProps) {
  return (
    <div className="rounded-2xl shadow-lg p-5 mb-6 border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      <label htmlFor="user-select" className="block text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        👤 Who are you?
      </label>
      <select
        id="user-select"
        value={currentUserId}
        onChange={(e) => onUserChange(Number(e.target.value))}
        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium"
        style={{ 
          borderColor: "var(--card-border)", 
          backgroundColor: "var(--background-secondary)", 
          color: "var(--text-primary)",
        }}
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

