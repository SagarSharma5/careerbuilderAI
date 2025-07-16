"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import { type UserProfile, RoadmapItem } from "@/types"

type AppStateContextType = {
    currentUser: UserProfile | null
    setCurrentUser: (user: UserProfile | null) => void
    users: Record<string, UserProfile>
    addUser: (user: UserProfile) => void
    updateUser: (userId: string, updates: Partial<UserProfile>) => void
    roadmapTasks: RoadmapItem[]
    setRoadmapTasks: (tasks: RoadmapItem[]) => void
    isRestoringSession: boolean
    userProfile: UserProfile | null // NEW: always reflects current user
    setCurrentUserById: (userId: string) => void // Add this line
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

export const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
    const [isClient, setIsClient] = useState(false)
    const [isRestoringSession, setIsRestoringSession] = useState(true)
    const [users, setUsers] = useState<Record<string, UserProfile>>({})
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
    const [roadmapTasks, setRoadmapTasks] = useState<RoadmapItem[]>([])
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

    // Restore from sessionStorage on mount
    useEffect(() => {
        setIsClient(true)
        const savedUsers = sessionStorage.getItem('users')
        const savedCurrentUser = sessionStorage.getItem('currentUser')
        if (savedUsers) setUsers(JSON.parse(savedUsers))
        if (savedCurrentUser) setCurrentUser(JSON.parse(savedCurrentUser))
        // Keep userProfile in sync with currentUser
        if (savedCurrentUser) setUserProfile(JSON.parse(savedCurrentUser))
        setIsRestoringSession(false)
    }, [])

    // Sync to sessionStorage on change
    useEffect(() => {
        if (isClient) {
            if (Object.keys(users).length === 0) {
                sessionStorage.removeItem('users')
            } else {
                sessionStorage.setItem('users', JSON.stringify(users))
            }
            if (currentUser) {
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser))
                setUserProfile(currentUser) // keep userProfile in sync
            } else {
                sessionStorage.removeItem('currentUser')
                setUserProfile(null)
            }
        }
    }, [users, currentUser, isClient])

    // Listen for custom logout event to clear all state and sessionStorage
    useEffect(() => {
        const handleLogout = () => {
            setUsers({})
            setCurrentUser(null)
            sessionStorage.clear()
        }
        window.addEventListener('logout', handleLogout)
        return () => window.removeEventListener('logout', handleLogout)
    }, [])

    const addUser = (user: UserProfile) => {
        setUsers(prev => {
            const newUsers = { ...prev, [user.id]: user }
            if (isClient) sessionStorage.setItem('users', JSON.stringify(newUsers))
            return newUsers
        })
        setCurrentUser(user)
        setUserProfile(user)
        if (isClient) sessionStorage.setItem('currentUser', JSON.stringify(user))
    }

    const updateUser = (userId: string, updates: Partial<UserProfile>) => {
        setUsers(prev => {
            if (!prev[userId]) return prev
            const updatedUser = { ...prev[userId], ...updates } as UserProfile
            const newUsers = { ...prev, [userId]: updatedUser }
            if (isClient) sessionStorage.setItem('users', JSON.stringify(newUsers))
            // If updating the current user, also update currentUser in sessionStorage
            if (currentUser?.id === userId && isClient) {
                sessionStorage.setItem('currentUser', JSON.stringify(updatedUser))
            }
            return newUsers
        })
        if (currentUser?.id === userId) {
            setCurrentUser(prev => {
                if (!prev) return null
                const updated = { ...prev, ...updates } as UserProfile
                setUserProfile(updated)
                return updated
            })
        }
    }

    // Add a function to switch profiles
    const setCurrentUserById = (userId: string) => {
        const user = users[userId]
        if (user) {
            setCurrentUser(user)
            setUserProfile(user)
            if (isClient) sessionStorage.setItem('currentUser', JSON.stringify(user))
        }
    }

    return (
        <AppStateContext.Provider
            value={{
                currentUser,
                setCurrentUser,
                users,
                addUser,
                updateUser,
                setCurrentUserById, // Expose the new function
                roadmapTasks,
                setRoadmapTasks,
                isRestoringSession,
                userProfile, // NEW
            }}
        >
            {children}
        </AppStateContext.Provider>
    )
}

export const useAppState = () => {
    const context = useContext(AppStateContext)
    if (context === undefined) {
        throw new Error("useAppState must be used within an AppStateProvider")
    }
    return context
}
