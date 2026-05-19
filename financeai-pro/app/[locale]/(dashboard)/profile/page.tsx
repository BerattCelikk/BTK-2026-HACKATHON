"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Settings, Bell, Shield, LogOut } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Profil</h1>
        <p className="text-gray-400 mt-1">Hesap ayarlarınızı yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-400" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Ad</label>
                  <Input placeholder="Adınız" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Soyad</label>
                  <Input placeholder="Soyadınız" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">E-posta</label>
                <Input type="email" placeholder="ornek@email.com" />
              </div>
              <Button>Kaydet</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-400" />
                Finansal Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Aylık Gelir (TL)</label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Risk Profili</label>
                <div className="flex gap-2">
                  {["Düşük", "Orta", "Yüksek", "Çok Yüksek"].map((level) => (
                    <Badge
                      key={level}
                      variant="outline"
                      className="cursor-pointer hover:bg-emerald-600/20 hover:text-emerald-400"
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="outline">Güncelle</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-emerald-400" />
                Bildirimler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Haftalık rapor", "Limit uyarıları", "Yatırım fırsatları"].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{item}</span>
                  <Badge variant="secondary" className="text-xs">Açık</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                Güvenlik
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-sm">
                Şifre Değiştir
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm text-red-400">
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış Yap
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
