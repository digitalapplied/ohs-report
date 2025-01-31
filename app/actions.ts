"use server"

import { cookies } from "next/headers"

// We will keep the cookie-based storing but also store in localStorage on the client side.
// For the server side, we rely on cookies. For the client side, we can reflect that in the
// ohs-report-form and report-list components.

const REPORTS_KEY = "ohs_reports"

// Helper to parse or return empty array
function parseJSON(value: string | undefined) {
  try {
    return JSON.parse(value || "[]")
  } catch {
    return []
  }
}

export async function submitReport(data: any) {
  // We'll generate a unique ID
  const reportId = Date.now().toString()
  const newReport = { id: reportId, ...data }

  const cookieStore = cookies()
  const existingReports = parseJSON(cookieStore.get(REPORTS_KEY)?.value)
  const updatedReports = [...existingReports, newReport]

  // Set cookie
  cookieStore.set(REPORTS_KEY, JSON.stringify(updatedReports))

  return { success: true, reportId }
}

export async function getReports() {
  const cookieStore = cookies()
  return parseJSON(cookieStore.get(REPORTS_KEY)?.value)
}

export async function deleteReport(id: string) {
  const cookieStore = cookies()
  const existingReports = parseJSON(cookieStore.get(REPORTS_KEY)?.value)
  const updatedReports = existingReports.filter((report: any) => report.id !== id)

  cookieStore.set(REPORTS_KEY, JSON.stringify(updatedReports))

  return { success: true }
}

export async function editReport(id: string, data: any) {
  const cookieStore = cookies()
  const existingReports = parseJSON(cookieStore.get(REPORTS_KEY)?.value)
  const updatedReports = existingReports.map((report: any) =>
    report.id === id ? { ...report, ...data } : report
  )

  cookieStore.set(REPORTS_KEY, JSON.stringify(updatedReports))

  return { success: true }
}

// Force including jspdf in the client bundle
import "jspdf"
