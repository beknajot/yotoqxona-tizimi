"use client";

import { useState } from "react";
import { 
  Plus, Search, Edit2, Trash2, ListOrdered, 
  Settings2, Hash, ArrowUpDown 
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { addCategoryAction, deleteCategoryAction, updateCategoryAction } from "./actions";

export default function AdminCategoriesClient({ initialCategories }: any) {
  const [categories, setCategories] = useState(initialCategories);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    minPoints: 1,
    maxPoints: 50,
    order: 0
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addCategoryAction(formData);
      toast.success("Kategoriya qo'shildi");
      setIsAddOpen(false);
      window.location.reload();
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
      await updateCategoryAction(selectedCategory.id, formData);
      toast.success("Kategoriya yangilandi");
      setIsEditOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Kategoriyani o'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteCategoryAction(id);
      toast.success("Kategoriya o'chirildi");
      setCategories(categories.filter((c: any) => c.id !== id));
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi");
    }
  };

  const openEdit = (c: any) => {
    setSelectedCategory(c);
    setFormData({
      name: c.name,
      minPoints: c.minPoints,
      maxPoints: c.maxPoints,
      order: c.order
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kategoriyalar</h2>
          <p className="text-muted-foreground">Ball chegirish qoidalari va kategoriyalarini boshqarish.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              Yangi Kategoriya
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yangi Kategoriya Qo'shish</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nomi</label>
                <Input 
                  placeholder="Masalan: Yotoqxonaga beso'roq kirish" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min. Ball</label>
                  <Input 
                    type="number"
                    value={formData.minPoints}
                    onChange={(e) => setFormData({...formData, minPoints: parseInt(e.target.value)})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max. Ball</label>
                  <Input 
                    type="number"
                    value={formData.maxPoints}
                    onChange={(e) => setFormData({...formData, maxPoints: parseInt(e.target.value)})}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tartib raqami (Order)</label>
                <Input 
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                  required 
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[60px] text-center">#</TableHead>
                  <TableHead>Kategoriya Nomi</TableHead>
                  <TableHead className="text-center">Min. Ball</TableHead>
                  <TableHead className="text-center">Max. Ball</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat: any) => (
                  <TableRow key={cat.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center font-mono text-muted-foreground">{cat.order}</TableCell>
                    <TableCell className="font-semibold">{cat.name}</TableCell>
                    <TableCell className="text-center">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">-{cat.minPoints}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">-{cat.maxPoints}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => openEdit(cat)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(cat.id)}
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
            <DialogTitle>Kategoriyani Tahrirlash</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomi</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min. Ball</label>
                <Input 
                  type="number"
                  value={formData.minPoints}
                  onChange={(e) => setFormData({...formData, minPoints: parseInt(e.target.value)})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max. Ball</label>
                <Input 
                  type="number"
                  value={formData.maxPoints}
                  onChange={(e) => setFormData({...formData, maxPoints: parseInt(e.target.value)})}
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tartib raqami (Order)</label>
              <Input 
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                required 
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
