
import React, { useState, useEffect } from 'react';
import type { User } from '../types';

interface UserFormProps {
  onSave: (user: User) => void;
  onClose: () => void;
  userToEdit: User | null;
}

const initialUserState: Omit<User, 'id'> = {
  username: '',
  password: '',
  role: 'user',
};

export const UserForm: React.FC<UserFormProps> = ({ onSave, onClose, userToEdit }) => {
    const [user, setUser] = useState(initialUserState);

    useEffect(() => {
        if (userToEdit) {
            setUser({ ...userToEdit, password: '' }); // Don't show existing password
        } else {
            setUser(initialUserState);
        }
    }, [userToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Password is required for new users, but optional when editing (if not changed)
        if (!userToEdit && !user.password) {
            alert('يرجى إدخال كلمة المرور للمستخدم الجديد.');
            return;
        }
        
        const userData = { ...user };
        // If password is not changed on edit, don't send it back
        if (userToEdit && !userData.password) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...rest } = userData;
            onSave(rest as User);
        } else {
             onSave(userData as User);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">اسم المستخدم</label>
                <input type="text" name="username" value={user.username} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">كلمة المرور</label>
                <input type="password" name="password" value={user.password} onChange={handleChange} placeholder={userToEdit ? 'اتركه فارغاً لعدم التغيير' : ''} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
            </div>
             <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300">الصلاحية</label>
                <select name="role" value={user.role} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                    <option value="user">مستخدم</option>
                    <option value="admin">مدير</option>
                </select>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md">حفظ</button>
            </div>
        </form>
    );
};