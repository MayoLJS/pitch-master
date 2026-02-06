'use client';

import { getMatchDetails, submitMatchResult } from "@/app/actions/match-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, Calendar, Users, Save } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function MatchPage({ params }: { params: { id: string } }) {
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [teamAScore, setTeamAScore] = useState(0);
    const [teamBScore, setTeamBScore] = useState(0);
    const [scorers, setScorers] = useState<{ [key: string]: number }>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getMatchDetails(params.id).then(data => {
            setMatch(data);
            setLoading(false);
        });
    }, [params.id]);

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Fixture...</div>;

    if (!match) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white gap-4 bg-slate-950">
                <h1 className="text-2xl font-bold text-red-500">Match Not Found</h1>
                <p className="text-slate-400">Could not retrieve match details for ID:</p>
                <code className="bg-slate-900 p-2 rounded text-xs">{params.id}</code>
                <Button variant="outline" asChild>
                    <Link href="/">Back to Dashboard</Link>
                </Button>
            </div>
        );
    }

    const teamA = match.teams[0];
    const teamB = match.teams[1];

    const handleGoalChange = (playerId: string, delta: number) => {
        setScorers(prev => ({
            ...prev,
            [playerId]: Math.max(0, (prev[playerId] || 0) + delta)
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await submitMatchResult(match.id, teamA.id, teamAScore, teamB.id, teamBScore, scorers);
            // Redirect happens in action
        } catch (error) {
            console.error(error);
            alert("Failed to save result");
            setSubmitting(false);
        }
    };

    const isScheduled = match.status === 'SCHEDULED';

    return (
        <main className="min-h-screen bg-slate-950 p-4 md:p-8 text-white">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <Link href="/">
                        <Button variant="ghost" className="text-slate-400 hover:text-white pl-0">&larr; Dashboard</Button>
                    </Link>
                    <Badge variant={isScheduled ? "secondary" : "default"} className={isScheduled ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"}>
                        {isScheduled ? "SCHEDULED FIXTURE" : "COMPLETED MATCH"}
                    </Badge>
                </div>

                {isScheduled ? (
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold">Log Match Result</h1>
                        <p className="text-slate-400">Enter the final score and stats for this fixture.</p>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <h1 className="text-4xl font-bold mb-4">{teamA.score} - {teamB.score}</h1>
                        <p className="text-slate-500">This match has been completed.</p>
                        <Button variant="outline" asChild className="mt-4">
                            <Link href="/">Back</Link>
                        </Button>
                    </div>
                )}

                {/* Score Entry */}
                {isScheduled && (
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="text-center flex-1">
                                    <h2 className="text-2xl font-bold mb-4">{teamA.name}</h2>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={teamAScore}
                                        onChange={(e) => setTeamAScore(parseInt(e.target.value) || 0)}
                                        className="text-center text-5xl h-24 w-full bg-slate-950 border-slate-700 focus:border-indigo-500 rounded-xl"
                                    />
                                </div>
                                <div className="text-2xl font-bold text-slate-600">VS</div>
                                <div className="text-center flex-1">
                                    <h2 className="text-2xl font-bold mb-4">{teamB.name}</h2>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={teamBScore}
                                        onChange={(e) => setTeamBScore(parseInt(e.target.value) || 0)}
                                        className="text-center text-5xl h-24 w-full bg-slate-950 border-slate-700 focus:border-indigo-500 rounded-xl"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Scorer Entry */}
                {isScheduled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Team A Players */}
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">{teamA.name} Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {teamA.team_members.map((tm: any) => (
                                    <div key={tm.player_id} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800/50">
                                        <span className="font-medium text-slate-300">{tm.players.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500 uppercase">Goals</span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-8 w-8 rounded-full border-slate-700 hover:bg-slate-800"
                                                    onClick={() => handleGoalChange(tm.player_id, -1)}
                                                >
                                                    -
                                                </Button>
                                                <span className="w-6 text-center font-bold text-indigo-400">{scorers[tm.player_id] || 0}</span>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-8 w-8 rounded-full border-slate-700 hover:bg-slate-800"
                                                    onClick={() => handleGoalChange(tm.player_id, 1)}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Team B Players */}
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">{teamB.name} Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {teamB.team_members.map((tm: any) => (
                                    <div key={tm.player_id} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800/50">
                                        <span className="font-medium text-slate-300">{tm.players.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500 uppercase">Goals</span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-8 w-8 rounded-full border-slate-700 hover:bg-slate-800"
                                                    onClick={() => handleGoalChange(tm.player_id, -1)}
                                                >
                                                    -
                                                </Button>
                                                <span className="w-6 text-center font-bold text-indigo-400">{scorers[tm.player_id] || 0}</span>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-8 w-8 rounded-full border-slate-700 hover:bg-slate-800"
                                                    onClick={() => handleGoalChange(tm.player_id, 1)}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {isScheduled && (
                    <Button
                        size="lg"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-lg"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? "Saving..." : "Confim Result"}
                    </Button>
                )}
            </div>
        </main>
    );
}
