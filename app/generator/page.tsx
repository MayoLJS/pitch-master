import { getPlayers } from "@/app/actions/player-actions";
import TeamGenerator from "@/components/team-generator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function GeneratorPage() {
    const players = await getPlayers();

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

                <h1 className="text-3xl font-bold text-white mb-8">Match Setup</h1>

                <TeamGenerator allPlayers={players} />
            </div>
        </main>
    );
}
