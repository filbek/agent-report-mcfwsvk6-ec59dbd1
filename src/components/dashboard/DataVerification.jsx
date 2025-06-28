import React, { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'

const DataVerification = ({ onDataReady }) => {
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState(null)
  const [fixing, setFixing] = useState(false)

  const checkDatabaseStatus = async () => {
    setChecking(true)
    setResults(null)

    try {
      console.log('🔍 Starting comprehensive database check...')
      
      const checks = {
        connection: false,
        agents: { exists: false, count: 0, data: [] },
        reports: { exists: false, count: 0, data: [] },
        profiles: { exists: false, count: 0, data: [] }
      }

      // 1. Test basic connection
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('count')
          .limit(1)
        
        if (!error) {
          checks.connection = true
          console.log('✅ Database connection: OK')
        } else {
          console.log('❌ Database connection failed:', error.message)
        }
      } catch (e) {
        console.log('❌ Database connection exception:', e.message)
      }

      // 2. Check agents table
      try {
        const { data, error, count } = await supabase
          .from('agents')
          .select('*', { count: 'exact' })
        
        if (!error) {
          checks.agents.exists = true
          checks.agents.count = count || 0
          checks.agents.data = data || []
          console.log(`✅ Agents table: ${count} records`)
        } else {
          console.log('❌ Agents table error:', error.message)
        }
      } catch (e) {
        console.log('❌ Agents table exception:', e.message)
      }

      // 3. Check reports table
      try {
        const { data, error, count } = await supabase
          .from('reports')
          .select('*', { count: 'exact' })
        
        if (!error) {
          checks.reports.exists = true
          checks.reports.count = count || 0
          checks.reports.data = data || []
          console.log(`✅ Reports table: ${count} records`)
        } else {
          console.log('❌ Reports table error:', error.message)
        }
      } catch (e) {
        console.log('❌ Reports table exception:', e.message)
      }

      // 4. Check profiles table
      try {
        const { data, error, count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
        
        if (!error) {
          checks.profiles.exists = true
          checks.profiles.count = count || 0
          checks.profiles.data = data || []
          console.log(`✅ Profiles table: ${count} records`)
        } else {
          console.log('❌ Profiles table error:', error.message)
        }
      } catch (e) {
        console.log('❌ Profiles table exception:', e.message)
      }

      setResults(checks)
      console.log('🏁 Database check completed:', checks)

    } catch (error) {
      console.error('💥 Database check failed:', error)
      setResults({ error: error.message })
    } finally {
      setChecking(false)
    }
  }

  const fixDatabase = async () => {
    setFixing(true)
    
    try {
      console.log('🔧 Starting database fix...')

      // Step 1: Create sample agents if missing
      if (!results?.agents?.count || results.agents.count === 0) {
        console.log('📝 Creating sample agents...')
        
        const sampleAgents = [
          { name: 'Adviye', category: 'Yurtdışı', email: 'adviye@test.com', notes: 'Deneyimli yurtdışı agent', active: true },
          { name: 'Jennifer', category: 'Yurtdışı', email: 'jennifer@test.com', notes: 'İngilizce konuşan agent', active: true },
          { name: 'Çiğdem', category: 'Yurtiçi', email: 'cigdem@test.com', notes: 'Yurtiçi operasyon uzmanı', active: true },
          { name: 'Hande', category: 'Yurtiçi', email: 'hande@test.com', notes: 'Müşteri ilişkileri uzmanı', active: true }
        ]

        const { data: insertedAgents, error: agentsError } = await supabase
          .from('agents')
          .insert(sampleAgents)
          .select()

        if (agentsError) {
          throw new Error(`Agent oluşturma hatası: ${agentsError.message}`)
        }

        console.log(`✅ Created ${insertedAgents?.length || 0} agents`)
      }

      // Step 2: Get current agents
      const { data: currentAgents, error: fetchError } = await supabase
        .from('agents')
        .select('*')

      if (fetchError) {
        throw new Error(`Agent getirme hatası: ${fetchError.message}`)
      }

      // Step 3: Create sample reports if missing
      if (!results?.reports?.count || results.reports.count === 0) {
        console.log('📊 Creating sample reports...')
        
        const sampleReports = []
        const months = ['Mayıs', 'Haziran', 'Temmuz', 'Ağustos']
        
        for (const agent of currentAgents || []) {
          for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
            for (let week = 1; week <= 4; week++) {
              const baseData = 50 + Math.floor(Math.random() * 100)
              const contacted = Math.floor(baseData * (0.5 + Math.random() * 0.3))
              const appointments = Math.floor(contacted * (0.1 + Math.random() * 0.2))
              
              sampleReports.push({
                agent_id: agent.id,
                date: `2024-0${5 + monthIndex}-${String(week * 7).padStart(2, '0')}`,
                month: months[monthIndex],
                week: week,
                incoming_data: baseData,
                contacted: contacted,
                unreachable: Math.floor(Math.random() * 15),
                no_answer: Math.floor(Math.random() * 20),
                rejected: Math.floor(Math.random() * 10),
                negative: Math.floor(Math.random() * 5),
                appointments: appointments
              })
            }
          }
        }

        // Insert reports in batches to avoid timeout
        const batchSize = 20
        for (let i = 0; i < sampleReports.length; i += batchSize) {
          const batch = sampleReports.slice(i, i + batchSize)
          const { error: reportsError } = await supabase
            .from('reports')
            .insert(batch)

          if (reportsError) {
            throw new Error(`Rapor oluşturma hatası (batch ${Math.floor(i/batchSize) + 1}): ${reportsError.message}`)
          }
        }

        console.log(`✅ Created ${sampleReports.length} reports`)
      }

      // Step 4: Verify the fix
      await checkDatabaseStatus()
      
      console.log('🎉 Database fix completed successfully!')
      
      // Notify parent component that data is ready
      if (onDataReady) {
        onDataReady()
      }

    } catch (error) {
      console.error('💥 Database fix failed:', error)
      setResults(prev => ({ ...prev, fixError: error.message }))
    } finally {
      setFixing(false)
    }
  }

  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold text-secondary-900">
          Veritabanı Durumu
        </h3>
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={checkDatabaseStatus}
              loading={checking}
              disabled={checking || fixing}
            >
              <i className="bi bi-search mr-2"></i>
              Durumu Kontrol Et
            </Button>
            
            {results && (
              <Button 
                onClick={fixDatabase}
                loading={fixing}
                disabled={checking || fixing}
                variant="success"
              >
                <i className="bi bi-tools mr-2"></i>
                Veritabanını Düzelt
              </Button>
            )}
          </div>

          {results && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`p-3 rounded-lg border ${
                  results.connection ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="text-center">
                    <i className={`bi ${results.connection ? 'bi-check-circle text-green-600' : 'bi-x-circle text-red-600'} text-xl mb-1`}></i>
                    <p className="text-sm font-medium">Bağlantı</p>
                    <p className="text-xs text-secondary-600">
                      {results.connection ? 'Başarılı' : 'Başarısız'}
                    </p>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  results.agents?.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="text-center">
                    <i className={`bi ${results.agents?.exists ? 'bi-people-fill text-green-600' : 'bi-people text-red-600'} text-xl mb-1`}></i>
                    <p className="text-sm font-medium">Agentler</p>
                    <p className="text-xs text-secondary-600">
                      {results.agents?.count || 0} kayıt
                    </p>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  results.reports?.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="text-center">
                    <i className={`bi ${results.reports?.exists ? 'bi-graph-up text-green-600' : 'bi-graph-down text-red-600'} text-xl mb-1`}></i>
                    <p className="text-sm font-medium">Raporlar</p>
                    <p className="text-xs text-secondary-600">
                      {results.reports?.count || 0} kayıt
                    </p>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  results.profiles?.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="text-center">
                    <i className={`bi ${results.profiles?.exists ? 'bi-person-check text-green-600' : 'bi-person-x text-red-600'} text-xl mb-1`}></i>
                    <p className="text-sm font-medium">Profiller</p>
                    <p className="text-xs text-secondary-600">
                      {results.profiles?.count || 0} kayıt
                    </p>
                  </div>
                </div>
              </div>

              {results.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">Hata:</p>
                  <p className="text-sm">{results.error}</p>
                </div>
              )}

              {results.fixError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">Düzeltme Hatası:</p>
                  <p className="text-sm">{results.fixError}</p>
                </div>
              )}

              {results.agents?.data && results.agents.data.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="font-medium text-blue-900 mb-2">Mevcut Agentler:</p>
                  <div className="text-sm text-blue-800">
                    {results.agents.data.map(agent => (
                      <span key={agent.id} className="inline-block bg-blue-100 px-2 py-1 rounded mr-2 mb-1">
                        {agent.name} ({agent.category})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  )
}

export default DataVerification