"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";

interface JobSuggestion {
    job_title: string;
    location: string;
    min_salary: number;
    max_salary: number;
    avg_salary: number;
    currency: string;
    company_name?: string;
    [key: string]: any;
}

export function JobSuggestions({ jobTitle, location, countryCode, renderCards, onJobsFetched, cachedJobs }: {
    jobTitle: string;
    location?: string;
    countryCode?: string;
    renderCards?: (jobs: JobSuggestion[]) => React.ReactNode;
    onJobsFetched?: (jobs: JobSuggestion[]) => void;
    cachedJobs?: JobSuggestion[] | null;
}) {
    const [jobs, setJobs] = useState<JobSuggestion[] | null>(cachedJobs ?? null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { resolvedTheme } = useTheme();
    const isLight = resolvedTheme === "light";

    useEffect(() => {
        if (!jobTitle) return;
        // If cachedJobs provided, use it and skip fetch
        if (cachedJobs && cachedJobs.length > 0) {
            setJobs(cachedJobs);
            return;
        }
        setLoading(true);
        setError(null);
        fetch("/api/job-suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobTitle, location, countryCode }),
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to fetch jobs");
                const data = await res.json();
                setJobs(data.data || []);
                if (onJobsFetched) onJobsFetched(data.data || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [jobTitle, location, countryCode, cachedJobs, onJobsFetched]);

    if (!jobTitle) return null;
    if (loading) return <div className="text-center py-4">Loading jobs...</div>;
    if (error) return <div className="text-center text-red-500 py-4">{error}</div>;
    if (!jobs || jobs.length === 0) return <div className="text-center py-4">No jobs found.</div>;

    if (renderCards) {
        return <>{renderCards(jobs)}</>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 h-full w-full">
            {jobs.map((job, idx) => (
                <Card key={idx} className={`h-full flex flex-col bg-gradient-to-br ${isLight ? 'from-primary-100/80 to-accent-100/80 border border-primary-200' : 'from-primary-800/80 to-accent-800/80 border border-primary-700'} shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer group`}>
                    <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
                        <div className={`text-center text-lg font-semibold transition-colors ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{job.job_title}</div>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">{job.company_name}</div>
                        <div className="mt-1 text-xs text-gray-700 dark:text-gray-200">Location: <span className="font-medium">{job.location}</span></div>
                        <div className="mt-1 text-xs text-gray-700 dark:text-gray-200">Salary: <span className="font-medium">{job.min_salary} - {job.max_salary} {job.currency}</span></div>
                        <div className="mt-1 text-xs text-gray-700 dark:text-gray-200">Average: <span className="font-medium">{job.avg_salary} {job.currency}</span></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
