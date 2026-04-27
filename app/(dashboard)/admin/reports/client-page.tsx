"use client";

import { useState } from "react";
import { 
  FileText, TrendingDown, Users, 
  Download, Calendar, Search, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminReportsClient({ rankings, logs }: any) {
  const [rankingSearch, setRankingSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");

  const filteredRankings = rankings.filter((r: any) => 
    r.name.toLowerCase().includes(rankingSearch.toLowerCase()) ||
    r.studentId.toLowerCase().includes(rankingSearch.toLowerCase())
  );

  const filteredLogs = logs.filter((l: any) => 
    l.student.name.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.category.name.toLowerCase().includes(logSearch.toLowerCase())
  );

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
              <div className="rounded-xl border overflow-hidden">
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
                        <TableCell className="font-semibold">{r.name}</TableCell>
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
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Sana</TableHead>
                      <TableHead>O'quvchi</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead>Ball</TableHead>
                      <TableHead>Tarbiyachi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString('uz-UZ')}
                        </TableCell>
                        <TableCell className="font-medium">{log.student.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{log.category.name}</TableCell>
                        <TableCell>
                          <span className="text-red-600 font-bold">-{log.pointsDeducted}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.educator.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
