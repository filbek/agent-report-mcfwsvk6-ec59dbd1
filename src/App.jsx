import React, { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import AuthForm from './components/auth/AuthForm.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Header from './components/layout/Header.jsx'
import Dashboard from './components/dashboard/Dashboard.jsx'
import AgentsList from './components/agents/AgentsList.jsx'
import ReportsList from './components/reports/ReportsList.jsx'
import DataUpload from './components/upload/DataUpload.jsx'
import AdminPanel from './components/admin/AdminPanel.jsx'

const AppContent = () => {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <i className="bi bi-arrow-clockwise animate-spin text-4xl text-primary-600 mb-4"></i>
          <p className="text-secondary-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'agents':
        return <AgentsList />
      case 'reports':
        return <ReportsList />
      case 'upload':
        return <DataUpload />
      case 'admin':
        return <AdminPanel />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      <div className="w-64 flex-shrink-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
