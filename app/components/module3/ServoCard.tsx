"use client";

import { useEffect, useState } from "react";

export default function ServoCard() {
  const [servoOpen, setServoOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch latest servo state
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}mod3_sensor_data?select=servo&order=created_at.desc&limit=1`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (data && data.length > 0) {
          setServoOpen(data[0].servo);
        }
      } catch (error) {
        console.error("Failed to fetch door state:", error);
      }
    }

    fetchData();

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Send command to Supabase (Open/Close)

async function setDoor(open: boolean) {
  setLoading(true);

  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}mod3_sensor_data?id=eq.1`,
      {
        method: "PATCH",
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          servo: open,
        }),
      }
    );

  } catch (error) {
    console.error("Failed to send servo command:", error);
  } finally {
    setLoading(false);
  }
}




  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-4">

      {/* ✅ Door status */}
      <div>
        <p className="text-sm text-zinc-400 mb-2">Door (Servo)</p>

        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium w-fit 
          ${servoOpen ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          
          {servoOpen ? "🔓 Door Open" : "🔒 Door Closed"}

        </div>
      </div>

      {/* ✅ Controls */}
      <div className="flex flex-col gap-2">
        
        <button
          onClick={() => setDoor(true)}
          disabled={loading}
          className="w-full py-2 rounded-lg font-medium transition-colors
                     bg-green-600 hover:bg-green-700 disabled:bg-zinc-600
                     disabled:cursor-not-allowed text-white"
        >
          Open Door
        </button>

        <button
          onClick={() => setDoor(false)}
          disabled={loading}
          className="w-full py-2 rounded-lg font-medium transition-colors
                     bg-red-600 hover:bg-red-700 disabled:bg-zinc-600
                     disabled:cursor-not-allowed text-white"
        >
          Close Door
        </button>
      </div>
    </div>
  );
}