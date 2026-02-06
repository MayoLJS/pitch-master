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

interface MatchResultPayload {
    matchId: string;
    teamAId: string;
    teamAScore: number;
    teamBId: string;
    teamBScore: number;
    stats: Array<{ playerId: string; goals: number; assists: number }>;
}

export async function submitMatchResult(payload: MatchResultPayload) {
    const supabase = await createClient();
    const { matchId, teamAId, teamAScore, teamBId, teamBScore, stats } = payload;

    // 1. Update Match Status
    const { error: matchError } = await supabase
        .from('matches')
        .update({ status: 'COMPLETED', played_at: new Date().toISOString() })
        .eq('id', matchId);

    if (matchError) throw new Error(`Failed to update match status: ${matchError.message}`);

    // 2. Update Team Scores
    await supabase.from('teams').update({ score: teamAScore }).eq('id', teamAId);
    await supabase.from('teams').update({ score: teamBScore }).eq('id', teamBId);

    // 3. Process Individual Stats (Goals/Assists)
    // We fetch all team members for this match to map player_id -> member_id
    const { data: members } = await supabase
        .from('team_members')
        .select('id, player_id, team_id')
        .in('team_id', [teamAId, teamBId]);

    if (members) {
        for (const stat of stats) {
            if (!stat.playerId) continue;
            const member = members.find(m => m.player_id === stat.playerId);
            if (member) {
                // Update specific match stats
                await supabase.from('team_members').update({
                    stats_goals: stat.goals,
                    stats_assists: stat.assists
                }).eq('id', member.id);

                // Update cumulative player stats (Goals/Assists)
                // We use an RPC or just raw increment if concurrency isn't huge.
                // For safety, let's fetch current and increment.
                const { data: p } = await supabase.from('players').select('goals_scored, assists_made').eq('id', stat.playerId).single();
                if (p) {
                    await supabase.from('players').update({
                        goals_scored: (p.goals_scored || 0) + stat.goals,
                        assists_made: (p.assists_made || 0) + stat.assists
                    }).eq('id', stat.playerId);
                }
            }
        }
    }

    // 4. Update League Table Stats (Points, Wins, etc.)
    // Logic:
    // Win = 3pts, Draw = 1pt, Loss = 0pts
    // GD = TeamGoals - OpponentGoals

    const teamAGoalDiff = teamAScore - teamBScore;
    const teamBGoalDiff = teamBScore - teamAScore;

    // Process Team A Players
    const teamAMembers = members?.filter((m: any) => m.team_id === teamAId) || [];
    for (const m of teamAMembers) {
        if (!m.player_id) continue;
        await updatePlayerLeagueStats(supabase, m.player_id, {
            win: teamAScore > teamBScore,
            draw: teamAScore === teamBScore,
            loss: teamAScore < teamBScore,
            gd: teamAGoalDiff
        });
    }

    // Process Team B Players
    const teamBMembers = members?.filter((m: any) => m.team_id === teamBId) || [];
    for (const m of teamBMembers) {
        if (!m.player_id) continue;
        await updatePlayerLeagueStats(supabase, m.player_id, {
            win: teamBScore > teamAScore,
            draw: teamBScore === teamAScore,
            loss: teamBScore < teamAScore,
            gd: teamBGoalDiff
        });
    }

    revalidatePath('/');
    revalidatePath('/league');
    redirect('/league');
}

async function updatePlayerLeagueStats(supabase: any, playerId: string, result: { win: boolean, draw: boolean, loss: boolean, gd: number }) {
    const { data: p } = await supabase.from('players').select('*').eq('id', playerId).single();
    if (!p) return;

    const newMatches = (p.matches_played || 0) + 1;
    const newWins = (p.wins || 0) + (result.win ? 1 : 0);
    const newDraws = (p.draws || 0) + (result.draw ? 1 : 0);
    const newLosses = (p.losses || 0) + (result.loss ? 1 : 0);

    // Points Calc
    const pointsAdded = result.win ? 3 : (result.draw ? 1 : 0);
    const newPoints = (p.points || 0) + pointsAdded;

    // GD Calc
    const newGD = (p.goal_difference || 0) + result.gd;

    // Win Rate Calc
    const newWinRate = newMatches > 0 ? (newWins / newMatches) * 100 : 0;

    await supabase.from('players').update({
        matches_played: newMatches,
        wins: newWins,
        draws: newDraws,
        losses: newLosses,
        points: newPoints,
        goal_difference: newGD,
        win_rate: newWinRate
    }).eq('id', playerId);
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

