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
    const [captainIds, setCaptainIds] = useState<Set<string>>(new Set());
    const [step, setStep] = useState<'SELECT_PLAYERS' | 'SELECT_CAPTAINS' | 'GENERATE'>('SELECT_PLAYERS');
    const [generatedTeams, setGeneratedTeams] = useState<Team[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [matchType, setMatchType] = useState<'FRIENDLY' | 'LEAGUE'>('FRIENDLY');
    const [teamSize, setTeamSize] = useState(5);
    const router = useRouter();

    const togglePlayer = (id: string) => {
        if (step === 'SELECT_CAPTAINS') return;
        const newSet = new Set(selectedPlayerIds);
        if (newSet.has(id)) {
            newSet.delete(id);
            if (captainIds.has(id)) {
                const newCaps = new Set(captainIds);
                newCaps.delete(id);
                setCaptainIds(newCaps);
            }
        } else {
            newSet.add(id);
        }
        setSelectedPlayerIds(newSet);
    };

    const toggleCaptain = (id: string) => {
        if (!selectedPlayerIds.has(id)) return;
        const newSet = new Set(captainIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            if (newSet.size >= 2) return;
            newSet.add(id);
        }
        setCaptainIds(newSet);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        const selectedPlayers = allPlayers.filter(p => selectedPlayerIds.has(p.id));
        const captains = allPlayers.filter(p => captainIds.has(p.id));

        const calculatedNumTeams = Math.max(2, Math.round(selectedPlayers.length / teamSize));

        const teams = await generateTeamsAction(selectedPlayers, calculatedNumTeams, captains);
        setGeneratedTeams(teams);
        setIsGenerating(false);
        setStep('GENERATE');
    };

    const selectAll = () => {
        if (selectedPlayerIds.size === allPlayers.length) {
            setSelectedPlayerIds(new Set());
            setCaptainIds(new Set());
        } else {
            setSelectedPlayerIds(new Set(allPlayers.map(p => p.id)));
        }
    };

    return (
        <div className="space-y-8">
            {step !== 'GENERATE' && (
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-col gap-4">
                        <div className="flex flex-row items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-400" />
                                {step === 'SELECT_PLAYERS' ? `Select Players (${selectedPlayerIds.size})` : `Select 2 Captains (${captainIds.size}/2)`}
                            </CardTitle>
                            {step === 'SELECT_PLAYERS' && (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={selectAll}>
                                        {selectedPlayerIds.size === allPlayers.length ? "Deselect All" : "Select All"}
                                    </Button>
                                    <Button
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        disabled={selectedPlayerIds.size < 2}
                                        onClick={() => setStep('SELECT_CAPTAINS')}
                                    >
                                        Next: Captains
                                    </Button>
                                </div>
                            )}
                            {step === 'SELECT_CAPTAINS' && (
                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={() => setStep('SELECT_PLAYERS')} className="text-slate-400">Back</Button>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        disabled={captainIds.size !== 2}
                                        onClick={handleGenerate}
                                    >
                                        {isGenerating ? "Balancing..." : "Generate Teams"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {step === 'SELECT_PLAYERS' && (
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
                            </div>
                        )}

                        {step === 'SELECT_CAPTAINS' && (
                            <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30 text-indigo-300 text-sm">
                                Select exactly <b>2 captains</b>. They will be forced into separate teams.
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allPlayers.map(player => {
                                const isSelected = selectedPlayerIds.has(player.id);
                                const isCaptain = captainIds.has(player.id);

                                if (step === 'SELECT_CAPTAINS' && !isSelected) return null;

                                return (
                                    <div
                                        key={player.id}
                                        onClick={() => step === 'SELECT_PLAYERS' ? togglePlayer(player.id) : toggleCaptain(player.id)}
                                        className={`cursor-pointer border rounded-lg p-3 transition-all flex items-center justify-between 
                                            ${step === 'SELECT_CAPTAINS'
                                                ? (isCaptain ? 'bg-amber-900/20 border-amber-500 ring-1 ring-amber-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600')
                                                : (isSelected ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700')
                                            }`}
                                    >
                                        <div>
                                            <div className="font-medium text-slate-200">{player.name}</div>
                                            <div className="text-xs text-slate-500">{player.position} • Rating: {player.rating}</div>
                                        </div>
                                        {step === 'SELECT_PLAYERS' && isSelected && <UserCheck className="w-4 h-4 text-indigo-400" />}
                                        {step === 'SELECT_CAPTAINS' && isCaptain && <div className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded">C</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 'GENERATE' && generatedTeams && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Button variant="ghost" onClick={() => setStep('SELECT_CAPTAINS')}>&larr; Back</Button>
                        <h2 className="text-xl font-bold text-white">Generated Teams</h2>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                            onClick={async () => {
                                setIsStarting(true);
                                const res = await startMatch(generatedTeams[0], generatedTeams[1], matchType);
                                if (res.success) {
                                    router.push('/');
                                    router.refresh();
                                } else {
                                    alert("Failed to start match");
                                    setIsStarting(false);
                                }
                            }}
                            disabled={isStarting}
                        >
                            <PlayCircle className="w-4 h-4" /> Save Fixture
                        </Button>
                    </div>

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
