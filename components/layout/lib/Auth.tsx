'use client'

import dayjs from 'dayjs'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import jutge from '@/lib/jutge'
import type { CredentialsIn, Download, Profile } from '@/lib/jutge_api_client'
import { sleep } from 'radash'

export interface AuthProviderProps {
    user: Profile | null
    avatar: Download | null
    login(credentials: CredentialsIn): Promise<boolean>
    logout(): Promise<void>
}

const AuthContext = createContext<AuthProviderProps>({
    user: null,
    avatar: null,
    login: async (): Promise<boolean> => {
        await sleep(0) // to make it async
        return false
    },
    logout: async () => {},
})

export default function AuthProvider({ children }: { children: ReactNode }) {
    //

    const [user, setUser] = useState<Profile | null>(null)
    const [avatar, setAvatar] = useState<Download | null>(null)

    async function checkLogin() {
        try {
            const token = localStorage.getItem('token')
            const expiration = localStorage.getItem('expiration')
            if (!token || !expiration) return false

            const now = dayjs()
            const expiration_date = dayjs(expiration)
            if (now.isAfter(expiration_date)) return false

            jutge.meta = { token }
            const profile = await jutge.student.profile.get()
            if (!profile.instructor) return false
            setUser(profile)
            try {
                const avatar = await jutge.student.profile.getAvatar()
                setAvatar(avatar)
            } catch (error) {
                // ignore
            }
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    useEffect(() => {
        checkLogin()
    }, [])

    async function login(credentialsIn: CredentialsIn) {
        try {
            const credentialsOut = await jutge.login(credentialsIn)
            if (!jutge.meta || !jutge.meta.token) return false
            const profile = await jutge.student.profile.get()
            if (!profile.instructor) return false
            setUser(profile)
            try {
                const avatar = await jutge.student.profile.getAvatar()
                setAvatar(avatar)
            } catch (error) {
                // ignore
            }
            localStorage.setItem('token', credentialsOut.token)
            localStorage.setItem('expiration', credentialsOut.expiration.toString())
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    async function logout() {
        try {
            localStorage.removeItem('token')
            localStorage.removeItem('expiration')
            setUser(null)
            setAvatar(null)
            await jutge.logout()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, avatar, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}
