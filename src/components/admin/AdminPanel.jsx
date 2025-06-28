import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import Card from '../ui/Card.jsx'
import Table from '../ui/Table.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import Modal from '../ui/Modal.jsx'

const AdminPanel = () => {
  const [users, setUsers] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    role: 'viewer'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError
      setProfiles(profilesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update(formData)
          .eq('id', editingProfile.id)
        
        if (error) throw error
      }

      setShowModal(false)
      setEditingProfile(null)
      setFormData({ full_name: '', role: 'viewer' })
      fetchData()
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleEdit = (profile) => {
    setEditingProfile(profile)
    setFormData({
      full_name: profile.full_name || '',
      role: profile.role
    })
    setShowModal(true)
  }

  const handleDelete = async (profileId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profileId)
        
        if (error) throw error
        fetchData()
      } catch (error) {
        console.error('Error deleting profile:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="bi bi-arrow-clockwise animate-spin text-4xl text-primary-600"></i>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Admin Panel</h1>

      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-secondary-900">
            Kullanıcı Yönetimi
          </h3>
        </Card.Header>
        <Card.Content className="p-0">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Ad Soyad</Table.Head>
                <Table.Head>Rol</Table.Head>
                <Table.Head>Kayıt Tarihi</Table.Head>
                <Table.Head>İşlemler</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {profiles.map((profile) => (
                <Table.Row key={profile.id}>
                  <Table.Cell>
                    <div className="font-medium text-secondary-900">
                      {profile.full_name || 'İsimsiz Kullanıcı'}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      profile.role === 'admin' 
                        ? 'bg-red-100 text-red-800'
                        : profile.role === 'agent'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-secondary-100 text-secondary-800'
                    }`}>
                      {profile.role === 'admin' ? 'Admin' : 
                       profile.role === 'agent' ? 'Agent' : 'Görüntüleyici'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(profile.created_at).toLocaleDateString('tr-TR')}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(profile)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(profile.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingProfile(null)
          setFormData({ full_name: '', role: 'viewer' })
        }}
        title="Kullanıcı Düzenle"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Ad Soyad"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="viewer">Görüntüleyici</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              İptal
            </Button>
            <Button type="submit">
              Güncelle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminPanel
