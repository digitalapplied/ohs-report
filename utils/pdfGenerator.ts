import jsPDF from "jspdf"

export function generatePDF(report: any) {
  const pdf = new jsPDF({
    unit: "pt",
    format: "a4",
  })

  let yPos = 40
  const leftMargin = 40
  const rightMargin = 555
  const lineHeight = 16

  function checkForNewPage() {
    if (yPos > 780) {
      pdf.addPage()
      yPos = 40
    }
  }

  function addSectionHeading(text: string) {
    checkForNewPage()
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(14)
    pdf.text(text, leftMargin, yPos)
    yPos += lineHeight * 1.5
  }

  function addSubHeading(text: string) {
    checkForNewPage()
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(12)
    pdf.text(text, leftMargin, yPos)
    yPos += lineHeight
  }

  function addField(label: string, value: string) {
    checkForNewPage()
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(10)
    pdf.text(`${label}:`, leftMargin, yPos)
    pdf.setFont("helvetica", "normal")
    const wrappedText = pdf.splitTextToSize(value || "N/A", rightMargin - leftMargin - 20)
    wrappedText.forEach((line: string) => {
      yPos += lineHeight
      checkForNewPage()
      pdf.text(line, leftMargin + 20, yPos)
    })
    yPos += lineHeight
  }

  // Title
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(18)
  pdf.text("Annual Occupational Health and Safety Report", leftMargin, yPos)
  yPos += lineHeight * 2

  // Basic Details
  addField("Depot Location", report.depotLocation)
  addField("Reporting Period", report.reportingPeriod)
  addField("Prepared By", report.preparedBy)
  addField("Date", new Date(report.date).toLocaleDateString())
  yPos += lineHeight

  // 1. Executive Summary
  addSectionHeading("1. Executive Summary")
  addSubHeading("1.1 Purpose of the Report")
  addField("", report.purposeOfReport)
  addSubHeading("1.2 Key Highlights")
  addField("Reduction in Workplace Injuries", report.keyHighlights.injuryReduction)
  addField("Safety Training", report.keyHighlights.safetyTraining)
  addField("Emergency Drills", report.keyHighlights.emergencyDrills)
  addField("Risk Assessment Completion", report.keyHighlights.riskAssessmentCompletion)

  // 2. Health and Safety Policy Statement
  addSectionHeading("2. Health and Safety Policy Statement")
  addField("", report.policyStatement)

  // 3. Health and Safety Performance Indicators
  addSectionHeading("3. Health and Safety Performance Indicators")
  addSubHeading("3.1 Incident Summary")
  addField("Total Number of Incidents", report.incidentSummary.totalIncidents)
  addField("Minor Injuries", report.incidentSummary.minorInjuries)
  addField("Major Accidents/Fatalities", report.incidentSummary.majorAccidents)
  addField("Lost Time Injury Frequency Rate (LTIFR)", report.incidentSummary.ltifr)
  addField("Total Recordable Incident Rate (TRIR)", report.incidentSummary.trir)
  addSubHeading("3.2 Year-on-Year Comparison")
  addField("", report.yearOnYearComparison)
  addSubHeading("3.3 Leading Indicators")
  addField("", report.leadingIndicators)

  // Continue with the rest of the sections...

  // Final styling or footer
  pdf.setFont("helvetica", "italic")
  pdf.setFontSize(10)
  pdf.text("End of Report", leftMargin, yPos + 30)

  return pdf
}

