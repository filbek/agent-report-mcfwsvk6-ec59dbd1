import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import Card from '../ui/Card.jsx'
import Table from '../ui/Table.jsx'
import Button from '../ui/Button.jsx'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

const ReportsList = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    month: '',
    category: '',
    agent: ''
  })

  useEffect(() => {
    fetchReports()
  }, [filters])

  const fetchReports = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('reports')
        .select(`
          *,
          agents (
            name,
            category
          )
        `)
        .order('date', { ascending: false })

      if (filters.month) {
        query = query.eq('month', filters.month)
      }
      
      if (filters.category) {
        query = query.eq('agents.category', filters.category)
      }

      const { data, error } = await query

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const weeklyData = reports.reduce((acc, report) => {
    const key = `${report.month}-W${report.week}-${report.agents?.category}`
    if (!acc[key]) {
      acc[key] = {
        month: report.month,
        week: report.week,
        category: report.agents?.category,
        incoming_data: 0,
        contacted: 0,
        unreachable: 0,
        no_answer: 0,
        rejected: 0,
        negative: 0,
        appointments: 0,
        agents_count: 0
      }
    }
    
    acc[key].incoming_data += report.incoming_data || 0
    acc[key].contacted += report.contacted || 0
    acc[key].unreachable += report.unreachable || 0
    acc[key].no_answer += report.no_answer || 0
    acc[key].rejected += report.rejected || 0
    acc[key].negative += report.negative || 0
    acc[key].appointments += report.appointments || 0
    acc[key].agents_count += 1
    
    return acc
  }, {})

  const weeklyReports = Object.values(weeklyData).map(week => ({
    ...week,
    sales_rate: week.incoming_data > 0 
      ? ((week.appointments / week.incoming_data) * 100).toFixed(1)
      : '0.0'
  }))

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
        <h1 className="text-2xl font-bold text-secondary-900">Raporlar</h1>
      </div>

      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-secondary-900">Filtreler</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Ay
              </label>
              <select
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tüm Aylar</option>
                <option value="Mayıs">Mayıs</option>
                <option value="Haziran">Haziran</option>
                <option value="Temmuz">Temmuz</option>
                <option value="Ağustos">Ağustos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Kategori
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tüm Kategoriler</option>
                <option value="Yurtdışı">Yurtdışı</option>
                <option value="Yurtiçi">Yurtiçi</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setFilters({ month: '', category: '', agent: '' })}
                variant="outline"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-secondary-900">
            Haftalık Performans Raporu
          </h3>
        </Card.Header>
        <Card.Content className="p-0">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Ay</Table.Head>
                <Table.Head>Hafta</Table.Head>
                <Table.Head>Kategori</Table.Head>
                <Table.Head>Gelen Data</Table.Head>
                <Table.Head>Görüşülen</Table.Head>
                <Table.Head>Randevu</Table.Head>
                <Table.Head>Satış Oranı</Table.Head>
                <Table.Head>Agent Sayısı</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {weeklyReports.map((week, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{week.month}</Table.Cell>
                  <Table.Cell>Hafta {week.week}</Table.Cell>
                  <Table.Cell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      week.category === 'Yurtdışı' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {week.category}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{week.incoming_data}</Table.Cell>
                  <Table.Cell>{week.contacted}</Table.Cell>
                  <Table.Cell>{week.appointments}</Table.Cell>
                  <Table.Cell>
                    <span className={`font-medium ${
                      parseFloat(week.sales_rate) >= 10 ? 'text-success-600' :
                      parseFloat(week.sales_rate) >= 5 ? 'text-warning-600' :
                      'text-danger-600'
                    }`}>
                      %{week.sales_rate}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{week.agents_count}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-secondary-900">
            Detaylı Raporlar
          </h3>
        </Card.Header>
        <Card.Content className="p-0">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Tarih</Table.Head>
                <Table.Head>Agent</Table.Head>
                <Table.Head>Kategori</Table.Head>
                <Table.Head>Gelen Data</Table.Head>
                <Table.Head>Görüşülen</Table.Head>
                <Table.Head>Randevu</Table.Head>
                <Table.Head>Satış Oranı</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {reports.slice(0, 50).map((report) => (
                <Table.Row key={report.id}>
                  <Table.Cell>
                    {format(new Date(report.date), 'dd MMM yyyy', { locale: tr })}
                  </Table.Cell>
                  <Table.Cell>{report.agents?.name}</Table.Cell>
                  <Table.Cell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.agents?.category === 'Yurtdışı' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {report.agents?.category}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{report.incoming_data}</Table.Cell>
                  <Table.Cell>{report.contacted}</Table.Cell>
                  <Table.Cell>{report.appointments}</Table.Cell>
                  <Table.Cell>
                    <span className={`font-medium ${
                      parseFloat(report.sales_rate) >= 10 ? 'text-success-600' :
                      parseFloat(report.sales_rate) >= 5 ? 'text-warning-600' :
                      'text-danger-600'
                    }`}>
                      %{report.sales_rate}
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>
    </div>
  )
}

export default ReportsList
