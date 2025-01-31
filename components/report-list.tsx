"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getReports, deleteReport } from "@/app/actions"
import { useToast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { generatePDF } from "@/utils/pdfGenerator"
import { Download } from "lucide-react"

// We also keep a local list in localStorage for quick reference, but the official
// source of truth is the server cookies. We'll just retrieve from the server
// whenever we mount. You can modify as needed.

export function ReportList({ onEdit }: { onEdit: (report: any) => void }) {
  const [reports, setReports] = useState<any[]>([])
  const { toast } = useToast()

  async function fetchReports() {
    try {
      const fetchedReports = await getReports()
      setReports(fetchedReports)
      // Also store in localStorage
      localStorage.setItem("all_ohs_reports", JSON.stringify(fetchedReports))
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "Error",
        description: "Failed to fetch reports. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    // On mount, fetch from server
    fetchReports()
  }, [])

  const handleDelete = async (id: string) => {
    const result = await deleteReport(id)
    if (result.success) {
      toast({
        title: "Report Deleted",
        description: "The report has been successfully deleted.",
      })
      fetchReports()
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = (report: any) => {
    const pdf = generatePDF(report)
    pdf.save(`OHS_Report_${report.id}.pdf`)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Submitted Reports</CardTitle>
        <CardDescription>View all submitted OHS reports</CardDescription>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p>No reports submitted yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Depot Location</TableHead>
                <TableHead>Reporting Period</TableHead>
                <TableHead>Prepared By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell>{report.depotLocation}</TableCell>
                  <TableCell>{report.reportingPeriod}</TableCell>
                  <TableCell>{report.preparedBy}</TableCell>
                  <TableCell>
                    {new Date(report.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="space-x-2">
                      <Button onClick={() => onEdit(report)}>Edit</Button>
                      <Button onClick={() => handleDownload(report)} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. It will permanently
                              delete the report.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(report.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
