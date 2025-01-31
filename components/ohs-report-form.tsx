"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, InfoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { submitReport, editReport, type ApiResponse } from "@/app/actions"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Below is the expanded schema, including all sections from the revised template.
 * Each field is validated for at least minimal presence or length.
 */
const ohsReportSchema = z.object({
  depotLocation: z.string().min(2, "Depot location must be at least 2 characters."),
  reportingPeriod: z.string().min(2, "Reporting period must be at least 2 characters."),
  preparedBy: z.string().min(2, "Prepared by must be at least 2 characters."),
  date: z.date({ required_error: "A date is required." }),

  executiveSummary: z.object({
    purposeOfReport: z.string().min(10, "Provide an overview (at least 10 characters)."),
    keyHighlights: z.object({
      injuryReduction: z.string().min(1, "Required."),
      safetyTraining: z.string().min(1, "Required."),
      emergencyDrills: z.string().min(1, "Required."),
      riskAssessmentCompletion: z.string().min(1, "Required."),
    }),
  }),

  policyStatement: z.string().min(10, "Policy statement must be at least 10 characters."),

  // 3. Health and Safety Performance
  healthAndSafetyPerformance: z.object({
    incidentSummary: z.object({
      totalIncidents: z.string().min(1, "Required."),
      minorInjuries: z.string().min(1, "Required."),
      majorAccidents: z.string().min(1, "Required."),
      ltifr: z.string().min(1, "Required."),
      trir: z.string().min(1, "Required."),
    }),
    yearOnYearComparison: z.string().optional(),
    leadingIndicators: z.string().optional(),
  }),

  // 4. Safety Training
  safetyTraining: z.object({
    trainingInitiatives: z.object({
      employeesTrained: z.string().min(1, "Required."),
      topicsCovered: z.string().min(2, "At least 2 characters."),
      specializedTraining: z.string().min(2, "At least 2 characters."),
    }),
    newHireOrientation: z.string().min(2, "At least 2 characters."),
    refresherCourses: z.string().min(2, "At least 2 characters."),
  }),

  // 5. Hazard Identification
  hazardIdentification: z.object({
    riskAssessments: z.object({
      completionRate: z.string().min(1, "Required."),
      methodology: z.string().min(2, "At least 2 characters."),
    }),
    topHazards: z.string().min(2, "At least 2 characters."),
    controlMeasures: z.string().min(2, "At least 2 characters."),
  }),

  // 6. Incident Investigations
  incidentInvestigations: z.object({
    totalInvestigated: z.string().min(1, "Required."),
    rootCauses: z.string().min(2, "At least 2 characters."),
    correctiveActions: z.string().min(2, "At least 2 characters."),
    followUpVerification: z.string().min(2, "At least 2 characters."),
  }),

  // 7. Emergency Preparedness
  emergencyPreparedness: z.object({
    drills: z.object({
      drillsConducted: z.string().min(1, "Required."),
      participationRate: z.string().min(1, "Required."),
      evacuationSuccessRate: z.string().min(1, "Required."),
    }),
    firstAidCapabilities: z.string().min(2, "Must be at least 2 characters."),
    emergencyResponsePlans: z.string().min(2, "Must be at least 2 characters."),
  }),

  // 8. PPE & Equipment
  ppeAndEquipment: z.object({
    ppeCompliance: z.object({
      complianceRate: z.string().min(1, "Required."),
      ppeTypes: z.string().min(2, "At least 2 characters."),
    }),
    equipmentInspections: z.string().min(2, "At least 2 characters."),
  }),

  // 9. Employee Health & Wellness
  employeeHealth: z.object({
    wellnessInitiatives: z.string().min(2, "At least 2 characters."),
    campaignsAndAwareness: z.string().min(2, "At least 2 characters."),
  }),

  // 10. Challenges
  challenges: z.object({
    keyChallenges: z.string().min(2, "At least 2 characters."),
    proposedImprovements: z.string().min(2, "At least 2 characters."),
  }),

  // 11. Recommendations
  recommendations: z.string().min(2, "At least 2 characters."),

  // 12. Sign-Off
  signOff: z.object({
    inspectorName: z.string().min(2, "Inspector name must be at least 2 characters."),
    inspectorSignature: z.string().optional(),
  }),

  // Additional notes/appendices
  appendices: z.string().optional(),
})

