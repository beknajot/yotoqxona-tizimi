import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-muted-foreground animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />
        <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
      </div>
      <p className="text-sm font-medium">Ma'lumotlar yuklanmoqda...</p>
    </div>
  );
}
