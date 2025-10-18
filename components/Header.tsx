
import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Product, Page, User, SalesOrder } from '../types';
import { initialProducts } from '../data/initialData';

interface HeaderProps {
  title: string;
  setActivePage: (page: Page) => void;
  onLogout: () => void;
  currentUser: User;
}

export const Header: React.FC<HeaderProps> = ({ title, setActivePage, onLogout, currentUser }) => {
  const [products] = useLocalStorage<Product[]>('products', initialProducts);
  const [salesOrders] = useLocalStorage<SalesOrder[]>('sales-orders', []);

  const lowStockProductsCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const pendingSalesOrdersCount = salesOrders.filter(o => o.status === 'pending').length;

  const handleLowStockNotificationClick = () => {
    localStorage.setItem('products_filter', 'low_stock');
    setActivePage('products');
  };
  
  const handleSalesOrderNotificationClick = () => {
    setActivePage('sales-orders');
  };

  return (
    <header className="h-20 bg-gray-900 shadow-sm flex items-center justify-between px-8 border-b border-gray-800">
      <h2 className="text-2xl font-bold text-gray-200">{title}</h2>
      <div className="flex items-center gap-6">
        <div className="text-gray-300">
            مرحباً, <span className="font-semibold text-white">{currentUser.username}</span>
        </div>

        <button onClick={handleSalesOrderNotificationClick} className="relative text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          {pendingSalesOrdersCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
              {pendingSalesOrdersCount}
            </span>
          )}
        </button>

        <button onClick={handleLowStockNotificationClick} className="relative text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {lowStockProductsCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              {lowStockProductsCount}
            </span>
          )}
        </button>

        <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </header>
  );
};