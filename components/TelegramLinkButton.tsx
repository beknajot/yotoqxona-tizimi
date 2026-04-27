"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send } from "lucide-react";

export function TelegramLinkButton({ userId, isStudent }: { userId: string, isStudent: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleLink = async () => {
    setLoading(true);
    try {
      // API orqali backendga murojaat qilib, yangi linkingCode olamiz
      const res = await fetch("/api/telegram-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isStudent }),
      });

      if (!res.ok) throw new Error("Xatolik yuz berdi");

      const { link } = await res.json();
      
      // Yangi oynada Telegram botni ochamiz
      window.open(link, "_blank");
      toast.success("Telegram bot ochildi! Start tugmasini bosing.");
    } catch (error) {
      toast.error("Telegram botga ulanishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleLink} 
      disabled={loading}
      variant="outline"
      className="gap-2 border-[#229ED9] text-[#229ED9] hover:bg-[#229ED9] hover:text-white"
    >
      <Send className="w-4 h-4" />
      {loading ? "Ulanmoqda..." : "Telegram bilan bog'lash"}
    </Button>
  );
}
