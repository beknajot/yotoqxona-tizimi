import { db } from "../lib/db";

async function backfillMonthYear() {
  // month=1, year=2025 bo'lgan — ya'ni default qiymat bilan qolgan — loglarni topamiz
  const logs = await db.scoreLog.findMany({
    where: { month: 1, year: 2025 },
  });

  console.log(`Default qiymati bor loglar soni: ${logs.length}`);

  let updated = 0;
  for (const log of logs) {
    const date = new Date(log.createdAt);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Agar haqiqatan ham 1-yanvar 2025 yilda yaratilgan bo'lsa — o'zgartirmaymiz
    // Lekin hozir sana 2026 bo'lgani uchun bular default qiymatlar
    if (year === 2025 && month === 1 && date.getFullYear() === 2025) {
      console.log(`Log ${log.id} haqiqatan ham yanvar 2025 da — skip`);
      continue;
    }

    await db.scoreLog.update({
      where: { id: log.id },
      data: { month, year },
    });
    updated++;
  }

  console.log(`Yangilandi: ${updated} ta log`);
  await db.$disconnect();
}

backfillMonthYear().catch((e) => {
  console.error(e);
  process.exit(1);
});
