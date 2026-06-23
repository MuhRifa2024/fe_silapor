import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { AlertTriangle } from "lucide-react";

export function TaskCard({ id, kategori, lokasi, batas_waktu, prioritas }) {
  return (
    <Card className="shadow-sm border-t-4 border-t-slate-200 hover:border-t-ulbi-orange transition-colors">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Tugas #{id} - {kategori}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" /> Batas: {batas_waktu}
            </CardDescription>
          </div>
          {prioritas === "tinggi" && <Badge className="bg-red-500">URGENT</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium mb-4">Lokasi: {lokasi}</p>
        <div className="flex gap-2">
          <Button className="flex-1 bg-ulbi-blue hover:bg-ulbi-blue/90 text-white">Update Status</Button>
          <Button variant="outline" className="flex-1">Lihat Detail</Button>
        </div>
      </CardContent>
    </Card>
  );
}
