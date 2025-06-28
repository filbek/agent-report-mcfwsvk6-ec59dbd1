import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import Card from '../ui/Card.jsx'
import Table from '../ui/Table.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import Modal from '../ui/Modal.jsx'
import AgentProfile from './AgentProfile.jsx'

const AgentsList = () => {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAgent, setEditingAgent] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Yurtdışı',
    email: '',
    notes: ''
  })
  const { isAdmin } = useAuth()

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name')

      if (error) throw error
      setAgents(data || [])
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingAgent) {
        const { error } = await supabase
          .from('agents')
          .update(formData)
          .eq('id', editingAgent.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('agents')
          .insert([formData])
        
        if (error) throw error
      }

      setShowModal(false)
      setEditingAgent(null)
      setFormData({ name: '', category: 'Yurtdışı', email: '', notes: '' })
      fetchAgents()
    } catch (error) {
      console.error('Error saving agent:', error)
    }
  }

  const handleEdit = (agent) => {
    setEditingAgent(agent)
    setFormData({
      name: agent.name,
      category: agent.category,
      email: agent.email || '',
      notes: agent.notes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (agentId) => {
    if (window.confirm('Bu agenti silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await supabase
          .from('agents')
          .delete()
          .eq('id', agentId)
        
        if (error) throw error
        fetchAgents()
      } catch (error) {
        console.error('Error deleting agent:', error)
      }
    }
  }

  const handleViewProfile = (agent) => {
    setSelectedAgent(agent)
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary-900">Agentler</h1>
        {isAdmin() && (
          <Button onClick={() => setShowModal(true)}>
            <i className="bi bi-plus mr-2"></i>
            Yeni Agent
          </Button>
        )}
      </div>

      <Card>
        <Card.Content className="p-0">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Ad</Table.Head>
                <Table.Head>Kategori</Table.Head>
                <Table.Head>E-posta</Table.Head>
                <Table.Head>Durum</Table.Head>
                <Table.Head>İşlemler</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {agents.map((agent) => (
                <Table.Row key={agent.id}>
                  <Table.Cell>
                    <button 
                      onClick={() => handleViewProfile(agent)}
                      className="font-medium text-primary-600 hover:text-primary-800 transition-colors"
                    >
                      {agent.name}
                    </button>
                  </Table.Cell>
                  <Table.Cell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      agent.category === 'Yurtdışı' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {agent.category}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{agent.email || '-'}</Table.Cell>
                  <Table.Cell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      agent.active 
                        ? 'bg-success-100 text-success-800'
                        : 'bg-danger-100 text-danger-800'
                    }`}>
                      {agent.active ? 'Aktif' : 'Pasif'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProfile(agent)}
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                      {isAdmin() && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(agent)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(agent.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </>
                      )}
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
          setEditingAgent(null)
          setFormData({ name: '', category: 'Yurtdışı', email: '', notes: '' })
        }}
        title={editingAgent ? 'Agent Düzenle' : 'Yeni Agent'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Ad"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="Yurtdışı">Yurtdışı</option>
              <option value="Yurtiçi">Yurtiçi</option>
            </select>
          </div>

          <Input
            label="E-posta"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
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
              {editingAgent ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>

      {selectedAgent && (
        <AgentProfile 
          agent={selectedAgent} 
          onClose={() => setSelectedAgent(null)} 
        />
      )}
    </div>
  )
}

export default AgentsList