import React, { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

const DataUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    setUploadResult(null)

    try {
      let data = []
      
      if (file.name.endsWith('.csv')) {
        // CSV dosyası işleme
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            data = results.data
            processData(data)
          },
          error: (error) => {
            console.error('CSV parse error:', error)
            setUploadResult({ success: false, message: 'CSV dosyası işlenirken hata oluştu' })
            setUploading(false)
          }
        })
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Excel dosyası işleme
        const reader = new FileReader()
        reader.onload = (e) => {
          const workbook = XLSX.read(e.target.result, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          data = XLSX.utils.sheet_to_json(worksheet)
          processData(data)
        }
        reader.readAsBinaryString(file)
      } else {
        setUploadResult({ success: false, message: 'Desteklenmeyen dosya formatı. CSV veya Excel dosyası yükleyin.' })
        setUploading(false)
        return
      }
    } catch (error) {
      console.error('File upload error:', error)
      setUploadResult({ success: false, message: 'Dosya yüklenirken hata oluştu' })
      setUploading(false)
    }
  }

  const processData = async (data) => {
    try {
      // Agentleri getir
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('id, name')

      if (agentsError) throw agentsError

      const agentMap = {}
      agents.forEach(agent => {
        agentMap[agent.name.toLowerCase()] = agent.id
      })

      const reportsToInsert = []
      let successCount = 0
      let errorCount = 0

      for (const row of data) {
        try {
          // Veri eşleştirme - sütun adlarını normalize et
          const agentName = (row['Agent'] || row['agent'] || row['AGENT'] || '').toString().toLowerCase()
          const agentId = agentMap[agentName]

          if (!agentId) {
            console.warn(`Agent bulunamadı: ${agentName}`)
            errorCount++
            continue
          }

          // Tarih işleme
          let date = new Date()
          if (row['Tarih'] || row['Date'] || row['date']) {
            date = new Date(row['Tarih'] || row['Date'] || row['date'])
          }

          // Hafta hesaplama
          const week = Math.ceil(date.getDate() / 7)
          
          // Ay belirleme
          const month = date.toLocaleDateString('tr-TR', { month: 'long' })

          const report = {
            agent_id: agentId,
            date: date.toISOString().split('T')[0],
            month: month,
            week: week,
            incoming_data: parseInt(row['Gelen Data'] || row['incoming_data'] || 0),
            contacted: parseInt(row['Görüşülen'] || row['contacted'] || 0),
            unreachable: parseInt(row['Ulaşılamadı'] || row['unreachable'] || 0),
            no_answer: parseInt(row['Cevap Vermiyor'] || row['no_answer'] || 0),rejected: parseInt(row['Red'] || row['rejected'] || 0),
            negative: parseInt(row['Olumsuz'] || row['negative'] || 0),
            appointments: parseInt(row['Randevu'] || row['appointments'] || 0),
            sales_rate: parseFloat(row['Satış Yüzdesi'] || row['sales_rate'] || 0)
          }

          reportsToInsert.push(report)
          successCount++
        } catch (rowError) {
          console.error('Row processing error:', rowError)
          errorCount++
        }
      }

      // Veritabanına toplu ekleme
      if (reportsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('reports')
          .insert(reportsToInsert)

        if (insertError) throw insertError
      }

      setUploadResult({
        success: true,
        message: `${successCount} kayıt başarıyla yüklendi. ${errorCount} kayıt hata ile karşılaştı.`
      })
    } catch (error) {
      console.error('Data processing error:', error)
      setUploadResult({
        success: false,
        message: 'Veri işlenirken hata oluştu: ' + error.message
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Veri Yükleme</h1>

      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-secondary-900">
            CSV/Excel Dosyası Yükle
          </h3>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center">
              <i className="bi bi-cloud-upload text-4xl text-secondary-400 mb-4"></i>
              <p className="text-secondary-600 mb-4">
                CSV veya Excel dosyanızı seçin
              </p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button
                  as="span"
                  disabled={uploading}
                  loading={uploading}
                >
                  {uploading ? 'Yükleniyor...' : 'Dosya Seç'}
                </Button>
              </label>
            </div>

            {uploadResult && (
              <div className={`p-4 rounded-lg ${
                uploadResult.success 
                  ? 'bg-success-50 text-success-700 border border-success-200'
                  : 'bg-danger-50 text-danger-700 border border-danger-200'
              }`}>
                <div className="flex items-center">
                  <i className={`${
                    uploadResult.success ? 'bi-check-circle' : 'bi-exclamation-triangle'
                  } mr-2`}></i>
                  {uploadResult.message}
                </div>
              </div>
            )}

            <div className="bg-secondary-50 p-4 rounded-lg">
              <h4 className="font-medium text-secondary-900 mb-2">
                Dosya Formatı Gereksinimleri:
              </h4>
              <ul className="text-sm text-secondary-600 space-y-1">
                <li>• Agent: Agent adı</li>
                <li>• Gelen Data: Gelen veri sayısı</li>
                <li>• Görüşülen: Görüşülen kişi sayısı</li>
                <li>• Ulaşılamadı: Ulaşılamayan kişi sayısı</li>
                <li>• Cevap Vermiyor: Cevap vermeyen kişi sayısı</li>
                <li>• Red: Red edilen kişi sayısı</li>
                <li>• Olumsuz: Olumsuz yanıt veren kişi sayısı</li>
                <li>• Randevu: Randevu verilen kişi sayısı</li>
                <li>• Satış Yüzdesi: Satış oranı (%)</li>
              </ul>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}

export default DataUpload
