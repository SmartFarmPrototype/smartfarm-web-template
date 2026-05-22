"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

// =============================================================================
// MODULE 2 — LCD Message Card
//
// This card should:
//   - Let the user type a message in the text field
//   - Send that message to Supabase when the button is clicked
//   - The Smart Farm Kit should read the latest message and display it on the LCD screen
// =============================================================================
import { useState } from "react";

export default function LcdMessageCard() {
    const [message, setMessage] = useState("");

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        try {
            const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${process.env.NEXT_PUBLIC_TABLE_SENSORS}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                    Prefer: "return=representation"
                },
                body: JSON.stringify({ lcd_message: message.trim() }),

            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error ${response.status}: ${errorData.message}`);
            }
            const ct = response.headers.get("content-type") || "";
            const data = (response.status !== 204 && ct.includes("application/json"))
                ? await response.json()
                : null;

            console.log("Message sent:", data ?? "no JSON returned");
            setMessage("");
         } catch (error) {
            console.error("Failed to send message:", error);
  }
};

    return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-4">
            <div>
                <p className="text-sm text-zinc-400 mb-1">LCD Display</p>
                <p className="text-xs text-zinc-500">Send a message to the physical LCD screen</p>
            </div>

            <textarea
                placeholder="Type your message here..."
                maxLength={32}
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-zinc-700 border border-zinc-600 text-white rounded-lg px-3 py-2 w-full
                           focus:outline-none focus:border-blue-500 resize-none text-sm"
            />

            <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">{message.length}/32 characters</span>
                <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed
                               text-white px-4 py-2 rounded-lg font-medium transition-colors"
  
                >
                    Send to LCD
                </button>
            </div>
        </div>
    );
}
