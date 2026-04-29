"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function revertScoreAction(logId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Sizda ushbu amalni bajarish uchun ruxsat yo'q");
  }

  // 1. Logni topamiz
  const log = await db.scoreLog.findUnique({
    where: { id: logId }
  });

  if (!log) {
    throw new Error("Log topilmadi");
  }

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // 2. Tranzaksiya orqali ballni qaytaramiz va logni o'chiramiz
  await db.$transaction(async (tx) => {
    // Ballni qaytarib qo'shish
    const monthlyScore = await tx.monthlyScore.findUnique({
      where: {
        studentId_month_year: {
          studentId: log.studentId,
          month: currentMonth,
          year: currentYear
        }
      }
    });

    if (monthlyScore) {
      await tx.monthlyScore.update({
        where: { id: monthlyScore.id },
        data: {
          score: {
            increment: log.pointsDeducted
          }
        }
      });
    }

    // Logni o'chirish
    await tx.scoreLog.delete({
      where: { id: logId }
    });
  });

  return { success: true };
}
