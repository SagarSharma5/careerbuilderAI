"use client"

import { useEffect, useCallback } from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppState } from "@/components/providers/app-state-provider"
import type { ResumeProfile } from "@/types"
import { useRouter } from "next/navigation"
import { UploadCloud, FileText, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"
import LoadingModal from '@/components/loading-modal';

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] // .docx only

const formSchema = z.object({
  resumeFile: z
    .custom<FileList>((val) => val instanceof FileList && val.length > 0, "Resume file is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine((files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type), "Only .docx files are accepted."),
  name: z.string().min(2, "Name must be at least 2 characters."),
})

type FormData = z.infer<typeof formSchema>

interface ResumeUploadFormProps {
  profile: ResumeProfile
}

export default function ResumeUploadForm({ profile }: ResumeUploadFormProps) {
  const { updateUser } = useAppState()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileName, setFileName] = useState<string | null>(profile.resumeFileName || null)
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile.name || "",
    },
  })

  const resumeFile = watch("resumeFile")
  const name = watch("name")

  // Real-time name update
  useEffect(() => {
    if (name && name.length >= 2 && profile.name !== name) {
      updateUser(profile.id, { name })
    }
    // Only update if name is valid and different
  }, [name, profile.id, profile.name, updateUser])

  useEffect(() => {
    if (resumeFile && resumeFile.length > 0) {
      setFileName(resumeFile[0].name)
    }
  }, [resumeFile])

  const onSubmit = async (data: FormData) => {
    setIsProcessing(true)
    try {
      const file = data.resumeFile[0]
      const formData = new FormData()
      formData.append("resume", file)
      // Call the real API
      const res = await axios.post("/api/resume-analysis", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      const analysis = res.data
      updateUser(profile.id, {
        name: data.name,
        resumeFileName: file.name,
        analysis,
        hasCompletedOnboarding: true,
        resumeText: "uploaded",
        type: "resume", // Set user type to 'resume'
      })
      // Persist to sessionStorage for reloads
      window.sessionStorage.setItem(
        'resumeUser',
        JSON.stringify({
          ...profile,
          name: data.name,
          resumeFileName: file.name,
          analysis,
          hasCompletedOnboarding: true,
          resumeText: "uploaded",
        })
      )
      toast({
        title: "Resume Processed!",
        description: "Your resume has been uploaded and analyzed.",
      })
      router.push("/resume-dashboard")
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || err.message || "Failed to analyze resume.",
        variant: "destructive"
      })
      setErrorMessage(err?.response?.data?.error || err.message || "Failed to analyze resume.");
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <LoadingModal isLoading={isProcessing} message="Analyzing your resume..." />
      <LoadingModal isLoading={showErrorModal} message={errorMessage || "An error occurred. Please try again."} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
        <div>
          <Label htmlFor="name">Your Name</Label>
          <Input id="name" type="text" placeholder="Enter your name" {...register("name")} className="mt-1" />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="resumeFile">Upload Resume (.docx, max 5MB)</Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {fileName ? (
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
              ) : (
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="resumeFile"
                  className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                >
                  <span>{fileName ? `Selected: ${fileName}` : "Upload a file"}</span>
                  <input
                    id="resumeFile"
                    type="file"
                    className="sr-only"
                    {...register("resumeFile")}
                    accept=".docx"
                  />
                </label>
                {!fileName && <p className="pl-1">or drag and drop</p>}
              </div>
              {!fileName && <p className="text-xs text-gray-500">DOCX up to 5MB</p>}
              {fileName && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setValue("resumeFile", new DataTransfer().files)
                    setFileName(null)
                  }}
                >
                  Change file
                </Button>
              )}
            </div>
          </div>
          {errors.resumeFile && <p className="text-sm text-red-500 mt-1">{errors.resumeFile.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Upload and Analyze Resume"
          )}
        </Button>
      </form>
    </>
  )
}
