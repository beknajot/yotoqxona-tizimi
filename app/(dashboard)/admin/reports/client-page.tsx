"use client";

import { useState } from "react";
import { 
  FileText, TrendingDown, Users, 
  Download, Calendar, Search, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { revertScoreAction } from "./actions";

export default function AdminReportsClient({ rankings, logs: initialLogs }: any) {
  const [rankingSearch, setRankingSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [logs, setLogs] = useState(initialLogs);
  const [isReverting, setIsReverting] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<{id: string, name: string} | null>(null);

  const filteredRankings = rankings.filter((r: any) => 
    r.name.toLowerCase().includes(rankingSearch.toLowerCase()) ||
    r.studentId.toLowerCase().includes(rankingSearch.toLowerCase())
  );

  const filteredLogs = logs.filter((l: any) => 
    l.student.name.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.category.name.toLowerCase().includes(logSearch.toLowerCase())
  );

  const handleRevert = async (logId: string) => {
    if (!confirm("Rostdan ham ushbu ayirilgan ballni bekor qilib o'quvchiga qaytarmoqchimisiz?")) return;
    setIsReverting(true);
    try {
      await revertScoreAction(logId);
      toast.success("Ball muvaffaqiyatli qaytarildi");
      setLogs((prev: any[]) => prev.filter(l => l.id !== logId));
      window.location.reload(); // To update the rankings too
    } catch (e: any) {
      toast.error(e.message || "Xatolik yuz berdi");
    } finally {
      setIsReverting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Hisobotlar</h2>
        <p className="text-muted-foreground">Tizimdagi barcha harakatlar va ballar statistikasi.</p>
      </div>

      <Tabs defaultValue="rankings" className="space-y-4">
        <TabsList className="bg-background/50 backdrop-blur-md border">
          <TabsTrigger value="rankings" className="gap-2">
            <Users className="w-4 h-4" />
            Umumiy Reyting
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <FileText className="w-4 h-4" />
            Batafsil Loglar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rankings">
          <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Talabalar Ballari</CardTitle>
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
                      <TableHead>F.I.SH</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Tarbiyachi</TableHead>
                      <TableHead className="text-right">Joriy Ball</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRankings.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-semibold">
                          <button 
                            className="text-primary hover:underline text-left transition-colors"
                            onClick={() => setSelectedStudentForHistory({ id: r.id, name: r.name })}
                          >
                            {r.name}
                          </button>
                        </TableCell>
                        <TableCell className="text-primary font-mono">{r.studentId}</TableCell>
                        <TableCell className="text-muted-foreground">{r.educator?.name}</TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          <span className={`${
                            (r.monthlyScores[0]?.score || 100) > 70 ? "text-green-600" : 
                            (r.monthlyScores[0]?.score || 100) > 40 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {r.monthlyScores[0]?.score || 100}
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

        <TabsContent value="logs">
          <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Oxirgi Amallar (Loglar)</CardTitle>
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
                    {filteredLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString('uz-UZ')}
                        </TableCell>
                        <TableCell className="font-medium">
                          <button 
                            className="text-primary hover:underline text-left font-bold transition-colors"
                            onClick={() => setSelectedStudentForHistory({ id: log.studentId, name: log.student.name })}
                          >
                            {log.student.name}
                          </button>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{log.category.name}</TableCell>
                        <TableCell>
                          <span className="text-red-600 font-bold">-{log.pointsDeducted}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.educator.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            onClick={() => handleRevert(log.id)}
                            disabled={isReverting}
                          >
                            Bekor qilish
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedStudentForHistory} onOpenChange={(open) => !open && setSelectedStudentForHistory(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedStudentForHistory?.name} - Ball ayirish tarixi</DialogTitle>
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
                  {logs.filter((l: any) => l.studentId === selectedStudentForHistory?.id).length > 0 ? (
                    logs.filter((l: any) => l.studentId === selectedStudentForHistory?.id).map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('uz-UZ')}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{log.category.name}</TableCell>
                        <TableCell className="text-destructive font-bold text-base">-{log.pointsDeducted}</TableCell>
                        <TableCell className="text-sm">{log.educator.name}</TableCell>
                        <TableCell className="italic text-xs text-muted-foreground max-w-[150px] truncate" title={log.comment || "Izoh yo'q"}>
                          {log.comment || "Izoh yo'q"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        Ushbu o'quvchida qoidabuzarliklar tarixi yo'q (yoki oxirgi 100 ta ro'yxatga tushmagan)
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
