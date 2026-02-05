'use client'

import { MatchReport, generateMatchReport, getCompletedMatches } from "@/app/actions/media-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bot, FileText, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MediaPage() {
    const [matches, setMatches] = useState<MatchReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getCompletedMatches().then(setMatches);
    }, []);

    const handleGenerate = async (id: string) => {
        setLoading(true);
        const res = await generateMatchReport(id);
        if (res.report) {
            setSelectedReport(res.report);
        }
        setLoading(false);
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-12 bg-background">
            <div className="z-10 max-w-5xl w-full text-sm">
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 pl-0 text-slate-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Media Center</h1>
                <p className="text-slate-400 mb-8">AI-Generated Match Reports & Highlights.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Match List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Recent Results</h2>
                        {matches.length === 0 && <div className="text-slate-500">No completed matches yet.</div>}
                        {matches.map(match => (
                            <Card key={match.id} className="bg-slate-900 border-slate-800 hover:border-indigo-500 cursor-pointer transition-all" onClick={() => handleGenerate(match.id)}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-slate-500">{new Date(match.created_at).toLocaleDateString()}</span>
                                        <Bot className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div className="flex justify-between items-center font-bold text-white text-lg">
                                        <span>{match.teams[0].name}</span>
                                        <span className="bg-slate-950 px-3 py-1 rounded">{match.teams[0].score} - {match.teams[1].score}</span>
                                        <span>{match.teams[1].name}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Report View */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">AI Analysis</h2>
                        <Card className="bg-slate-950 border-slate-800 min-h-[400px]">
                            <CardContent className="p-6">
                                {loading && (
                                    <div className="flex flex-col items-center justify-center h-full text-indigo-400 animate-pulse">
                                        <Bot className="w-12 h-12 mb-4" />
                                        <p>Generating Match Report...</p>
                                    </div>
                                )}

                                {!loading && !selectedReport && (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                        <FileText className="w-12 h-12 mb-4" />
                                        <p>Select a match to view report</p>
                                    </div>
                                )}

                                {!loading && selectedReport && (
                                    <div className="space-y-4">
                                        <div className="whitespace-pre-line text-slate-300 font-mono text-sm leading-relaxed">
                                            {selectedReport}
                                        </div>
                                        <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                                            <Button variant="outline" size="sm">
                                                <Share2 className="w-4 h-4 mr-2" /> Share
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
