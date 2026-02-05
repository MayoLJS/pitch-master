'use client'

import { addPlayer } from "@/app/actions/player-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRef } from "react";
// import { useToast } from "@/components/ui/use-toast" // TODO: Add toast later

export default function PlayerInputForm() {
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <Card className="w-full bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-white">Add New Player</CardTitle>
                <CardDescription className="text-slate-400">
                    Register a regular for the sessions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    ref={formRef}
                    action={async (formData) => {
                        await addPlayer(formData);
                        formRef.current?.reset();
                    }}
                    className="flex flex-col gap-4"
                >
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-200">Name</label>
                        <input
                            name="name"
                            id="name"
                            required
                            placeholder="e.g. Tony"
                            className="bg-slate-950 border border-slate-700 rounded-md p-2 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="position" className="text-sm font-medium text-slate-200">Position</label>
                            <select
                                name="position"
                                id="position"
                                className="bg-slate-950 border border-slate-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="ATT">Attacker</option>
                                <option value="MID">Midfielder</option>
                                <option value="DEF">Defender</option>
                                <option value="GK">Goalkeeper</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="rating" className="text-sm font-medium text-slate-200">Initial Rating (1-10)</label>
                            <input
                                name="rating"
                                type="number"
                                min="1"
                                max="10"
                                defaultValue="5"
                                className="bg-slate-950 border border-slate-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2">
                        Add Player
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
