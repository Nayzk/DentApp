
// Fix: Implemented the main App component to handle routing and layout.
import React, { useState, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Sales } from './pages/Sales';
import { Customers } from './pages/Customers';
import { Suppliers } from './pages/Suppliers';
import { Orders } from './pages/Orders';
import { SalesOrders } from './pages/SalesOrders';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { NAV_ITEMS } from './constants';
import type { Page, User } from './types';
import { initialUsers } from './data/initialData';
import { PurchaseRequests } from './pages/PurchaseRequests';

const App: React.FC = () => {
  // Add initial users if not present
  useLocalStorage<User[]>('users', initialUsers);

  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  
  // Function to handle navigation by updating the URL hash
  const navigate = (page: Page) => {
    window.location.hash = page;
  };

  // Effect to sync component state with the URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const pageFromHash = window.location.hash.substring(1) || 'dashboard';
      const isValidPage = NAV_ITEMS.some(item => item.id === pageFromHash);
      
      if (isValidPage) {
        setActivePage(pageFromHash as Page);
      } else {
        // If hash is invalid, redirect to dashboard
        setActivePage('dashboard');
        window.location.hash = 'dashboard';
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Set initial page from hash on load
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);


  const handleLogout = () => {
    setCurrentUser(null);
    window.location.hash = '';
  };
  
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    navigate('dashboard');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products currentUser={currentUser!} />;
      case 'sales':
        return <Sales currentUser={currentUser!} />;
      case 'customers':
        return <Customers />;
      case 'suppliers':
        return <Suppliers />;
      case 'orders':
        return <Orders currentUser={currentUser!} />;
      case 'sales-orders':
        return <SalesOrders currentUser={currentUser!} />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <Users currentUser={currentUser!} />;
      case 'about':
        return <About />;
      case 'purchase-requests':
        return <PurchaseRequests currentUser={currentUser!} />;
      default:
        return <Dashboard />;
    }
  };

  if (!currentUser) {
    if (authScreen === 'login') {
      return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthScreen('register')} />;
    }
    return <Register onRegisterSuccess={() => setAuthScreen('login')} onNavigateToLogin={() => setAuthScreen('login')} />;
  }

  const currentPageTitle = NAV_ITEMS.find(item => item.id === activePage)?.label || 'لوحة التحكم';

  return (
    <div className="flex h-screen bg-gray-800 text-slate-300" dir="rtl">
      <Sidebar currentUser={currentUser} activePage={activePage} setActivePage={navigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={currentPageTitle} setActivePage={navigate} onLogout={handleLogout} currentUser={currentUser} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-800 p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;