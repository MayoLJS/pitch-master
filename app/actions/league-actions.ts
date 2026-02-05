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
}

export async function getLeagueStandings() {
    const supabase = await createClient();

    // 1. Fetch all COMPLETED LEAGUE matches with full details
    const { data: matches, error } = await supabase
        .from('matches')
        .select(`
            id,
            teams (
                id,
                name,
                score,
                team_members (
                    player_id,
                    stats_goals,
                    players (name)
                )
            )
        `)
        .eq('status', 'COMPLETED')
        .eq('type', 'LEAGUE');

    if (error) {
        console.error("Error fetching league matches:", error);
        return [];
    }

    // 2. Aggregate Stats
    const standings: Record<string, PlayerStanding> = {};

    matches.forEach((match: any) => {
        const teamA = match.teams[0];
        const teamB = match.teams[1];

        // Determine result
        let winnerId: string | null = null;
        let isDraw = false;

        if (teamA.score > teamB.score) winnerId = teamA.id;
        else if (teamB.score > teamA.score) winnerId = teamB.id;
        else isDraw = true;

        // Process players
        match.teams.forEach((team: any) => {
            const isWinner = team.id === winnerId;
            const isLoser = !isWinner && !isDraw;

            team.team_members.forEach((tm: any) => {
                const pid = tm.player_id;
                if (!pid) return; // Skip if null (deleted player?)

                if (!standings[pid]) {
                    standings[pid] = {
                        playerId: pid,
                        name: tm.players?.name || 'Unknown',
                        played: 0,
                        won: 0,
                        drawn: 0,
                        lost: 0,
                        goals: 0,
                        points: 0
                    };
                }

                standings[pid].played += 1;
                standings[pid].goals += (tm.stats_goals || 0);

                if (isWinner) {
                    standings[pid].won += 1;
                    standings[pid].points += 3;
                } else if (isDraw) {
                    standings[pid].drawn += 1;
                    standings[pid].points += 1;
                } else {
                    standings[pid].lost += 1;
                }
            });
        });
    });

    // 3. Convert to Array and Sort
    return Object.values(standings).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points; // Points
        if ((b.won) !== (a.won)) return b.won - a.won; // Wins
        return b.goals - a.goals; // Goals
    });
}
