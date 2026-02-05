'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type LedgerEntry = {
    id: string;
    created_at: string;
    player_id: string;
    match_id: string | null;
    amount: number;
    status: 'PAID' | 'UNPAID' | 'PENDING';
    payment_method: 'CASH' | 'DIGITAL';
    notes: string | null;
    players?: { name: string };
};

export async function getLedger() {
    const supabase = await createClient();

    // Fetch ledger with player names
    const { data, error } = await supabase
        .from('ledger')
        .select(`
            *,
            players (name)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching ledger:", error);
        return [];
    }

    return data as LedgerEntry[];
}

export async function addLedgerEntry(formData: FormData) {
    const supabase = await createClient();
    const playerId = formData.get('playerId') as string;
    const amount = Number(formData.get('amount'));
    const notes = formData.get('notes') as string;

    if (!playerId || !amount) return { error: "Missing fields" };

    const { error } = await supabase.from('ledger').insert({
        player_id: playerId,
        amount,
        status: 'UNPAID',
        notes
    });

    if (error) {
        console.error("Error adding entry:", error);
        return { error: "Failed" };
    }

    revalidatePath('/treasurer');
    return { success: true };
}

export async function togglePaymentStatus(entryId: string, currentStatus: string) {
    const supabase = await createClient();
    const newStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';

    await supabase
        .from('ledger')
        .update({ status: newStatus })
        .eq('id', entryId);

    revalidatePath('/treasurer');
}
