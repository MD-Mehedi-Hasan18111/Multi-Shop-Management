import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Shop Manager team.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tight">Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          Have a question or feedback? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <Card className="rounded-3xl border-none shadow-xl">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-2xl font-bold">Send a Message</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Tell us how we can help..."
                />
              </div>
              <Button className="w-full h-12 rounded-xl font-bold text-lg">
                <Send className="mr-2 h-5 w-5" /> Send Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Get in Touch</h2>
          <div className="space-y-4">
            {[
              { icon: Mail, title: "Email", value: "mdmehedihasan18111@gmail.com" },
              { icon: Phone, title: "Phone", value: "+8801856943601" },
              { icon: MapPin, title: "Address", value: "Block - A, Road - 1, Halishahar, Chattogram" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-5 rounded-2xl bg-muted/50 border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-muted-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Card className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Business Hours</h3>
              <div className="space-y-1 text-white/80 text-sm">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
