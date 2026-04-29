"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, History } from "lucide-react";
import { DeductModal } from "@/components/DeductModal";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { deductPoints } from "./actions";
import { toast } from "sonner";

export type LogEntry = {
  id: string;
  studentId: string;
  amount: number;
  category: string;
  comment: string;
  date: string;
  educator: string;
};

export default function ClientStudentsPage({ 
  initialStudents, 
  initialLogs 
}: { 
  initialStudents: any[], 
  initialLogs: LogEntry[] 
}) {
  const [students, setStudents] = useState(initialStudents);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState<string | null>(null);

  const handleDeduct = async (studentId: string, amount: number, category: string, comment: string) => {
    // UI ni darhol yangilash (Optimistic update)
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, score: Math.max(0, s.score - amount) };
      }
      return s;
    }));

    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      studentId,
      amount,
      category,
      comment,
      date: new Date().toLocaleString('uz-UZ'),
      educator: "Siz",
    };
    setLogs(prev => [newLog, ...prev]);

    // Server Action ni chaqirish
    try {
      await deductPoints(studentId, amount, category, comment);
    } catch (error) {
      toast.error("Xatolik yuz berdi. Sahifani yangilang.");
    }
  };

  const openHistory = (studentId: string) => {
    setSelectedHistoryStudent(studentId);
    setHistoryOpen(true);
  };

  // Avval jins bo'yicha ajratamiz (sinflar ro'yxatini olish uchun)
  const studentsByGender = students.filter(s => genderFilter === "ALL" || s.gender === genderFilter);
  
  // Shu jinsdagi mavjud sinflar ro'yxatini shakllantiramiz
  const availableClasses = Array.from(new Set(studentsByGender.map(s => s.className))).sort();

  const filteredStudents = studentsByGender.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "ALL" || s.className === classFilter;
    return matchesSearch && matchesClass;
  });

  const activeStudentHistory = logs.filter(l => l.studentId === selectedHistoryStudent);
  const activeStudentName = students.find(s => s.id === selectedHistoryStudent)?.name;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">O'quvchilar ro'yxati</h2>
        <p className="text-muted-foreground mt-2">
          Guruhga biriktirilgan barcha o'quvchilarni ko'rish va tizimdan izlash
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <Tabs 
            defaultValue="ALL" 
            onValueChange={(v) => {
              setGenderFilter(v);
              setClassFilter("ALL"); // Jins o'zgarganda sinf filtrini tozalaymiz
            }} 
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3 mb-2 sm:mb-0">
              <TabsTrigger value="ALL">Barchasi</TabsTrigger>
              <TabsTrigger value="MALE">O'g'il bolalar</TabsTrigger>
              <TabsTrigger value="FEMALE">Qiz bolalar</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={classFilter} onValueChange={(v) => setClassFilter(v || "ALL")}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Barcha sinflar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Barcha sinflar</SelectItem>
                {availableClasses.map(c => (
                  <SelectItem key={String(c)} value={String(c)}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Ism yoki ID ni kiriting..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DeductModal students={students} onDeduct={handleDeduct} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>O'quvchi ID</TableHead>
                  <TableHead>F.I.Sh</TableHead>
                  <TableHead>Sinf</TableHead>
                  <TableHead className="text-right">Joriy Ball</TableHead>
                  <TableHead className="text-right">Harakat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>
                      <button 
                        onClick={() => openHistory(student.id)}
                        className="hover:underline font-medium flex items-center gap-2"
                      >
                        {student.name}
                        <History className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className="bg-muted px-2 py-1 rounded text-xs font-medium border">
                        {student.className}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                         student.score >= 80 ? 'bg-primary/10 text-primary' 
                         : student.score >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                         : 'bg-destructive/10 text-destructive'
                      }`}>
                        {student.score}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DeductModal students={[student]} onDeduct={handleDeduct}>
                        Ball ayirish
                      </DeductModal>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      O'quvchi topilmadi
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto w-full">
          <SheetHeader className="mb-6">
            <SheetTitle>{activeStudentName} tarixi</SheetTitle>
            <SheetDescription>
              Ushbu o'quvchidan shu kungacha qachon va kim tomonidan qancha ball ayirilgani tarixi.
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-4">
            {activeStudentHistory.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/20">
                Ushbu o'quvchidan hali ball ayirilmagan. (Intizomli o'quvchi!)
              </div>
            ) : (
              activeStudentHistory.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-3 relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 bg-destructive h-full"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm">{log.category}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{log.date}</p>
                    </div>
                    <div className="bg-destructive/10 text-destructive font-bold px-2 py-1 rounded text-sm shrink-0">
                      -{log.amount} ball
                    </div>
                  </div>
                  
                  <div className="bg-muted p-2 rounded text-sm italic">
                    "{log.comment}"
                  </div>
                  
                  <div className="text-xs text-right text-muted-foreground">
                    Tarbiyachi: {log.educator}
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
