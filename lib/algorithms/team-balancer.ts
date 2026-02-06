import { Player } from "@/app/actions/player-actions";

export type Team = {
    id: number;
    name: string;
    players: Player[];
    averageRating: number;
};

// Target Ratios for 5-a-side
const TARGET_RATIO = {
    GK: 1,
    DEF: 2,
    MID: 1, // varied based on preference, usually 1-2
    ATT: 1
};

export function balanceTeams(players: Player[], numTeams: number = 2, captains: Player[] = []): Team[] {
    // 1. Initialize Teams
    const teams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
        id: i + 1,
        // Captain name logic: If captains exist, name team after them
        name: captains[i] ? `Team ${captains[i].name.split(' ')[0]}` : `Team ${i + 1}`,
        players: [],
        averageRating: 0
    }));

    // 2. Pre-assign Captains
    const playersToDistribute = [...players];
    captains.forEach((cap, i) => {
        if (i < numTeams) {
            teams[i].players.push(cap);
            // Remove captain from pool to distribute
            const idx = playersToDistribute.findIndex(p => p.id === cap.id);
            if (idx > -1) playersToDistribute.splice(idx, 1);
        }
    });

    // 3. Sort remaining players by position buckets
    const goalkeepers = playersToDistribute.filter(p => p.position === 'GK');
    const defenders = playersToDistribute.filter(p => p.position === 'DEF');
    const midfielders = playersToDistribute.filter(p => p.position === 'MID');
    const attackers = playersToDistribute.filter(p => p.position === 'ATT');

    // Shuffle helper
    const shuffle = <T>(array: T[]) => array.sort(() => Math.random() - 0.5);

    const shuffledGK = shuffle([...goalkeepers]);
    const shuffledDEF = shuffle([...defenders]);
    const shuffledMID = shuffle([...midfielders]);
    const shuffledATT = shuffle([...attackers]);

    // Distribute Logic via "Snake Draft" or Round Robin for each position to ensure even spread
    // We prioritize GK -> DEF -> MID -> ATT

    // Start filling from index 0 or random?
    // Since captains are already placed, we should check current counts.
    // Assuming 1 captain per team, counts are equal (1).
    let currentTeamIndex = 0;

    const distribute = (pool: Player[]) => {
        for (const player of pool) {
            teams[currentTeamIndex].players.push(player);
            // Move to next team, wrap around
            currentTeamIndex = (currentTeamIndex + 1) % numTeams;
        }
        // Randomize start index for next position group to avoid "Team 1 always gets best player" if sorted by rating
        currentTeamIndex = Math.floor(Math.random() * numTeams);
    };

    // If we want stricter positional control (e.g. EXACTLY 1 GK per team), we should logic strictly.
    // For now, round robin distribution per position group works well for general balance.
    distribute(shuffledGK);
    distribute(shuffledDEF);
    distribute(shuffledMID);
    distribute(shuffledATT);

    // Initial Rating Calculation
    calculateRatings(teams);

    // Optimization Step: Swap players to balance ratings
    // NOTE: We must NOT swap captains.
    const captainIds = new Set(captains.map(c => c.id));

    // Try to swap players of SAME position between teams if it reduces rating variance
    // Run this for a few iterations
    for (let i = 0; i < 100; i++) {
        const teamA = teams[Math.floor(Math.random() * numTeams)];
        const teamB = teams[Math.floor(Math.random() * numTeams)];

        if (teamA === teamB) continue;

        // Find a random position present in both teams
        const positions = ['DEF', 'MID', 'ATT', 'GK']; // GK usually shouldn't swap if 1 per team, but if unbalanced...
        const pos = positions[Math.floor(Math.random() * positions.length)];

        // Candidate players (EXCLUDING CAPTAINS)
        const playersA = teamA.players.filter(p => p.position === pos && !captainIds.has(p.id));
        const playersB = teamB.players.filter(p => p.position === pos && !captainIds.has(p.id));

        if (playersA.length === 0 || playersB.length === 0) continue;

        const pA = playersA[Math.floor(Math.random() * playersA.length)];
        const pB = playersB[Math.floor(Math.random() * playersB.length)];

        // Calculate current rating diff
        const currentDiff = Math.abs(teamA.averageRating - teamB.averageRating);

        // Calculate new ratings if swapped
        const teamARatingNew = calculateNewRating(teamA, pA, pB);
        const teamBRatingNew = calculateNewRating(teamB, pB, pA);
        const newDiff = Math.abs(teamARatingNew - teamBRatingNew);

        // Standard annealing: if better, swap. 
        if (newDiff < currentDiff) {
            // Perform Swap
            teamA.players = teamA.players.filter(p => p.id !== pA.id).concat(pB);
            teamB.players = teamB.players.filter(p => p.id !== pB.id).concat(pA);

            // Recalculate real ratings
            calculateRatings(teams);
        }
    }

    return teams;
}

function calculateRatings(teams: Team[]) {
    teams.forEach(team => {
        const total = team.players.reduce((sum, p) => sum + (p.rating || 5), 0);
        team.averageRating = team.players.length ? parseFloat((total / team.players.length).toFixed(1)) : 0;
    });
}

function calculateNewRating(team: Team, removePlayer: Player, addPlayer: Player): number {
    const currentTotal = team.averageRating * team.players.length;
    const newTotal = currentTotal - (removePlayer.rating || 5) + (addPlayer.rating || 5);
    return newTotal / team.players.length;
}
