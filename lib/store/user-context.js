'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api, UserRole } from '@/lib/mock-api';
import { useRouter } from 'next/navigation';

const UserContext = createContext({});

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check session on mount
        checkSession();
    }, []);

    async function checkSession() {
        try {
            const userData = await api.auth.getCurrentUser();
            setUser(userData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        const userData = await api.auth.login(email, password);
        setUser(userData);
        return userData;
    }

    async function signup(email, password) {
        const userData = await api.auth.signup(email, password);
        setUser(userData);
        return userData;
    }

    async function logout() {
        await api.auth.logout();
        setUser(null);
        router.push('/login');
    }

    return (
        <UserContext.Provider value={{ user, loading, login, logout, refreshUser: checkSession }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
