
import { Shield, CheckCircle2, CreditCard, Lock, Bell } from 'lucide-react';

export const mockNotifications = {
    client: [
        { id: 1, type: 'kyc', title: 'Identity Verification Required', message: 'Complete your KYC verification to unlock full platform access and vault creation', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: false, action: '/onboarding/kyc?role=client' },
        { id: 2, type: 'milestone', title: 'Milestone Completed', message: 'Freelancer completed milestone "Phase 1 Development" - ready for review', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: false },
        { id: 3, type: 'payment', title: 'Payment Processed', message: '$2,500 has been transferred to escrow for "API Integration"', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), read: true },
        { id: 4, type: 'security', title: 'New Login Detected', message: 'Login from Chrome on MacBook Pro in New York, US', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true },
        { id: 5, type: 'milestone', title: 'Milestone Approved', message: 'You approved milestone "Database Setup" - $1,200 released to freelancer', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), read: true },
    ],
    freelancer: [
        { id: 1, type: 'kyc', title: 'Identity Verification Required', message: 'Complete your KYC verification to unlock full platform access and payments', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: false, action: '/onboarding/kyc?role=freelancer' },
        { id: 2, type: 'milestone', title: 'Milestone Approved', message: 'Client approved milestone "Phase 1 Development" - $2,500 released to escrow', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: false },
        { id: 3, type: 'payment', title: 'Payment Received', message: '$2,500 has been settled in your account', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), read: true },
        { id: 4, type: 'security', title: 'New Login Detected', message: 'Login from Chrome on MacBook Pro in New York, US', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true },
        { id: 5, type: 'milestone', title: 'Milestone Submitted', message: 'Your submission for "API Integration" is under review', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), read: true },
    ]
};
