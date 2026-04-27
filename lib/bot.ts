import { Bot, Context, webhookCallback } from "grammy";
import { db } from "./db";

// Bot token'ni env dan olish
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.warn("TELEGRAM_BOT_TOKEN is not defined in the environment variables.");
}

export const bot = new Bot(token || "dummy_token");

// /start komandasi uchun handler
bot.command("start", async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const payload = ctx.match; // "start" komandasi orqasidan kelgan matn (masalan, linkingCode)

  if (payload) {
    // Bog'lash jarayoni
    const linkingCode = payload.trim();
    
    // Studentni qidiramiz
    let student = await db.studentUser.findUnique({
      where: { telegramLinkCode: linkingCode },
      include: { student: true }
    });

    if (student) {
      // Bog'laymiz
      await db.studentUser.update({
        where: { id: student.id },
        data: { telegramId: telegramId, telegramLinkCode: null }
      });
      return ctx.reply(`Tabriklaymiz, ${student.student.name}! Sizning Telegram akkauntingiz tizimga muvaffaqiyatli bog'landi.`);
    }

    // O'qituvchi/Adminni qidiramiz
    let educator = await db.user.findUnique({
      where: { telegramLinkCode: linkingCode }
    });

    if (educator) {
      await db.user.update({
        where: { id: educator.id },
        data: { telegramId: telegramId, telegramLinkCode: null }
      });
      return ctx.reply(`Tabriklaymiz, hurmatli ${educator.name}! Sizning Telegram akkauntingiz tizimga muvaffaqiyatli bog'landi.`);
    }

    return ctx.reply("Bunday bog'lash kodi (Link Code) topilmadi yoki u allaqachon ishlatilgan. Iltimos, tizimdan qayta kod oling.");
  }

  // Payload yo'q bo'lsa (odatiy /start)
  const student = await db.studentUser.findUnique({
    where: { telegramId },
    include: { student: true },
  });

  const educator = await db.user.findUnique({
    where: { telegramId },
  });

  if (student) {
    await ctx.reply(
      `Assalomu alaykum, ${student.student.name}! \nSizning oylik ballaringiz va ma'lumotlaringiz shu bot orqali ko'rinadi. Ma'lumot olish uchun /me deb yozing.`
    );
  } else if (educator) {
    await ctx.reply(
      `Assalomu alaykum, hurmatli ${educator.name}! \nTizim botiga xush kelibsiz.`
    );
  } else {
    await ctx.reply(
      "Sizning Telegram hisobingiz yotoqxona tizimiga ulanmagan. \nIltimos, tizimga kirib, 'Telegram bilan bog'lash' tugmasini bosing."
    );
  }
});

// Ma'lumot olish uchun /me komandasi
bot.command("me", async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const student = await db.studentUser.findUnique({
    where: { telegramId },
    include: { student: { include: { monthlyScores: true } } },
  });

  if (student) {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyScore = student.student.monthlyScores.find(
      (m) => m.month === currentMonth && m.year === currentYear
    );

    await ctx.reply(
      `👤 Talaba: ${student.student.name}\n🏆 Joriy oydagi ball: ${monthlyScore ? monthlyScore.score : 100} ball`
    );
  } else {
    await ctx.reply("Sizning ma'lumotlaringiz topilmadi yoki siz talaba emassiz.");
  }
});
