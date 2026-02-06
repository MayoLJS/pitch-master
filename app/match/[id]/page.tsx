import { endMatch, getMatchDetails, recordGoal } from "@/app/actions/match-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, StopCircle, Trophy } from "lucide-react";
import Image from "next/image";

export default async function MatchPage({ params }: { params: { id: string } }) {
    const match = await getMatchDetails(params.id);

    if (!match) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white gap-4">
                <h1 className="text-2xl font-bold text-red-500">Match Not Found</h1>
                <p className="text-slate-400">Could not retrieve match details for ID:</p>
                <code className="bg-slate-900 p-2 rounded text-xs">{params.id}</code>
                <Button variant="outline" asChild>
                    <a href="/generator">Go Back</a>
                </Button>
            </div>
        );
    }

    const teamA = match.teams[0];
    const teamB = match.teams[1];

    return (
        <main className="flex min-h-screen flex-col items-center p-4 bg-background">
            {/* Scoreboard Header */}
            <div className="w-full max-w-4xl mt-4 mb-8">
                <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
                    {/* Team A */}
                    <div className="text-center flex-1">
                        <h2 className="text-2xl font-bold text-white mb-2">{teamA.name}</h2>
                        <div className="text-6xl font-black text-indigo-400">{teamA.score}</div>
                    </div>

                    {/* Timer / Status */}
                    <div className="text-center px-4">
                        <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse mb-2 inline-block">
                            LIVE
                        </div>
                        <div className="text-slate-500 text-xs">FRIENDLY</div>
                    </div>

                    {/* Team B */}
                    <div className="text-center flex-1">
                        <h2 className="text-2xl font-bold text-white mb-2">{teamB.name}</h2>
                        <div className="text-6xl font-black text-indigo-400">{teamB.score}</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">

                {/* Team A Controls */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-300 text-sm uppercase tracking-wider">Record {teamA.name} Goal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <form action={async () => {
                                'use server';
                                await recordGoal(match.id, teamA.id, null);
                            }}>
                                <Button variant="secondary" className="bg-indigo-900/50 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/30">
                                    + Unknown Scorer
                                </Button>
                            </form>
                            {teamA.team_members.map((member: any) => (
                                <form key={member.id} action={async () => {
                                    'use server';
                                    await recordGoal(match.id, teamA.id, member.players.id);
                                }}>
                                    <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors">
                                        {member.players.name}
                                    </Button>
                                </form>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Team B Controls */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-300 text-sm uppercase tracking-wider">Record {teamB.name} Goal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <form action={async () => {
                                'use server';
                                await recordGoal(match.id, teamB.id, null);
                            }}>
                                <Button variant="secondary" className="bg-indigo-900/50 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/30">
                                    + Unknown Scorer
                                </Button>
                            </form>
                            {teamB.team_members.map((member: any) => (
                                <form key={member.id} action={async () => {
                                    'use server';
                                    await recordGoal(match.id, teamB.id, member.players.id);
                                }}>
                                    <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors">
                                        {member.players.name}
                                    </Button>
                                </form>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>

            <div className="mt-12 w-full max-w-4xl flex justify-center">
                <form action={async () => {
                    'use server';
                    await endMatch(match.id);
                }}>
                    <Button variant="destructive" size="lg" className="w-full md:w-auto px-12">
                        <StopCircle className="w-5 h-5 mr-2" /> End Match
                    </Button>
                </form>
            </div>
        </main>
    );
}
