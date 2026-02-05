'use server'

import { Player } from "@/app/actions/player-actions";
import { balanceTeams, Team } from "@/lib/algorithms/team-balancer";

export async function generateTeamsAction(players: Player[], numTeams: number) {
    if (!players || players.length < numTeams * 5) {
        // Warning: Not enough players for full 5-aside, but we proceed anyway
    }

    const teams = balanceTeams(players, numTeams);
    return teams;
}
