import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ShopkeeperProfile() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Shop Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
          <CardDescription>This information will be displayed to customers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop-name">Store Name</Label>
            <Input id="shop-name" placeholder="Enter store name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-description">About Your Store</Label>
            <Textarea id="shop-description" placeholder="Write something about your brand..." rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-email">Business Email</Label>
            <Input id="shop-email" type="email" placeholder="shop@example.com" />
          </div>
          <Button>Save Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
