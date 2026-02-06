'use client';

import { getMatchDetails, submitMatchResult } from "@/app/actions/match-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Save, Trophy } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface StatEntry {
    playerId: string;
    goals: number;
    assists: number;
}

export default function FixturePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [teamAScore, setTeamAScore] = useState(0);
    const [teamBScore, setTeamBScore] = useState(0);

    // Stats State: Map of temporary ID -> Entry
    const [teamAStats, setTeamAStats] = useState<StatEntry[]>([]);
    const [teamBStats, setTeamBStats] = useState<StatEntry[]>([]);

    useEffect(() => {
        if (!id) return;
        getMatchDetails(id).then(data => {
            setMatch(data);
            setLoading(false);
            if (data) {
                setTeamAScore(data.teams[0].score || 0);
                setTeamBScore(data.teams[1].score || 0);
            }
        });
    }, [id]);

    const addStatRow = (team: 'A' | 'B') => {
        const newEntry: StatEntry = { playerId: '', goals: 0, assists: 0 };
        if (team === 'A') setTeamAStats([...teamAStats, newEntry]);
        else setTeamBStats([...teamBStats, newEntry]);
    };

    const updateStatRow = (team: 'A' | 'B', index: number, field: keyof StatEntry, value: any) => {
        const setter = team === 'A' ? setTeamAStats : setTeamBStats;
        const current = team === 'A' ? [...teamAStats] : [...teamBStats];

        current[index] = { ...current[index], [field]: value };
        setter(current);
    };

    const removeStatRow = (team: 'A' | 'B', index: number) => {
        const setter = team === 'A' ? setTeamAStats : setTeamBStats;
        const current = team === 'A' ? [...teamAStats] : [...teamBStats];
        current.splice(index, 1);
        setter(current);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Basic validation
            const totalGoalsA = teamAStats.reduce((sum, s) => sum + (s.goals || 0), 0);
            const totalGoalsB = teamBStats.reduce((sum, s) => sum + (s.goals || 0), 0);

            // Optional: Warn if goals don't match score
            if (totalGoalsA !== teamAScore || totalGoalsB !== teamBScore) {
                if (!confirm(`Warning: Total individual goals (${totalGoalsA}-${totalGoalsB}) do not match the final score (${teamAScore}-${teamBScore}). Continue?`)) {
                    setSubmitting(false);
                    return;
                }
            }

            const payload = {
                matchId: match.id,
                teamAId: match.teams[0].id,
                teamAScore,
                teamBId: match.teams[1].id,
                teamBScore,
                stats: [...teamAStats, ...teamBStats].filter(s => s.playerId) // Filter empty rows
            };

            const res = await submitMatchResult(payload);

            if (res.success) {
                router.push('/league');
            } else {
                alert(`Error: ${res.error}`);
                setSubmitting(false);
            }
        } catch (error: any) {
            console.error(error);
            alert(`Unexpected Error: ${error.message || 'Failed to save result'}`);
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Fixture...</div>;

    if (!match) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white gap-4 bg-slate-950">
                <h1 className="text-2xl font-bold text-red-500">Fixture Not Found</h1>
                <Button variant="outline" asChild><Link href="/">Back to Dashboard</Link></Button>
            </div>
        );
    }

    const teamA = match.teams[0];
    const teamB = match.teams[1];
    const isCompleted = match.status === 'COMPLETED';

    return (
        <main className="min-h-screen bg-slate-950 p-4 md:p-8 text-white">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <Link href="/">
                        <Button variant="ghost" className="text-slate-400 hover:text-white pl-0">&larr; Dashboard</Button>
                    </Link>
                    <Badge variant={isCompleted ? "default" : "secondary"} className={isCompleted ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}>
                        {isCompleted ? "COMPLETED" : "SCHEDULED FIXTURE"}
                    </Badge>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Match Result</h1>
                    <p className="text-slate-400">Enter final score and player statistics.</p>
                </div>

                {/* Score Board */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
                            {/* Team A */}
                            <div className="flex-1 w-full text-center space-y-4">
                                <h2 className="text-2xl font-bold text-indigo-400">{teamA.name}</h2>
                                <Input
                                    type="number"
                                    min="0"
                                    value={teamAScore}
                                    onChange={(e) => setTeamAScore(parseInt(e.target.value) || 0)}
                                    className="text-center text-6xl h-32 w-full bg-slate-950 border-slate-700 focus:border-indigo-500 rounded-2xl font-mono"
                                    disabled={isCompleted}
                                />
                            </div>

                            <div className="text-slate-600 font-bold text-xl">VS</div>

                            {/* Team B */}
                            <div className="flex-1 w-full text-center space-y-4">
                                <h2 className="text-2xl font-bold text-indigo-400">{teamB.name}</h2>
                                <Input
                                    type="number"
                                    min="0"
                                    value={teamBScore}
                                    onChange={(e) => setTeamBScore(parseInt(e.target.value) || 0)}
                                    className="text-center text-6xl h-32 w-full bg-slate-950 border-slate-700 focus:border-indigo-500 rounded-2xl font-mono"
                                    disabled={isCompleted}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Entry */}
                {!isCompleted && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Team A Stats */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-300">{teamA.name} Performers</h3>
                                <Button size="sm" variant="outline" onClick={() => addStatRow('A')} className="border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-400">
                                    <Plus className="w-4 h-4 mr-2" /> Add Player Stats
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {teamAStats.map((stat, idx) => (
                                    <Card key={idx} className="bg-slate-900/50 border-slate-800">
                                        <CardContent className="p-3 flex items-center gap-3">
                                            <div className="flex-1">
                                                <Select value={stat.playerId} onValueChange={(val) => updateStatRow('A', idx, 'playerId', val)}>
                                                    <SelectTrigger className="bg-slate-950 border-slate-700">
                                                        <SelectValue placeholder="Select Player" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {teamA.team_members.map((tm: any) => (
                                                            <SelectItem key={tm.players.id} value={tm.players.id}>{tm.players.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-20">
                                                <div className="text-[10px] uppercase text-slate-500 mb-1 text-center">Goals</div>
                                                <Input
                                                    type="number" min="0"
                                                    className="bg-slate-950 border-slate-700 text-center h-9"
                                                    value={stat.goals}
                                                    onChange={(e) => updateStatRow('A', idx, 'goals', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="w-20">
                                                <div className="text-[10px] uppercase text-slate-500 mb-1 text-center">Assists</div>
                                                <Input
                                                    type="number" min="0"
                                                    className="bg-slate-950 border-slate-700 text-center h-9"
                                                    value={stat.assists}
                                                    onChange={(e) => updateStatRow('A', idx, 'assists', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <Button size="icon" variant="ghost" className="text-slate-500 hover:text-red-400 h-9 w-9 mt-4" onClick={() => removeStatRow('A', idx)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                                {teamAStats.length === 0 && <p className="text-sm text-slate-600 text-center italic py-4">No stats recorded</p>}
                            </div>
                        </div>

                        {/* Team B Stats */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-300">{teamB.name} Performers</h3>
                                <Button size="sm" variant="outline" onClick={() => addStatRow('B')} className="border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-400">
                                    <Plus className="w-4 h-4 mr-2" /> Add Player Stats
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {teamBStats.map((stat, idx) => (
                                    <Card key={idx} className="bg-slate-900/50 border-slate-800">
                                        <CardContent className="p-3 flex items-center gap-3">
                                            <div className="flex-1">
                                                <Select value={stat.playerId} onValueChange={(val) => updateStatRow('B', idx, 'playerId', val)}>
                                                    <SelectTrigger className="bg-slate-950 border-slate-700">
                                                        <SelectValue placeholder="Select Player" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {teamB.team_members.map((tm: any) => (
                                                            <SelectItem key={tm.players.id} value={tm.players.id}>{tm.players.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-20">
                                                <div className="text-[10px] uppercase text-slate-500 mb-1 text-center">Goals</div>
                                                <Input
                                                    type="number" min="0"
                                                    className="bg-slate-950 border-slate-700 text-center h-9"
                                                    value={stat.goals}
                                                    onChange={(e) => updateStatRow('B', idx, 'goals', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="w-20">
                                                <div className="text-[10px] uppercase text-slate-500 mb-1 text-center">Assists</div>
                                                <Input
                                                    type="number" min="0"
                                                    className="bg-slate-950 border-slate-700 text-center h-9"
                                                    value={stat.assists}
                                                    onChange={(e) => updateStatRow('B', idx, 'assists', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <Button size="icon" variant="ghost" className="text-slate-500 hover:text-red-400 h-9 w-9 mt-4" onClick={() => removeStatRow('B', idx)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                                {teamBStats.length === 0 && <p className="text-sm text-slate-600 text-center italic py-4">No stats recorded</p>}
                            </div>
                        </div>
                    </div>
                )}

                {!isCompleted && (
                    <div className="pt-8 border-t border-slate-800">
                        <Button
                            className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? "Saving Result & Updating League..." : "Save Final Result"}
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
