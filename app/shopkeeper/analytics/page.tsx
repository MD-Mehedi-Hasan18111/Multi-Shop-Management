import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShopkeeperAnalytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded border-2 border-dashed flex items-center justify-center text-muted-foreground">
              [Chart: Sales Trend Data]
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded border-2 border-dashed flex items-center justify-center text-muted-foreground">
              [List: Popular Items]
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
