"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, InfoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { submitReport, editReport } from "@/app/actions"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const formSchema = z.object({
  depotLocation: z.string().min(2, { message: "Depot location must be at least 2 characters." }),
  reportingPeriod: z.string().min(2, { message: "Reporting period must be at least 2 characters." }),
  preparedBy: z.string().min(2, { message: "Prepared by must be at least 2 characters." }),
  date: z.date({ required_error: "A date is required." }),
  executiveSummary: z.object({
    purposeOfReport: z.string().min(10, { message: "Purpose of report must be at least 10 characters." }),
    keyHighlights: z.object({
      injuryReduction: z.string().min(1, { message: "Injury reduction percentage is required." }),
      safetyTraining: z.string().min(1, { message: "Safety training information is required." }),
      emergencyDrills: z.string().min(1, { message: "Emergency drill information is required." }),
      riskAssessmentCompletion: z.string().min(1, { message: "Risk assessment completion rate is required." }),
    }),
  }),
  policyStatement: z.string().min(10, { message: "Policy statement must be at least 10 characters." }),
  healthAndSafetyPerformance: z.object({
    incidentSummary: z.object({
      totalIncidents: z.string().min(1, { message: "Total incidents is required." }),
      minorInjuries: z.string().min(1, { message: "Minor injuries information is required." }),
      majorAccidents: z.string().min(1, { message: "Major accidents information is required." }),
      ltifr: z.string().min(1, { message: "LTIFR is required." }),
      trir: z.string().min(1, { message: "TRIR is required." }),
    }),
    yearOnYearComparison: z.string().optional(),
    leadingIndicators: z.string().optional(),
  }),
  safetyTraining: z.object({
    trainingInitiatives: z.object({
      employeesTrained: z.string().min(1, { message: "Employees trained information is required." }),
      topicsCovered: z.string().min(2, { message: "Topics covered must be at least 2 characters." }),
      specializedTraining: z.string().min(2, { message: "Specialized training must be at least 2 characters." }),
    }),
    newHireOrientation: z.string().min(2, { message: "New hire orientation must be at least 2 characters." }),
    refresherCourses: z.string().min(2, { message: "Refresher courses must be at least 2 characters." }),
  }),
  hazardIdentification: z.object({
    riskAssessments: z.object({
      completionRate: z.string().min(1, { message: "Risk assessment completion rate is required." }),
      methodology: z.string().min(2, { message: "Risk assessment methodology must be at least 2 characters." }),
    }),
    topHazards: z.string().min(2, { message: "Top hazards must be at least 2 characters." }),
    controlMeasures: z.string().min(2, { message: "Control measures must be at least 2 characters." }),
  }),
  incidentInvestigations: z.object({
    totalInvestigated: z.string().min(1, { message: "Incidents investigated is required." }),
    rootCauses: z.string().min(2, { message: "Root causes must be at least 2 characters." }),
    correctiveActions: z.string().min(2, { message: "Corrective actions must be at least 2 characters." }),
    followUpVerification: z.string().min(2, { message: "Follow-up and verification must be at least 2 characters." }),
  }),
  emergencyPreparedness: z.object({
    drills: z.object({
      drillsConducted: z.string().min(1, { message: "Emergency drills conducted is required." }),
      participationRate: z.string().min(1, { message: "Participation rate is required." }),
      evacuationSuccessRate: z.string().min(1, { message: "Evacuation success rate is required." }),
    }),
    firstAidCapabilities: z.string().min(2, { message: "First aid capabilities must be at least 2 characters." }),
    emergencyResponsePlans: z.string().min(2, { message: "Emergency response plans must be at least 2 characters." }),
  }),
  ppeAndEquipment: z.object({
    ppeCompliance: z.object({
      complianceRate: z.string().min(1, { message: "PPE compliance rate is required." }),
      ppeTypes: z.string().min(2, { message: "PPE types must be at least 2 characters." }),
    }),
    equipmentInspections: z.string().min(2, { message: "Equipment inspections must be at least 2 characters." }),
  }),
  employeeHealth: z.object({
    wellnessInitiatives: z.string().min(2, { message: "Wellness initiatives must be at least 2 characters." }),
    campaignsAndAwareness: z.string().min(2, { message: "Campaigns and awareness must be at least 2 characters." }),
  }),
  challenges: z.object({
    keyChallenges: z.string().min(2, { message: "Key challenges must be at least 2 characters." }),
    proposedImprovements: z.string().min(2, { message: "Proposed improvements must be at least 2 characters." }),
  }),
  recommendations: z.string().min(2, { message: "Recommendations must be at least 2 characters." }),
  signOff: z.object({
    inspectorName: z.string().min(2, { message: "Inspector name must be at least 2 characters." }),
    inspectorSignature: z.string().optional(),
  }),
})

