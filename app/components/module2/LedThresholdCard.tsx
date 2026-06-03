"use client";
import { useEffect, useState } from "react";

// LED Threshold Card
export default function LedThresholdCard() {
    const [ledStatus, setLedStatus] = useState<number | null>(null);
    const [threshold, setThreshold] = useState<string>("");
    
    const [mounted, setMounted] = useState(false);
    // 1. Add state to hold the ID of the latest row
    const [latestId, setLatestId] = useState<number | string | null>(null);


    useEffect(() => {
        let mountedFlag = true;
        setMounted(true);

        const fetchData = async () => {
            try {
                // 2. Fetch the id and order by id (or created_at) descending to get the true "latest" row
                const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${process.env.NEXT_PUBLIC_TABLE_SENSORS}?select=id,light_threshold,led_status&order=id.desc&limit=1`;
                const res = await fetch(url, {
                    headers: {
                        "Content-Type": "application/json",
                        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                    },
                });

                if (!res.ok) {
                    const body = await res.text().catch(() => "");
                    console.error("Failed to fetch settings:", res.status, body);
                    return;
                }

                const data = await res.json();
                const row = Array.isArray(data) && data.length > 0 ? data[0] : null;

                if (!mountedFlag) return;
                
                // 3. Store the latest ID so we can target it later
                if (row?.id) setLatestId(row.id);
                setLedStatus(row?.led_status ?? null);
                setThreshold(row?.light_threshold !== undefined && row?.light_threshold !== null
                    ? String(row.light_threshold)
                    : "");
            } catch (err) {
                console.error("Error fetching LED status / threshold:", err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => {
            mountedFlag = false;
            clearInterval(interval);
        };
    }, []);

    const handleSetThreshold = async () => {
        const val = parseFloat(threshold);
        if (isNaN(val)) return;
        
        // Ensure we have a row ID to target before attempting to update
        if (!latestId) {
            console.error("No row ID found to update.");
            return;
        }

        try {
            // 4. Append the ?id=eq.{latestId} filter to target only the latest row
            const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${process.env.NEXT_PUBLIC_TABLE_SENSORS}?id=eq.${latestId}`;
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                    Prefer: "return=representation",
                },
                body: JSON.stringify({ light_threshold: val }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Error ${response.status}: ${errorData?.message ?? "unknown"}`);
            }

            const ct = response.headers.get("content-type") || "";
            const data = (response.status !== 204 && ct.includes("application/json"))
                ? await response.json()
                : null;

            console.log("Threshold sent:", data ?? "no JSON returned");
            setThreshold("");
        } catch (error) {
            console.error("Failed to set threshold:", error);
        }
    };

    const ledLabel = ledStatus && Number(ledStatus) > 0 ? "💡 LED on" : "💡 LED off";

    const computedDisabled = Boolean(!threshold.trim() || isNaN(parseFloat(threshold)) || !latestId);

    const isDisabled = mounted ? computedDisabled : true;

    const disabledAttr = isDisabled ? true : undefined;

    return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-4">
            <div>
                <p className="text-sm text-zinc-400 mb-2">LED Status</p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium w-fit bg-zinc-700 text-zinc-400">
                    {ledLabel}
                </div>
            </div>

            <div>
                <label className="text-sm text-zinc-400 block mb-2">Light Threshold (lx)</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 200.0"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        className="bg-zinc-700 border border-zinc-600 text-white rounded-lg px-3 py-2 w-full
                                   focus:outline-none focus:border-blue-500"
                    />
                    <button
                        suppressHydrationWarning={true}
                        data-server-threshold={threshold}
                        data-server-latestid={String(latestId)}
                        data-computed-disabled={String(disabledAttr)}
                        onClick={handleSetThreshold}
                        disabled={Boolean(disabledAttr)}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed
                                   text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                    >
                        Set
                    </button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Current: {threshold || "—"}</p>
            </div>
        </div>
    );
}
