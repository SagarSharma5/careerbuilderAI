"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useAppState } from "@/components/providers/app-state-provider"
import type { StartFreshProfile } from "@/types"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMemo } from 'react';
import LoadingModal from '@/components/loading-modal';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  educationLevel: z.string().min(1, "Please select your education level."),
  interests: z.array(z.string()).min(1, "Select at least one interest."),
  strengths: z.string().min(10, "Describe your strengths (min 10 characters)."),
  workPreferences: z.array(z.string()).min(1, "Select at least one work preference."),
  broadField: z.string().min(1, "Please enter your target field."),
  specificRole: z.string().min(1, "Please enter your target role.")
})

type FormData = z.infer<typeof formSchema>

const educationLevels = [
  "High School",
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Vocational/Technical School",
  "Other",
]
const interestOptions = [
  "Technology",
  "Design",
  "Business",
  "Healthcare",
  "Education",
  "Arts & Culture",
  "Science",
  "Engineering",
  "Finance",
  "Marketing",
]
const workPreferenceOptions = ["Remote", "Hybrid", "On-site/Field", "Flexible Hours", "Fixed Schedule"]

interface StartFreshFormProps {
  profile: StartFreshProfile
}

// Add debounce utility function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default function StartFreshForm({ profile }: StartFreshFormProps) {
  const { updateUser } = useAppState()
  const router = useRouter()
  // Initialize currentStep from profile.lastStep if available, or skip name if already present
  const getInitialStep = (profile: StartFreshProfile) => {
    if (typeof profile.lastStep === 'number') return profile.lastStep;
    if (profile.name && profile.name.trim().length >= 2) return 1;
    return 0;
  };
  const [currentStep, setCurrentStep] = useState<number>(getInitialStep(profile));
  const { theme, resolvedTheme } = useTheme()
  const [suggestions, setSuggestions] = useState<{ fields: string[], roles: string[] }>({ fields: [], roles: [] })
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false);

  const steps = [
    { id: "name", label: "Your Name" },
    { id: "education", label: "Education Level" },
    { id: "interests", label: "Interests" },
    { id: "strengths", label: "Strengths" },
    { id: "preferences", label: "Work Preferences" },
    { id: "field", label: "Target Field" },
    { id: "role", label: "Target Role" }
  ]

  // Helper: check if a step is filled
  const isStepFilled = (idx: number, values?: Partial<FormData>) => {
    // Use values if provided, otherwise use watch()
    const get = (key: keyof FormData) => values ? values[key] : watch(key as any)
    switch (idx) {
      case 0:
        return !!(get('name') && (get('name') as string).trim().length >= 2)
      case 1:
        return !!(get('educationLevel') && (get('educationLevel') as string).trim().length > 0)
      case 2:
        return Array.isArray(get('interests')) && (get('interests') as string[]).length > 0
      case 3:
        const strengthsVal = values ? values.strengths : watch('strengths' as any)
        return typeof strengthsVal === 'string'
          ? strengthsVal.trim().length >= 10
          : Array.isArray(strengthsVal)
            ? strengthsVal.join(", ").length >= 10
            : false
      case 4:
        return Array.isArray(get('workPreferences')) && (get('workPreferences') as string[]).length > 0
      case 5:
        return !!(get('broadField') && (get('broadField') as string).trim().length > 0)
      case 6:
        return !!(get('specificRole') && (get('specificRole') as string).trim().length > 0)
      default:
        return false
    }
  }

  // Track which steps have ever been filled
  const [everFilledSteps, setEverFilledSteps] = useState([0]);
  const [completedSteps, setCompletedSteps] = useState([0]); // Always include step 0 as completed/visited

  // Restore filled/completed steps when profile changes
  useEffect(() => {
    // Use profile fields to determine which steps are filled
    const values: Partial<FormData> = {
      name: profile.name || "",
      educationLevel: profile.educationLevel || "",
      interests: profile.interests || [],
      strengths: Array.isArray(profile.strengths)
        ? profile.strengths.join(", ")
        : typeof profile.strengths === "string"
          ? profile.strengths
          : "",
      workPreferences: profile.workPreferences || [],
      broadField: profile.broadField || "",
      specificRole: profile.specificRole || "",
    }
    const filled: number[] = []
    for (let i = 0; i < steps.length; i++) {
      if (isStepFilled(i, values)) filled.push(i)
    }
    setEverFilledSteps(filled.length ? filled : [0])
    // Completed steps: all filled steps before lastStep
    const completed = filled.filter(idx => idx < (profile.lastStep ?? 0))
    setCompletedSteps(completed.length ? completed : [0])
    // Also set currentStep to lastStep if profile changed, or to step 1 if name is present
    setCurrentStep(getInitialStep(profile))
  }, [profile])

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile.name || "", // Use profile.name
      educationLevel: profile.educationLevel || "",
      interests: profile.interests || [],
      strengths: profile.strengths?.join(", ") || "",
      workPreferences: profile.workPreferences || [],
      broadField: profile.broadField || "",
      specificRole: profile.specificRole || "",
    },
    mode: "onChange", // Validate on change for better UX
  })

  // Save currentStep to profile on change
  useEffect(() => {
    if (profile.lastStep !== currentStep) {
      updateUser(profile.id, { lastStep: currentStep } as Partial<StartFreshProfile>)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  // Watch for changes to update profile in real-time (debounced or on blur might be better for performance)
  useEffect(() => {
    const subscription = watch((value) => {
      // This is a simple update on any change. For production, consider debouncing.
      updateUser(profile.id, {
        ...value,
        strengths: value.strengths
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean), // Convert string back to array
      } as Partial<StartFreshProfile>)
    })
    return () => subscription.unsubscribe()
  }, [watch, profile.id, updateUser])

  // Add debounced strengths value
  const strengthsValue = watch('strengths')
  const debouncedStrengths = useDebounce(strengthsValue, 2000) // 2 seconds delay

  // Update the useEffect to use debounced value
  useEffect(() => {
    const fetchSuggestions = async () => {
      const educationLevel = watch('educationLevel')
      const interests = watch('interests')
      const strengths = debouncedStrengths
      const workPreferences = watch('workPreferences')

      // Check if all required fields are filled
      const hasAllRequiredFields =
        educationLevel &&
        interests?.length > 0 &&
        strengths &&
        strengths.length >= 10 &&
        workPreferences?.length > 0

      if (hasAllRequiredFields) {
        setIsLoadingSuggestions(true)
        setShowSuggestions(true)

        // Add a small delay before making the API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        try {
          const response = await fetch('/api/suggestFields', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              interests,
              strengths: strengths.split(',').map(s => s.trim()).filter(Boolean),
              educationLevel,
              workPreferences
            })
          })

          if (!response.ok) {
            throw new Error('Failed to fetch suggestions')
          }

          const data = await response.json()
          setSuggestions(data)
        } catch (error) {
          console.error('Error fetching suggestions:', error)
          toast({
            title: "Error",
            description: "Failed to fetch career suggestions. Please try again.",
            variant: "destructive"
          })
        } finally {
          setIsLoadingSuggestions(false)
        }
      } else {
        setShowSuggestions(false)
      }
    }

    fetchSuggestions()
  }, [watch('interests'), debouncedStrengths, watch('educationLevel'), watch('workPreferences')])

  // Add new function to fetch role suggestions
  const fetchRoleSuggestions = async (selectedField: string) => {
    if (!selectedField) return

    setIsLoadingRoles(true)
    try {
      const response = await fetch('/api/suggestFields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests: watch('interests'),
          strengths: watch('strengths').split(',').map(s => s.trim()).filter(Boolean),
          educationLevel: watch('educationLevel'),
          workPreferences: watch('workPreferences'),
          selectedField // Add the selected field to the request
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch role suggestions')
      }

      const data = await response.json()
      setSuggestions(prev => ({ ...prev, roles: data.roles }))
    } catch (error) {
      console.error('Error fetching role suggestions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch role suggestions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingRoles(false)
    }
  }

  // Update the useEffect to handle field selection
  useEffect(() => {
    const selectedField = watch('broadField')
    if (selectedField) {
      fetchRoleSuggestions(selectedField)
    }
  }, [watch('broadField')])

  // Update the onSubmit function to handle the loading screen
  const onSubmit = async (data: FormData) => {
    try {
      setIsGeneratingRoadmap(true)
      setShowErrorModal(false);

      // Update user profile
      const updatedProfile = {
        ...data,
        hasCompletedOnboarding: true,
        strengths: data.strengths
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }
      updateUser(profile.id, updatedProfile)

      // Show loading toast
      toast({
        title: "Generating Roadmap",
        description: "Please wait while we create your personalized career roadmap...",
      })

      // Generate tasks using AI
      const response = await fetch('/api/generateTasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          educationLevel: data.educationLevel,
          interests: data.interests,
          strengths: data.strengths.split(",").map((s) => s.trim()).filter(Boolean),
          workPreferences: data.workPreferences,
          broadField: data.broadField,
          specificRole: data.specificRole
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate tasks')
      }

      const tasks = await response.json()

      // Update user with generated tasks
      updateUser(profile.id, {
        ...updatedProfile,
        roadmapItems: tasks
      })

      toast({
        title: "Roadmap Updated!",
        description: "Your personalized roadmap has been regenerated.",
      })

      // Add a 3-second delay before redirecting
      await new Promise(resolve => setTimeout(resolve, 3000))

      router.push("/roadmap-dashboard")
    } catch (error) {
      console.error('Error:', error)
      setShowErrorModal(true);
      setIsGeneratingRoadmap(false)
    }
  }

  const handleStepClick = (index: number) => {
    // Allow jumping to any step, regardless of completion
    setCurrentStep(index);
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      setCompletedSteps((steps) =>
        steps.includes(next) ? steps : [...steps, next]
      );
      return next;
    });
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Validation for Next button
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return (watch('name') && watch('name').trim().length >= 2)
      case 1:
        return (watch('educationLevel') && watch('educationLevel').trim().length > 0)
      case 2:
        return (Array.isArray(watch('interests')) && watch('interests').length > 0)
      case 3:
        return (watch('strengths') && watch('strengths').trim().length >= 10)
      case 4:
        return (Array.isArray(watch('workPreferences')) && watch('workPreferences').length > 0)
      case 5:
        return (watch('broadField') && watch('broadField').trim().length > 0)
      case 6:
        return (watch('specificRole') && watch('specificRole').trim().length > 0)
      default:
        return true
    }
  }

  // --- NEW: Helper to get filled steps from profile ---
  const getFilledStepsFromProfile = (profile: StartFreshProfile) => {
    const filled: number[] = [];
    if (profile.name && profile.name.trim().length >= 2) filled.push(0);
    if (profile.educationLevel && profile.educationLevel.trim().length > 0) filled.push(1);
    if (Array.isArray(profile.interests) && profile.interests.length > 0) filled.push(2);
    // Fix for strengths type error (handle undefined, string, array)
    const strengths = profile.strengths;
    if (
      (Array.isArray(strengths) && strengths.join(", ").length >= 10) ||
      (typeof strengths === "string" && strengths && (strengths as string).trim().length >= 10)
    ) filled.push(3);
    if (Array.isArray(profile.workPreferences) && profile.workPreferences.length > 0) filled.push(4);
    if (profile.broadField && profile.broadField.trim().length > 0) filled.push(5);
    if (profile.specificRole && profile.specificRole.trim().length > 0) filled.push(6);
    return filled;
  };

  // --- NEW: Sync completed/everFilled steps from profile on mount/profile change ---
  useEffect(() => {
    const filled = getFilledStepsFromProfile(profile);
    setCompletedSteps(filled);
    setEverFilledSteps(filled);
    // Also restore currentStep from profile.lastStep if needed, or to step 1 if name is present
    setCurrentStep(getInitialStep(profile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  // --- END NEW ---

  // Update everFilledSteps when a step is filled
  useEffect(() => {
    steps.forEach((_, idx) => {
      if (isStepFilled(idx) && !everFilledSteps.includes(idx)) {
        setEverFilledSteps((prev) => [...prev, idx]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch(), steps]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Name
        return (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Label htmlFor="name">Full Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input id="name" placeholder="Enter your name here..." {...field} />}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </motion.div>
        )
      case 1: // Education Level
        return (
          <motion.div
            key="education"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Label htmlFor="educationLevel">Highest Level of Education</Label>
            <Controller
              name="educationLevel"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="educationLevel" className={`cursor-pointer transition-all duration-200 ${theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                    ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                    : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-slate-900'
                    }`}>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent className={`${theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                    ? 'bg-slate-800 border-white/20'
                    : 'bg-purple-50 border-purple-200'
                    }`}>
                    {educationLevels.map((level) => (
                      <SelectItem
                        key={level}
                        value={level}
                        className={`cursor-pointer transition-all duration-200 ${theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                          ? 'text-white hover:bg-white/20 data-[state=checked]:bg-white/30 data-[state=checked]:text-white'
                          : 'text-slate-900 hover:bg-purple-100 data-[state=checked]:bg-purple-200 data-[state=checked]:text-slate-900'
                          }`}
                      >
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.educationLevel && <p className="text-sm text-red-500 mt-1">{errors.educationLevel.message}</p>}
          </motion.div>
        )
      case 2: // Interests
        return (
          <motion.div
            key="interests"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Label>Your Interests (select multiple)</Label>
            <Controller
              name="interests"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {interestOptions.map((interest) => (
                    <div
                      key={interest}
                      className={`flex items-center space-x-2 p-2 border rounded-md cursor-pointer transition-all duration-200 ${field.value?.includes(interest)
                        ? theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                          ? 'bg-white/30 border-white/30 text-white hover:bg-white/40'
                          : 'bg-purple-200 border-purple-300 text-slate-900 hover:bg-purple-300'
                        : theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                          ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                          : 'bg-purple-50 border-purple-200 text-slate-900 hover:bg-purple-100'
                        }`}
                      onClick={() => {
                        const newValue = field.value?.includes(interest)
                          ? field.value.filter((value) => value !== interest)
                          : [...(field.value || []), interest]
                        field.onChange(newValue)
                      }}
                    >
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={field.value?.includes(interest)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), interest])
                            : field.onChange(field.value?.filter((value) => value !== interest))
                        }}
                        className={`cursor-pointer ${theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                          ? 'border-white/30 data-[state=checked]:bg-[#5330cf] data-[state=checked]:border-[#5330cf]'
                          : 'border-purple-300 data-[state=checked]:bg-[#5330cf] data-[state=checked]:border-[#5330cf]'
                          }`}
                      />
                      <Label htmlFor={`interest-${interest}`} className="font-normal cursor-pointer">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.interests && <p className="text-sm text-red-500 mt-1">{errors.interests.message}</p>}
          </motion.div>
        )
      case 3: // Strengths
        return (
          <motion.div
            key="strengths"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Label htmlFor="strengths">What are your key strengths or skills?</Label>
            <Controller
              name="strengths"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="strengths"
                  placeholder="e.g., Problem-solving, Communication, Quick learner..."
                  {...field}
                />
              )}
            />
            {errors.strengths && <p className="text-sm text-red-500 mt-1">{errors.strengths.message}</p>}
          </motion.div>
        )
      case 4: // Work Preferences
        return (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Label>Work Preferences (select multiple)</Label>
            <Controller
              name="workPreferences"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {workPreferenceOptions.map((pref) => (
                    <div
                      key={pref}
                      className={`flex items-center space-x-2 p-2 border rounded-md cursor-pointer transition-all duration-200 ${field.value?.includes(pref)
                        ? theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                          ? 'bg-white/30 border-white/30 text-white hover:bg-white/40'
                          : 'bg-purple-200 border-purple-300 text-slate-900 hover:bg-purple-300'
                        : theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                          ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                          : 'bg-purple-50 border-purple-200 text-slate-900 hover:bg-purple-100'
                        }`}
                      onClick={() => {
                        const newValue = field.value?.includes(pref)
                          ? field.value.filter((value) => value !== pref)
                          : [...(field.value || []), pref]
                        field.onChange(newValue)
                      }}
                    >
                      <Checkbox
                        id={`pref-${pref}`}
                        checked={field.value?.includes(pref)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), pref])
                            : field.onChange(field.value?.filter((value) => value !== pref))
                        }}
                        className={`cursor-pointer ${theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                          ? 'border-white/30 data-[state=checked]:bg-[#5330cf] data-[state=checked]:border-[#5330cf]'
                          : 'border-purple-300 data-[state=checked]:bg-[#5330cf] data-[state=checked]:border-[#5330cf]'
                          }`}
                      />
                      <Label htmlFor={`pref-${pref}`} className="font-normal cursor-pointer">
                        {pref}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.workPreferences && <p className="text-sm text-red-500 mt-1">{errors.workPreferences.message}</p>}
          </motion.div>
        )
      case 5: // Target Field
        return (
          <motion.div
            key="field"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Label htmlFor="broadField">Target Field</Label>
            {showSuggestions && (
              <div className="mt-4 mb-6">
                {isLoadingSuggestions ? (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing your profile to suggest career fields...</span>
                  </div>
                ) : suggestions.fields.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">Suggested fields based on your profile:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {suggestions.fields.map((field, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setValue('broadField', field, { shouldValidate: true })}
                            className={cn(
                              "w-full h-12 text-base justify-start px-4",
                              watch('broadField') === field && "border-primary bg-primary/5",
                              theme === 'dark' ? "hover:bg-purple-900/50" : "hover:bg-blue-900/50"
                            )}
                          >
                            <span className="flex-1 text-left">{field}</span>
                            {watch('broadField') === field && (
                              <div className={cn(
                                "h-4 w-4 rounded-full",
                                theme === 'dark' ? "bg-purple-400" : "bg-blue-400"
                              )} />
                            )}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      You can also type your own career field below if none of these match your interests.
                    </p>
                  </div>
                ) : null}
              </div>
            )}
            <Controller
              name="broadField"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter your target career field"
                  className={cn(
                    "h-12 text-base",
                    errors.broadField && "border-red-500"
                  )}
                />
              )}
            />
            {errors.broadField && (
              <p className="text-sm text-red-500 mt-1">{errors.broadField.message}</p>
            )}
          </motion.div>
        )
      case 6: // Target Role
        return (
          <motion.div
            key="role"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Label htmlFor="specificRole">Target Role</Label>
            {showSuggestions && (
              <div className="mt-4 mb-6">
                {isLoadingRoles ? (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing your profile and selected field to suggest roles...</span>
                  </div>
                ) : suggestions.roles.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Suggested roles in {watch('broadField')} based on your profile:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {suggestions.roles.map((role, index) => (
                        <div key={index}>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setValue('specificRole', role, { shouldValidate: true })}
                            className={cn(
                              "w-full h-12 text-base justify-start px-4",
                              watch('specificRole') === role && "border-primary bg-primary/5",
                              theme === 'dark' ? "hover:bg-purple-900/50" : "hover:bg-blue-900/50"
                            )}
                          >
                            <span className="flex-1 text-left">{role}</span>
                            {watch('specificRole') === role && (
                              <div className={cn(
                                "h-4 w-4 rounded-full",
                                theme === 'dark' ? "bg-purple-400" : "bg-blue-400"
                              )} />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      You can also type your own role below if none of these match your interests.
                    </p>
                  </div>
                ) : null}
              </div>
            )}
            <Controller
              name="specificRole"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter your target role"
                  className={cn(
                    "h-12 text-base",
                    errors.specificRole && "border-red-500"
                  )}
                />
              )}
            />
            {errors.specificRole && (
              <p className="text-sm text-red-500 mt-1">{errors.specificRole.message}</p>
            )}
          </motion.div>
        )
    }
  }

  return (
    <>
      <LoadingModal isLoading={isGeneratingRoadmap} message="Cooking something cool..." />
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent
          className={`max-w-md w-full flex flex-col items-center justify-center border-2 shadow-2xl transition-colors duration-200
            ${resolvedTheme === 'dark' ? 'bg-[#18181b] border-[#7c3aed] text-white' : 'bg-white border-[#5330cf] text-[#5330cf]'}
          `}
        >
          <DialogTitle className="text-2xl font-bold text-center mb-2">Oops! Something crashed.</DialogTitle>
          <p className="text-base text-center mb-4">There was a problem generating your roadmap. Please try again.</p>
          <Button
            className={resolvedTheme === 'dark' ? 'bg-[#a78bfa] text-black hover:bg-[#7c3aed]' : 'bg-[#5330cf] text-white hover:bg-[#7c3aed]'}
            onClick={() => setShowErrorModal(false)}
            autoFocus
          >
            Try Again
          </Button>
        </DialogContent>
      </Dialog>
      {/* Main content fragment for mobile/desktop */}
      <>
        {/* Modern Stepper - hidden on mobile, visible on sm+ */}
        <div className="hidden sm:block w-full px-4 pt-2 pb-4">
          <div className="relative flex items-center justify-between">
            {steps.map((step, idx) => {
              // Show completed for any filled step except the current one
              const isCompleted = everFilledSteps.includes(idx) && idx !== currentStep;
              const isActive = idx === currentStep;
              const isFilled = everFilledSteps.includes(idx);
              const isDisabled = !isFilled && idx !== 0 && !isActive;
              return (
                <div key={step.id} className="flex-1 flex flex-col items-center min-w-0 relative">
                  <button
                    type="button"
                    onClick={() => handleStepClick(idx)}
                    disabled={isDisabled}
                    className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                    ${isActive ? 'bg-white border-[#5330cf] text-[#5330cf] shadow-lg' :
                        isCompleted ? 'bg-green-100 border-green-500 text-green-700' :
                          'bg-gray-100 border-gray-300 text-gray-400 opacity-60'}
                    ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    hover:scale-105 active:scale-95
                  `}
                    style={{ boxShadow: isActive ? '0 0 0 4px #ede9fe' : undefined }}
                  >
                    {isActive ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" /></svg>
                    ) : isCompleted ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className="font-bold text-lg">{idx + 1}</span>
                    )}
                  </button>
                  {/* Connector line with gap */}
                  {idx < steps.length - 1 && (
                    <div className="absolute left-1/2 top-1/2 w-full flex justify-center z-0" style={{ pointerEvents: 'none', height: 0 }}>
                      <svg width="80" height="12" viewBox="0 0 80 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="8" y1="6" x2="72" y2="6" stroke={isCompleted ? '#22c55e' : isActive ? '#a78bfa' : '#e5e7eb'} strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}
                  <div className="mt-2 flex flex-col items-center min-w-0">
                    <span className={`text-xs font-semibold tracking-wide uppercase ${isActive ? 'text-[#5330cf]' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>STEP {idx + 1}</span>
                    <span className={`text-sm font-medium ${isActive ? 'text-[#5330cf]' : isCompleted ? 'text-foreground' : 'text-gray-400'}`}>{step.label}</span>
                    <span className={`text-xs mt-0.5 ${isCompleted ? 'text-green-600' : isActive ? 'text-[#5330cf]' : 'text-gray-400'}`}>{isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-4 px-2 sm:px-4 w-full max-w-xs mx-auto sm:max-w-full sm:mx-0">
          {renderStepContent()}
        </div>
        <div className="flex flex-col gap-3 px-4 sm:flex-row sm:justify-between pt-4 w-full max-w-xs mx-auto sm:max-w-full sm:mx-0">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className={cn(
                resolvedTheme === 'dark'
                  ? 'bg-[#a78bfa] text-black hover:bg-[#c4b5fd]'
                  : 'bg-[#c4b5fd] text-[#5330cf] border border-[#a78bfa] hover:bg-[#a78bfa] hover:text-[#5330cf]',
                'font-semibold shadow-sm transition-colors duration-200'
              )}
            >
              {isSubmitting ? "Saving..." : "Complete"}
            </Button>
          ) : (
            <Button
              onClick={handleNextStep}
              disabled={!isStepValid()}
              className={cn(
                resolvedTheme === 'dark'
                  ? 'bg-[#a78bfa] text-black hover:bg-[#c4b5fd]'
                  : 'bg-[#c4b5fd] text-[#5330cf] border border-[#a78bfa] hover:bg-[#a78bfa] hover:text-[#5330cf]',
                'font-semibold shadow-sm transition-colors duration-200'
              )}
            >
              Next
            </Button>
          )}
        </div>
      </>
    </>
  )
}