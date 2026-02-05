'use client'

import { Player, deletePlayer } from "@/app/actions/player-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Sword, Activity, Hand, Trash2 } from "lucide-react";
import { useTransition } from "react";

const PositionIcon = ({ position }: { position: string }) => {
    switch (position) {
        case 'ATT': return <Sword className="w-4 h-4 text-red-400" />;
        case 'DEF': return <Shield className="w-4 h-4 text-blue-400" />;
        case 'GK': return <Hand className="w-4 h-4 text-yellow-400" />;
        default: return <Activity className="w-4 h-4 text-green-400" />;
    }
}

const PositionColor = (position: string) => {
    switch (position) {
        case 'ATT': return 'bg-red-500/10 text-red-400 border-red-500/20';
        case 'DEF': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'GK': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        default: return 'bg-green-500/10 text-green-400 border-green-500/20';
    }
}

export default function PlayerList({ players }: { players: Player[] }) {
    if (players.length === 0) {
        return (
            <div className="text-center p-8 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                No players added yet.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((player) => (
                <Card key={player.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors relative group">
                    <CardContent className="p-4">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-slate-500 hover:text-red-500"
                                onClick={async () => {
                                    if (confirm('Delete player?')) {
                                        await deletePlayer(player.id);
                                    }
                                }}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>

                        <div className="flex justify-between items-start mb-2">
                            <div className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 ${PositionColor(player.position)}`}>
                                <PositionIcon position={player.position} />
                                {player.position}
                            </div>
                            <div className="text-lg font-bold text-slate-200">{player.rating}</div>
                        </div>
                        <div className="mb-4">
                            <h3 className="font-bold text-white truncate">{player.name}</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
                            <div className="bg-slate-950 p-1 rounded">
                                <div className="font-bold text-white">{player.matches_played}</div>
                                <div className="text-[10px]">match</div>
                            </div>
                            <div className="bg-slate-950 p-1 rounded">
                                <div className="font-bold text-white">{player.goals_scored}</div>
                                <div className="text-[10px]">goal</div>
                            </div>
                            <div className="bg-slate-950 p-1 rounded">
                                <div className="font-bold text-white">{player.assists_made}</div>
                                <div className="text-[10px]">assist</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
