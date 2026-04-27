import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, AlertOctagon } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();
  
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // Haqiqiy ma'lumotlarni bazadan olish
  const totalStudents = await db.student.count();
  const totalEducators = await db.user.count({
    where: { role: "EDUCATOR" }
  });
  
  // Oxirgi 30 kundagi qoidabuzarliklar
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentViolations = await db.scoreLog.count({
    where: {
      createdAt: {
        gte: thirtyDaysAgo
      }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Xush kelibsiz, {session.name}!</h2>
        <p className="text-muted-foreground mt-2">
          Yotoqxona ball tizimining barcha ko'rsatkichlari bu yerda ko'rinadi.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami O'quvchilar</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Tizimga kiritilgan o'quvchilar</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarbiyachilar</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEducators}</div>
            <p className="text-xs text-muted-foreground">Faol tarbiyachilar ro'yxati</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qoidabuzarliklar</CardTitle>
            <AlertOctagon className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{recentViolations} ta</div>
            <p className="text-xs text-muted-foreground">Oxirgi 30 kun ichida</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tezkor harakatlar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Tez orada bu yerda O'quvchilar va Tarbiyachilarni tahrirlash jadvali paydo bo'ladi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
