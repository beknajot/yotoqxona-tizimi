import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN topilmadi. .env faylini tekshiring." }, { status: 400 });
  }

  // Tizim joylashgan url ni olamiz
  const host = req.headers.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const webhookUrl = `${protocol}://${host}/api/bot`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
    const data = await response.json();

    if (data.ok) {
      return NextResponse.json({ success: true, message: "Webhook muvaffaqiyatli o'rnatildi!", url: webhookUrl });
    } else {
      return NextResponse.json({ success: false, error: data.description }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "So'rov yuborishda xatolik yuz berdi" }, { status: 500 });
  }
}
