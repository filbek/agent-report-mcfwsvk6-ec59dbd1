import React, { useState, useEffect } from 'react'
import { supabase, testSupabaseConnection, safeQuery } from '../../lib/supabase.js'
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
  const [debugInfo, setDebugInfo] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('testing')
  const [dataCreating, setDataCreating] = useState(false)

  const months = ['Mayıs', 'Haziran', 'Temmuz', 'Ağustos']
  const categories = ['Yurtdışı', 'Yurtiçi']

  useEffect(() => {
    initializeDashboard()
  }, [])

  const initializeDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo('Bağlantı test ediliyor...')
      setConnectionStatus('testing')
      
      // Test Supabase connection first
      const connectionTest = await testSupabaseConnection()
      
      if (!connectionTest.success) {
        setConnectionStatus('failed')
        setError(`Veritabanı bağlantısı başarısız: ${connectionTest.error}`)
        setDebugInfo('Bağlantı testi başarısız')
        setLoading(false)
        return
      }
      
      setConnectionStatus('connected')
      setDebugInfo('Bağlantı başarılı, veriler kontrol ediliyor...')
      
      await checkAndLoadData()
      
    } catch (error) {
      console.error('Dashboard initialization error:', error)
      setConnectionStatus('failed')
      setError(`Başlatma hatası: ${error.message}`)
      setLoading(false)
    }
  }

  const checkAndLoadData = async () => {
    try {
      setDebugInfo('Mevcut veriler kontrol ediliyor...')
      
      // Check if we have any agents using safe query
      const agentsResult = await safeQuery(async () => {
        return await supabase
          .from('agents')
          .select('id, name, category')
          .limit(5)
      })

      if (agentsResult.error) {
        console.error('Error checking agents:', agentsResult.error)
        throw new Error(`Agent kontrolü başarısız: ${agentsResult.error.message}`)
      }

      const existingAgents = agentsResult.data || []
      console.log('Existing agents found:', existingAgents.length)

      // Check if we have any reports using safe query
      const reportsResult = await safeQuery(async () => {
        return await supabase
          .from('reports')
          .select('id, agent_id, month')
          .limit(5)
      })

      if (reportsResult.error) {
        console.error('Error checking reports:', reportsResult.error)
        throw new Error(`Rapor kontrolü başarısız: ${reportsResult.error.message}`)
      }

      const existingReports = reportsResult.data || []
      console.log('Existing reports found:', existingReports.length)

      if (existingAgents.length === 0) {
        setDebugInfo('Hiç agent bulunamadı, örnek veriler oluşturuluyor...')
        await createSampleData()
      } else if (existingReports.length === 0) {
        setDebugInfo('Agentler mevcut ama raporlar yok, örnek raporlar oluşturuluyor...')
        await createSampleReports(existingAgents)
      } else {
        setDebugInfo('Mevcut veriler yükleniyor...')
        await fetchData()
      }
      
    } catch (error) {
      console.error('Error in checkAndLoadData:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  const createSampleData = async () => {
    try {
      setDataCreating(true)
      setDebugInfo('Örnek agentler oluşturuluyor...')
      
      // Create sample agents
      const sampleAgents = [
        { name: 'Adviye', category: 'Yurtdışı', email: 'adviye@test.com', notes: 'Yurtdışı uzmanı', active: true },
        { name: 'Cengiz Yurtdışı', category: 'Yurtdışı', email: 'cengiz.yurtdisi@test.com', notes: 'Avrupa sorumlusu', active: true },
        { name: 'Dilara', category: 'Yurtdışı', email: 'dilara@test.com', notes: 'Amerika sorumlusu', active: true },
        { name: 'Jennifer', category: 'Yurtdışı', email: 'jennifer@test.com', notes: 'İngilizce müşteriler', active: true },
        { name: 'Merve', category: 'Yurtdışı', email: 'merve@test.com', notes: 'Orta Doğu sorumlusu', active: true },
        { name: 'Çiğdem', category: 'Yurtiçi', email: 'cigdem@test.com', notes: 'İstanbul sorumlusu', active: true },
        { name: 'Hande', category: 'Yurtiçi', email: 'hande@test.com', notes: 'Ankara sorumlusu', active: true },
        { name: 'Hilal', category: 'Yurtiçi', email: 'hilal@test.com', notes: 'İzmir sorumlusu', active: true },
        { name: 'Saliha', category: 'Yurtiçi', email: 'saliha@test.com', notes: 'Bursa sorumlusu', active: true },
      ]

      // Insert agents one by one to avoid conflicts
      const insertedAgents = []
      for (const agent of sampleAgents) {
        try {
          const result = await safeQuery(async () => {
            return await supabase
              .from('agents')
              .insert([agent])
              .select()
              .single()
          })

          if (result.error) {
            console.error(`Error inserting agent ${agent.name}:`, result.error)
            // Try to get existing agent
            const existingResult = await safeQuery(async () => {
              return await supabase
                .from('agents')
                .select('*')
                .eq('name', agent.name)
                .eq('category', agent.category)
                .single()
            })
            
            if (existingResult.data) {
              insertedAgents.push(existingResult.data)
            }
          } else {
            insertedAgents.push(result.data)
          }
        } catch (err) {
          console.error(`Error with agent ${agent.name}:`, err)
        }
      }

      console.log('Agents created/found:', insertedAgents.length)
      setDebugInfo(`${insertedAgents.length} agent oluşturuldu/bulundu, raporlar oluşturuluyor...`)

      await createSampleReports(insertedAgents)
      
    } catch (error) {
      console.error('Error creating sample data:', error)
      setError(`Örnek veri oluşturma hatası: ${error.message}`)
      setLoading(false)
    } finally {
      setDataCreating(false)
    }
  }

  const createSampleReports = async (agentsList) => {
    try {
      setDebugInfo('Örnek raporlar oluşturuluyor...')
      
      const sampleReports = []
      
      // Predefined data for specific agents
      const agentData = {
        'Adviye': {
          'Mayıs': { incoming_data: 436, contacted: 263, unreachable: 35, no_answer: 138, rejected: 0, negative: 0, appointments: 4 },
          'Haziran': { incoming_data: 186, contacted: 93, unreachable: 0, no_answer: 0, rejected: 0, negative: 0, appointments: 4 }
        },
        'Cengiz Yurtdışı': {
          'Mayıs': { incoming_data: 70, contacted: 37, unreachable: 1, no_answer: 20, rejected: 0, negative: 12, appointments: 5 },
          'Haziran': { incoming_data: 58, contacted: 43, unreachable: 2, no_answer: 13, rejected: 0, negative: 4, appointments: 1 }
        },
        'Dilara': {
          'Mayıs': { incoming_data: 93, contacted: 33, unreachable: 33, no_answer: 22, rejected: 3, negative: 2, appointments: 5 },
          'Haziran': { incoming_data: 64, contacted: 31, unreachable: 22, no_answer: 11, rejected: 2, negative: 1, appointments: 0 }
        },
        'Jennifer': {
          'Mayıs': { incoming_data: 186, contacted: 71, unreachable: 72, no_answer: 42, rejected: 1, negative: 0, appointments: 12 },
          'Haziran': { incoming_data: 152, contacted: 76, unreachable: 47, no_answer: 29, rejected: 0, negative: 0, appointments: 11 }
        },
        'Merve': {
          'Mayıs': { incoming_data: 614, contacted: 297, unreachable: 38, no_answer: 226, rejected: 19, negative: 34, appointments: 2 },
          'Haziran': { incoming_data: 515, contacted: 253, unreachable: 96, no_answer: 166, rejected: 24, negative: 48, appointments: 5 }
        },
        'Çiğdem': {
          'Mayıs': { incoming_data: 373, contacted: 281, unreachable: 79, no_answer: 15, rejected: 12, negative: 1, appointments: 15 },
          'Haziran': { incoming_data: 66, contacted: 37, unreachable: 21, no_answer: 1, rejected: 8, negative: 0, appointments: 6 }
        },
        'Hande': {
          'Mayıs': { incoming_data: 291, contacted: 206, unreachable: 85, no_answer: 25, rejected: 0, negative: 0, appointments: 20 },
          'Haziran': { incoming_data: 182, contacted: 105, unreachable: 37, no_answer: 10, rejected: 40, negative: 0, appointments: 16 }
        },
        'Hilal': {
          'Mayıs': { incoming_data: 240, contacted: 115, unreachable: 77, no_answer: 20, rejected: 39, negative: 9, appointments: 25 },
          'Haziran': { incoming_data: 150, contacted: 102, unreachable: 28, no_answer: 3, rejected: 20, negative: 0, appointments: 10 }
        },
        'Saliha': {
          'Mayıs': { incoming_data: 378, contacted: 248, unreachable: 125, no_answer: 27, rejected: 5, negative: 0, appointments: 28 },
          'Haziran': { incoming_data: 364, contacted: 236, unreachable: 126, no_answer: 7, rejected: 0, negative: 2, appointments: 11 }
        }
      }

      agentsList.forEach(agent => {
        const data = agentData[agent.name] || {}
        
        // Mayıs data
        const mayisData = data['Mayıs'] || {
          incoming_data: Math.floor(Math.random() * 300) + 100,
          contacted: Math.floor(Math.random() * 150) + 50,
          unreachable: Math.floor(Math.random() * 40) + 10,
          no_answer: Math.floor(Math.random() * 60) + 20,
          rejected: Math.floor(Math.random() * 20) + 5,
          negative: Math.floor(Math.random() * 15) + 2,
          appointments: Math.floor(Math.random() * 25) + 5,
        }
        
        sampleReports.push({
          agent_id: agent.id,
          date: '2024-05-01',
          month: 'Mayıs',
          week: 1,
          ...mayisData
        })
        
        // Haziran data
        const haziranData = data['Haziran'] || {
          incoming_data: Math.floor(Math.random() * 250) + 80,
          contacted: Math.floor(Math.random() * 120) + 40,
          unreachable: Math.floor(Math.random() * 30) + 8,
          no_answer: Math.floor(Math.random() * 50) + 15,
          rejected: Math.floor(Math.random() * 15) + 3,
          negative: Math.floor(Math.random() * 10) + 1,
          appointments: Math.floor(Math.random() * 20) + 3,
        }
        
        sampleReports.push({
          agent_id: agent.id,
          date: '2024-06-01',
          month: 'Haziran',
          week: 1,
          ...haziranData
        })
      })

      // Insert reports in batches using safe query
      const batchSize = 10
      let insertedCount = 0
      
      for (let i = 0; i < sampleReports.length; i += batchSize) {
        const batch = sampleReports.slice(i, i + batchSize)
        
        try {
          const result = await safeQuery(async () => {
            return await supabase
              .from('reports')
              .insert(batch)
              .select()
          })

          if (result.error) {
            console.error('Error inserting report batch:', result.error)
          } else {
            insertedCount += result.data?.length || 0
          }
        } catch (err) {
          console.error('Error with report batch:', err)
        }
      }

      console.log('Reports created:', insertedCount)
      setDebugInfo(`${insertedCount} rapor oluşturuldu, veriler yükleniyor...`)
      
      // Now fetch all data
      await fetchData()
      
    } catch (error) {
      console.error('Error creating sample reports:', error)
      setError(`Örnek rapor oluşturma hatası: ${error.message}`)
      setLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      setDebugInfo('Agentler getiriliyor...')
      
      // Fetch agents with error handling using safe query
      const agentsResult = await safeQuery(async () => {
        return await supabase
          .from('agents')
          .select('*')
          .order('name')
      })

      if (agentsResult.error) {
        console.error('Error fetching agents:', agentsResult.error)
        throw new Error(`Agentler yüklenirken hata: ${agentsResult.error.message}`)
      }

      const agentsData = agentsResult.data || []
      console.log('Agents fetched:', agentsData.length)
      setAgents(agentsData)

      setDebugInfo('Raporlar getiriliyor...')

      // Fetch reports with error handling using safe query
      const reportsResult = await safeQuery(async () => {
        return await supabase
          .from('reports')
          .select('*')
          .order('date', { ascending: false })
      })

      if (reportsResult.error) {
        console.error('Error fetching reports:', reportsResult.error)
        throw new Error(`Raporlar yüklenirken hata: ${reportsResult.error.message}`)
      }

      const reportsData = reportsResult.data || []
      console.log('Reports fetched:', reportsData.length)
      setReports(reportsData)

      setDebugInfo(`Yükleme tamamlandı: ${agentsData.length} agent, ${reportsData.length} rapor`)
      setError(null)

    } catch (error) {
      console.error('Error in fetchData:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (loading || dataCreating) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <Card>
          <Card.Content>
            <div className="text-center py-8">
              <i className="bi bi-arrow-clockwise animate-spin text-4xl text-primary-600 mb-4"></i>
              <p className="text-secondary-600 mb-2">
                {dataCreating ? 'Veriler oluşturuluyor...' : 'Veriler yükleniyor...'}
              </p>
              <p className="text-sm text-secondary-500 mb-2">{debugInfo}</p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'testing' ? 'bg-yellow-500' :
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-sm text-secondary-600">
                  {connectionStatus === 'testing' ? 'Bağlantı test ediliyor' :
                   connectionStatus === 'connected' ? 'Bağlantı başarılı' :
                   'Bağlantı başarısız'}
                </span>
              </div>
              {!dataCreating && (
                <Button 
                  onClick={initializeDashboard} 
                  variant="outline" 
                  size="sm"
                >
                  Yeniden Dene
                </Button>
              )}
            </div>
          </Card.Content>
        </Card>
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
              <p className="text-sm text-secondary-500 mb-4">{debugInfo}</p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-secondary-600">
                  {connectionStatus === 'connected' ? 'Bağlantı OK' : 'Bağlantı Sorunu'}
                </span>
              </div>
              <div className="space-x-2">
                <Button onClick={initializeDashboard}>
                  <i className="bi bi-arrow-clockwise mr-2"></i>
                  Tekrar Dene
                </Button>
                <Button onClick={createSampleData} variant="secondary">
                  <i className="bi bi-plus mr-2"></i>
                  Örnek Veri Oluştur
                </Button>
              </div>
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
              <p className="text-secondary-600 mb-2">Henüz agent verisi bulunmuyor</p>
              <p className="text-sm text-secondary-500 mb-4">
                Agents: {agents.length}, Reports: {reports.length}
              </p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-secondary-600">Bağlantı OK</span>
              </div>
              <div className="space-x-2">
                <Button onClick={initializeDashboard}>
                  <i className="bi bi-arrow-clockwise mr-2"></i>
                  Verileri Yenile
                </Button>
                <Button onClick={createSampleData} variant="secondary">
                  <i className="bi bi-plus mr-2"></i>
                  Örnek Veri Oluştur
                </Button>
              </div>
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
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-secondary-600">
              {agents.length} agent, {reports.length} rapor
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-secondary-500">Bağlı</span>
            </div>
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