"use client";

// =============================================================================
// MODULE 2 — Light Card
//
// This card should display the current light level reading from Supabase.
// Follow the same pattern used in SoilHumidityCard (module1) as a reference.
// =============================================================================

import { useEffect, useState } from "react";

export default function LightCard() {
    const [lightLevel, setLightLevel] = useState<number>(0);

    useEffect(() => {
        async function fetchData() {
            try {
                const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${process.env.NEXT_PUBLIC_TABLE_SENSORS}?select=light_level&order=created_at.desc&limit=1`;
                const response = await fetch(url, {
                    headers: {
                        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                    },
                });
                const data = await response.json();
                console.log("Current light level:", data);
                setLightLevel(data[0]?.light_level ?? 0);
            } catch (error) {
                console.error("Failed to fetch light level:", error);
            }
        }

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-1">Light Level</p>
            <p className="text-3xl font-bold">
                {lightLevel}
                <span className="text-lg text-zinc-400 ml-2">lx</span>
            </p>
        </div>
    );
}

