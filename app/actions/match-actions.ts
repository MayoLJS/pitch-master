'use server'

import { createClient } from "@/lib/supabase/server";
// ... (imports remain)
import { Team } from "@/lib/algorithms/team-balancer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function startMatch(teamA: Team, teamB: Team, matchType: 'FRIENDLY' | 'LEAGUE') {
    const supabase = await createClient();

    // 1. Create Match as SCHEDULED
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
            status: 'SCHEDULED', // Changed from LIVE
            type: matchType
        })
        .select()
        .single();

    if (matchError || !match) {
        console.error("Error creating match:", matchError);
        return { error: "Failed to start match" };
    }

    // 2. Create Teams
    const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .insert([
            { match_id: match.id, name: teamA.name },
            { match_id: match.id, name: teamB.name }
        ])
        .select();

    if (teamsError || !teamsData) {
        console.error("Error creating teams:", teamsError);
        return { error: "Failed to create teams" };
    }

    // 3. Add Members to Teams
    const teamAMapped = teamsData.find(t => t.name === teamA.name) || teamsData[0];
    const teamBMapped = teamsData.find(t => t.name === teamB.name) || teamsData[1];

    const allMembers = [
        ...teamA.players.map(p => ({ team_id: teamAMapped.id, player_id: p.id })),
        ...teamB.players.map(p => ({ team_id: teamBMapped.id, player_id: p.id }))
    ];

    const { error: membersError } = await supabase
        .from('team_members')
        .insert(allMembers);

    if (membersError) {
        console.error("Error adding members:", membersError);
        return { error: "Failed to add players to match" };
    }

    return { success: true, matchId: match.id };
}

export async function submitMatchResult(matchId: string, teamAId: string, teamAScore: number, teamBId: string, teamBScore: number, scorers: { [key: string]: number }) {
    const supabase = await createClient();

    // 1. Update Match Status
    const { error: matchError } = await supabase
        .from('matches')
        .update({ status: 'COMPLETED', played_at: new Date().toISOString() })
        .eq('id', matchId);

    if (matchError) throw new Error("Failed to update match status");

    // 2. Update Team Scores (and determine winner logic if strictly needed, but score is enough usually)
    await supabase.from('teams').update({ score: teamAScore }).eq('id', teamAId);
    await supabase.from('teams').update({ score: teamBScore }).eq('id', teamBId);

    // 3. Update Scorers (Reset them first if re-submitting? For now assume one-time submit)
    // We loop through scorers map: { playerId: goals }
    for (const [playerId, goals] of Object.entries(scorers)) {
        if (goals > 0) {
            // Find team_member id
            // We need to know which team member record to update.
            // A player could theoretically play for multiple teams in different matches, so strictly need matchId context.
            // The team_members table is specific to a team, which is specific to a match. 
            // So we can find the team_member by player_id where team_id is one of the match's teams.

            // Allow generic find:
            const { data: member } = await supabase.from('team_members')
                .select('id, team_id, teams!inner(match_id)')
                .eq('player_id', playerId)
                .eq('teams.match_id', matchId)
                .single();

            if (member) {
                await supabase.from('team_members').update({ stats_goals: goals }).eq('id', member.id);
            }

            // Update Global Stats
            // Increment goals
            const { data: player } = await supabase.from('players').select('goals_scored, matches_played, win_rate').eq('id', playerId).single();
            if (player) {
                await supabase.from('players').update({
                    goals_scored: (player.goals_scored || 0) + goals
                }).eq('id', playerId);
            }
        }
    }

    // 4. Update Global Matches Played & Win Rates for ALL participants
    // This is getting complex to do transactionally. Let's do a simple increment for MVP.
    // Ideally we re-calculate from scratch for perfect consistency.
    // For now: Increment matches_played for everyone involved.

    const { data: allMembers } = await supabase
        .from('team_members')
        .select('player_id, team_id')
        .in('team_id', [teamAId, teamBId]);

    if (allMembers) {
        for (const m of allMembers) {
            if (!m.player_id) continue;
            const { data: p } = await supabase.from('players').select('matches_played').eq('id', m.player_id).single();
            if (p) {
                await supabase.from('players').update({ matches_played: (p.matches_played || 0) + 1 }).eq('id', m.player_id);
            }
        }
    }

    revalidatePath('/');
    revalidatePath('/league');
    redirect('/league'); // Go to league table to see results
}

export async function getMatchDetails(matchId: string) {
    const supabase = await createClient();

    const { data: match, error } = await supabase
        .from('matches')
        .select(`
            *,
            teams (
                *,
                team_members (
                    *,
                    players (*)
                )
            )
        `)
        .eq('id', matchId)
        .single();

    if (error) {
        console.error("Error fetching match:", error);
        return null;
    }

    return match;
}

// Deprecated or Unused Actions actions can be removed or kept for reference
// recordGoal, endMatch are replaced by submitMatchResult logic.

