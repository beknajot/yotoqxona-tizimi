"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Fingerprint } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await loginAction(login, password);
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success("Muvaffaqiyatli kirdingiz!");
        if (result.role === "ADMIN") {
          router.push("/admin");
        } else if (result.role === "STUDENT") {
          router.push("/student-dashboard"); // Student dashboard hali mavjud emas
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      toast.error("Tizimga ulanishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="max-w-md w-full" style={{ viewTransitionName: "card" }}>
        <Card className="border-none shadow-2xl bg-background/50 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center pb-8">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Fingerprint className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Tizimga kirish</CardTitle>
            <CardDescription className="text-base">
              Yotoqxona axloqiy ball tizimi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="login"
                  placeholder="ID (ST001) yoki Login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                  className="h-12 px-4 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolni kiriting..."
                  required
                  className="h-12 px-4 shadow-sm"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-md font-medium mt-6 shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
                disabled={loading}
              >
                {loading ? "Tekshirilmoqda..." : "Kirish"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground pt-4">
            Parolni unutdingizmi? Tarbiyachiga murojaat qiling
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
