"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Edit2, Trash2, GripVertical, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Tip tanımlamaları (Veritabanımıza uygun)
type Category = {
  id: string
  name: any // jsonb olduğu için
  is_active: boolean
  order_index: number
}

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Overlay (Sheet) Kontrolü
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Form State
  const [formData, setFormData] = useState({ nameTr: "", nameEn: "" })

  // Verileri Çek
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    // Burada kendi 'restaurant_id'mizi dinamik alacağız, şimdilik statik düşünelim
    // Gerçek senaryoda: const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })

    if (data) setCategories(data)
    setLoading(false)
  }

  const handleSave = async () => {
    // Kaydetme mantığı (Insert veya Update)
    // Şimdilik sadece konsola yazdıralım
    console.log("Kaydedilecek veri:", formData)
    
    // İşlem bitince paneli kapat ve yenile
    setIsSheetOpen(false)
    fetchCategories()
  }

  const openNewCategory = () => {
    setEditingCategory(null)
    setFormData({ nameTr: "", nameEn: "" })
    setIsSheetOpen(true)
  }

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat)
    // JSONB içinden dilleri çekiyoruz
    setFormData({ 
      nameTr: cat.name?.tr || "", 
      nameEn: cat.name?.en || "" 
    })
    setIsSheetOpen(true)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      
      {/* Üst Başlık ve Ekle Butonu */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menü Yönetimi</h1>
          <p className="text-muted-foreground">Kategorileri ve ürünleri buradan yönetin.</p>
        </div>
        <Button onClick={openNewCategory} className="bg-black hover:bg-gray-800 text-white">
          <Plus className="mr-2 h-4 w-4" /> Kategori Ekle
        </Button>
      </div>

      {/* Kategori Listesi (Kartlar) */}
      <div className="grid gap-4">
        {loading ? <p>Yükleniyor...</p> : categories.map((cat) => (
          <Card key={cat.id} className="group hover:border-black transition-colors">
            <CardContent className="flex items-center p-4">
              {/* Sürükleme Kulpu */}
              <div className="cursor-grab p-2 text-gray-400 hover:text-black">
                <GripVertical size={20} />
              </div>

              {/* Resim Alanı (Placeholder) */}
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <ImageIcon size={20} className="text-gray-400" />
              </div>

              {/* İsim ve Durum */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{cat.name?.tr || "İsimsiz"}</h3>
                <div className="flex gap-2 text-sm text-gray-500">
                  <span>{cat.name?.en || "No English"}</span>
                  {cat.is_active ? (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Aktif</Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600">Pasif</Badge>
                  )}
                </div>
              </div>

              {/* Aksiyonlar */}
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEditCategory(cat)}>
                  <Edit2 size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                  <Trash2 size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- SAĞDAN AÇILAN OVERLAY (SHEET) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Oluştur"}
            </SheetTitle>
            <SheetDescription>
              Kategori detaylarını ve çevirilerini buradan yönetebilirsiniz.
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-6 py-6">
            {/* Türkçe İsim */}
            <div className="grid gap-2">
              <Label htmlFor="nameTr">Kategori Adı (Türkçe)</Label>
              <Input 
                id="nameTr" 
                value={formData.nameTr} 
                onChange={(e) => setFormData({...formData, nameTr: e.target.value})}
                placeholder="Örn: Çorbalar" 
              />
            </div>

            {/* İngilizce İsim */}
            <div className="grid gap-2">
              <Label htmlFor="nameEn">Kategori Adı (İngilizce)</Label>
              <Input 
                id="nameEn" 
                value={formData.nameEn} 
                onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                placeholder="Ex: Soups" 
              />
            </div>

            {/* Resim Yükleme Alanı (Gelecek Adımda Aktif Edeceğiz) */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition">
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">Resim yüklemek için tıklayın</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
               <Label>Aktif mi?</Label>
               {/* Buraya Switch component gelecek */}
            </div>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">İptal</Button>
            </SheetClose>
            <Button onClick={handleSave} className="bg-black text-white">
              {editingCategory ? "Değişiklikleri Kaydet" : "Oluştur"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