export default function OHSReportForm({
  reportToEdit,
  onSubmitSuccess,
}: {
  reportToEdit?: any
  onSubmitSuccess?: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: reportToEdit
      ? {
          ...reportToEdit,
          date: new Date(reportToEdit.date),
        }
      : {
          depotLocation: "",
          reportingPeriod: "",
          preparedBy: "",
          date: new Date(),
          executiveSummary: {
            purposeOfReport: "",
            keyHighlights: {
              injuryReduction: "",
              safetyTraining: "",
              emergencyDrills: "",
              riskAssessmentCompletion: "",
            },
          },
          policyStatement: "",
          healthAndSafetyPerformance: {
            incidentSummary: {
              totalIncidents: "",
              minorInjuries: "",
              majorAccidents: "",
              ltifr: "",
              trir: "",
            },
            yearOnYearComparison: "",
            leadingIndicators: "",
          },
          safetyTraining: {
            trainingInitiatives: {
              employeesTrained: "",
              topicsCovered: "",
              specializedTraining: "",
            },
            newHireOrientation: "",
            refresherCourses: "",
          },
          hazardIdentification: {
            riskAssessments: {
              completionRate: "",
              methodology: "",
            },
            topHazards: "",
            controlMeasures: "",
          },
          incidentInvestigations: {
            totalInvestigated: "",
            rootCauses: "",
            correctiveActions: "",
            followUpVerification: "",
          },
          emergencyPreparedness: {
            drills: {
              drillsConducted: "",
              participationRate: "",
              evacuationSuccessRate: "",
            },
            firstAidCapabilities: "",
            emergencyResponsePlans: "",
          },
          ppeAndEquipment: {
            ppeCompliance: {
              complianceRate: "",
              ppeTypes: "",
            },
            equipmentInspections: "",
          },
          employeeHealth: {
            wellnessInitiatives: "",
            campaignsAndAwareness: "",
          },
          challenges: {
            keyChallenges: "",
            proposedImprovements: "",
          },
          recommendations: "",
          signOff: {
            inspectorName: "",
            inspectorSignature: "",
          },
        },
  })

  useEffect(() => {
    if (reportToEdit) {
      form.reset({
        ...reportToEdit,
        date: new Date(reportToEdit.date),
      })
    }
  }, [reportToEdit, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const result: { success: boolean; reportId?: string; error?: string } = reportToEdit
        ? await editReport(reportToEdit.id, values)
        : await submitReport(values)

      if (result.success) {
        toast({
          title: reportToEdit ? "Report Updated" : "Report Submitted",
          description: reportToEdit
            ? "Your report has been successfully updated."
            : result.reportId
              ? `Your report has been successfully submitted with ID: ${result.reportId}`
              : "Your report has been successfully submitted.",
        })
        form.reset()
        if (onSubmitSuccess) {
          onSubmitSuccess()
        }
      } else if (result.error) {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "There was an error submitting your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{reportToEdit ? "Edit Report" : "Annual Occupational Health and Safety Report"}</CardTitle>
        <CardDescription>
          {reportToEdit
            ? "Update the report information below."
            : "Complete the form below to submit your annual OHS report."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="depotLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depot Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Pinetown, KwaZulu-Natal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reportingPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporting Period</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., January 2024 – December 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preparedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prepared By</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name / Position" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">1. Executive Summary</h2>
              <FormField
                control={form.control}
                name="executiveSummary.purposeOfReport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>1.1 Purpose of the Report</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide an overview of the OHS performance at the depot for the reporting period."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <h3 className="text-md font-semibold">1.2 Key Highlights</h3>
                <FormField
                  control={form.control}
                  name="executiveSummary.keyHighlights.injuryReduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reduction in Workplace Injuries</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 15% decrease compared to previous year" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="executiveSummary.keyHighlights.safetyTraining"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Safety Training</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 100 employees completed accredited safety training programs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="executiveSummary.keyHighlights.emergencyDrills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Drills</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 4 evacuation drills conducted; 80% participation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="executiveSummary.keyHighlights.riskAssessmentCompletion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Assessment Completion</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 100% of operational areas assessed" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Health and Safety Policy Statement */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">2. Health and Safety Policy Statement</h2>
              <FormField
                control={form.control}
                name="policyStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Statement</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summarize key commitments, objectives, and scope of your health and safety policy."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Health and Safety Performance Indicators */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">3. Health and Safety Performance Indicators</h2>
              <div className="space-y-4">
                <h3 className="text-md font-semibold">3.1 Incident Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="healthAndSafetyPerformance.incidentSummary.totalIncidents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Number of Incidents</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 5 incidents" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="healthAndSafetyPerformance.incidentSummary.minorInjuries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minor Injuries</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 3 (cuts, sprains, bruises)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="healthAndSafetyPerformance.incidentSummary.majorAccidents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Major Accidents/Fatalities</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="healthAndSafetyPerformance.incidentSummary.ltifr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Lost Time Injury Frequency Rate (LTIFR)
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 ml-2" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>LTIFR is the number of lost time injuries per 1,000,000 hours worked</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1.2 per 1,000,000 hours worked" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="healthAndSafetyPerformance.incidentSummary.trir"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Total Recordable Incident Rate (TRIR)
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 ml-2" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>TRIR is the number of recordable incidents per 100 full-time employees per year</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 3.5 per 100 full-time employees" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="healthAndSafetyPerformance.yearOnYearComparison"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>3.2 Year-on-Year Comparison</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide trends or comparisons with previous years, if available."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="healthAndSafetyPerformance.leadingIndicators"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>3.3 Leading Indicators</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Include proactive measures such as safety inspections, near-miss reporting, and safety training completion rates."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Continue with the rest of the form sections... */}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : reportToEdit ? "Update Report" : "Submit Report"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
