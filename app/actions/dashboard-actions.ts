'use server'

import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
    const supabase = await createClient();

    // 1. Get Player Count
    const { count: playerCount, error: playerError } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true });

    if (playerError) {
        console.error("Error fetching player count:", playerError);
    }

    // 2. Get Total Funds
    // Supabase doesn't have a simple SUM function in the JS client without RPC or getting all rows.
    // For MVP with small data, fetching all PAID rows is fine.
    const { data: ledger, error: ledgerError } = await supabase
        .from('ledger')
        .select('amount')
        .eq('status', 'PAID');

    let totalFunds = 0;
    if (ledger) {
        totalFunds = ledger.reduce((sum, entry) => sum + entry.amount, 0);
    }

    if (ledgerError) {
        console.error("Error fetching funds:", ledgerError);
    }

    return {
        playerCount: playerCount || 0,
        totalFunds
    };
}
