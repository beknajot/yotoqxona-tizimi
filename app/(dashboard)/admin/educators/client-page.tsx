"use client";

import { useState } from "react";
import { 
  Plus, Search, Edit2, Trash2, ShieldCheck, 
  Key, UserCheck, Mail, UserCircle, Users 
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  addEducatorAction, deleteEducatorAction, 
  updateEducatorAction, updateEducatorPasswordAction 
} from "./actions";

export default function AdminEducatorsClient({ initialEducators }: any) {
  const [educators, setEducators] = useState(initialEducators);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPassOpen, setIsPassOpen] = useState(false);
  const [selectedEducator, setSelectedEducator] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    login: "",
    password: "",
    gender: "MALE"
  });
  const [newPassword, setNewPassword] = useState("");

  const filteredEducators = educators.filter((e: any) => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.login.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addEducatorAction(formData);
      toast.success("Tarbiyachi qo'shildi");
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
      await updateEducatorAction(selectedEducator.id, {
        name: formData.name,
        login: formData.login,
        gender: formData.gender
      });
      toast.success("Ma'lumotlar yangilandi");
      setIsEditOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handlePassUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateEducatorPasswordAction(selectedEducator.id, newPassword);
      toast.success("Parol o'zgartirildi");
      setIsPassOpen(false);
      setNewPassword("");
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tarbiyachini o'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteEducatorAction(id);
      toast.success("Tarbiyachi o'chirildi");
      setEducators(educators.filter((e: any) => e.id !== id));
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const openEdit = (e: any) => {
    setSelectedEducator(e);
    setFormData({
      name: e.name,
      login: e.login,
      password: "",
      gender: e.gender
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tarbiyachilar Boshqaruvi</h2>
          <p className="text-muted-foreground">Tarbiyachilarni qo'shish va ularning ruxsatlarini boshqarish.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Yangi Tarbiyachi
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yangi Tarbiyachi Qo'shish</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ismi</label>
                <Input 
                  placeholder="Rustam aka" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Login</label>
                <Input 
                  placeholder="rustam_1" 
                  value={formData.login}
                  onChange={(e) => setFormData({...formData, login: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parol</label>
                <Input 
                  type="password"
                  placeholder="******" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
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
                    <SelectItem value="MALE">Erkak (O'g'il bolalar tarbiyachisi)</SelectItem>
                    <SelectItem value="FEMALE">Ayol (Qiz bolalar tarbiyachisi)</SelectItem>
                  </SelectContent>
                </Select>
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

      <div className="grid gap-6 md:grid-cols-4">
        {filteredEducators.map((educator: any) => (
          <Card key={educator.id} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-background/50 backdrop-blur-md">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${
              educator.gender === "MALE" ? "bg-blue-500" : "bg-pink-500"
            }`} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${
                  educator.gender === "MALE" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"
                }`}>
                  <UserCircle className="w-6 h-6" />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => openEdit(educator)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(educator.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-4">{educator.name}</CardTitle>
              <p className="text-xs text-muted-foreground font-mono">@{educator.login}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm py-2 border-y border-muted/50">
                <span className="text-muted-foreground">O'quvchilar:</span>
                <span className="font-bold flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {educator._count.students} ta
                </span>
              </div>
              <Button 
                variant="outline" 
                className="w-full gap-2 text-xs" 
                onClick={() => { setSelectedEducator(educator); setIsPassOpen(true); }}
              >
                <Key className="w-3 h-3" />
                Parolni o'zgartirish
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Password Dialog */}
      <Dialog open={isPassOpen} onOpenChange={setIsPassOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Parolni Yangilash</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePassUpdate} className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              <b>{selectedEducator?.name}</b> uchun yangi parol o'rnating.
            </p>
            <Input 
              type="password" 
              placeholder="Yangi parol..." 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required 
            />
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Yangilanmoqda..." : "Parolni Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tarbiyachi Ma'lumotlari</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ismi</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Login</label>
              <Input 
                value={formData.login}
                onChange={(e) => setFormData({...formData, login: e.target.value})}
                required 
              />
            </div>
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
                  <SelectItem value="MALE">Erkak</SelectItem>
                  <SelectItem value="FEMALE">Ayol</SelectItem>
                </SelectContent>
              </Select>
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
