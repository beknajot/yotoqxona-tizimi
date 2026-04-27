"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// O'quvchi qo'shish
export async function addStudentAction(data: { name: string; studentId: string; gender: string; educatorId?: string }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Ruxsat yo'q");

  const student = await db.student.create({
    data: {
      name: data.name,
      studentId: data.studentId,
      gender: data.gender,
      educatorId: data.educatorId || null,
    }
  });

  // O'quvchi uchun boshlang'ich oy ballini yaratish
  const now = new Date();
  await db.monthlyScore.create({
    data: {
      studentId: student.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      score: 100,
    }
  });

  revalidatePath("/admin/students");
  return { success: true };
}

// O'quvchini o'chirish
export async function deleteStudentAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Ruxsat yo'q");

  // Aloqador ma'lumotlarni o'chirish
  await db.scoreLog.deleteMany({ where: { studentId: id } });
  await db.monthlyScore.deleteMany({ where: { studentId: id } });
  await db.studentUser.deleteMany({ where: { studentId: id } });
  await db.student.delete({ where: { id } });

  revalidatePath("/admin/students");
  return { success: true };
}

// O'quvchini tahrirlash
export async function updateStudentAction(id: string, data: { name: string; studentId: string; gender: string; educatorId?: string }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Ruxsat yo'q");

  await db.student.update({
    where: { id },
    data: {
      name: data.name,
      studentId: data.studentId,
      gender: data.gender,
      educatorId: data.educatorId || null,
    }
  });

  revalidatePath("/admin/students");
  return { success: true };
}
