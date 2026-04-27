import { webhookCallback } from "grammy";
import { bot } from "@/lib/bot";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const handleUpdate = webhookCallback(bot, "std/http");

export async function POST(req: NextRequest) {
  try {
    const response = await handleUpdate(req);
    return response;
  } catch (error) {
    console.error("Bot webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram bot is running" });
}
