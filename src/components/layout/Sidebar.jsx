import React from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { isAdmin } = useAuth()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { id: 'agents', label: 'Agentler', icon: 'bi-people' },
    { id: 'reports', label: 'Raporlar', icon: 'bi-graph-up' },
    ...(isAdmin() ? [
      { id: 'upload', label: 'Veri Yükleme', icon: 'bi-upload' },
      { id: 'admin', label: 'Admin Panel', icon: 'bi-gear' }
    ] : [])
  ]

  return (
    <div className="bg-white shadow-sm border-r border-secondary-200 h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary-600 flex items-center">
          <i className="bi bi-hospital mr-2"></i>
          Sağlık Turizmi
        </h1>
        <p className="text-sm text-secondary-600 mt-1">Admin Paneli</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === item.id
                ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
            }`}
          >
            <i className={`${item.icon} mr-3`}></i>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
