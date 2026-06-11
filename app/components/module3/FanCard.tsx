"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";

export default function FanCard() {

  const [fanOn, setFanOn] = useState(false);
  const [threshold, setThreshold] = useState(25);
  const [loading, setLoading] = useState(false);

  // ✅ CHANGE: FIXED URL (added /rest/v1/)
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/mod3_sensor_data`;

  // ✅ CHANGE: added Prefer header (important for PATCH)
  const headers = {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  // ✅ CHANGE: force fan OFF at startup (still POST = insert if needed)
  useEffect(() => {
    async function initFan() {
      try {
        await fetch(`${baseUrl}`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            id: 1,              // ✅ IMPORTANT: ensure row exists
            fan: false,
            fan_speed: 0.2,
          }),
        });
      } catch (err) {
        console.error("Init error:", err);
      }
    }

    initFan();
  }, []);

  // ✅ CHANGE: fetch latest data (FIXED & instead of &amp;)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function fetchData() {
      try {
        const res = await fetch(
          `${baseUrl}?select=*&order=id.asc&limit=1`, // ✅ FIXED URL
          {
            headers,
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (data.length > 0) {
          const row = data[0];

          // ✅ set fan state
          setFanOn(row.fan ?? false);

          // ✅ load threshold
          if (row.threshold !== undefined && row.threshold !== null) {
            setThreshold(row.threshold);
          }
        }
      } catch (error) {
        console.error("Failed to fetch fan status:", error);
      }
    }

    const timeout = setTimeout(() => {
      fetchData();
      interval = setInterval(fetchData, 5000);
    }, 6000);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);


  // ✅ CHANGE: PATCH instead of POST + row filter (?id=eq.1)
  async function toggleFan() {
    setLoading(true);

    try {
      const newState = !fanOn;

      await fetch(`${baseUrl}?id=eq.1`, {   // ✅ IMPORTANT
        method: "PATCH",
        headers,
        body: JSON.stringify({
          fan: newState,
          fan_speed: 0.2,
        }),
      });

      setFanOn(newState);
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setLoading(false);
    }
  }


  // ✅ CHANGE: PATCH instead of POST + filter
  async function setAutoThreshold() {
    try {
      await fetch(`${baseUrl}?id=eq.1`, {   // ✅ IMPORTANT
        method: "PATCH",
        headers,
        body: JSON.stringify({
          threshold: threshold,
        }),
      });

      console.log("Threshold updated:", threshold);
    } catch (err) {
      console.error("Failed to set threshold:", err);
    }
  }


  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-4">

      {/* Fan status */}
      <div>
        <p className="text-sm text-zinc-400 mb-2">Fan</p>

        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              fanOn
                ? "bg-green-600 text-white"
                : "bg-zinc-700 text-zinc-400"
            }`}
          >
            💨 {fanOn ? "Fan On" : "Fan Off"}
          </div>
        </div>
      </div>

      {/* Manual toggle */}
      <button
        onClick={toggleFan}
        disabled={loading}
        className={`w-full py-2 rounded-lg font-medium transition-colors text-white ${
          fanOn
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {fanOn ? "Turn Fan Off" : "Turn Fan On"}
      </button>

      {/* Threshold control */}
      <div>
        <label className="text-sm text-zinc-400 block mb-2">
          Auto Threshold (°C)
        </label>

        <div className="flex gap-2">
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="bg-zinc-700 border border-zinc-600 text-white rounded-lg px-3 py-2 w-full
                       focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={setAutoThreshold}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg
                       font-medium transition-colors whitespace-nowrap"
          >
            Set
          </button>

        </div>
      </div>

    </div>
  );
}