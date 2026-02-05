'use server'

import { createClient } from "@/lib/supabase/server";

export type MatchReport = {
    id: string;
    teams: { name: string, score: number, team_members: { players: { name: string }, stats_goals: number }[] }[];
    created_at: string;
    report?: string;
};

export async function getCompletedMatches() {
    const supabase = await createClient();

    // Fetch completed matches with full details
    const { data, error } = await supabase
        .from('matches')
        .select(`
            id,
            created_at,
            teams (
                name,
                score,
                team_members (
                    stats_goals,
                    players (name)
                )
            )
        `)
        .eq('status', 'COMPLETED')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching matches:", error);
        return [];
    }

    return data as unknown as MatchReport[];
}

export async function generateMatchReport(matchId: string) {
    const supabase = await createClient();

    // 1. Fetch Match Data
    const { data: match, error } = await supabase
        .from('matches')
        .select(`
            *,
            teams (
                name,
                score,
                team_members (
                    stats_goals,
                    players (name)
                )
            )
        `)
        .eq('id', matchId)
        .single();

    if (error || !match) return { error: "Match not found" };

    // 2. Generate Logic (Mock AI)
    const teamA = match.teams[0];
    const teamB = match.teams[1];

    let winner = "Draw";
    if (teamA.score > teamB.score) winner = teamA.name;
    if (teamB.score > teamA.score) winner = teamB.name;

    const totalGoals = teamA.score + teamB.score;

    // Find top scorers
    const scorers: string[] = [];
    teamA.team_members.forEach((tm: any) => { if (tm.stats_goals > 0) scorers.push(`${tm.players.name} (${tm.stats_goals})`) });
    teamB.team_members.forEach((tm: any) => { if (tm.stats_goals > 0) scorers.push(`${tm.players.name} (${tm.stats_goals})`) });

    const report = `
        MATCH REPORT
        ----------------
        Final Score: ${teamA.name} ${teamA.score} - ${teamB.score} ${teamB.name}
        Winner: ${winner}
        
        It was an electrifying night at the Pitch Master arena! ${winner === 'Draw' ? 'Both teams fought bravely to a stalemate' : `${winner} dominated the field to claim a well-deserved victory`}.
        
        Highlights:
        - A total of ${totalGoals} goals were scored.
        - ${scorers.length > 0 ? `Key contributions from ${scorers.join(', ')}.` : 'Defenses were on top today.'}
        
        ${totalGoals > 10 ? 'An absolute goal-fest that kept the fans on the edge of their seats!' : 'A tactical battle decided by fine margins.'}
        
        Man of the Match needs to be decided!
    `;

    // 3. Save to DB (mocking saving to a 'notes' field or similar, actually we don't have a report field in schema yet, so returning it)
    // If we want to persist, we should add a column. For now, we return it to UI.

    return { report };
}
