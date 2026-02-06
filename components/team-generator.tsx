'use client'

import { Player } from "@/app/actions/player-actions";
import { generateTeamsAction } from "@/app/actions/team-actions";
import { startMatch } from "@/app/actions/match-actions";
import { Team } from "@/lib/algorithms/team-balancer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"; // unused but kept if needed
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TeamGenerator({ allPlayers }: { allPlayers: Player[] }) {
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
    const [numTeams, setNumTeams] = useState(2);
    const [generatedTeams, setGeneratedTeams] = useState<Team[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [matchType, setMatchType] = useState<'FRIENDLY' | 'LEAGUE'>('FRIENDLY');
    const [teamSize, setTeamSize] = useState(5);
    const router = useRouter();

    const togglePlayer = (id: string) => {
        const newSet = new Set(selectedPlayerIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedPlayerIds(newSet);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        const selectedPlayers = allPlayers.filter(p => selectedPlayerIds.has(p.id));

        // Calculate numTeams based on target size
        // If we have 13 players and size 5 -> 13/5 = 2.6 -> 3 teams.
        // User said: "if extra, add to one of the teams". 
        // This usually implies maximizing full teams or just splitting?
        // Let's use standard rounding behavior but ensure at least 2 teams.
        const calculatedNumTeams = Math.max(2, Math.round(selectedPlayers.length / teamSize));

        const teams = await generateTeamsAction(selectedPlayers, calculatedNumTeams);
        setGeneratedTeams(teams);
        setIsGenerating(false);
    };

    const selectAll = () => {
        if (selectedPlayerIds.size === allPlayers.length) {
            setSelectedPlayerIds(new Set());
        } else {
            setSelectedPlayerIds(new Set(allPlayers.map(p => p.id)));
        }
    };

    return (
        <div className="space-y-8">
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-col gap-4">
                    <div className="flex flex-row items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-400" />
                            Select Players ({selectedPlayerIds.size})
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={selectAll}>
                                {selectedPlayerIds.size === allPlayers.length ? "Deselect All" : "Select All"}
                            </Button>
                        </div>
                    </div>

                    {/* Configuration Row */}
                    <div className="flex flex-wrap items-center gap-4 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-400 whitespace-nowrap">Players per Team:</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={teamSize}
                                onChange={(e) => setTeamSize(parseInt(e.target.value) || 5)}
                                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">
                                Result: <span className="text-indigo-400 font-bold">{Math.max(2, Math.round(selectedPlayerIds.size / teamSize))}</span> Teams
                            </span>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={selectedPlayerIds.size < 2 || isGenerating}
                            className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isGenerating ? "Balancing..." : "Generate Teams"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {allPlayers.map(player => (
                            <div
                                key={player.id}
                                onClick={() => togglePlayer(player.id)}
                                className={`cursor-pointer border rounded-lg p-3 transition-all flex items-center justify-between ${selectedPlayerIds.has(player.id) ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                            >
                                <div>
                                    <div className="font-medium text-slate-200">{player.name}</div>
                                    <div className="text-xs text-slate-500">{player.position} • Rating: {player.rating}</div>
                                </div>
                                {selectedPlayerIds.has(player.id) && <UserCheck className="w-4 h-4 text-indigo-400" />}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {generatedTeams && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Generated Teams</h2>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                            onClick={async () => {
                                setIsStarting(true);
                                const res = await startMatch(generatedTeams[0], generatedTeams[1], matchType);
                                if (res.success) {
                                    router.push(`/match/${res.matchId}`);
                                } else {
                                    alert("Failed to start match");
                                    setIsStarting(false);
                                }
                            }}
                            disabled={isStarting}
                        >
                            <PlayCircle className="w-4 h-4" /> Start Match
                        </Button>
                    </div>

                    {/* Match Type Selector */}
                    <div className="flex gap-4 bg-slate-900 p-4 rounded-lg border border-slate-800">
                        <span className="text-sm font-bold text-slate-400 self-center">Match Mode:</span>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant={matchType === 'FRIENDLY' ? 'default' : 'outline'}
                                onClick={() => setMatchType('FRIENDLY')}
                                className={matchType === 'FRIENDLY' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                            >
                                Friendly
                            </Button>
                            <Button
                                size="sm"
                                variant={matchType === 'LEAGUE' ? 'default' : 'outline'}
                                onClick={() => setMatchType('LEAGUE')}
                                className={matchType === 'LEAGUE' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                            >
                                League
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {generatedTeams.map(team => (
                            <Card key={team.id} className="bg-slate-900 border-slate-800 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-white">{team.name}</CardTitle>
                                        <Badge variant="secondary" className="bg-slate-800">avg {team.averageRating}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {team.players.map(p => (
                                            <li key={p.id} className="flex justify-between items-center p-2 rounded bg-slate-950/50 border border-slate-800/50">
                                                <span className="text-slate-300">{p.name}</span>
                                                <div className="flex gap-2 items-center">
                                                    <Badge variant="outline" className="text-[10px] h-5 border-slate-700 text-slate-500">{p.position}</Badge>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
