import { getLeagueStandings } from "@/app/actions/league-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";

export default async function LeaguePage() {
    const standings = await getLeagueStandings();

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

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-amber-500/10 rounded-full text-amber-500 border border-amber-500/20">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">League Table</h1>
                        <p className="text-slate-400">Official Player Rankings (Season 1)</p>
                    </div>
                </div>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Standings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="w-full overflow-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                                    <tr>
                                        <th className="p-4 rounded-tl-lg">Pos</th>
                                        <th className="p-4">Player</th>
                                        <th className="p-4 text-center">P</th>
                                        <th className="p-4 text-center">W</th>
                                        <th className="p-4 text-center">D</th>
                                        <th className="p-4 text-center">L</th>
                                        <th className="p-4 text-center">G</th>
                                        <th className="p-4 text-center">GD</th>
                                        <th className="p-4 text-center font-bold text-white rounded-tr-lg">Pts</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {standings.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="p-8 text-center text-slate-500">
                                                No league matches played yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        standings.map((player, index) => (
                                            <tr key={player.playerId} className="hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4 font-mono text-slate-500">
                                                    {index + 1}
                                                </td>
                                                <td className="p-4 font-bold text-slate-200">
                                                    {player.name}
                                                    {index === 0 && <span className="ml-2 text-amber-500">👑</span>}
                                                </td>
                                                <td className="p-4 text-center text-slate-400">{player.played}</td>
                                                <td className="p-4 text-center text-green-400">{player.won}</td>
                                                <td className="p-4 text-center text-slate-400">{player.drawn}</td>
                                                <td className="p-4 text-center text-red-400">{player.lost}</td>
                                                <td className="p-4 text-center text-slate-400">{player.goals}</td>
                                                <td className={`p-4 text-center font-bold ${player.goalDifference > 0 ? 'text-green-500' : (player.goalDifference < 0 ? 'text-red-500' : 'text-slate-500')}`}>
                                                    {player.goalDifference > 0 ? '+' : ''}{player.goalDifference}
                                                </td>
                                                <td className="p-4 text-center font-black text-amber-500 text-lg">{player.points}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
