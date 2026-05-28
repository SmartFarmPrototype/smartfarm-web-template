"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

// =============================================================================
// MODULE 1 — Soil Humidity Card
//
// This card should display the current soil humidity reading from Supabase.
// =============================================================================

import { useState, useEffect } from "react";

const API_URL = "https://xpyilzprpomzultikekk.supabase.co/rest/v1/mod1_sensor_data?select=id,created_at,soil_adc&order=created_at.desc&limit=1";

export default function SoilHumidityCard() {
    const [value, setValue] = useState<number | null>(null);

    useEffect(() => {

        async function fetchData() {
            // TODO: Fetch the latest soil humidity reading from your Supabase table.
        try {
                const res = await fetch(
                    API_URL,
                    {
                        headers: {
                            apikey: "sb_publishable_R0tmuL3xh3obJQqJ_Yl5Vw_O8dqze3p",
                            Authorization: `Bearer sb_publishable_R0tmuL3xh3obJQqJ_Yl5Vw_O8dqze3p`,
                        },
                    }
                );

                const data = await res.json();

                if (data && data.length > 0) {
                    // soil_adc assumed to be percentage already
                    setValue(Math.round(data[0].soil_adc));
                }
            } catch (error) {
                console.error("Error fetching soil data:", error);
            }
        }

        fetchData();
        const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);          // Cleanup on unmount
    }, []);

    return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-1">Soil Humidity</p>
            <p className="text-3xl font-bold">
                { value }
                —
                <span className="text-lg text-zinc-400 ml-2">%</span>
            </p>
        </div>
    );
}
