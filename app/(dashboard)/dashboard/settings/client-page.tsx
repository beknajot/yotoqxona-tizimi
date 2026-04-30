"use client";

import { useState } from "react";
import { Lock, UserCircle, Save, ShieldCheck, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { updateProfilePasswordAction, updateProfileLoginAction } from "./actions";
import { useTheme } from "next-themes";

export default function SettingsClient({ user }: any) {
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [loginData, setLoginData] = useState({
    currentPass: "",
    newLogin: ""
  });

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      return toast.error("Yangi parollar mos kelmadi!");
    }

    setLoading(true);
    try {
      const res = await updateProfilePasswordAction(passData.current, passData.new);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Parol muvaffaqiyatli yangilandi!");
        setPassData({ current: "", new: "", confirm: "" });
      }
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfileLoginAction(loginData.currentPass, loginData.newLogin);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Login muvaffaqiyatli yangilandi! Tizimga qayta kirishingiz mumkin.");
        setLoginData({ currentPass: "", newLogin: "" });
        // Optionally redirect to login, but let's keep them here.
      }
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sozlamalar</h2>
        <p className="text-muted-foreground">Shaxsiy ma'lumotlar va xavfsizlik.</p>
      </div>

      {/* Theme Card */}
      <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            Ko'rinish rejimi
          </CardTitle>
          <CardDescription>Tizimning kunduzgi yoki tungi ko'rinishini tanlang.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: "Kunduzgi", Icon: Sun },
              { value: "dark",  label: "Tungi",    Icon: Moon },
              { value: "system",label: "Avtomatik",Icon: Monitor },
            ].map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  theme === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:border-muted-foreground hover:bg-muted text-muted-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  theme === value ? "scale-110" : ""
                }`} />
                <span className="text-xs font-medium">{label}</span>
                {theme === value && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-primary" />
            Profil Ma'lumotlari
          </CardTitle>
          <CardDescription>Sizning tizimdagi asosiy ma'lumotlaringiz.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Ismingiz:</span>
              <p className="font-semibold text-lg">{user.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Rolingiz:</span>
              <p className="font-semibold text-lg">{user.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Loginni O'zgartirish
          </CardTitle>
          <CardDescription>Tizimga kirish uchun foydalaniladigan loginingizni o'zgartirishingiz mumkin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLoginUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Yangi Login</label>
                <Input 
                  type="text" 
                  placeholder="Yangi login..." 
                  value={loginData.newLogin}
                  onChange={(e) => setLoginData({...loginData, newLogin: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tasdiqlash uchun parolingiz</label>
                <Input 
                  type="password" 
                  placeholder="Hozirgi parolingiz..." 
                  value={loginData.currentPass}
                  onChange={(e) => setLoginData({...loginData, currentPass: e.target.value})}
                  required 
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2">
              <Save className="w-4 h-4" />
              {loading ? "Yangilanmoqda..." : "Yangi loginni saqlash"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Parolni O'zgartirish
          </CardTitle>
          <CardDescription>Xavfsizlikni ta'minlash uchun parolingizni muntazam yangilab turing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hozirgi parol</label>
              <Input 
                type="password" 
                placeholder="********" 
                value={passData.current}
                onChange={(e) => setPassData({...passData, current: e.target.value})}
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Yangi parol</label>
                <Input 
                  type="password" 
                  placeholder="Yangi..." 
                  value={passData.new}
                  onChange={(e) => setPassData({...passData, new: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parolni tasdiqlang</label>
                <Input 
                  type="password" 
                  placeholder="Qayta..." 
                  value={passData.confirm}
                  onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                  required 
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2">
              <Save className="w-4 h-4" />
              {loading ? "Yangilanmoqda..." : "Yangi parolni saqlash"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
