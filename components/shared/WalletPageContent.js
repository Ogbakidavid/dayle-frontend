'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AmountDisplay } from '@/components/ui/amount-display';
import { StatusBadge } from '@/components/ui/status-badge';
import { WalletBalance } from '@/components/shared/WalletBalance';
import { useWallet } from '@/lib/store/wallet-context';
import {
    Download,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    CreditCard,
    ShieldCheck,
    History
} from 'lucide-react';

export default function WalletPageContent() {
    const { balance, transactions, loading, withdraw } = useWallet();
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (!withdrawAmount || isWithdrawing) return;
        setIsWithdrawing(true);
        try {
            await withdraw(parseFloat(withdrawAmount));
            setWithdrawAmount('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsWithdrawing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="container-custom py-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Secured Settlement Wallet
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Financial Center
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="gap-2 font-bold h-11 px-6">
                                <Download size={16} />
                                Export Ledger
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-10 space-y-10">
                {/* Balance Visualization */}
                <WalletBalance balance={balance} role="freelancer" />

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Withdrawal Interface */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-lg border-slate-200 overflow-hidden sticky top-32">
                            <div className="bg-slate-900 py-4 px-6">
                                <h3 className="text-white font-bold uppercase tracking-wider text-xs">Painless Withdrawal</h3>
                            </div>
                            <CardContent className="p-6">
                                <form onSubmit={handleWithdraw} className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                            Amount (USD)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full text-2xl font-black tabular-nums border-b-2 border-slate-100 focus:border-blue-600 outline-none py-3 transition-colors"
                                                min="1"
                                                step="0.01"
                                            />
                                            <span className="absolute left-0 top-3- text-2xl font-black text-slate-300">$</span>
                                        </div>
                                        <div className="mt-2 text-[10px] text-slate-400 font-medium">
                                            Available: <AmountDisplay amount={balance?.available || 0} size="small" className="text-slate-500 scale-75 origin-left" />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                        <div className="flex gap-3">
                                            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Guaranteed Safety</p>
                                                <p className="text-[10px] font-medium text-blue-700/80 leading-relaxed uppercase">
                                                    Withdrawals are processed instantly via our institutional-grade settlement rails.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-[0.2em] rounded-xl"
                                        disabled={!withdrawAmount || isWithdrawing || parseFloat(withdrawAmount) > (balance?.available || 0)}
                                        isLoading={isWithdrawing}
                                    >
                                        Execute Withdrawal
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transaction History Ledger */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                                <History className="w-5 h-5 text-slate-400" />
                                Transaction Ledger
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search ledger..."
                                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="3" className="py-20 text-center">
                                                <div className="spinner w-8 h-8 mx-auto" />
                                            </td>
                                        </tr>
                                    ) : transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                No transactions found in ledger
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'withdraw' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                                                            }`}>
                                                            {tx.type === 'withdraw' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-sm uppercase">{tx.description}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">
                                                                {new Date(tx.date).toLocaleDateString()} • {tx.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <StatusBadge status={tx.status} />
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <AmountDisplay
                                                        amount={tx.amount}
                                                        size="small"
                                                        className={tx.type === 'withdraw' ? 'text-slate-900' : 'text-green-600'}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
