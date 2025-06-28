import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import Card from '../ui/Card.jsx'
import Table from '../ui/Table.jsx'
import Button from '../ui/Button.jsx'
import Modal from '../ui/Modal.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const AgentProfile = ({ agent, onClose }) => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('Tümü')

  useEffect(() => {
    if (agent) {
      fetchAgentReports()
    }
  }, [agent])

  const fetchAgentReports = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('agent_id', agent.id)
        .order('date', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching agent reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = selectedMonth === 'Tümü' 
    ? reports 
    : reports.filter(report => report.month === selectedMonth)

  const totalStats = filteredReports.reduce((acc, report) => ({
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

  const totalSalesRate = totalStats.incoming_data > 0 
    ? ((totalStats.appointments / totalStats.incoming_data) * 100).toFixed(1)
    : '0.0'

  const contactRate = totalStats.incoming_data > 0 
    ? ((totalStats.contacted / totalStats.incoming_data) * 100).toFixed(1)
    : '0.0'

  const chartData = filteredReports.map(report => ({
    month: report.month,
    week: `Hafta ${report.week}`,
    appointments: report.appointments,
    contacted: report.contacted,
    sales_rate: parseFloat(report.sales_rate || 0),
    incoming_data: report.incoming_data
  }))

  const pieData = [
    { name: 'Randevu', value: totalStats.appointments, color: '#22c55e' },
    { name: 'Görüşülen', value: totalStats.contacted - totalStats.appointments, color: '#3b82f6' },
    { name: 'Ulaşılamadı', value: totalStats.unreachable, color: '#ef4444' },
    { name: 'Cevap Vermiyor', value: totalStats.no_answer, color: '#f59e0b' },
    { name: 'Red', value: totalStats.rejected, color: '#8b5cf6' },
    { name: 'Olumsuz', value: totalStats.negative, color: '#6b7280' }
  ].filter(item => item.value > 0)

  const months = ['Tümü', ...new Set(reports.map(r => r.month))]

  if (!agent) return null

  return (
    <Modal isOpen={true} onClose={onClose} title={`${agent.name} - Agent Profili`} size="xl">
      <div className="space-y-6">
        {/* Agent Info */}
        <Card>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-secondary-700">Agent Adı</h4>
                <p className="text-lg font-semibold text-secondary-900">{agent.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-secondary-700">Kategori</h4>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  agent.category === 'Yurtdışı' 
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {agent.category}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-secondary-700">E-posta</h4>
                <p className="text-secondary-900">{agent.email || 'Belirtilmemiş'}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Month Filter */}
        <div className="flex gap-2">
          {months.map(month => (
            <Button
              key={month}
              variant={selectedMonth === month ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedMonth(month)}
            >
              {month}
            </Button>
          ))}
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <Card.Content>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{totalStats.incoming_data}</p>
                <p className="text-sm text-secondary-600">Gelen Data</p>
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Content>
              <div className="text-center">
                <p className="text-2xl font-bold text-success-600">{totalStats.contacted}</p>
                <p className="text-sm text-secondary-600">Görüşülen</p>
                <p className="text-xs text-secondary-500">%{contactRate} oran</p>
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Content>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning-600">{totalStats.appointments}</p>
                <p className="text-sm text-secondary-600">Randevu</p>
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Content>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">%{totalSalesRate}</p>
                <p className="text-sm text-secondary-600">Satış Oranı</p>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-secondary-900">
                Aylık Performans Trendi
              </h3>
            </Card.Header>
            <Card.Content>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="appointments" stroke="#22c55e" strokeWidth={2} name="Randevu" />
                  <Line type="monotone" dataKey="contacted" stroke="#3b82f6" strokeWidth={2} name="Görüşülen" />
                </LineChart>
              </ResponsiveContainer>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-secondary-900">
                Performans Dağılımı
              </h3>
            </Card.Header>
            <Card.Content>
              <ResponsiveContainer width="100%" height={250}>
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
        </div>

        {/* Detailed Reports Table */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-secondary-900">
              Detaylı Raporlar
            </h3>
          </Card.Header>
          <Card.Content className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <i className="bi bi-arrow-clockwise animate-spin text-2xl text-primary-600"></i>
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Ay</Table.Head>
                    <Table.Head>Hafta</Table.Head>
                    <Table.Head>Gelen Data</Table.Head>
                    <Table.Head>Görüşülen</Table.Head>
                    <Table.Head>Ulaşılamadı</Table.Head>
                    <Table.Head>Cevap Vermiyor</Table.Head>
                    <Table.Head>Red</Table.Head>
                    <Table.Head>Olumsuz</Table.Head>
                    <Table.Head>Randevu</Table.Head>
                    <Table.Head>Satış %</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredReports.map((report) => (
                    <Table.Row key={report.id}>
                      <Table.Cell>{report.month}</Table.Cell>
                      <Table.Cell>Hafta {report.week}</Table.Cell>
                      <Table.Cell>{report.incoming_data}</Table.Cell>
                      <Table.Cell>{report.contacted}</Table.Cell>
                      <Table.Cell>{report.unreachable}</Table.Cell>
                      <Table.Cell>{report.no_answer}</Table.Cell>
                      <Table.Cell>{report.rejected}</Table.Cell>
                      <Table.Cell>{report.negative}</Table.Cell>
                      <Table.Cell>{report.appointments}</Table.Cell>
                      <Table.Cell>
                        <span className={`font-medium ${
                          parseFloat(report.sales_rate) >= 10 ? 'text-success-600' :
                          parseFloat(report.sales_rate) >= 5 ? 'text-warning-600' :
                          'text-danger-600'
                        }`}>
                          %{parseFloat(report.sales_rate || 0).toFixed(1)}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Card.Content>
        </Card>
      </div>
    </Modal>
  )
}

export default AgentProfile