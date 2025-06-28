import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import Card from '../ui/Card.jsx'
import Table from '../ui/Table.jsx'
import Button from '../ui/Button.jsx'
import AgentProfile from '../agents/AgentProfile.jsx'
import DatabaseDiagnostics from './DatabaseDiagnostics.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const Dashboard = () => {
  const [activeMonth, setActiveMonth] = useState('Mayıs')
  const [activeCategory, setActiveCategory] = useState('Yurtdışı')
  const [agents, setAgents] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [debugInfo, setDebugInfo] = useState('')
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [dataStatus, setDataStatus] = useState({
    agents: 0,
    reports: 0,
    lastUpdate: null
  })

  const months = ['Mayıs', 'Haziran', 'Temmuz', 'Ağustos']
  const categories = ['Yurtdışı', 'Yurtiçi']

  useEffect(() => {
    initializeDashboard()
  }, [])

  const initializeDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo('🔍 Bağlantı test ediliyor...')
      
      console.log('🚀 Dashboard initialization started')
      
      // Enhanced connection test with detailed logging
      const connectionTest = await testConnection()
      if (!connectionTest.success) {
        console.error('❌ Connection test failed:', connectionTest.error)
        setError(`Bağlantı hatası: ${connectionTest.error}`)
        setShowDiagnostics(true)
        setLoading(false)
        return
      }
      
      console.log('✅ Connection test passed')
      setDebugInfo('📊 Veriler yükleniyor...')
      await loadData()
      
    } catch (error) {
      console.error('💥 Dashboard initialization error:', error)
      setError(`Başlatma hatası: ${error.message}`)
      setShowDiagnostics(true)
      setLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      console.log('🔍 Testing Supabase connection...')
      
      // Test basic connection
      const { data, error } = await supabase
        .from('agents')
        .select('count')
        .limit(1)

      if (error) {
        console.error('❌ Connection error:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Connection successful')
      return { success: true, data }
    } catch (error) {
      console.error('💥 Connection exception:', error)
      return { success: false, error: error.message }
    }
  }

  const loadData = async () => {
    try {
      setDebugInfo('👥 Agentler getiriliyor...')
      console.log('📋 Loading agents...')
      
      // Load agents with enhanced error handling
      const { data: agentsData, error: agentsError, count: agentsCount } = await supabase
        .from('agents')
        .select('*', { count: 'exact' })
        .order('name')

      if (agentsError) {
        console.error('❌ Agents fetch error:', agentsError)
        throw new Error(`Agentler yüklenirken hata: ${agentsError.message}`)
      }

      console.log('✅ Agents loaded:', agentsCount, agentsData)
      setAgents(agentsData || [])

      setDebugInfo('📊 Raporlar getiriliyor...')
      console.log('📈 Loading reports...')

      // Load reports with enhanced error handling
      const { data: reportsData, error: reportsError, count: reportsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })

      if (reportsError) {
        console.error('❌ Reports fetch error:', reportsError)
        throw new Error(`Raporlar yüklenirken hata: ${reportsError.message}`)
      }

      console.log('✅ Reports loaded:', reportsCount, reportsData)
      setReports(reportsData || [])

      // Update status
      setDataStatus({
        agents: agentsCount || 0,
        reports: reportsCount || 0,
        lastUpdate: new Date()
      })

      setDebugInfo(`✅ Yükleme tamamlandı: ${agentsCount || 0} agent, ${reportsCount || 0} rapor`)
      setError(null)
      setShowDiagnostics(false)

      // Enhanced data validation
      if ((agentsCount || 0) === 0) {
        console.warn('⚠️ No agents found in database')
        setShowDiagnostics(true)
        setError('Agent verisi bulunamadı. Veritabanını kontrol edin.')
      } else if ((reportsCount || 0) === 0) {
        console.warn('⚠️ No reports found in database')
        setShowDiagnostics(true)
        setError('Rapor verisi bulunamadı. Veritabanını kontrol edin.')
      } else {
        console.log('🎉 Data loading completed successfully')
        
        // Log sample data for debugging
        console.log('📊 Sample agent:', agentsData?.[0])
        console.log('📈 Sample report:', reportsData?.[0])
        
        // Verify data relationships
        const agentIds = agentsData?.map(a => a.id) || []
        const reportsWithValidAgents = reportsData?.filter(r => agentIds.includes(r.agent_id)) || []
        console.log(`🔗 Reports with valid agents: ${reportsWithValidAgents.length}/${reportsCount}`)
        
        if (reportsWithValidAgents.length !== reportsCount) {
          console.warn('⚠️ Some reports have invalid agent references')
        }
      }

    } catch (error) {
      console.error('💥 Error loading data:', error)
      setError(error.message)
      setDebugInfo('❌ Veri yükleme hatası')
      setShowDiagnostics(true)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async () => {
    console.log('🔄 Retrying data load...')
    await initializeDashboard()
  }

  const forceRefresh = async () => {
    console.log('🔄 Force refreshing data...')
    setAgents([])
    setReports([])
    setDataStatus({ agents: 0, reports: 0, lastUpdate: null })
    await initializeDashboard()
  }

  const handleDataReady = () => {
    console.log('✅ Data ready callback triggered')
    setShowDiagnostics(false)
    initializeDashboard()
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <Card>
          <Card.Content>
            <div className="text-center py-8">
              <i className="bi bi-arrow-clockwise animate-spin text-4xl text-primary-600 mb-4"></i>
              <p className="text-secondary-600 mb-2">Veriler yükleniyor...</p>
              <p className="text-sm text-secondary-500">{debugInfo}</p>
              <div className="mt-4 text-xs text-secondary-400">
                Son durum: {dataStatus.agents} agent, {dataStatus.reports} rapor
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    )
  }

  // Show diagnostics/error state
  if (error || showDiagnostics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        
        {error && (
          <Card>
            <Card.Content>
              <div className="text-center py-4">
                <i className="bi bi-exclamation-triangle text-4xl text-warning-600 mb-4"></i>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">Veri Yükleme Sorunu</h3>
                <p className="text-secondary-600 mb-2">{error}</p>
                <p className="text-sm text-secondary-500 mb-4">{debugInfo}</p>
                <div className="text-xs text-secondary-400 mb-4">
                  Durum: {dataStatus.agents} agent, {dataStatus.reports} rapor
                  {dataStatus.lastUpdate && (
                    <span className="block">Son güncelleme: {dataStatus.lastUpdate.toLocaleTimeString()}</span>
                  )}
                </div>
                <div className="space-x-2">
                  <Button onClick={handleRetry}>
                    <i className="bi bi-arrow-clockwise mr-2"></i>
                    Tekrar Dene
                  </Button>
                  <Button onClick={forceRefresh} variant="secondary">
                    <i className="bi bi-arrow-repeat mr-2"></i>
                    Zorla Yenile
                  </Button>
                  <Button onClick={() => setShowDiagnostics(true)} variant="outline">
                    <i className="bi bi-tools mr-2"></i>
                    Tanılama
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>
        )}

        <DatabaseDiagnostics onDataReady={handleDataReady} />
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
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Veri Bulunamadı</h3>
              <p className="text-secondary-600 mb-2">Sistemde henüz agent verisi bulunmuyor</p>
              <p className="text-sm text-secondary-500 mb-4">
                Durum: {dataStatus.agents} agent, {dataStatus.reports} rapor
              </p>
              <div className="space-x-2">
                <Button onClick={handleRetry}>
                  <i className="bi bi-arrow-clockwise mr-2"></i>
                  Verileri Yenile
                </Button>
                <Button onClick={() => setShowDiagnostics(true)} variant="secondary">
                  <i className="bi bi-tools mr-2"></i>
                  Veritabanını Kontrol Et
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    )
  }

  console.log('🎯 Rendering dashboard with data:', {
    agents: agents.length,
    reports: reports.length,
    activeMonth,
    activeCategory
  })

  const filteredReports = reports.filter(report => {
    const agent = agents.find(a => a.id === report.agent_id)
    const matchesCategory = agent?.category === activeCategory
    const matchesMonth = report.month === activeMonth
    
    console.log('🔍 Filtering report:', {
      reportId: report.id,
      agentName: agent?.name,
      agentCategory: agent?.category,
      reportMonth: report.month,
      matchesCategory,
      matchesMonth,
      included: matchesCategory && matchesMonth
    })
    
    return matchesCategory && matchesMonth
  })

  console.log('📊 Filtered reports:', filteredReports.length, 'for', activeCategory, activeMonth)

  const aggregatedData = agents
    .filter(agent => agent.category === activeCategory)
    .map(agent => {
      const agentReports = filteredReports.filter(report => report.agent_id === agent.id)
      console.log(`📈 Agent ${agent.name} reports:`, agentReports.length)
      
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

  console.log('📊 Aggregated data:', aggregatedData)

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
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-secondary-600">
              {dataStatus.agents} agent, {dataStatus.reports} rapor
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-secondary-500">Aktif</span>
            </div>
            {dataStatus.lastUpdate && (
              <span className="text-xs text-secondary-400">
                {dataStatus.lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button 
              onClick={forceRefresh} 
              variant="ghost" 
              size="sm"
              title="Verileri yenile"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </Button>
            <Button 
              onClick={() => setShowDiagnostics(true)} 
              variant="ghost" 
              size="sm"
              title="Veritabanı durumunu kontrol et"
            >
              <i className="bi bi-database"></i>
            </Button>
          </div>
        </div>
        
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
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-secondary-900">
              {activeCategory} - {activeMonth} Performans Tablosu
            </h3>
            <div className="text-sm text-secondary-500">
              {filteredReports.length} rapor
            </div>
          </div>
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