import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle } from "lucide-react";
import { DeductModal } from "@/components/DeductModal";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EducatorDashboard() {
  const session = await getSession();

  if (!session || session.role !== "EDUCATOR") {
    // Agar admin bo'lsa, o'z paneliga yo'naltiramiz
    if (session?.role === "ADMIN") redirect("/admin");
    redirect("/login");
  }

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Tarbiyachining o'quvchilarini va joriy oy ballarini olib kelamiz
  const studentsRaw = await db.student.findMany({
    where: { educatorId: session.id },
    include: {
      monthlyScores: {
        where: { month: currentMonth, year: currentYear }
      }
    }
  });

  const students = studentsRaw.map((s: any) => ({
    id: s.id,
    studentId: s.studentId,
    name: s.name,
    score: s.monthlyScores[0]?.score ?? 100
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tarbiyachi Paneli: {session.name}</h2>
          <p className="text-muted-foreground mt-2">
            Guruhdagi o'quvchilar ro'yxati va ularning joriy axloqiy ballari
          </p>
        </div>
        
        <DeductModal students={students} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {students.length === 0 && (
          <div className="col-span-full py-12 text-center border rounded-lg bg-muted/20">
            Hali guruhga o'quvchilar biriktirilmagan.
          </div>
        )}
        {students.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-all relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${
              student.score >= 80 ? 'bg-primary' : student.score >= 50 ? 'bg-yellow-500' : 'bg-destructive'
            }`} />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{student.name}</CardTitle>
              <div className="text-sm text-muted-foreground flex items-center justify-between">
                <span>{student.studentId}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mt-4">
                <div className="text-sm text-muted-foreground">Joriy ball</div>
                <div className={`text-4xl font-bold ${
                  student.score >= 80 ? 'text-primary' : student.score >= 50 ? 'text-yellow-600 dark:text-yellow-500' : 'text-destructive'
                }`}>
                  {student.score}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
