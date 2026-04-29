"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function loginAction(login: string, password: string) {
  try {
    // Ikkala jadvaldan (Admin/Tarbiyachi va O'quvchi) parallel qidiramiz
    const [user, studentUser] = await Promise.all([
      db.user.findUnique({ where: { login } }),
      db.studentUser.findUnique({
        where: { login },
        include: { student: true },
      })
    ]);

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return { error: "Login yoki parol noto'g'ri!" };

      const cookieStore = await cookies();
      cookieStore.set("session_user", JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role,
        gender: user.gender,
      }), { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 }); // 7 kun

      return { success: true, role: user.role };
    }

    if (studentUser) {
      const isMatch = await bcrypt.compare(password, studentUser.password);
      if (!isMatch) return { error: "Login yoki parol noto'g'ri!" };

      const cookieStore = await cookies();
      cookieStore.set("session_user", JSON.stringify({
        id: studentUser.id,
        name: studentUser.student.name,
        role: "STUDENT",
        studentDbId: studentUser.studentId,
      }), { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });

      return { success: true, role: "STUDENT" };
    }

    return { error: "Login yoki parol noto'g'ri!" };
  } catch (e: any) {
    console.error("Login xatosi:", e);
    return { error: `Baza bilan bog'lanishda xatolik: ${e.message || "Noma'lum xato"}` };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session_user");
}

export async function getSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session_user")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: string; name: string; role: string; gender?: string; studentDbId?: string };
  } catch {
    return null;
  }
}
