import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import Card from '../ui/Card.jsx'
import Table from '../ui/Table.jsx'
import Button from '../ui/Button.jsx'
import AgentProfile from '../agents/AgentProfile.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const Dashboard = () => {
  const [activeMonth, setActiveMonth] = useState('Mayıs')
  const [activeCategory, setActiveCategory] = useState('Yurtdışı')
  const [agents, setAgents] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState(null)

  const months = ['Mayıs', 'Haziran', 'Temmuz', 'Ağustos']
  const categories = ['Yurtdışı', 'Yurtiçi']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch agents with error handling
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .eq('active', true)

      if (agentsError) {
        console.error('Error fetching agents:', agentsError)
        setError('Agentler yüklenirken hata oluştu')
        setAgents([])
      } else {
        setAgents(agentsData || [])
      }

      // Fetch reports with error handling
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')

      if (reportsError) {
        console.error('Error fetching reports:', reportsError)
        setError('Raporlar yüklenirken hata oluştu')
        setReports([])
      } else {
        setReports(reportsData || [])
      }
    } catch (error) {
      console.error('Error in fetchData:', error)
      setError('Veri yüklenirken beklenmeyen bir hata oluştu')
      setAgents([])
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="bi bi-arrow-clockwise animate-spin text-4xl text-primary-600 mb-4"></i>
            <p className="text-secondary-600">Veriler yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <Card>
          <Card.Content>
            <div className="text-center py-8">
              <i className="bi bi-exclamation-triangle text-4xl text-warning-600 mb-4"></i>
              <p className="text-secondary-600 mb-4">{error}</p>
              <Button onClick={fetchData}>
                <i className="bi bi-arrow-clockwise mr-2"></i>
                Tekrar Dene
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    )
  }

  // Show empty state if no data
  if (agents.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <Card>
          <Card.Content>
            <div className="text-center py-8">
              <i className="bi bi-inbox text-4xl text-secondary-400 mb-4"></i>
              <p className="text-secondary-600 mb-4">Henüz agent verisi bulunmuyor</p>
              <p className="text-sm text-secondary-500">Admin panelinden agent ekleyebilirsiniz</p>
            </div>
          </Card.Content>
        </Card>
      </div>
    )
  }

  const filteredReports = reports.filter(report => {
    const agent = agents.find(a => a.id === report.agent_id)
    return agent?.category === activeCategory && report.month === activeMonth
  })

  const aggregatedData = agents
    .filter(agent => agent.category === activeCategory)
    .map(agent => {
      const agentReports = filteredReports.filter(report => report.agent_id === agent.id)
      const totals = agentReports.reduce((acc, report) => ({
        incoming_data: acc.incoming_data + (report.incoming_data || 0),
        contacted: acc.contacted + (report.contacted || 0),
        unreachable: acc.unreachable + (report.unreachable || 0),
        no_answer: acc.no_answer + (report.no_answer || 0),
        rejected: acc.rejected + (report.rejected || 0),
        negative: acc.negative + (report.negative || 0),
        appointments: acc.appointments + (report.appointments || 0),
      }), {
        incoming_data: 0,
        contacted: 0,
        unreachable: 0,
        no_answer: 0,
        rejected: 0,
        negative: 0,
        appointments: 0,
      })

      const salesRate = totals.incoming_data > 0 
        ? ((totals.appointments / totals.incoming_data) * 100).toFixed(1)
        : '0.0'

      return {
        ...agent,
        ...totals,
        sales_rate: salesRate
      }
    })

  const totalRow = aggregatedData.reduce((acc, agent) => ({
    incoming_data: acc.incoming_data + agent.incoming_data,
    contacted: acc.contacted + agent.contacted,
    unreachable: acc.unreachable + agent.unreachable,
    no_answer: acc.no_answer + agent.no_answer,
    rejected: acc.rejected + agent.rejected,
    negative: acc.negative + agent.negative,
    appointments: acc.appointments + agent.appointments,
  }), {
    incoming_data: 0,
    contacted: 0,
    unreachable: 0,
    no_answer: 0,
    rejected: 0,
    negative: 0,
    appointments: 0,
  })

  const totalSalesRate = totalRow.incoming_data > 0 
    ? ((totalRow.appointments / totalRow.incoming_data) * 100).toFixed(1)
    : '0.0'

  const chartData = aggregatedData.map(agent => ({
    name: agent.name,
    sales_rate: parseFloat(agent.sales_rate),
    appointments: agent.appointments,
    contacted: agent.contacted,
    unreachable: agent.unreachable,
    no_answer: agent.no_answer
  }))

  const pieData = [
    { name: 'Görüşülen', value: totalRow.contacted, color: '#22c55e' },
    { name: 'Cevap Vermiyor', value: totalRow.no_answer, color: '#f59e0b' },
    { name: 'Ulaşılamadı', value: totalRow.unreachable, color: '#ef4444' },
    { name: 'Red', value: totalRow.rejected, color: '#8b5cf6' },
    { name: 'Olumsuz', value: totalRow.negative, color: '#6b7280' }
  ].filter(item => item.value > 0)

  const handleAgentClick = (agent) => {
    setSelectedAgent(agent)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        
        <div className="flex flex-wrap gap-2">
          {months.map(month => (
            <Button
              key={month}
              variant={activeMonth === month ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveMonth(month)}
            >
              {month}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={activeCategory === category ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{totalRow.incoming_data}</p>
              <p className="text-sm text-secondary-600">Toplam Gelen Data</p>
            </div>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">{totalRow.contacted}</p>
              <p className="text-sm text-secondary-600">Toplam Görüşülen</p>
            </div>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600">{totalRow.appointments}</p>
              <p className="text-sm text-secondary-600">Toplam Randevu</p>
            </div>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">%{totalSalesRate}</p>
              <p className="text-sm text-secondary-600">Ortalama Satış Oranı</p>
            </div>
          </Card.Content>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-secondary-900">
            {activeCategory} - {activeMonth} Performans Tablosu
          </h3>
        </Card.Header>
        <Card.Content className="p-0">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Agent</Table.Head>
                <Table.Head>Gelen Data</Table.Head>
                <Table.Head>Görüşülen</Table.Head>
                <Table.Head>Ulaşılamadı</Table.Head>
                <Table.Head>Cevap Vermiyor</Table.Head>
                <Table.Head>Red (VKİ)</Table.Head>
                <Table.Head>Olumsuz</Table.Head>
                <Table.Head>Randevu</Table.Head>
                <Table.Head>Satış Yüzdesi</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {aggregatedData.map((agent) => (
                <Table.Row key={agent.id}>
                  <Table.Cell>
                    <button 
                      onClick={() => handleAgentClick(agent)}
                      className="text-primary-600 hover:text-primary-800 font-medium transition-colors"
                    >
                      {agent.name}
                    </button>
                  </Table.Cell>
                  <Table.Cell>{agent.incoming_data}</Table.Cell>
                  <Table.Cell>{agent.contacted}</Table.Cell>
                  <Table.Cell>{agent.unreachable}</Table.Cell>
                  <Table.Cell>{agent.no_answer}</Table.Cell>
                  <Table.Cell>{agent.rejected}</Table.Cell>
                  <Table.Cell>{agent.negative}</Table.Cell>
                  <Table.Cell>{agent.appointments}</Table.Cell>
                  <Table.Cell>
                    <span className={`font-medium ${
                      parseFloat(agent.sales_rate) >= 10 ? 'text-success-600' :
                      parseFloat(agent.sales_rate) >= 5 ? 'text-warning-600' :
                      'text-danger-600'
                    }`}>
                      %{agent.sales_rate}
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}
              {aggregatedData.length > 0 && (
                <Table.Row className="bg-secondary-50 font-semibold">
                  <Table.Cell>TOPLAM</Table.Cell>
                  <Table.Cell>{totalRow.incoming_data}</Table.Cell>
                  <Table.Cell>{totalRow.contacted}</Table.Cell>
                  <Table.Cell>{totalRow.unreachable}</Table.Cell>
                  <Table.Cell>{totalRow.no_answer}</Table.Cell>
                  <Table.Cell>{totalRow.rejected}</Table.Cell>
                  <Table.Cell>{totalRow.negative}</Table.Cell>
                  <Table.Cell>{totalRow.appointments}</Table.Cell>
                  <Table.Cell>
                    <span className="text-primary-600">%{totalSalesRate}</span>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>

      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-secondary-900">
                Agent Satış Oranları
              </h3>
            </Card.Header>
            <Card.Content>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`%${value}`, 'Satış Oranı']} />
                  <Bar dataKey="sales_rate" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Content>
          </Card>

          {pieData.length > 0 && (
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-secondary-900">
                  İletişim Dağılımı
                </h3>
              </Card.Header>
              <Card.Content>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} %${(percent * 100).toFixed(0)}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Content>
            </Card>
          )}
        </div>
      )}

      {chartData.length > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-secondary-900">
              Aylık Randevu Trendi
            </h3>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="appointments" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>
      )}

      {selectedAgent && (
        <AgentProfile 
          agent={selectedAgent} 
          onClose={() => setSelectedAgent(null)} 
        />
      )}
    </div>
  )
}

export default Dashboard