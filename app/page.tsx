"use client"

import { useState, useCallback } from "react"
import OHSReportForm from "@/components/ohs-report-form"
import { ReportList } from "@/components/report-list"

export default function Home() {
  const [editingReport, setEditingReport] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEdit = useCallback((report) => {
    setEditingReport(report)
  }, [])

  const handleSubmitSuccess = useCallback(() => {
    setEditingReport(null)
    setRefreshKey((prevKey) => prevKey + 1)
  }, [])

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">OHS Report Management</h1>
      <OHSReportForm reportToEdit={editingReport} onSubmitSuccess={handleSubmitSuccess} />
      <ReportList key={refreshKey} onEdit={handleEdit} />
    </main>
  )
}

