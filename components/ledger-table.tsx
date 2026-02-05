'use client'

import { LedgerEntry, togglePaymentStatus } from "@/app/actions/ledger-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Banknote, CreditCard } from "lucide-react";

export default function LedgerTable({ entries }: { entries: LedgerEntry[] }) {

    // Calculate Stats
    const totalCollected = entries
        .filter(e => e.status === 'PAID')
        .reduce((sum, e) => sum + Number(e.amount), 0);

    const pendingAmount = entries
        .filter(e => e.status !== 'PAID')
        .reduce((sum, e) => sum + Number(e.amount), 0);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-emerald-950/20 border-emerald-900/50">
                    <CardContent className="p-6">
                        <div className="text-xs text-emerald-400 uppercase font-bold tracking-wider mb-1">Total Collected</div>
                        <div className="text-3xl font-black text-emerald-400">£{totalCollected.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-red-950/20 border-red-900/50">
                    <CardContent className="p-6">
                        <div className="text-xs text-red-400 uppercase font-bold tracking-wider mb-1">Outstanding</div>
                        <div className="text-3xl font-black text-red-400">£{pendingAmount.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {entries.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">No records found.</div>
                        ) : (
                            entries.map(entry => (
                                <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/50 hover:border-slate-700 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${entry.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {entry.status === 'PAID' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-200">{entry.players?.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">
                                                {new Date(entry.created_at).toLocaleDateString()} • {entry.notes || 'Pitch Fees'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-mono text-white font-bold">£{entry.amount}</div>
                                            <div className="text-[10px] text-slate-500 flex justify-end items-center gap-1">
                                                {entry.payment_method === 'CASH' ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                                                {entry.payment_method}
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-slate-400 hover:text-white"
                                            onClick={async () => {
                                                await togglePaymentStatus(entry.id, entry.status);
                                            }}
                                        >
                                            {entry.status === 'PAID' ? 'Mark Unpaid' : 'Mark Paid'}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
