"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Fingerprint } from "lucide-react";
import { toast } from "sonner";

interface DeductModalProps {
  students: { id: string; name: string }[];
  children?: React.ReactNode;
  onDeduct?: (studentId: string, amount: number, category: string, comment: string) => void;
}

const CATEGORIES = [
  { id: "1", name: "Nazarda tutilmagan intizom buzilishi", min: 1, max: 50 },
  { id: "2", name: "Yotoqxonadan vaqtincha ketish haqida ogohlantirmaslik", min: 30, max: 30 },
  { id: "3", name: "Yotoqxona va maktab hududidan beso'roq chiqish", min: 30, max: 30 },
  { id: "4", name: "Yotoqxonaga beso'roq kirish", min: 10, max: 10 },
  { id: "5", name: "O'g'rilik qilish", min: 60, max: 60 },
  { id: "6", name: "Mushtlashish", min: 50, max: 50 },
  { id: "7", name: "Haqorat qilish, jargon so'zlarni ishlatish, so'kinish", min: 15, max: 15 },
  { id: "8", name: "Tartibsizlik uchun", min: 15, max: 15 },
  { id: "9", name: "Yotoqxonaga ta'qiqlangan narsa (yegulik, gadjet)lar olib kirish", min: 15, max: 15 },
  { id: "10", name: "Yolg'on gapirish", min: 15, max: 15 },
  { id: "11", name: "Belgilanmagan xonada yotish", min: 15, max: 15 },
  { id: "12", name: "Yotoqxona binosiga va mulkiga zarar yetkazish", min: 5, max: 40 },
  { id: "13", name: "Maktab binosiga va mulkiga zarar yetkazish", min: 5, max: 40 },
  { id: "14", name: "Maktab foyesida va sinf xonalarida sport va gadjet o'yinlarini o'ynash", min: 10, max: 10 },
  { id: "15", name: "Maktabga ta'qiqlangan yegulik olib kirish", min: 15, max: 15 },
  { id: "16", name: "Belgilanmagan vaqtda gadjetlardan foydalanish", min: 15, max: 15 },
  { id: "17", name: "Belgilangan vaqtda sababsiz uhlamaslik va uyg'onmaslik", min: 10, max: 10 },
  { id: "18", name: "Navbatchilikni sababsiz o'z vaqtida qilmaslik", min: 10, max: 10 },
];

export function DeductModal({ students, children, onDeduct }: DeductModalProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState(
    students.length === 1 ? students[0].id : ""
  );
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [points, setPoints] = React.useState<number | "">("");
  const [comment, setComment] = React.useState("");

  const activeCategory = CATEGORIES.find(c => c.id === selectedCategory);
  
  const isRange = activeCategory ? activeCategory.min !== activeCategory.max : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() === "") {
      toast.error("Izoh yozilishi majburiy!");
      return;
    }
    
    let deducted = points;
    if (!isRange && activeCategory) {
      deducted = activeCategory.max;
    }

    if (!deducted || Number(deducted) <= 0) {
      toast.error("Iltimos, ayiriladigan ballni kiriting!");
      return;
    }

    const amount = Number(deducted);
    const sName = students.find(s => s.id === selectedStudent)?.name || "O'quvchi";

    if (onDeduct) {
      onDeduct(selectedStudent, amount, activeCategory?.name || "Noma'lum", comment);
    }

    toast.success(`Muvaffaqiyatli! ${sName}dan ${amount} ball ayirildi.`);
    setOpen(false);
    
    // Formni tozalash
    if (students.length > 1) {
      setSelectedStudent("");
    }
    setSelectedCategory("");
    setPoints("");
    setComment("");
  };

  const currentDate = new Date().toLocaleString('uz-UZ', { 
    year: 'numeric', month: 'long', day: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        className={children 
          ? "text-sm text-destructive hover:underline cursor-pointer bg-transparent border-none p-0 inline" 
          : "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 h-9 px-4 py-2"
        }
      >
        {children || (
          <>
            <AlertTriangle className="w-4 h-4" />
            Ball Ayirish
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Axloqiy ball ayirish</DialogTitle>
          <DialogDescription>
            Qoidabuzarlik turini tanlang, tasdiqlang va izoh yozing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted p-2 rounded-md">
          <span><strong>Sana:</strong> {currentDate}</span>
          <span><strong>Tarbiyachi:</strong> Hozirgi foydalanuvchi</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-4">
            
            {/* O'quvchi */}
            {students.length === 1 ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tanlangan O'quvchi</label>
                <Input 
                  value={`${students[0].name} (${students[0].id})`} 
                  disabled 
                  className="w-full bg-muted font-medium text-foreground opacity-100" 
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">O'quvchini tanlang</label>
                <Select value={selectedStudent} onValueChange={(val) => setSelectedStudent(val || "")} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="O'quvchini tanlang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Kategoriya */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Qoidabuzarlik</label>
              <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || "")} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Kategoriyani tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.min === c.max ? c.min : `${c.min}-${c.max}`} ball)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ball */}
            {activeCategory && isRange && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <label className="text-sm font-medium">Qancha ball ayirmoqchisiz?</label>
                <Input 
                  type="number" 
                  min={activeCategory.min} 
                  max={activeCategory.max} 
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  placeholder={`${activeCategory.min} dan ${activeCategory.max} gacha kiriting`}
                  required
                />
              </div>
            )}
            
            {activeCategory && !isRange && (
               <div className="text-sm text-destructive font-medium border border-destructive/20 bg-destructive/10 p-3 rounded-lg flex items-center">
                 <AlertTriangle className="w-4 h-4 mr-2" />
                 Ushbu qoidabuzarlik uchun avtomatik ravishda qat'iy {activeCategory.max} ball ayiriladi!
               </div>
            )}

            {/* Izoh */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Izoh (majburiy)</label>
              <Input 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                placeholder="Vaziyatni qisqacha yozing..."
                required
              />
            </div>
            
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Yopish</Button>
            <Button type="submit" variant="destructive">Tasdiqlash</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
