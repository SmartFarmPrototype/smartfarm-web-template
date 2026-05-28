"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

// =============================================================================
// MODULE 1 — Water Level Card
//
// This card should:
//   - Display the current water level reading from Supabase
//   - Show whether the buzzer is currently active
//   - Let the user set a water level threshold
//   - Send that threshold to Supabase so the Smart Farm Kit can read it
// =============================================================================

import { useState, useEffect } from "react";

const API_URL = "https://xpyilzprpomzultikekk.supabase.co/rest/v1/mod1_sensor_data?select=id,created_at,water_level_adc,buzzer_status&order=created_at.desc&limit=1";

export default function WaterLevelCard() {
    const [threshold,    setThreshold]    = useState<number | null>(null);
    const [waterLevel, setWaterLevel] = useState<number | null>(null);
    const [buzzerStatus, setBuzzerStatus] = useState<boolean | null>(null);
    
function updateThreshold() {
    console.log("HELLO")

}

    useEffect(() => {
        async function fetchData() {
            // TODO: Fetch the latest water level reading from my Supabase table.
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
                
                    setWaterLevel(Math.round(data[0].water_level_adc));
                    setBuzzerStatus(data[0].buzzer_status);
                }
            } catch (error) {
                console.error("Error fetching water level:", error);
            }
        }

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-4">
            {/* Sensor reading */}
            <div>
                <p className="text-sm text-zinc-400 mb-1">Water Level</p>
                <p className="text-3xl font-bold">
                    {waterLevel !== null ? waterLevel : "—"}
                    <span className="text-lg text-zinc-400 ml-2">%</span>
                </p>
            </div>

            {/* Buzzer status */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium w-fit bg-zinc-700 text-zinc-400">
                🔊 Buzzer Inactive
            </div>
            {/* Threshold control */}
            <div>
                <label className="text-sm text-zinc-400 block mb-2">Water Level Threshold (%)</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="e.g. 30"
                        className="bg-zinc-700 border border-zinc-600 text-white rounded-lg px-3 py-2 w-full
                                   focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={updateThreshold}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg
                                   font-medium transition-colors whitespace-nowrap"
                    >
                        Set
                    </button>
                </div>
                {/* Show current threshold */}
                    <p className="text-xs text-zinc-500 mt-2">
                Current: {threshold !== null ? `${threshold}%` : "--"}
                    </p>
             </div>
             
        </div>
    );
}
