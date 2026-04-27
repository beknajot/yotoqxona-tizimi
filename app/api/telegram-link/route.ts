import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, isStudent } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Foydalanuvchi ID si berilmadi" }, { status: 400 });
    }

    // Tasodifiy unikal kod yaratish
    const linkingCode = crypto.randomBytes(16).toString("hex");

    if (isStudent) {
      await db.studentUser.update({
        where: { id: userId },
        data: { telegramLinkCode: linkingCode },
      });
    } else {
      await db.user.update({
        where: { id: userId },
        data: { telegramLinkCode: linkingCode },
      });
    }

    // Bot manzili env orqali olinadi
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "SizningBot_Bot";
    const link = `https://t.me/${botUsername}?start=${linkingCode}`;

    return NextResponse.json({ link });
  } catch (error) {
    console.error("Telegram link generator error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
