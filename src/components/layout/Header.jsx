import React from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import Button from '../ui/Button.jsx'

const Header = () => {
  const { user, profile, signOut } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              Hoş Geldiniz
            </h2>
            <p className="text-sm text-secondary-600">
              {profile?.full_name || user?.email}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-secondary-900">
                {profile?.full_name || 'Kullanıcı'}
              </p>
              <p className="text-xs text-secondary-500 capitalize">
                {profile?.role || 'viewer'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
            >
              <i className="bi bi-box-arrow-right mr-2"></i>
              Çıkış
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
