"use client";
import { useEffect, useState } from "react";

export default function LedThresholdCard() {
    const [ledStatus, setLedStatus] = useState<number | null>(null);

    // 1. Split state: one for the live DB value, one for the user's input
    const [currentThreshold, setCurrentThreshold] = useState<string>("");
    const [inputValue, setInputValue] = useState<string>("");

    const [mounted, setMounted] = useState(false);
    const [latestId, setLatestId] = useState<number | string | null>(null);

    useEffect(() => {
        let mountedFlag = true;
        setMounted(true);

        const fetchData = async () => {
            try {
                const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${process.env.NEXT_PUBLIC_TABLE_SETTINGS}?select=id,light_threshold&order=id.desc&limit=1`;
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

                if (row?.id) setLatestId(row.id);
                // setLedStatus(row?.led_status ?? null);

                // 2. Only update the 'currentThreshold', leaving user input alone
                setCurrentThreshold(
                    row?.light_threshold !== undefined && row?.light_threshold !== null
                        ? String(row.light_threshold)
                        : ""
                );
            } catch (err) {
                console.error("Error fetching LED status / threshold:", err);
            }
            try {
                const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${process.env.NEXT_PUBLIC_TABLE_SENSORS}?select=led_status&order=id.desc&limit=1`;
                const res = await fetch(url, {
                    headers: {
                        "Content-Type": "application/json",
                        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                    },
                });
                if (!res.ok) {
                    const body = await res.text().catch(() => "");
                    console.error("Failed to fetch sensor data:", res.status, body);
                    return;
                }
                const sensorData = await res.json();
                const ledStatus = Array.isArray(sensorData) && sensorData.length > 0 ? sensorData[0]?.led_status : null;
                if (!mountedFlag) return;
                setLedStatus(ledStatus);
            } catch (err) {
                console.error("Error fetching LED status:", err);
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
        const val = parseFloat(inputValue);
        if (isNaN(val)) return;

        if (!latestId) {
            console.error("No row ID found to update.");
            return;
        }

        // Optimistically update UI so it feels snappy
        setCurrentThreshold(String(val));

        try {
            const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${process.env.NEXT_PUBLIC_TABLE_SETTINGS}?id=eq.${latestId}`;
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

            // 3. Clear the input field after successful submission
            setInputValue("");
        } catch (error) {
            console.error("Failed to set threshold:", error);
        }
    };

    const ledLabel = ledStatus && Number(ledStatus) > 0 ? "💡 LED on" : "💡 LED off";

    // 4. Update validation to look at 'inputValue' instead of 'threshold'
    const computedDisabled = Boolean(!inputValue.trim() || isNaN(parseFloat(inputValue)) || !latestId);
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
                        suppressHydrationWarning={true}
                        type="number"
                        step="0.1"
                        placeholder="e.g. 200.0"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="bg-zinc-700 border border-zinc-600 text-white rounded-lg px-3 py-2 w-full
                                   focus:outline-none focus:border-blue-500"
                    />
                    <button
                        suppressHydrationWarning={true}
                        data-server-threshold={inputValue}
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
                <p className="text-xs text-zinc-500 mt-2">Current: {currentThreshold || "—"}</p>
            </div>
        </div>
    );
}