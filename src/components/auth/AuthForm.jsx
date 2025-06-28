import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import Card from '../ui/Card.jsx'

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password, fullName)
      
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <i className="bi bi-hospital text-4xl text-primary-600"></i>
          </div>
          <h2 className="text-3xl font-bold text-secondary-900">
            Sağlık Turizmi Admin
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
          </p>
        </div>

        <Card>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {!isLogin && (
                <Input
                  label="Ad Soyad"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Adınızı ve soyadınızı girin"
                />
              )}

              <Input
                label="E-posta Adresi"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="E-posta adresinizi girin"
              />

              <Input
                label="Şifre"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Şifrenizi girin"
              />

              <Button
                type="submit"
                className="w-full"
                loading={loading}
              >
                {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
              </Button>
            </form>
          </Card.Content>

          <Card.Footer>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                {isLogin 
                  ? "Hesabınız yok mu? Kayıt olun" 
                  : "Zaten hesabınız var mı? Giriş yapın"
                }
              </button>
            </div>
          </Card.Footer>
        </Card>
      </div>
    </div>
  )
}

export default AuthForm
