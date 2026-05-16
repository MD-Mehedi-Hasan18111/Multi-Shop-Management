"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X, Globe, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function ShopkeeperProfile() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [form, setForm] = useState({
    shopName: "",
    logo: "",
    aboutText: "",
    bannerImages: [] as string[],
    contactInfo: {
      email: "",
      phone: "",
      address: "",
    },
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
    }
  });

  useEffect(() => {
    fetch("/api/shopkeeper/settings")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setForm(prev => ({
            ...prev,
            ...data,
            contactInfo: { ...prev.contactInfo, ...data.contactInfo },
            socialLinks: { ...prev.socialLinks, ...data.socialLinks }
          }));
        }
      })
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id.startsWith("contact-")) {
      const field = id.replace("contact-", "");
      setForm(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, [field]: value } }));
    } else if (id.startsWith("social-")) {
      const field = id.replace("social-", "");
      setForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [field]: value } }));
    } else {
      setForm(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (type === 'logo') setUploadingLogo(true);
      else setUploadingBanner(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (type === 'logo') {
          setForm(prev => ({ ...prev, logo: data.secure_url }));
        } else {
          setForm(prev => ({ ...prev, bannerImages: [...prev.bannerImages, data.secure_url] }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingLogo(false);
      setUploadingBanner(false);
    }
  };

  const handleRemoveBanner = (index: number) => {
    setForm(prev => ({
      ...prev,
      bannerImages: prev.bannerImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shopkeeper/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">Shop Profile</h1>
          <p className="text-zinc-500">Customize how your store appears to customers.</p>
        </div>
        <div>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={loading}
            className="h-14 px-8 rounded-full shadow-2xl shadow-blue-600/30 hover:scale-105 transition-transform"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Basic Info */}
          <Card className="border-none shadow-xl shadow-zinc-200/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" /> Store Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="shopName">Store Name</Label>
                <Input id="shopName" value={form.shopName} onChange={handleChange} placeholder="e.g. Urban Essentials" className="h-12 text-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutText">About Your Store</Label>
                <Textarea id="aboutText" value={form.aboutText} onChange={handleChange} placeholder="Tell your story..." rows={6} />
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="border-none shadow-xl shadow-zinc-200/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" /> Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Business Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input id="contact-email" value={form.contactInfo.email} onChange={handleChange} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Business Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input id="contact-phone" value={form.contactInfo.phone} onChange={handleChange} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact-address">Business Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input id="contact-address" value={form.contactInfo.address} onChange={handleChange} className="pl-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="border-none shadow-xl shadow-zinc-200/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-800" /> Social Presence
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="social-facebook">Facebook URL</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input id="social-facebook" value={form.socialLinks.facebook} onChange={handleChange} className="pl-10" placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="social-instagram">Instagram URL</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input id="social-instagram" value={form.socialLinks.instagram} onChange={handleChange} className="pl-10" placeholder="https://..." />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Logo Upload */}
          <Card className="border-none shadow-xl shadow-zinc-200/50 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400">Store Logo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-3xl bg-zinc-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-zinc-200 group">
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-zinc-300 group-hover:text-blue-600 transition-colors" />
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleImageUpload(e, 'logo')}
                  disabled={uploadingLogo}
                />
                {uploadingLogo && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-500 text-center">Click to upload. PNG/JPG, 512x512 recommended.</p>
            </CardContent>
          </Card>

          {/* Banners */}
          <Card className="border-none shadow-xl shadow-zinc-200/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400">Store Banners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video rounded-2xl bg-zinc-100 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 group">
                <Upload className="h-6 w-6 text-zinc-300 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-medium mt-2 text-zinc-400">Add Banner Image</span>
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleImageUpload(e, 'banner')}
                  disabled={uploadingBanner}
                />
                {uploadingBanner && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {form.bannerImages.map((banner, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden border group">
                    <img src={banner} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveBanner(i)}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
