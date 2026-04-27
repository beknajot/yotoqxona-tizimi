"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function updateProfilePasswordAction(currentPass: string, newPass: string) {
  const session = await getSession();
  if (!session) throw new Error("Avtorizatsiyadan o'tilmagan");

  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user) throw new Error("Foydalanuvchi topilmadi");

  const isMatch = await bcrypt.compare(currentPass, user.password);
  if (!isMatch) return { error: "Amaldagi parol noto'g'ri!" };

  const hashedPassword = await bcrypt.hash(newPass, 10);
  await db.user.update({
    where: { id: session.id },
    data: { password: hashedPassword }
  });

  return { success: true };
}
