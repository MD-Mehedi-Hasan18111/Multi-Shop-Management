import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ShopkeeperOrders() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Incoming Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">#ORD-8821</TableCell>
                <TableCell>Sarah Jenkins</TableCell>
                <TableCell>May 14, 2024</TableCell>
                <TableCell>2 Items</TableCell>
                <TableCell><Badge variant="secondary">Processing</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">Update Status</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
