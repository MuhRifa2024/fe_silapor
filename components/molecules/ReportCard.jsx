import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";

export function ReportCard({ kategori, lokasi, status, prioritas, tanggal }) {
  return (
    <Card className="hover:shadow-md transition-all hover:border-ulbi-blue/50 group cursor-pointer h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg group-hover:text-ulbi-blue transition-colors">
            {kategori}
          </CardTitle>
          {prioritas === "tinggi" && (
            <Badge variant="destructive" className="animate-pulse bg-ulbi-orange">
              Eskalasi
            </Badge>
          )}
        </div>
        <CardDescription>{lokasi}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mt-2">
          <Badge 
            variant={status === 'selesai' ? 'success' : status === 'dikerjakan' ? 'warning' : 'default'}
          >
            {status.toUpperCase()}
          </Badge>
          <span className="text-xs text-slate-500">
            {new Date(tanggal).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