type OHSReportFormValues = z.infer<typeof ohsReportSchema>

export default function OHSReportForm({
  reportToEdit,
  onSubmitSuccess,
}: {
  reportToEdit?: any
  onSubmitSuccess?: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialize the form
  const form = useForm<OHSReportFormValues>({
    resolver: zodResolver(ohsReportSchema),
    defaultValues: reportToEdit
      ? {
          ...reportToEdit,
          date: new Date(reportToEdit.date),
        }
      : {
          // Basic details
          depotLocation: "",
          reportingPeriod: "",
          preparedBy: "",
          date: new Date(),

          // 1. Executive summary
          executiveSummary: {
            purposeOfReport: "",
            keyHighlights: {
              injuryReduction: "",
              safetyTraining: "",
              emergencyDrills: "",
              riskAssessmentCompletion: "",
            },
          },

          // 2. Policy statement
          policyStatement: "",

          // 3. Performance
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

          // 4. Safety training
          safetyTraining: {
            trainingInitiatives: {
              employeesTrained: "",
              topicsCovered: "",
              specializedTraining: "",
            },
            newHireOrientation: "",
            refresherCourses: "",
          },

          // 5. Hazard identification
          hazardIdentification: {
            riskAssessments: {
              completionRate: "",
              methodology: "",
            },
            topHazards: "",
            controlMeasures: "",
          },

          // 6. Incident investigations
          incidentInvestigations: {
            totalInvestigated: "",
            rootCauses: "",
            correctiveActions: "",
            followUpVerification: "",
          },

          // 7. Emergency preparedness
          emergencyPreparedness: {
            drills: {
              drillsConducted: "",
              participationRate: "",
              evacuationSuccessRate: "",
            },
            firstAidCapabilities: "",
            emergencyResponsePlans: "",
          },

          // 8. PPE and equipment
          ppeAndEquipment: {
            ppeCompliance: {
              complianceRate: "",
              ppeTypes: "",
            },
            equipmentInspections: "",
          },

          // 9. Employee health
          employeeHealth: {
            wellnessInitiatives: "",
            campaignsAndAwareness: "",
          },

          // 10. Challenges
          challenges: {
            keyChallenges: "",
            proposedImprovements: "",
          },

          // 11. Recommendations
          recommendations: "",

          // 12. Sign-off
          signOff: {
            inspectorName: "",
            inspectorSignature: "",
          },

          // Additional
          appendices: "",
        },
  })

  // If editing an existing report, reset form on mount or when `reportToEdit` changes
  useEffect(() => {
    if (reportToEdit) {
      form.reset({
        ...reportToEdit,
        date: new Date(reportToEdit.date),
      })
    }
  }, [reportToEdit, form])

  // Attempt to store in localStorage for "offline" or local usage
  useEffect(() => {
    // On mount, load from localStorage if it exists
    const stored = localStorage.getItem("draft_ohs_report")
    if (stored && !reportToEdit) {
      try {
        const parsed = JSON.parse(stored)
        // Only reset if the user is not editing an existing record
        form.reset({
          ...form.getValues(),
          ...parsed,
          date: parsed?.date ? new Date(parsed.date) : new Date(),
        })
      } catch (err) {
        // ignore
      }
    }
  }, [form, reportToEdit])

  // Save current form data to local storage whenever the form changes
  useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem("draft_ohs_report", JSON.stringify(values))
    })
    return () => subscription.unsubscribe()
  }, [form])

  async function onSubmit(values: OHSReportFormValues) {
    setIsSubmitting(true)
    try {
      const result: ApiResponse =
        reportToEdit && reportToEdit.id
          ? await editReport(reportToEdit.id, values)
          : await submitReport(values)

      if (result.success) {
        toast({
          title: reportToEdit ? "Report Updated" : "Report Submitted",
          description: reportToEdit
            ? "Your report has been successfully updated."
            : result.reportId
            ? `Your report has been successfully submitted (ID: ${result.reportId}).`
            : "Your report has been successfully submitted.",
        })
        form.reset()
        localStorage.removeItem("draft_ohs_report") // clear the local draft
        onSubmitSuccess && onSubmitSuccess()
      } else if (result.error) {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error submitting your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {reportToEdit ? "Edit Report" : "Annual Occupational Health and Safety Report"}
        </CardTitle>
        <CardDescription>
          {reportToEdit
            ? "Update the report information below."
            : "Complete the form below to submit your annual OHS report."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* =============== BASIC DETAILS =============== */}
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
                        <Input
                          placeholder="e.g., Pinetown, KwaZulu-Natal"
                          {...field}
                        />
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
                        <Input
                          placeholder="e.g., January 2024 – December 2024"
                          {...field}
                        />
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
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* =============== 1. EXECUTIVE SUMMARY =============== */}
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
                        placeholder="Describe the overall purpose of this OHS report..."
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
                        <Input
                          placeholder="e.g., 15% decrease compared to previous year"
                          {...field}
                        />
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
                          placeholder="e.g., 100 employees completed accredited programs"
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
                        <Input
                          placeholder="e.g., 4 evacuation drills conducted; 80% participation"
                          {...field}
                        />
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
                        <Input
                          placeholder="e.g., 100% of operational areas assessed"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* =============== 2. HEALTH AND SAFETY POLICY STATEMENT =============== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                2. Health and Safety Policy Statement
              </h2>
              <FormField
                control={form.control}
                name="policyStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Statement</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summarize or attach your Health and Safety Policy Statement..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* =============== 3. HEALTH AND SAFETY PERFORMANCE =============== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                3. Health and Safety Performance Indicators
              </h2>

              {/* 3.1 Incident Summary */}
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
                          <Input
                            placeholder="e.g., 5 incidents"
                            {...field}
                          />
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
                          <Input
                            placeholder="e.g., 3 (cuts, sprains, bruises)"
                            {...field}
                          />
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
                                <p>
                                  LTIFR = # of lost-time injuries per
                                  1,000,000 hours worked
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 1.2 per 1,000,000 hours worked"
                            {...field}
                          />
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
                                <p>
                                  TRIR = # of recordable incidents per 100
                                  full-time employees per year
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 3.5 per 100 full-time employees"
                            {...field}
                          />
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
                        placeholder="Include proactive measures (inspections, near-miss reporting, training completion rates, etc.)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* =============== 4. SAFETY TRAINING AND EDUCATION =============== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">4. Safety Training and Education</h2>

              <h3 className="text-md font-semibold">4.1 Training Initiatives</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="safetyTraining.trainingInitiatives.employeesTrained"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Employees Trained</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 80% employees completed mandatory OHS training"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="safetyTraining.trainingInitiatives.topicsCovered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topics Covered</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Hazard Identification, Emergency Procedures, First Aid"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="safetyTraining.trainingInitiatives.specializedTraining"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialized Training</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., PPE Usage, Handling Hazardous Materials, Working at Height"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="safetyTraining.newHireOrientation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>4.2 New Hire Orientation</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your induction process for new hires..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="safetyTraining.refresherCourses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>4.3 Refresher Courses</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List the frequency (e.g., biannual) and topics of refresher training..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* =============== 5. HAZARD IDENTIFICATION AND RISK ASSESSMENT =============== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">5. Hazard Identification and Risk Assessment</h2>
              <h3 className="text-md font-semibold">5.1 Risk Assessments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hazardIdentification.riskAssessments.completionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Rate</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 100% of depot activities assessed"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hazardIdentification.riskAssessments.methodology"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Methodology Used</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Describe how you identify and assess hazards..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hazardIdentification.topHazards"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>5.2 Top Hazards Identified</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List the top hazards (e.g. manual handling, equipment accidents, chemical exposure)..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hazardIdentification.controlMeasures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>5.3 Control Measures Implemented</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List actions to mitigate each top hazard..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* =============== 6. INCIDENT INVESTIGATIONS AND CORRECTIVE ACTIONS =============== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">6. Incident Investigations and Corrective Actions</h2>
              <FormField
                control={form.control}
                name="incidentInvestigations.totalInvestigated"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Incidents Investigated</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 5 incidents investigated"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incidentInvestigations.rootCauses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Root Causes Identified</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Inadequate Training, Equipment Failure, Human Error..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incidentInvestigations.correctiveActions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Corrective Actions Taken</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Additional Training, Machinery Upgrades, Stricter Policies..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incidentInvestigations.followUpVerification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-Up and Verification</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe how you verify corrective actions are effective..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* =============== 7. EMERGENCY PREPAREDNESS =============== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">7. Emergency Preparedness</h2>

              <h3 className="text-md font-semibold">7.1 Emergency Drills</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyPreparedness.drills.drillsConducted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drills Conducted</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyPreparedness.drills.participationRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participation Rate</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 80%"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyPreparedness.drills.evacuationSuccessRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evacuation Success Rate</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 100% within required timeframe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="emergencyPreparedness.firstAidCapabilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>7.2 First Aid and Response Capabilities</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Number of Certified First Aiders, frequency of kit inspections, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyPreparedness.emergencyResponsePlans"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>7.3 Emergency Response Plans</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summarize any updates or reviews of emergency procedures, assembly points, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* =============== 8. PPE & EQUIPMENT MANAGEMENT =============== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">8. PPE and Equipment Management</h2>
              <h3 className="text-md font-semibold">8.1 PPE Compliance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ppeAndEquipment.ppeCompliance.complianceRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compliance Rate</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 95% in high-risk areas"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ppeAndEquipment.ppeCompliance.ppeTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Types of PPE Issued</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Hard Hats, Gloves, High-Vis, Boots, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ppeAndEquipment.equipmentInspections"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>8.2 Equipment Inspections</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Outline inspection schedules and maintenance findings..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* =============== 9. EMPLOYEE HEALTH AND WELLNESS PROGRAMS =============== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">9. Employee Health and Wellness Programs</h2>
              <FormField
                control={form.control}
                name="employeeHealth.wellnessInitiatives"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>9.1 Wellness Initiatives</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detail health screenings, mental health awareness, stress mgmt..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeHealth.campaignsAndAwareness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>9.2 Campaigns and Awareness</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nutrition, exercise, ergonomics, substance abuse prevention..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* =============== 10. CHALLENGES AND AREAS FOR IMPROVEMENT =============== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">10. Challenges and Areas for Improvement</h2>
              <FormField
                control={form.control}
                name="challenges.keyChallenges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>10.1 Key Challenges</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Ensuring all employees complete required training on time..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="challenges.proposedImprovements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>10.2 Proposed Improvements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List potential strategies to address challenges..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* =============== 11. RECOMMENDATIONS =============== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">11. Recommendations</h2>
              <FormField
                control={form.control}
                name="recommendations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommendations</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add suggestions for next reporting period..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* =============== 12. SIGN-OFF =============== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">12. Sign-Off and Compliance Statement</h2>
              <FormField
                control={form.control}
                name="signOff.inspectorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name of OHS Inspector/Auditor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Auditor / Inspector Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* We won't do signature capture here, but you could add an upload or signature input if needed */}
              <FormField
                control={form.control}
                name="signOff.inspectorSignature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspector Signature (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Type or leave blank"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* =============== ADDITIONAL NOTES/APPENDICES =============== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Additional Notes / Appendices (Optional)
              </h2>
              <FormField
                control={form.control}
                name="appendices"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appendices / References</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Attach or reference any additional documents, checklists, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* =============== SUBMIT BUTTON =============== */}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Submitting..."
                : reportToEdit
                ? "Update Report"
                : "Submit Report"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
