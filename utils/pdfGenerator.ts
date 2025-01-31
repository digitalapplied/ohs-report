import jsPDF from "jspdf"

/**
 * Given a report object, generate a comprehensive PDF
 * reflecting the newly revised Annual OHS Report template.
 */
export function generatePDF(report: any) {
  const pdf = new jsPDF({
    unit: "pt",
    format: "a4",
  })

  let yPos = 50
  const leftMargin = 40
  const rightMargin = 555
  const lineHeight = 14

  function checkForNewPage() {
    if (yPos > 760) {
      pdf.addPage()
      yPos = 50
    }
  }

  function addSectionTitle(text: string) {
    checkForNewPage()
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(14)
    pdf.text(text, leftMargin, yPos)
    yPos += lineHeight * 1.5
  }

  function addSubSectionTitle(text: string) {
    checkForNewPage()
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(12)
    pdf.text(text, leftMargin, yPos)
    yPos += lineHeight
  }

  function addField(label: string, value?: string, boldLabel = true) {
    checkForNewPage()
    pdf.setFont("helvetica", boldLabel ? "bold" : "normal")
    pdf.setFontSize(10)
    pdf.text(`${label}`, leftMargin, yPos)
    pdf.setFont("helvetica", "normal")
    const wrappedText = pdf.splitTextToSize(value || "N/A", rightMargin - leftMargin - 20)
    wrappedText.forEach((line: string) => {
      yPos += lineHeight
      checkForNewPage()
      pdf.text(line, leftMargin + 20, yPos)
    })
    yPos += lineHeight
  }

  // ============== Title Page Info ==============
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(16)
  pdf.text("ANNUAL OCCUPATIONAL HEALTH AND SAFETY REPORT", leftMargin, yPos)
  yPos += lineHeight * 2

  addField("Depot Location:", report.depotLocation)
  addField("Reporting Period:", report.reportingPeriod)
  addField("Prepared By:", report.preparedBy)
  addField("Date:", new Date(report.date).toLocaleDateString())

  yPos += lineHeight

  // ======== 1. EXECUTIVE SUMMARY ========
  addSectionTitle("1. EXECUTIVE SUMMARY")

  addSubSectionTitle("1.1 Purpose of the Report")
  addField("Purpose", report.executiveSummary?.purposeOfReport || "", false)

  addSubSectionTitle("1.2 Key Highlights")
  addField("- Reduction in Workplace Injuries", report.executiveSummary?.keyHighlights?.injuryReduction)
  addField("- Safety Training", report.executiveSummary?.keyHighlights?.safetyTraining)
  addField("- Emergency Drills", report.executiveSummary?.keyHighlights?.emergencyDrills)
  addField("- Risk Assessment Completion", report.executiveSummary?.keyHighlights?.riskAssessmentCompletion)

  // ======== 2. HEALTH AND SAFETY POLICY STATEMENT ========
  addSectionTitle("2. HEALTH AND SAFETY POLICY STATEMENT")
  addField("Policy Statement", report.policyStatement || "", false)

  // ======== 3. HEALTH AND SAFETY PERFORMANCE ========
  addSectionTitle("3. HEALTH AND SAFETY PERFORMANCE INDICATORS")

  addSubSectionTitle("3.1 Incident Summary")
  const incidentSummary = report.healthAndSafetyPerformance?.incidentSummary
  addField("Total Number of Incidents", incidentSummary?.totalIncidents)
  addField("Minor Injuries", incidentSummary?.minorInjuries)
  addField("Major Accidents/Fatalities", incidentSummary?.majorAccidents)
  addField("Lost Time Injury Frequency Rate (LTIFR)", incidentSummary?.ltifr)
  addField("Total Recordable Incident Rate (TRIR)", incidentSummary?.trir)

  addSubSectionTitle("3.2 Year-on-Year Comparison")
  addField("", report.healthAndSafetyPerformance?.yearOnYearComparison || "", false)

  addSubSectionTitle("3.3 Leading Indicators")
  addField("", report.healthAndSafetyPerformance?.leadingIndicators || "", false)

  // ======== 4. SAFETY TRAINING AND EDUCATION ========
  addSectionTitle("4. SAFETY TRAINING AND EDUCATION")
  const training = report.safetyTraining

  addSubSectionTitle("4.1 Training Initiatives")
  addField("Number of Employees Trained", training?.trainingInitiatives?.employeesTrained)
  addField("Topics Covered", training?.trainingInitiatives?.topicsCovered)
  addField("Specialized Training", training?.trainingInitiatives?.specializedTraining)

  addSubSectionTitle("4.2 New Hire Orientation")
  addField("", training?.newHireOrientation || "", false)

  addSubSectionTitle("4.3 Refresher Courses")
  addField("", training?.refresherCourses || "", false)

  // ======== 5. HAZARD IDENTIFICATION AND RISK ASSESSMENT ========
  addSectionTitle("5. HAZARD IDENTIFICATION AND RISK ASSESSMENT")
  const hazard = report.hazardIdentification

  addSubSectionTitle("5.1 Risk Assessments")
  addField("Completion Rate", hazard?.riskAssessments?.completionRate)
  addField("Methodology Used", hazard?.riskAssessments?.methodology)

  addSubSectionTitle("5.2 Top Hazards Identified")
  addField("", hazard?.topHazards, false)

  addSubSectionTitle("5.3 Control Measures Implemented")
  addField("", hazard?.controlMeasures, false)

  // ======== 6. INCIDENT INVESTIGATIONS AND CORRECTIVE ACTIONS ========
  addSectionTitle("6. INCIDENT INVESTIGATIONS AND CORRECTIVE ACTIONS")
  const incidents = report.incidentInvestigations

  addField("Total Incidents Investigated", incidents?.totalInvestigated)
  addField("Root Causes Identified", incidents?.rootCauses)
  addField("Corrective Actions Taken", incidents?.correctiveActions)
  addField("Follow-Up and Verification", incidents?.followUpVerification)

  // ======== 7. EMERGENCY PREPAREDNESS ========
  addSectionTitle("7. EMERGENCY PREPAREDNESS")
  const emergency = report.emergencyPreparedness

  addSubSectionTitle("7.1 Emergency Drills")
  addField("Drills Conducted", emergency?.drills?.drillsConducted)
  addField("Participation Rate", emergency?.drills?.participationRate)
  addField("Evacuation Success Rate", emergency?.drills?.evacuationSuccessRate)

  addSubSectionTitle("7.2 First Aid and Response Capabilities")
  addField("", emergency?.firstAidCapabilities, false)

  addSubSectionTitle("7.3 Emergency Response Plans")
  addField("", emergency?.emergencyResponsePlans, false)

  // ======== 8. PPE AND EQUIPMENT MANAGEMENT ========
  addSectionTitle("8. PPE AND EQUIPMENT MANAGEMENT")
  const ppe = report.ppeAndEquipment

  addSubSectionTitle("8.1 PPE Compliance")
  addField("Compliance Rate", ppe?.ppeCompliance?.complianceRate)
  addField("Types of PPE Issued", ppe?.ppeCompliance?.ppeTypes)

  addSubSectionTitle("8.2 Equipment Inspections")
  addField("", ppe?.equipmentInspections, false)

  // ======== 9. EMPLOYEE HEALTH AND WELLNESS PROGRAMS ========
  addSectionTitle("9. EMPLOYEE HEALTH AND WELLNESS PROGRAMS")
  const eh = report.employeeHealth

  addField("9.1 Wellness Initiatives", eh?.wellnessInitiatives)
  addField("9.2 Campaigns and Awareness", eh?.campaignsAndAwareness)

  // ======== 10. CHALLENGES AND AREAS FOR IMPROVEMENT ========
  addSectionTitle("10. CHALLENGES AND AREAS FOR IMPROVEMENT")
  const challenges = report.challenges

  addField("10.1 Key Challenges", challenges?.keyChallenges)
  addField("10.2 Proposed Improvements", challenges?.proposedImprovements)

  // ======== 11. RECOMMENDATIONS ========
  addSectionTitle("11. RECOMMENDATIONS")
  addField("", report.recommendations, false)

  // ======== 12. SIGN-OFF AND COMPLIANCE STATEMENT ========
  addSectionTitle("12. SIGN-OFF AND COMPLIANCE STATEMENT")
  const so = report.signOff
  addField("Inspector Name:", so?.inspectorName)
  addField("Inspector Signature:", so?.inspectorSignature)

  // ======== Additional Notes / Appendices ========
  if (report.appendices) {
    addSectionTitle("Additional Notes / Appendices")
    addField("", report.appendices, false)
  }

  // Footer
  checkForNewPage()
  pdf.setFont("helvetica", "italic")
  pdf.setFontSize(10)
  yPos += 10
  pdf.text("End of Report", leftMargin, yPos)

  return pdf
}
