import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  borderTopColor, 
  valueColorClass, 
  iconColorClass,
  titleColorClass = "text-slate-500" 
}) {
  return (
    <Card className={`${borderTopColor ? `border-t-4 ${borderTopColor}` : ''} shadow-sm`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-sm ${titleColorClass}`}>{title}</CardTitle>
        {Icon && <Icon className={`h-4 w-4 ${iconColorClass}`} />}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl sm:text-3xl font-bold ${valueColorClass || 'text-slate-800 dark:text-slate-100'}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
