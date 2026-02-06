'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/mock-api';
import { useRouter } from 'next/navigation';
import { User, UserRoleType, UserContextType } from '@/lib/types';

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        // Check session on mount
        checkSession();
    }, []);

    async function checkSession() {
        try {
            const userData = await api.auth.getCurrentUser();
            setUser(userData);

            if (userData && userData.role !== 'NONE') {
                const count = await api.notifications.getUnreadCount();
                setUnreadCount(count);
            }

            return userData;
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function login(email: string, password: string) {
        const userData = await api.auth.login(email, password);
        setUser(userData);

        const count = await api.notifications.getUnreadCount();
        setUnreadCount(count);

        return userData;
    }

    async function signup(email: string, password: string, name: string, role: UserRoleType) {
        const userData = await api.auth.signup(email, password, name, role);
        setUser(userData);

        const count = await api.notifications.getUnreadCount();
        setUnreadCount(count);

        return userData;
    }

    async function logout() {
        await api.auth.logout();
        setUser(null);
        setUnreadCount(0);
        router.push('/login');
    }

    async function updateProfile(updates: Partial<User>) {
        const updatedUser = await api.auth.updateProfile(updates);
        setUser(updatedUser);
        return updatedUser;
    }

    return (
        <UserContext.Provider value={{
            user,
            loading,
            unreadCount,
            login,
            signup,
            logout,
            updateProfile,
            refreshUser: async () => { await checkSession(); }
        }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
