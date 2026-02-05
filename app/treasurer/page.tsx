import { getLedger, addLedgerEntry } from "@/app/actions/ledger-actions";
import { getPlayers } from "@/app/actions/player-actions";
import LedgerTable from "@/components/ledger-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function TreasurerPage() {
    const ledger = await getLedger();
    const players = await getPlayers();

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-12 bg-background">
            <div className="z-10 max-w-4xl w-full text-sm">
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 pl-0 text-slate-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Treasurer</h1>
                <p className="text-slate-400 mb-8">Track payments and debts.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Transaction Form */}
                    <div className="lg:col-span-1">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">New Charge</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form action={addLedgerEntry} className="space-y-4">
                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-slate-400">Player</label>
                                        <select name="playerId" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white">
                                            {players.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-slate-400">Amount (£)</label>
                                        <input name="amount" type="number" step="0.50" defaultValue="5.00" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-slate-400">Notes</label>
                                        <input name="notes" placeholder="e.g. Match 12/10" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                                    </div>
                                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                        <PlusCircle className="w-4 h-4 mr-2" /> Add Charge
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Ledger Table */}
                    <div className="lg:col-span-2">
                        <LedgerTable entries={ledger} />
                    </div>
                </div>
            </div>
        </main>
    );
}
