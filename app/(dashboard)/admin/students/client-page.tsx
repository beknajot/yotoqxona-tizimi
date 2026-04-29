"use client";

import { useState } from "react";
import { 
  Plus, Search, Edit2, Trash2, UserPlus, 
  ChevronRight, Users, GraduationCap, Filter, History, Undo2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { addStudentAction, deleteStudentAction, updateStudentAction } from "./actions";
import { revertScoreAction } from "../reports/actions";

export default function AdminStudentsClient({ initialStudents, educators, initialLogs = [] }: any) {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>(initialLogs);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    gender: "MALE",
    educatorId: ""
  });

  const [genderFilter, setGenderFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");

  const studentsWithClass = students.map((s: any) => {
    const match = s.name.match(/\(([^)]+)\)$/);
    return {
      ...s,
      className: match ? match[1] : "Kiritilmagan",
      cleanName: s.name.replace(/\s*\([^)]+\)$/, "").trim()
    };
  });

  const studentsByGender = studentsWithClass.filter((s: any) => genderFilter === "ALL" || s.gender === genderFilter);
  const availableClasses = Array.from(new Set(studentsByGender.map((s: any) => s.className))).sort();

  const filteredStudents = studentsByGender.filter((s: any) => {
    const matchesSearch = s.cleanName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "ALL" || s.className === classFilter;
    return matchesSearch && matchesClass;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addStudentAction(formData);
      toast.success("O'quvchi qo'shildi");
      setIsAddOpen(false);
      window.location.reload(); // Quick refresh to get updated list
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateStudentAction(selectedStudent.id, formData);
      toast.success("Ma'lumotlar yangilandi");
      setIsEditOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("O'quvchini o'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteStudentAction(id);
      toast.success("O'quvchi o'chirildi");
      setStudents(students.filter((s: any) => s.id !== id));
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const openEdit = (s: any) => {
    setSelectedStudent(s);
    setFormData({
      name: s.name,
      studentId: s.studentId,
      gender: s.gender,
      educatorId: s.educatorId || "null"
    });
    setIsEditOpen(true);
  };

  const openHistory = (id: string) => {
    setSelectedHistoryStudent(id);
    setHistoryOpen(true);
  };

  const handleRevert = async (logId: string) => {
    if (!confirm("Haqiqatdan ham bu ayirilgan ballni bekor qilmoqchimisiz?")) return;
    try {
      await revertScoreAction(logId);
      toast.success("Ball qaytarildi!");
      setLogs(logs.filter((l: any) => l.id !== logId));
      window.location.reload(); // update table scores
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi");
    }
  };

  const activeStudentHistory = logs.filter((l: any) => l.studentId === selectedHistoryStudent);
  const activeStudentName = students.find((s: any) => s.id === selectedHistoryStudent)?.name;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">O'quvchilar Boshqaruvi</h2>
          <p className="text-muted-foreground">Tizimdagi barcha o'quvchilarni tahrirlash va yangi qo'shish.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2 shadow-lg shadow-primary/20">
            <UserPlus className="w-4 h-4" />
            Yangi O'quvchi
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yangi O'quvchi Qo'shish</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">F.I.SH</label>
                <Input 
                  placeholder="Ali Valiyev" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ID (ST001)</label>
                <Input 
                  placeholder="ST101" 
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jinsi</label>
                  <Select 
                    value={formData.gender}
                    onValueChange={(v) => setFormData({...formData, gender: v || ""})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">O'g'il bola</SelectItem>
                      <SelectItem value="FEMALE">Qiz bola</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tarbiyachi</label>
                  <Select 
                    value={formData.educatorId}
                    onValueChange={(v) => setFormData({...formData, educatorId: v || ""})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {educators.filter((e:any) => e.gender === formData.gender).map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Qo'shilmoqda..." : "Saqlash"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <Tabs 
              defaultValue="ALL" 
              onValueChange={(v) => {
                setGenderFilter(v);
                setClassFilter("ALL");
              }} 
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 mb-2 sm:mb-0">
                <TabsTrigger value="ALL">Barchasi</TabsTrigger>
                <TabsTrigger value="MALE">O'g'il</TabsTrigger>
                <TabsTrigger value="FEMALE">Qiz</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={classFilter} onValueChange={(v) => setClassFilter(v || "ALL")}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Barcha sinflar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Barcha sinflar</SelectItem>
                  {availableClasses.map((c: any) => (
                    <SelectItem key={String(c)} value={String(c)}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Ism yoki ID ni kiriting..."
                  className="w-full pl-8 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>F.I.SH</TableHead>
                  <TableHead>Sinfi</TableHead>
                  <TableHead>Jinsi</TableHead>
                  <TableHead>Tarbiyachi</TableHead>
                  <TableHead>Ball</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student: any) => (
                  <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-primary">{student.studentId}</TableCell>
                    <TableCell className="font-semibold">
                      <button 
                        onClick={() => openHistory(student.id)}
                        className="hover:underline font-semibold flex items-center gap-2 text-left"
                      >
                        {student.cleanName}
                        <History className="w-3 h-3 text-muted-foreground shrink-0" />
                      </button>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">
                      {student.className}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.gender === "MALE" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                      }`}>
                        {student.gender === "MALE" ? "O'g'il" : "Qiz"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.educator?.name || "Biriktirilmagan"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          (student.monthlyScores[0]?.score || 100) > 70 ? "bg-green-500" : 
                          (student.monthlyScores[0]?.score || 100) > 40 ? "bg-yellow-500" : "bg-red-500"
                        }`} />
                        <span className="font-bold">{student.monthlyScores[0]?.score || 100}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => openEdit(student)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>O'quvchi Ma'lumotlarini Tahrirlash</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">F.I.SH</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ID (ST001)</label>
              <Input 
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Jinsi</label>
                <Select 
                  value={formData.gender}
                  onValueChange={(v) => setFormData({...formData, gender: v || ""})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">O'g'il bola</SelectItem>
                    <SelectItem value="FEMALE">Qiz bola</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tarbiyachi</label>
                <Select 
                  value={formData.educatorId}
                  onValueChange={(v) => setFormData({...formData, educatorId: v || ""})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Biriktirilmagan</SelectItem>
                    {educators.filter((e:any) => e.gender === formData.gender).map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saqlanmoqda..." : "O'zgarishlarni Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* History Sheet */}
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
                Ushbu o'quvchidan hali ball ayirilmagan.
              </div>
            ) : (
              activeStudentHistory.map((log: any) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-3 relative overflow-hidden group">
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
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">Tarbiyachi: {log.educator}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs gap-1 border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => handleRevert(log.id)}
                    >
                      <Undo2 className="w-3 h-3" />
                      Qaytarish
                    </Button>
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
