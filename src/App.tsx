import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StoreTable from './components/StoreTable';
import StoreCard from './components/StoreCard';
import CalendarView from './components/CalendarView';
import AddStoreModal from './components/AddStoreModal';
import ImportModal from './components/ImportModal';
import LoginPage from './components/LoginPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import TUsPage from './pages/TUsPage';
import AuditPage from './pages/AuditPage';

export default function App() {
  const { currentUser, restoreSession } = useStore();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Восстанавливаем сессию при загрузке
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (!currentUser) return <LoginPage />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'table': return <StoreTable />;
      case 'calendar': return <CalendarView />;
      case 'users': return <UsersPage />;
      case 'roles': return <RolesPage />;
      case 'tus': return <TUsPage />;
      case 'audit': return <AuditPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      <StoreCard />
      <AddStoreModal />
      <ImportModal />
    </>
  );
}
