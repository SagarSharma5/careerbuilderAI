import type { AppState, UserProfile } from "@/types"

export function getInitialAppState(): AppState {
    return { users: {}, currentUser: undefined }
}

export function addUserProfile(profile: UserProfile): AppState {
    const currentState = getInitialAppState()
    const newState: AppState = {
        ...currentState,
        users: {
            ...currentState.users,
            [profile.id]: profile,
        },
        currentUser: profile.id, // Optionally set new user as current
    }
    return newState
}

export function updateUserProfile(profileId: string, updates: Partial<UserProfile>): AppState {
    const currentState = getInitialAppState()
    if (currentState.users[profileId]) {
        const newState: AppState = {
            ...currentState,
            users: {
                ...currentState.users,
                [profileId]: { ...currentState.users[profileId], ...updates } as UserProfile,
            },
        }
        return newState
    }
    return currentState
}

export function getCurrentUser(state: AppState): UserProfile | undefined {
    if (state.currentUser && state.users[state.currentUser]) {
        return state.users[state.currentUser]
    }
    // If no current user or current user ID is invalid,
    // try to return the first user if available
    const userIds = Object.keys(state.users)
    if (userIds.length > 0) {
        return state.users[userIds[0]]
    }
    return undefined
}

export function setCurrentUser(userId: string): AppState {
    const currentState = getInitialAppState()
    if (currentState.users[userId]) {
        const newState: AppState = {
            ...currentState,
            currentUser: userId,
        }
        return newState
    }
    return currentState
}
