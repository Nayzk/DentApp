
import React, { useMemo, useState } from 'react';
import { NAV_ITEMS } from '../constants';
import type { Page, User } from '../types';
import { Logo } from './Logo';
import { ContactModal } from './ContactModal';

interface SidebarProps {
  currentUser: User;
  activePage: Page;
  setActivePage: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, activePage, setActivePage }) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const visibleNavItems = useMemo(() => {
    if (currentUser.role === 'admin') {
      return NAV_ITEMS;
    }
    return NAV_ITEMS.filter(item => !item.adminOnly);
  }, [currentUser.role]);
  
  return (
    <>
    <aside className="w-64 bg-black text-slate-100 flex flex-col shadow-2xl">
      <div className="h-20 flex items-center justify-center border-b border-gray-800">
        <div className="flex items-center gap-3">
            <Logo />
           <h1 className="text-2xl font-bold text-white tracking-wider">الأسنانجي</h1>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {visibleNavItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActivePage(item.id)}
                className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 ${
                  activePage === item.id
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'hover:bg-gray-800 text-slate-300'
                }`}
              >
                <span className="me-4">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
       <div className="px-4 py-4 mt-auto border-t border-gray-800">
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 hover:bg-gray-800 text-slate-300"
          >
            <span className="me-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </span>
            <span className="font-medium">تواصل معنا</span>
          </button>
      </div>
    </aside>
    <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </>
  );
};