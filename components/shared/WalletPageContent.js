'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AmountDisplay } from '@/components/ui/amount-display';
import { StatusBadge } from '@/components/ui/status-badge';
import { WalletBalance } from '@/components/shared/WalletBalance';
import { useWallet } from '@/lib/store/wallet-context';
import { cn } from '@/lib/utils';
import {
    Download,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    CreditCard,
    ShieldCheck,
    History,
    Zap,
    ArrowRight
} from 'lucide-react';

export default function WalletPageContent() {
    const { balance, transactions, loading, withdraw } = useWallet();
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (!withdrawAmount || isWithdrawing) return;

        // Redirect to the new withdrawal flow with amount
        const url = `   /withdraw?amount=${withdrawAmount}`;
        window.location.href = url;
    };

    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const paginatedTransactions = transactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-[#0A0A0A] pb-20 text-white">
            {/* Header */}
            <header className="mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Secured Settlement Wallet
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            Financial Center
                        </h1>
                        <p className="text-sm text-white font-bold uppercase tracking-wide">Manage your vault earnings and global settlements</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2 font-bold h-11 px-6 border-white/10 bg-black/30 hover:bg-white/10 hover:border-white/20 text-white/80">
                            <Download size={16} />
                            Export Ledger
                        </Button>
                    </div>
                </div>
            </header>

            <div className="space-y-10">
                {/* Balance Visualization */}
                <div className="bg-[#111111] border border-gray-900 rounded-sm p-1">
                    <WalletBalance balance={balance} role="freelancer" />
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Withdrawal Interface */}
                    <div className="lg:col-span-1">
                        <Card className="bg-[#111111] border-gray-900 overflow-hidden sticky top-32 rounded-sm shadow-2xl">
                            <div className="bg-emerald-600/10 border-b border-emerald-500/10 py-4 px-6">
                                <h3 className="text-emerald-500 font-black uppercase tracking-wide text-sm">Instant Withdrawal</h3>
                            </div>
                            <CardContent className="p-8 space-y-8">
                                <form onSubmit={handleWithdraw} className="space-y-8">
                                    <div>
                                        <label className="text-sm font-black text-white uppercase tracking-wide mb-4 block">
                                            Amount (USD)
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-white group-focus-within:text-emerald-500 transition-colors">$</span>
                                            <input
                                                type="number"
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full text-4xl font-bold tabular-nums bg-transparent border-b border-white/10 focus:border-emerald-500 outline-none py-4 pl-8 transition-all text-white placeholder:text-white"
                                                min="1"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="mt-4 flex items-center justify-between text-sm font-bold uppercase tracking-wide">
                                            <span className="text-white">Available Limit</span>
                                            <span className="text-emerald-400">
                                                ${balance?.available?.toLocaleString() || '0.00'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-500/5 rounded-sm p-4 border border-emerald-500/10">
                                        <div className="flex gap-4">
                                            <Zap className="w-5 h-5 text-emerald-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-black text-emerald-500 uppercase tracking-wide mb-1">Turbo Settlement</p>
                                                <p className="text-sm font-bold text-white leading-relaxed uppercase">
                                                    Withdrawals are processed instantly via private settlement rails.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-black font-black uppercase text-sm tracking-wide rounded-sm transition-all shadow-lg shadow-emerald-600/10 active:scale-[0.98]"
                                        disabled={!withdrawAmount || isWithdrawing || parseFloat(withdrawAmount) > (balance?.available || 0)}
                                    >
                                        {isWithdrawing ? 'Processing...' : 'Execute Settlement'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transaction History Ledger */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3 tracking-tight">
                                <History className="w-5 h-5 text-emerald-500" />
                                Transaction Ledger
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="w-4 h-4 text-white absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search ledger..."
                                        className="pl-10 pr-4 py-2 bg-[#111111] border border-white/5 rounded-sm text-sm font-medium outline-none focus:border-emerald-500/50 transition-all text-white w-64 placeholder:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#111111] border border-gray-900 rounded-sm overflow-hidden shadow-2xl">
                            <table className="w-full border-collapse">
                                <thead className="bg-black/20 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-sm font-black text-white/30 uppercase tracking-wide">Transaction</th>
                                        <th className="px-6 py-5 text-left text-sm font-black text-white/30 uppercase tracking-wide">Status</th>
                                        <th className="px-6 py-5 text-right text-sm font-black text-white/30 uppercase tracking-wide">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="3" className="py-20 text-center">
                                                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="py-20 text-center text-white text-sm font-black uppercase tracking-[0.3em]">
                                                No transactions found in ledger
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTransactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-11 h-11 rounded-sm flex items-center justify-center shrink-0 border transition-colors ${tx.amount < 0
                                                            ? 'bg-amber-500/5 border-amber-500/20 text-amber-500'
                                                            : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
                                                            }`}>
                                                            {tx.amount < 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-sm uppercase tracking-wide group-hover:text-emerald-400 transition-colors">{tx.description}</div>
                                                            <div className="text-sm text-white/30 font-black uppercase tracking-wide mt-1.5 flex items-center gap-2">
                                                                {new Date(tx.date).toLocaleDateString()}
                                                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                                                ID: {tx.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className={cn(
                                                        "px-2.5 py-1 text-sm font-black uppercase tracking-wide rounded-sm border",
                                                        tx.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                            tx.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                                "bg-white/5 text-white border-white/10"
                                                    )}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className={cn(
                                                        "text-lg font-bold tracking-tight",
                                                        tx.amount < 0 ? 'text-white' : 'text-emerald-500'
                                                    )}>
                                                        {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString()}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-black/10">
                                    <div className="text-sm font-black text-white uppercase tracking-wide">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="h-8 px-3 text-sm border-white/10 bg-transparent hover:bg-white/10 text-white disabled:opacity-30"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="h-8 px-3 text-sm border-white/10 bg-transparent hover:bg-white/10 text-white disabled:opacity-30"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
