
import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import useLocalStorage from '../hooks/useLocalStorage';
import type { User } from '../types';
import { initialUsers } from '../data/initialData';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users] = useLocalStorage<User[]>('users', initialUsers);

  const handleLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      setError('');
      // We don't want to pass the password to the app state
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userToLogin } = foundUser;
      onLogin(userToLogin as User);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black text-slate-300" dir="rtl">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Logo width={60} height={60} />
            <h1 className="text-4xl font-bold text-white tracking-wider">الأسنانجي</h1>
          </div>
          <p className="text-gray-400">نظام إدارة مستلزمات طب الأسنان</p>
        </div>
        <form className="space-y-6" onSubmit={handleLoginAttempt}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">اسم المستخدم</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 placeholder-gray-500"
              placeholder="admin or user"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">كلمة المرور</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 placeholder-gray-500"
              placeholder="password"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 transition-colors"
            >
              تسجيل الدخول
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          ليس لديك حساب؟{' '}
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="font-medium text-sky-400 hover:text-sky-300 focus:outline-none"
          >
            إنشاء حساب جديد
          </button>
        </p>
      </div>
    </div>
  );
};