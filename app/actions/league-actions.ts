'use server'

import { createClient } from "@/lib/supabase/server";

export type PlayerStanding = {
    playerId: string;
    name: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goals: number;
    points: number;
    goalDifference: number;
}

export async function getLeagueStandings() {
    const supabase = await createClient();

    const { data: players, error } = await supabase
        .from('players')
        .select('id, name, matches_played, wins, draws, losses, goals_scored, points, goal_difference')
        .order('points', { ascending: false })
        .order('goal_difference', { ascending: false })
        .order('goals_scored', { ascending: false });

    if (error) {
        console.error("Error fetching standings:", error);
        return [];
    }

    return players.map((p: any) => ({
        playerId: p.id,
        name: p.name,
        played: p.matches_played || 0,
        won: p.wins || 0,
        drawn: p.draws || 0,
        lost: p.losses || 0,
        goals: p.goals_scored || 0,
        points: p.points || 0,
        goalDifference: p.goal_difference || 0
    }));
}
