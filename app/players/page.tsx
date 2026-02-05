import Link from "next/link";
import { getPlayers } from "@/app/actions/player-actions";
import PlayerInputForm from "@/components/player-input-form";
import PlayerList from "@/components/player-list";
import { Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PlayersPage() {
    const players = await getPlayers();

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-12 bg-background">
            <div className="z-10 max-w-5xl w-full text-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Squad</h1>
                        <p className="text-slate-400">Manage your player roster.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="md:col-span-1">
                        <PlayerInputForm />
                    </div>

                    {/* Right Column: List */}
                    <div className="md:col-span-2">
                        <PlayerList players={players} />
                    </div>
                </div>
            </div>
        </main>
    );
}
