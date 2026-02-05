import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Plus, Users, Trophy, Wallet, Bot } from "lucide-react";
import Link from "next/link";

export default function Home() {
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

                {/* Next Match Card */}
                <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                            <span>Next Match</span>
                            <span className="text-sm font-normal px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                                Confirmed
                            </span>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Thursday 8:00 PM • Wembley Powerleague
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">Team A</div>
                                <div className="text-xs text-slate-500">AVG RATING 7.8</div>
                            </div>
                            <div className="text-3xl font-mono text-slate-600 font-bold">VS</div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">Team B</div>
                                <div className="text-xs text-slate-500">AVG RATING 7.6</div>
                            </div>
                        </div>
                        <Button className="w-full text-slate-200" variant="secondary">
                            View Lineups
                        </Button>
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
                            <div className="text-3xl font-bold text-white mb-2">24</div>
                            <p className="text-xs text-slate-400 mb-4">4 Active • 2 Injured</p>
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
                            <div className="text-3xl font-bold text-emerald-400 mb-2">£120.00</div>
                            <p className="text-xs text-slate-400 mb-4">Collected this week</p>
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
