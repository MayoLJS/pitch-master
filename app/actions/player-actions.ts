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

export async function deletePlayer(playerId: string) {
    const supabase = await createClient();

    // Check if player has constraints? Supabase should handle cascade or error.
    // Ideally we assume cascade or we warn user. For MVP, just delete.
    const { error } = await supabase.from('players').delete().eq('id', playerId);

    if (error) {
        console.error("Error deleting player:", error);
        return { error: "Failed to delete player" };
    }

    // ... (existing exports)

    export async function getPaidPlayers() {
        const supabase = await createClient();

        // Strategy: Get players who have a PAID ledger entry created in the last 24 hours.
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        // 1. Get IDs of paid players
        const { data: paidEntries, error: ledgerError } = await supabase
            .from('ledger')
            .select('player_id')
            .eq('status', 'PAID')
            .gt('created_at', oneDayAgo.toISOString());

        if (ledgerError) {
            console.error("Error fetching paid players:", ledgerError);
            return [];
        }

        const paidPlayerIds = paidEntries.map(e => e.player_id);

        if (paidPlayerIds.length === 0) return [];

        // 2. Fetch Player details
        const { data: players, error: playerError } = await supabase
            .from('players')
            .select('*')
            .in('id', paidPlayerIds)
            .order('name', { ascending: true });

        if (playerError) {
            console.error("Error fetching available players:", playerError);
            return [];
        }

        return players as Player[];
    }
