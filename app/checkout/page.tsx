import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Truck, ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-center">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Truck className="h-6 w-6" /> Shipping Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input placeholder="Doe" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Address</Label>
                <Input placeholder="123 Street Address" />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="New York" />
              </div>
              <div className="space-y-2">
                <Label>Zip Code</Label>
                <Input placeholder="10001" />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6" /> Payment Method
            </h2>
            <RadioGroup defaultValue="card" className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                <Label
                  htmlFor="card"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <CreditCard className="mb-3 h-6 w-6" />
                  Card
                </Label>
              </div>
              <div>
                <RadioGroupItem value="paypal" id="paypal" className="peer sr-only" />
                <Label
                  htmlFor="paypal"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="font-bold mb-3">PayPal</span>
                  Paypal
                </Label>
              </div>
              <div>
                <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                <Label
                  htmlFor="cod"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="font-bold mb-3 text-lg">💵</span>
                  Cash on Delivery
                </Label>
              </div>
            </RadioGroup>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-2 border-primary/10">
            <CardHeader>
              <CardTitle>Your Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                     <span>Premium Leather Bag x 1</span>
                     <span>$120.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span>Organic T-Shirt x 2</span>
                     <span>$50.00</span>
                  </div>
               </div>
               <Separator />
               <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>$170.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span>$170.00</span>
                  </div>
               </div>
            </CardContent>
            <CardContent className="pt-0 space-y-4">
                <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Secure encrypted checkout
                </div>
                <Button className="w-full py-6 font-bold text-lg">Place Order</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
