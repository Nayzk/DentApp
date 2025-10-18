
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { User } from '../types';
import { Modal } from '../components/Modal';
import { initialUsers } from '../data/initialData';
import { EmptyState } from '../components/EmptyState';
import { UserForm } from '../components/UserForm';


interface UsersProps {
    currentUser: User;
}

export const Users: React.FC<UsersProps> = ({ currentUser }) => {
  const [users, setUsers] = useLocalStorage<User[]>('users', initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const handleOpenModal = (user?: User) => {
    setUserToEdit(user || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setUserToEdit(null);
    setIsModalOpen(false);
  };
  
  const handleSaveUser = (user: User) => {
    if (userToEdit) {
      setUsers(users.map(u => u.id === user.id ? { ...u, ...user } : u));
    } else {
      setUsers([...users, { ...user, id: crypto.randomUUID() }]);
    }
    handleCloseModal();
  };
  
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
        alert('لا يمكنك حذف حسابك الخاص.');
        return;
    }
    if(window.confirm('هل أنت متأكد من رغبتك في حذف هذا المستخدم؟')) {
        setUsers(users.filter(u => u.id !== userId));
    }
  };

  return (
    <div className="bg-gray-900 p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-100">إدارة المستخدمين</h2>
        <div className="flex gap-4 items-center">
            <button onClick={() => handleOpenModal()} className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
              إضافة مستخدم جديد
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {users.length > 0 ? (
          <table className="w-full text-right">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 font-semibold text-gray-300">اسم المستخدم</th>
                <th className="p-4 font-semibold text-gray-300">الصلاحية</th>
                <th className="p-4 font-semibold text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-4 font-medium text-gray-200">{user.username}</td>
                  <td className="p-4 text-gray-300">{user.role === 'admin' ? 'مدير' : 'مستخدم'}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleOpenModal(user)} className="text-blue-400 hover:text-blue-300">تعديل</button>
                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-400 hover:text-red-300">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
            <EmptyState
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.781-4.121M12 12a4 4 0 110-8 4 4 0 010 8z" /></svg>}
              title="لا يوجد مستخدمون"
              message="ابدأ بإضافة المستخدمين وتعيين صلاحياتهم."
              action={{
                label: "إضافة مستخدم جديد",
                onClick: () => handleOpenModal(),
              }}
            />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={userToEdit ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}>
        <UserForm onSave={handleSaveUser} onClose={handleCloseModal} userToEdit={userToEdit} />
      </Modal>
    </div>
  );
};