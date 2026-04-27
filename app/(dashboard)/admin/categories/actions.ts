"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Kategoriya qo'shish
export async function addCategoryAction(data: { name: string; minPoints: number; maxPoints: number; order: number }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Ruxsat yo'q");

  await db.category.create({
    data: {
      name: data.name,
      minPoints: data.minPoints,
      maxPoints: data.maxPoints,
      order: data.order,
    }
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

// Kategoriyani o'chirish
export async function deleteCategoryAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Ruxsat yo'q");

  // Aloqador ScoreLog larni tekshirish (agar bo'lsa o'chirish yoki ogohlantirish)
  const logsCount = await db.scoreLog.count({ where: { categoryId: id } });
  if (logsCount > 0) {
    throw new Error("Ushbu kategoriya bo'yicha ball chegirilgan loglar mavjud. O'chirib bo'lmaydi.");
  }

  await db.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
  return { success: true };
}

// Kategoriyani tahrirlash
export async function updateCategoryAction(id: string, data: { name: string; minPoints: number; maxPoints: number; order: number }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Ruxsat yo'q");

  await db.category.update({
    where: { id },
    data: {
      name: data.name,
      minPoints: data.minPoints,
      maxPoints: data.maxPoints,
      order: data.order,
    }
  });

  revalidatePath("/admin/categories");
  return { success: true };
}
