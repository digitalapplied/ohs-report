"use server"

import { cookies } from "next/headers"

const REPORTS_KEY = "ohs_reports"

export async function submitReport(data: any) {
  const reportId = Date.now().toString()
  const newReport = { id: reportId, ...data }

  const cookieStore = cookies()
  const existingReports = JSON.parse(cookieStore.get(REPORTS_KEY)?.value || "[]")
  const updatedReports = [...existingReports, newReport]

  cookieStore.set(REPORTS_KEY, JSON.stringify(updatedReports))

  return { success: true, reportId }
}

export async function getReports() {
  const cookieStore = cookies()
  return JSON.parse(cookieStore.get(REPORTS_KEY)?.value || "[]")
}

export async function deleteReport(id: string) {
  const cookieStore = cookies()
  const existingReports = JSON.parse(cookieStore.get(REPORTS_KEY)?.value || "[]")
  const updatedReports = existingReports.filter((report: any) => report.id !== id)

  cookieStore.set(REPORTS_KEY, JSON.stringify(updatedReports))

  return { success: true }
}

export async function editReport(id: string, data: any) {
  const cookieStore = cookies()
  const existingReports = JSON.parse(cookieStore.get(REPORTS_KEY)?.value || "[]")
  const updatedReports = existingReports.map((report: any) => (report.id === id ? { ...report, ...data } : report))

  cookieStore.set(REPORTS_KEY, JSON.stringify(updatedReports))

  return { success: true }
}

// This import is needed to include jspdf in the client-side bundle
import "jspdf"

