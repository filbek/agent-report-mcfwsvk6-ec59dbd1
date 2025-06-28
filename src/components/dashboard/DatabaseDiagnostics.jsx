import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Table from '../ui/Table.jsx'

const DatabaseDiagnostics = ({ onDataReady }) => {
  const [diagnostics, setDiagnostics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fixing, setFixing] = useState(false)
  const [logs, setLogs] = useState([])

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { timestamp, message, type }])
    console.log(`[${timestamp}] ${message}`)
  }

  const runComprehensiveDiagnostics = async () => {
    setLoading(true)
    setLogs([])
    addLog('🔍 Kapsamlı veritabanı tanılaması başlatılıyor...')

    try {
      const results = {
        connection: false,
        tables: {},
        data: {},
        relationships: {},
        issues: [],
        recommendations: []
      }

      // 1. Bağlantı Testi
      addLog('📡 Supabase bağlantısı test ediliyor...')
      try {
        const { data, error } = await supabase.from('agents').select('count').limit(1)
        if (error) throw error
        results.connection = true
        addLog('✅ Bağlantı başarılı')
      } catch (error) {
        results.connection = false
        results.issues.push(`Bağlantı hatası: ${error.message}`)
        addLog(`❌ Bağlantı başarısız: ${error.message}`, 'error')
      }

      // 2. Tablo Yapısı Kontrolü
      const tables = ['agents', 'reports', 'profiles']
      for (const tableName of tables) {
        addLog(`🔍 ${tableName} tablosu kontrol ediliyor...`)
        try {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' })
            .limit(5)

          if (error) throw error

          results.tables[tableName] = {
            exists: true,
            count: count || 0,
            sample: data || []
          }
          addLog(`✅ ${tableName}: ${count} kayıt bulundu`)
        } catch (error) {
          results.tables[tableName] = {
            exists: false,
            error: error.message
          }
          results.issues.push(`${tableName} tablosu hatası: ${error.message}`)
          addLog(`❌ ${tableName} hatası: ${error.message}`, 'error')
        }
      }

      // 3. Veri İlişkileri Kontrolü
      addLog('🔗 Veri ilişkileri kontrol ediliyor...')
      if (results.tables.agents?.exists && results.tables.reports?.exists) {
        try {
          // Orphaned reports check
          const { data: orphanedReports, error } = await supabase
            .from('reports')
            .select('id, agent_id')
            .not('agent_id', 'in', `(${results.tables.agents.sample.map(a => `'${a.id}'`).join(',')})`)

          if (!error) {
            results.relationships.orphanedReports = orphanedReports?.length || 0
            if (orphanedReports?.length > 0) {
              results.issues.push(`${orphanedReports.length} orphaned report bulundu`)
              addLog(`⚠️ ${orphanedReports.length} orphaned report`, 'warning')
            }
          }

          // Agents without reports
          const agentsWithoutReports = results.tables.agents.sample.filter(agent => 
            !results.tables.reports.sample.some(report => report.agent_id === agent.id)
          )
          results.relationships.agentsWithoutReports = agentsWithoutReports.length
          if (agentsWithoutReports.length > 0) {
            addLog(`⚠️ ${agentsWithoutReports.length} agent raporsuz`, 'warning')
          }

        } catch (error) {
          addLog(`❌ İlişki kontrolü hatası: ${error.message}`, 'error')
        }
      }

      // 4. Veri Kalitesi Kontrolü
      addLog('📊 Veri kalitesi kontrol ediliyor...')
      if (results.tables.reports?.sample) {
        const reports = results.tables.reports.sample
        const invalidReports = reports.filter(r => 
          !r.incoming_data || r.incoming_data < 0 ||
          !r.month || !r.week ||
          r.contacted > r.incoming_data ||
          r.appointments > r.contacted
        )
        
        if (invalidReports.length > 0) {
          results.issues.push(`${invalidReports.length} geçersiz rapor bulundu`)
          addLog(`⚠️ ${invalidReports.length} geçersiz rapor`, 'warning')
        }
      }

      // 5. Öneriler Oluştur
      if (results.tables.agents?.count === 0) {
        results.recommendations.push('Örnek agent verileri oluştur')
      }
      if (results.tables.reports?.count === 0) {
        results.recommendations.push('Örnek rapor verileri oluştur')
      }
      if (results.tables.agents?.count > 0 && results.tables.reports?.count === 0) {
        results.recommendations.push('Mevcut agentler için rapor verileri oluştur')
      }

      setDiagnostics(results)
      addLog(`🏁 Tanılama tamamlandı. ${results.issues.length} sorun, ${results.recommendations.length} öneri`)

    } catch (error) {
      addLog(`💥 Tanılama hatası: ${error.message}`, 'error')
      setDiagnostics({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const fixDatabaseIssues = async () => {
    setFixing(true)
    addLog('🔧 Veritabanı sorunları düzeltiliyor...')

    try {
      // 1. Agentleri oluştur/kontrol et
      if (!diagnostics?.tables?.agents?.count || diagnostics.tables.agents.count === 0) {
        addLog('👥 Örnek agentler oluşturuluyor...')
        
        const sampleAgents = [
          { name: 'Adviye', category: 'Yurtdışı', email: 'adviye@test.com', notes: 'Deneyimli yurtdışı agent - Almanya uzmanı', active: true },
          { name: 'Jennifer', category: 'Yurtdışı', email: 'jennifer@test.com', notes: 'İngilizce konuşan agent - ABD uzmanı', active: true },
          { name: 'Çiğdem', category: 'Yurtiçi', email: 'cigdem@test.com', notes: 'Yurtiçi operasyon uzmanı - İstanbul', active: true },
          { name: 'Hande', category: 'Yurtiçi', email: 'hande@test.com', notes: 'Müşteri ilişkileri uzmanı - Ankara', active: true }
        ]

        // Önce mevcut agentleri kontrol et
        const { data: existingAgents } = await supabase
          .from('agents')
          .select('name')

        const existingNames = existingAgents?.map(a => a.name) || []
        const newAgents = sampleAgents.filter(agent => !existingNames.includes(agent.name))

        if (newAgents.length > 0) {
          const { data, error } = await supabase
            .from('agents')
            .insert(newAgents)
            .select()

          if (error) throw error
          addLog(`✅ ${newAgents.length} yeni agent oluşturuldu`)
        } else {
          addLog('ℹ️ Tüm agentler zaten mevcut')
        }
      }

      // 2. Güncel agentleri getir
      const { data: currentAgents, error: agentsError } = await supabase
        .from('agents')
        .select('*')

      if (agentsError) throw agentsError
      addLog(`📋 ${currentAgents.length} agent bulundu`)

      // 3. Raporları oluştur/kontrol et
      if (!diagnostics?.tables?.reports?.count || diagnostics.tables.reports.count < 50) {
        addLog('📊 Kapsamlı rapor verileri oluşturuluyor...')
        
        // Önce mevcut raporları temizle
        const { error: deleteError } = await supabase
          .from('reports')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

        if (deleteError) {
          addLog(`⚠️ Eski raporlar temizlenemedi: ${deleteError.message}`, 'warning')
        } else {
          addLog('🗑️ Eski raporlar temizlendi')
        }

        // Yeni raporlar oluştur
        const months = [
          { name: 'Mayıs', index: 5 },
          { name: 'Haziran', index: 6 },
          { name: 'Temmuz', index: 7 },
          { name: 'Ağustos', index: 8 }
        ]

        const allReports = []
        let reportCount = 0

        for (const agent of currentAgents) {
          for (const month of months) {
            for (let week = 1; week <= 4; week++) {
              // Gerçekçi veri oluştur
              const baseData = agent.category === 'Yurtdışı' 
                ? 80 + Math.floor(Math.random() * 120)  // 80-200
                : 50 + Math.floor(Math.random() * 80)   // 50-130

              const contactRate = 0.5 + Math.random() * 0.3 // %50-80
              const contacted = Math.floor(baseData * contactRate)
              
              const appointmentRate = 0.1 + Math.random() * 0.15 // %10-25
              const appointments = Math.floor(contacted * appointmentRate)

              const report = {
                agent_id: agent.id,
                date: `2024-${String(month.index).padStart(2, '0')}-${String(week * 7).padStart(2, '0')}`,
                month: month.name,
                week: week,
                incoming_data: baseData,
                contacted: contacted,
                unreachable: Math.floor(Math.random() * 20),
                no_answer: Math.floor(Math.random() * 25),
                rejected: Math.floor(Math.random() * 15),
                negative: Math.floor(Math.random() * 8),
                appointments: appointments
              }

              allReports.push(report)
              reportCount++
            }
          }
        }

        // Raporları batch halinde ekle
        const batchSize = 50
        for (let i = 0; i < allReports.length; i += batchSize) {
          const batch = allReports.slice(i, i + batchSize)
          const { error } = await supabase
            .from('reports')
            .insert(batch)

          if (error) {
            addLog(`❌ Batch ${Math.floor(i/batchSize) + 1} hatası: ${error.message}`, 'error')
          } else {
            addLog(`✅ Batch ${Math.floor(i/batchSize) + 1} eklendi (${batch.length} rapor)`)
          }
        }

        addLog(`🎉 Toplam ${reportCount} rapor oluşturuldu`)
      }

      // 4. Final doğrulama
      addLog('🔍 Final doğrulama yapılıyor...')
      await runComprehensiveDiagnostics()

      addLog('✅ Veritabanı düzeltme işlemi tamamlandı!')
      
      if (onDataReady) {
        onDataReady()
      }

    } catch (error) {
      addLog(`💥 Düzeltme hatası: ${error.message}`, 'error')
    } finally {
      setFixing(false)
    }
  }

  const clearAllData = async () => {
    if (!window.confirm('TÜM VERİLER SİLİNECEK! Emin misiniz?')) return

    setFixing(true)
    addLog('🗑️ Tüm veriler temizleniyor...')

    try {
      // Sırayla sil (foreign key constraints nedeniyle)
      await supabase.from('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      addLog('✅ Raporlar silindi')
      
      await supabase.from('agents').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      addLog('✅ Agentler silindi')

      addLog('🎉 Tüm veriler temizlendi')
      await runComprehensiveDiagnostics()
    } catch (error) {
      addLog(`❌ Temizleme hatası: ${error.message}`, 'error')
    } finally {
      setFixing(false)
    }
  }

  useEffect(() => {
    runComprehensiveDiagnostics()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-secondary-900">
              Veritabanı Tanılaması
            </h3>
            <div className="flex gap-2">
              <Button 
                onClick={runComprehensiveDiagnostics}
                loading={loading}
                disabled={loading || fixing}
                size="sm"
              >
                <i className="bi bi-arrow-clockwise mr-2"></i>
                Yenile
              </Button>
              {diagnostics?.recommendations?.length > 0 && (
                <Button 
                  onClick={fixDatabaseIssues}
                  loading={fixing}
                  disabled={loading || fixing}
                  variant="success"
                  size="sm"
                >
                  <i className="bi bi-tools mr-2"></i>
                  Düzelt
                </Button>
              )}
              <Button 
                onClick={clearAllData}
                disabled={loading || fixing}
                variant="danger"
                size="sm"
              >
                <i className="bi bi-trash mr-2"></i>
                Temizle
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          {diagnostics && (
            <div className="space-y-4">
              {/* Connection Status */}
              <div className={`p-3 rounded-lg border ${
                diagnostics.connection 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  <i className={`bi ${
                    diagnostics.connection 
                      ? 'bi-check-circle text-green-600' 
                      : 'bi-x-circle text-red-600'
                  } mr-2`}></i>
                  <span className="font-medium">
                    Bağlantı: {diagnostics.connection ? 'Başarılı' : 'Başarısız'}
                  </span>
                </div>
              </div>

              {/* Tables Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(diagnostics.tables || {}).map(([tableName, tableInfo]) => (
                  <div key={tableName} className={`p-3 rounded-lg border ${
                    tableInfo.exists 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="text-center">
                      <i className={`bi ${
                        tableInfo.exists 
                          ? 'bi-table text-blue-600' 
                          : 'bi-exclamation-triangle text-red-600'
                      } text-xl mb-1`}></i>
                      <p className="font-medium capitalize">{tableName}</p>
                      <p className="text-sm text-secondary-600">
                        {tableInfo.exists ? `${tableInfo.count} kayıt` : 'Hata'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Issues */}
              {diagnostics.issues?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">
                    <i className="bi bi-exclamation-triangle mr-2"></i>
                    Tespit Edilen Sorunlar:
                  </h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {diagnostics.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {diagnostics.recommendations?.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    <i className="bi bi-lightbulb mr-2"></i>
                    Öneriler:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {diagnostics.recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sample Data */}
              {diagnostics.tables?.agents?.sample?.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Mevcut Agentler:</h4>
                  <div className="flex flex-wrap gap-2">
                    {diagnostics.tables.agents.sample.map(agent => (
                      <span key={agent.id} className="bg-gray-200 px-2 py-1 rounded text-sm">
                        {agent.name} ({agent.category})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Logs */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-secondary-900">
            İşlem Logları
          </h3>
        </Card.Header>
        <Card.Content className="p-0">
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <Table.Body>
                {logs.map((log, index) => (
                  <Table.Row key={index}>
                    <Table.Cell className="w-20 text-xs text-secondary-500">
                      {log.timestamp}
                    </Table.Cell>
                    <Table.Cell className={`text-sm ${
                      log.type === 'error' ? 'text-red-600' :
                      log.type === 'warning' ? 'text-yellow-600' :
                      'text-secondary-900'
                    }`}>
                      {log.message}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}

export default DatabaseDiagnostics