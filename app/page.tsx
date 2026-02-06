import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Plus, Users, Trophy, Wallet, Bot } from "lucide-react";
import Link from "next/link";

import { getDashboardStats, getScheduledFixtures } from "@/app/actions/dashboard-actions";
import { Badge } from "@/components/ui/badge";

export default async function Home() {
    const stats = await getDashboardStats();
    const fixtures = await getScheduledFixtures();

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-background">
            {/* Header */}
            <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex mb-8">
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-mono text-muted-foreground">PRE-ALPHA BUILD</p>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
                        PITCH MASTER
                    </h1>
                    <p className="text-muted-foreground">
                        The ultimate companion for competitive 5-aside football.
                    </p>
                </div>
                <div className="mt-4 lg:mt-0 flex gap-4">
                    <Link href="/league">
                        <Button variant="outline" className="gap-2">
                            <Trophy className="h-4 w-4 text-amber-500" /> League
                        </Button>
                    </Link>
                    <Link href="/media">
                        <Button variant="outline" className="gap-2">
                            <Bot className="h-4 w-4" /> Media Center
                        </Button>
                    </Link>
                    <Link href="/generator">
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
                            <Plus className="h-4 w-4" /> New Session
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">

                {/* Next Match Card / Fixtures List */}
                <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                            <span>Upcoming Fixtures</span>
                            <Badge variant="outline" className="text-slate-400 border-slate-600">
                                {fixtures.length} Pending
                            </Badge>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Select a fixture to enter results.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fixtures.length === 0 ? (
                            <div className="text-center py-6 text-slate-500 bg-slate-950/30 rounded-lg border border-slate-800/50">
                                <p>No scheduled fixtures.</p>
                                <p className="text-xs mt-1">Generate teams to create one.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {fixtures.map((fixture: any) => (
                                    <Link key={fixture.id} href={`/match/${fixture.id}`}>
                                        <div className="flex items-center justify-between p-4 bg-slate-950/50 hover:bg-slate-950 hover:border-indigo-500/50 transition-all rounded-lg border border-slate-800 group cursor-pointer">
                                            <div className="text-center w-1/3">
                                                <div className="font-bold text-white text-sm md:text-base">{fixture.teams[0]?.name || 'Team A'}</div>
                                            </div>
                                            <div className="text-center w-1/3 flex flex-col items-center">
                                                <div className="text-xs font-bold text-slate-500 mb-1">{fixture.type}</div>
                                                <div className="bg-slate-800 text-slate-300 px-3 py-1 rounded text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    ENTER RESULT
                                                </div>
                                            </div>
                                            <div className="text-center w-1/3">
                                                <div className="font-bold text-white text-sm md:text-base">{fixture.teams[1]?.name || 'Team B'}</div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats / Actions */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-4 w-4 text-sky-400" /> Players
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white mb-2">{stats.playerCount}</div>
                            <p className="text-xs text-slate-400 mb-4">Active Squad Members</p>
                            <Link href="/players" className="w-full">
                                <Button size="sm" variant="outline" className="w-full">Manage Squad</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-emerald-400" /> Treasurer
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-400 mb-2">£{stats.totalFunds.toFixed(2)}</div>
                            <p className="text-xs text-slate-400 mb-4">Total Collected</p>
                            <Link href="/treasurer" className="w-full">
                                <Button size="sm" variant="outline" className="w-full">View Ledger</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </main>
    );
}
