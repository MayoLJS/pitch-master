'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Player = {
    id: string;
    name: string;
    position: 'ATT' | 'MID' | 'DEF' | 'GK';
    rating: number;
    goals_scored: number;
    assists_made: number;
    matches_played: number;
    win_rate: number;
};

export async function addPlayer(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const position = formData.get("position") as string;
    const rating = Number(formData.get("rating"));

    if (!name || !position) {
        return { error: "Name and position are required" };
    }

    const { error } = await supabase
        .from("players")
        .insert({
            name,
            position,
            rating: rating || 5
        });

    if (error) {
        console.error("Error adding player:", error);
        return { error: "Failed to add player" };
    }

    revalidatePath("/players");
    return { success: true };
}

export async function getPlayers() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching players:", error);
        return [];
    }

    return data as Player[];
}
