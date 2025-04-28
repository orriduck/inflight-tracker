import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
    title: string;
    unit?: string;
    value: number;
    icon: React.ReactNode;
}

export default function MetricCard({ title, unit, value, icon }: MetricCardProps) {
    return (
        <Card className="w-full">
            <CardHeader className="text-center">
                <CardTitle className="flex flex-wrap gap-1 items-center justify-center">
                    { icon }
                    { title }
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1 items-end justify-center">
                <div className="text-4xl">{ value }</div>
                { unit }
            </CardContent>
        </Card>
    );
}