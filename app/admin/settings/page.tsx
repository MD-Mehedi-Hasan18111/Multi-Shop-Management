"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert("Settings updated successfully!");
      } else {
        alert("Failed to update settings.");
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight italic uppercase text-zinc-900">App Settings</h1>
          <p className="text-sm text-zinc-500 font-medium">Configure your ecosystem global details, appearance, and homepage content.</p>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={saving}
          className="rounded-xl px-6 font-bold shadow-lg bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 animate-all"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-blue-600">General</TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-blue-600">Appearance</TabsTrigger>
          <TabsTrigger value="homepage" className="rounded-lg font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-blue-600">Homepage</TabsTrigger>
          <TabsTrigger value="social" className="rounded-lg font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-blue-600">Social Links</TabsTrigger>
          <TabsTrigger value="seo" className="rounded-lg font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-blue-600">SEO Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card className="rounded-2xl border-muted/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">General Information</CardTitle>
              <CardDescription>Basic application details, about us context, and customer contacts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="shopName" className="font-bold text-zinc-700">App Name</Label>
                <Input
                  id="shopName"
                  className="rounded-xl h-11"
                  value={settings?.shopName || ""}
                  onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold text-zinc-700">Contact Email</Label>
                  <Input
                    id="email"
                    className="rounded-xl h-11"
                    type="email"
                    value={settings?.contactInfo?.email || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contactInfo: { ...settings.contactInfo, email: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold text-zinc-700">Phone Number</Label>
                  <Input
                    id="phone"
                    className="rounded-xl h-11"
                    value={settings?.contactInfo?.phone || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contactInfo: { ...settings.contactInfo, phone: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="font-bold text-zinc-700">Address</Label>
                <Textarea
                  id="address"
                  className="rounded-xl"
                  rows={3}
                  value={settings?.contactInfo?.address || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contactInfo: { ...settings.contactInfo, address: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutText" className="font-bold text-zinc-700">App Description / About Us Text</Label>
                <Textarea
                  id="aboutText"
                  className="rounded-xl"
                  rows={4}
                  value={settings?.aboutText || ""}
                  onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card className="rounded-2xl border-muted/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Branding & Styles</CardTitle>
              <CardDescription>Customize the dynamic styling, theme colors, logos, and slider banners of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="font-bold text-zinc-700">Primary Color</Label>
                  <div className="flex gap-3">
                    <Input
                      type="color"
                      id="primaryColor"
                      value={settings?.primaryColor || "#000000"}
                      className="w-12 h-11 p-1 rounded-xl cursor-pointer"
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    />
                    <Input
                      value={settings?.primaryColor || ""}
                      className="rounded-xl h-11 flex-1 font-mono uppercase"
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" className="font-bold text-zinc-700">Secondary Color</Label>
                  <div className="flex gap-3">
                    <Input
                      type="color"
                      id="secondaryColor"
                      value={settings?.secondaryColor || "#ffffff"}
                      className="w-12 h-11 p-1 rounded-xl cursor-pointer"
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    />
                    <Input
                      value={settings?.secondaryColor || ""}
                      className="rounded-xl h-11 flex-1 font-mono uppercase"
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="font-bold text-zinc-700">App Logo (Single Image)</Label>
                  <ImageUpload 
                    isLogo 
                    value={settings?.logo || ""} 
                    onChange={(url) => setSettings({ ...settings, logo: url as string })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-zinc-700">App Banner Slider Images (Multiple)</Label>
                  <ImageUpload 
                    value={settings?.bannerImages || []} 
                    onChange={(urls) => setSettings({ ...settings, bannerImages: urls as string[] })} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homepage" className="mt-6">
          <div className="space-y-6">
            {/* Hero Section Card */}
            <Card className="rounded-2xl border-muted/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Hero Section Management</CardTitle>
                <CardDescription>The very first section users encounter when landing on your site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle" className="font-bold text-zinc-700">Hero Section Title</Label>
                  <Input
                    id="heroTitle"
                    className="rounded-xl h-11"
                    value={settings?.homepage?.heroTitle || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      homepage: { ...(settings.homepage || {}), heroTitle: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroDescription" className="font-bold text-zinc-700">Hero Section Description</Label>
                  <Textarea
                    id="heroDescription"
                    className="rounded-xl"
                    rows={3}
                    value={settings?.homepage?.heroDescription || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      homepage: { ...(settings.homepage || {}), heroDescription: e.target.value }
                    })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heroBtnText" className="font-bold text-zinc-700">CTA Button Text</Label>
                    <Input
                      id="heroBtnText"
                      className="rounded-xl h-11"
                      placeholder="Shop Now"
                      value={settings?.homepage?.heroBtnText || ""}
                      onChange={(e) => setSettings({
                        ...settings,
                        homepage: { ...(settings.homepage || {}), heroBtnText: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroBtnLink" className="font-bold text-zinc-700">CTA Button Redirect Path / URL</Label>
                    <Input
                      id="heroBtnLink"
                      className="rounded-xl h-11"
                      placeholder="/products"
                      value={settings?.homepage?.heroBtnLink || ""}
                      onChange={(e) => setSettings({
                        ...settings,
                        homepage: { ...(settings.homepage || {}), heroBtnLink: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promo Banner Section Card */}
            <Card className="rounded-2xl border-muted/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Promotional Section Banner</CardTitle>
                <CardDescription>Middle promo card section highlighting sales, coupons, or campaigns.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="promoTitle" className="font-bold text-zinc-700">Promo Banner Title</Label>
                      <Input
                        id="promoTitle"
                        className="rounded-xl h-11"
                        value={settings?.homepage?.promoTitle || ""}
                        onChange={(e) => setSettings({
                          ...settings,
                          homepage: { ...(settings.homepage || {}), promoTitle: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promoDiscount" className="font-bold text-zinc-700">Discount Badge Text</Label>
                      <Input
                        id="promoDiscount"
                        className="rounded-xl h-11"
                        placeholder="Up to 50% Off"
                        value={settings?.homepage?.promoDiscount || ""}
                        onChange={(e) => setSettings({
                          ...settings,
                          homepage: { ...(settings.homepage || {}), promoDiscount: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-zinc-700">Promo Banner Background Image</Label>
                    <ImageUpload
                      isLogo
                      value={settings?.homepage?.promoBannerImage || ""}
                      onChange={(url) => setSettings({
                        ...settings,
                        homepage: { ...(settings.homepage || {}), promoBannerImage: url as string }
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promoDescription" className="font-bold text-zinc-700">Promo Description</Label>
                  <Textarea
                    id="promoDescription"
                    className="rounded-xl"
                    rows={3}
                    value={settings?.homepage?.promoDescription || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      homepage: { ...(settings.homepage || {}), promoDescription: e.target.value }
                    })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promoBtnText" className="font-bold text-zinc-700">Promo Button Text</Label>
                    <Input
                      id="promoBtnText"
                      className="rounded-xl h-11"
                      placeholder="Get the Deal"
                      value={settings?.homepage?.promoBtnText || ""}
                      onChange={(e) => setSettings({
                        ...settings,
                        homepage: { ...(settings.homepage || {}), promoBtnText: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promoBtnLink" className="font-bold text-zinc-700">Promo Button Path / URL</Label>
                    <Input
                      id="promoBtnLink"
                      className="rounded-xl h-11"
                      placeholder="/deals"
                      value={settings?.homepage?.promoBtnLink || ""}
                      onChange={(e) => setSettings({
                        ...settings,
                        homepage: { ...(settings.homepage || {}), promoBtnLink: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Core App Features/Benefits Card */}
            <Card className="rounded-2xl border-muted/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">App Features / Value Section</CardTitle>
                <CardDescription>Manage the three value points (like Free Shipping, Secure Payments) displayed to buyers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(settings?.homepage?.features || [
                    { title: "Free Shipping", icon: "Truck", description: "On all orders over BDT 1000" },
                    { title: "24/7 Support", icon: "Clock", description: "Dedicated customer service" },
                    { title: "Secure Payment", icon: "Shield", description: "100% secure payment gateway" }
                  ]).map((feature: any, index: number) => (
                    <div key={index} className="p-4 border rounded-xl space-y-4 bg-zinc-50/50">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-bold text-zinc-700 uppercase tracking-widest text-xs">Feature Point {index + 1}</span>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-zinc-600 text-xs">Title</Label>
                        <Input
                          className="rounded-lg h-9 bg-white"
                          value={feature.title || ""}
                          onChange={(e) => {
                            const currentFeatures = settings.homepage?.features || [
                              { title: "Free Shipping", icon: "Truck", description: "On all orders over BDT 1000" },
                              { title: "24/7 Support", icon: "Clock", description: "Dedicated customer service" },
                              { title: "Secure Payment", icon: "Shield", description: "100% secure payment gateway" }
                            ];
                            const newFeatures = [...currentFeatures];
                            newFeatures[index] = { ...newFeatures[index], title: e.target.value };
                            setSettings({
                              ...settings,
                              homepage: { ...(settings.homepage || {}), features: newFeatures }
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-zinc-600 text-xs">Icon (Lucide name e.g. Truck, Clock, Shield)</Label>
                        <Input
                          className="rounded-lg h-9 bg-white"
                          value={feature.icon || ""}
                          onChange={(e) => {
                            const currentFeatures = settings.homepage?.features || [
                              { title: "Free Shipping", icon: "Truck", description: "On all orders over BDT 1000" },
                              { title: "24/7 Support", icon: "Clock", description: "Dedicated customer service" },
                              { title: "Secure Payment", icon: "Shield", description: "100% secure payment gateway" }
                            ];
                            const newFeatures = [...currentFeatures];
                            newFeatures[index] = { ...newFeatures[index], icon: e.target.value };
                            setSettings({
                              ...settings,
                              homepage: { ...(settings.homepage || {}), features: newFeatures }
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-zinc-600 text-xs">Description</Label>
                        <Textarea
                          className="rounded-lg bg-white"
                          rows={3}
                          value={feature.description || ""}
                          onChange={(e) => {
                            const currentFeatures = settings.homepage?.features || [
                              { title: "Free Shipping", icon: "Truck", description: "On all orders over BDT 1000" },
                              { title: "24/7 Support", icon: "Clock", description: "Dedicated customer service" },
                              { title: "Secure Payment", icon: "Shield", description: "100% secure payment gateway" }
                            ];
                            const newFeatures = [...currentFeatures];
                            newFeatures[index] = { ...newFeatures[index], description: e.target.value };
                            setSettings({
                              ...settings,
                              homepage: { ...(settings.homepage || {}), features: newFeatures }
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <Card className="rounded-2xl border-muted/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Social Links</CardTitle>
              <CardDescription>Links to your social media profiles displayed in footer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {["facebook", "instagram", "twitter", "linkedin"].map((platform) => (
                <div key={platform} className="space-y-2">
                  <Label htmlFor={platform} className="capitalize font-bold text-zinc-700">
                    {platform}
                  </Label>
                  <Input
                    id={platform}
                    className="rounded-xl h-11"
                    placeholder={`https://${platform}.com/ecosystem`}
                    value={settings?.socialLinks?.[platform] || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLinks: { ...settings.socialLinks, [platform]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <Card className="rounded-2xl border-muted/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">SEO Settings</CardTitle>
              <CardDescription>Optimize search engine visibility for the entire platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle" className="font-bold text-zinc-700">Meta Title</Label>
                <Input
                  id="metaTitle"
                  className="rounded-xl h-11"
                  value={settings?.seo?.metaTitle || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, seo: { ...settings.seo, metaTitle: e.target.value } })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription" className="font-bold text-zinc-700">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  className="rounded-xl"
                  rows={4}
                  value={settings?.seo?.metaDescription || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, metaDescription: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
