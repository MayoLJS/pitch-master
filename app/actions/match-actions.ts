'use server'

import { createClient } from "@/lib/supabase/server";
import { Team } from "@/lib/algorithms/team-balancer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function startMatch(teamA: Team, teamB: Team, matchType: 'FRIENDLY' | 'LEAGUE') {
    const supabase = await createClient();

    // 1. Create Match
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
            status: 'LIVE',
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
    const teamA_DbId = teamsData[0].id; // Assumption: order is preserved or we map by name if needed. 
    // Ideally we map back by name to be safe, but for this simpler logic:
    // Actually insert returns array. Let's map properly.
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

export async function recordGoal(matchId: string, teamId: string, playerId: string | null) {
    const supabase = await createClient();

    // 1. Increment Team Score
    // We need to fetch current score first or use RPC? Simple fetch update is fine for MVP
    const { data: team } = await supabase.from('teams').select('score').eq('id', teamId).single();
    if (team) {
        await supabase.from('teams').update({ score: team.score + 1 }).eq('id', teamId);
    }

    // 2. Increment Player Goal Stats (if linked) - BOTH on team_members (match specific) and players (global)
    if (playerId) {
        // Update Match Stats
        // Find team_member record
        const { data: member } = await supabase.from('team_members')
            .select('*')
            .eq('team_id', teamId) // redundant but safe
            .eq('player_id', playerId)
            .single();

        if (member) {
            await supabase.from('team_members').update({ stats_goals: (member.stats_goals || 0) + 1 }).eq('id', member.id);
        }

        // Update Global Stats
        const { data: player } = await supabase.from('players').select('goals_scored').eq('id', playerId).single();
        if (player) {
            await supabase.from('players').update({ goals_scored: (player.goals_scored || 0) + 1 }).eq('id', playerId);
        }
    }

    revalidatePath(`/match/${matchId}`);
}

export async function endMatch(matchId: string) {
    const supabase = await createClient();
    await supabase.from('matches').update({ status: 'COMPLETED' }).eq('id', matchId);

    // Optionally update global stats "matches_played" here for all participants
    // Keeping it simple for now.

    redirect('/');
}
