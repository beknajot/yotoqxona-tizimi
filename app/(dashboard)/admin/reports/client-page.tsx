"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, TrendingDown, Users,
  Download, Calendar, Search, ChevronLeft, ChevronRight, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { revertScoreAction } from "./actions";

const MONTH_NAMES = [
  "", "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
];

interface MonthEntry { month: number; year: number; }

export default function AdminReportsClient({
  rankings,
  logs: initialLogs,
  availableMonths,
  selectedMonth,
  selectedYear,
}: {
  rankings: any[];
  logs: any[];
  availableMonths: MonthEntry[];
  selectedMonth: number;
  selectedYear: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [rankingSearch, setRankingSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [logs, setLogs] = useState(initialLogs);
  const [isReverting, setIsReverting] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const now = new Date();
  const isCurrentMonth =
    selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

  // --- Oy filtrlash navigatsiyasi ---
  const navigateToMonth = (month: number, year: number) => {
    startTransition(() => {
      router.push(`/admin/reports?month=${month}&year=${year}`);
    });
  };

  // Oldingi va keyingi oy
  const getPrevMonth = () => {
    if (selectedMonth === 1) return { month: 12, year: selectedYear - 1 };
    return { month: selectedMonth - 1, year: selectedYear };
  };
  const getNextMonth = () => {
    if (selectedMonth === 12) return { month: 1, year: selectedYear + 1 };
    return { month: selectedMonth + 1, year: selectedYear };
  };

  // Keyingi oyga o'tish imkoni bormi (joriy oydan katta bo'lmaydi)
  const canGoNext =
    selectedYear < now.getFullYear() ||
    (selectedYear === now.getFullYear() && selectedMonth < now.getMonth() + 1);

  // --- Filtrlar ---
  const filteredRankings = rankings.filter(
    (r: any) =>
      r.name.toLowerCase().includes(rankingSearch.toLowerCase()) ||
      r.studentId.toLowerCase().includes(rankingSearch.toLowerCase())
  );

  const filteredLogs = logs.filter(
    (l: any) =>
      l.student.name.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.category.name.toLowerCase().includes(logSearch.toLowerCase())
  );

  // --- Revert ---
  const handleRevert = async (logId: string) => {
    if (
      !confirm(
        "Rostdan ham ushbu ayirilgan ballni bekor qilib o'quvchiga qaytarmoqchimisiz?"
      )
    )
      return;
    setIsReverting(true);
    try {
      await revertScoreAction(logId);
      toast.success("Ball muvaffaqiyatli qaytarildi");
      setLogs((prev: any[]) => prev.filter((l) => l.id !== logId));
      // Reytingni yangilash uchun sahifani refresh qilamiz
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Xatolik yuz berdi");
    } finally {
      setIsReverting(false);
    }
  };

  // --- Month Selector Component ---
  const MonthSelector = () => (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Oldingi oy */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => {
          const { month, year } = getPrevMonth();
          navigateToMonth(month, year);
        }}
        disabled={isPending}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Joriy ko'rinayotgan oy */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-background/80 backdrop-blur min-w-[160px] justify-center">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">
          {MONTH_NAMES[selectedMonth]} {selectedYear}
        </span>
        {isCurrentMonth && (
          <Badge variant="default" className="text-xs px-1.5 py-0 ml-1">
            Hozir
          </Badge>
        )}
      </div>

      {/* Keyingi oy */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => {
          const { month, year } = getNextMonth();
          navigateToMonth(month, year);
        }}
        disabled={!canGoNext || isPending}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Tezkor oy tugmalari — faqat log bor oylar */}
      <div className="flex gap-1 flex-wrap">
        {availableMonths.slice(0, 6).map((m) => {
          const isActive = m.month === selectedMonth && m.year === selectedYear;
          return (
            <Button
              key={`${m.year}-${m.month}`}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => navigateToMonth(m.month, m.year)}
              disabled={isPending}
            >
              {MONTH_NAMES[m.month].slice(0, 3)} {m.year}
            </Button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hisobotlar</h2>
          <p className="text-muted-foreground">
            Tizimdagi barcha harakatlar va ballar statistikasi.
          </p>
        </div>
        {isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <Clock className="w-4 h-4" />
            Yuklanmoqda...
          </div>
        )}
      </div>

      {/* Oy tanlash filtri */}
      <Card className="border-none shadow-md bg-background/50 backdrop-blur-sm">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Oy tanlang:
            </span>
            <MonthSelector />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="rankings" className="space-y-4">
        <TabsList className="bg-background/50 backdrop-blur-md border">
          <TabsTrigger value="rankings" className="gap-2">
            <Users className="w-4 h-4" />
            Umumiy Reyting
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <FileText className="w-4 h-4" />
            Batafsil Loglar
            {logs.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {logs.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ===== REYTING TAB ===== */}
        <TabsContent value="rankings">
          <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle>Talabalar Ballari</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {MONTH_NAMES[selectedMonth]} {selectedYear} oyi uchun
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Qidirish..."
                    className="pl-9 w-[200px]"
                    value={rankingSearch}
                    onChange={(e) => setRankingSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>F.I.SH</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Tarbiyachi</TableHead>
                      <TableHead className="text-right">
                        {MONTH_NAMES[selectedMonth]} oyi bali
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRankings
                      .map((r: any) => ({
                        ...r,
                        score: r.monthlyScores[0]?.score ?? 100,
                      }))
                      .sort((a: any, b: any) => b.score - a.score)
                      .map((r: any, idx: number) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-semibold">
                            <button
                              className="text-primary hover:underline text-left transition-colors"
                              onClick={() =>
                                setSelectedStudentForHistory({
                                  id: r.id,
                                  name: r.name,
                                })
                              }
                            >
                              {r.name}
                            </button>
                          </TableCell>
                          <TableCell className="text-primary font-mono">
                            {r.studentId}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.educator?.name}
                          </TableCell>
                          <TableCell className="text-right font-bold text-lg">
                            <span
                              className={`${
                                r.score > 70
                                  ? "text-green-600"
                                  : r.score > 40
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {r.score}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== LOGLAR TAB ===== */}
        <TabsContent value="logs">
          <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle>Qoidabuzarlik Loglari</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {MONTH_NAMES[selectedMonth]} {selectedYear} — jami {logs.length} ta yozuv
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Ism yoki kategoriya..."
                  className="pl-9 w-[250px]"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Sana</TableHead>
                      <TableHead>O'quvchi</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead>Ball</TableHead>
                      <TableHead>Tarbiyachi</TableHead>
                      <TableHead className="text-right">Amal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground h-24"
                        >
                          {MONTH_NAMES[selectedMonth]} {selectedYear} oyida qoidabuzarlik loglari yo'q
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString("uz-UZ")}
                          </TableCell>
                          <TableCell className="font-medium">
                            <button
                              className="text-primary hover:underline text-left font-bold transition-colors"
                              onClick={() =>
                                setSelectedStudentForHistory({
                                  id: log.studentId,
                                  name: log.student.name,
                                })
                              }
                            >
                              {log.student.name}
                            </button>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {log.category.name}
                          </TableCell>
                          <TableCell>
                            <span className="text-red-600 font-bold">
                              -{log.pointsDeducted}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.educator.name}
                          </TableCell>
                          <TableCell className="text-right">
                            {isCurrentMonth ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                onClick={() => handleRevert(log.id)}
                                disabled={isReverting}
                              >
                                Bekor qilish
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Arxiv
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* O'quvchi tarixi modali */}
      <Dialog
        open={!!selectedStudentForHistory}
        onOpenChange={(open) => !open && setSelectedStudentForHistory(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStudentForHistory?.name} —{" "}
              {MONTH_NAMES[selectedMonth]} {selectedYear} oyi tarixi
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto mt-2">
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Sana</TableHead>
                    <TableHead>Kategoriya</TableHead>
                    <TableHead>Ball</TableHead>
                    <TableHead>Tarbiyachi</TableHead>
                    <TableHead>Izoh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.filter(
                    (l: any) =>
                      l.studentId === selectedStudentForHistory?.id
                  ).length > 0 ? (
                    logs
                      .filter(
                        (l: any) =>
                          l.studentId === selectedStudentForHistory?.id
                      )
                      .map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString("uz-UZ")}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {log.category.name}
                          </TableCell>
                          <TableCell className="text-destructive font-bold text-base">
                            -{log.pointsDeducted}
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.educator.name}
                          </TableCell>
                          <TableCell
                            className="italic text-xs text-muted-foreground max-w-[150px] truncate"
                            title={log.comment || "Izoh yo'q"}
                          >
                            {log.comment || "Izoh yo'q"}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground h-24"
                      >
                        Bu o'quvchi {MONTH_NAMES[selectedMonth]} {selectedYear} oyida qoidabuzarlik qilmagan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
