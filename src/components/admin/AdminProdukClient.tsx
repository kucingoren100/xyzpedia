"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  X,
  ExternalLink,
  Edit2,
  Check,
  TrendingUp,
  DollarSign,
  Tag,
  ShieldCheck,
  Zap,
  Image as ImageIcon,
  Upload,
  Info,
  Sliders,
  Clock,
} from "lucide-react";
import AdminTopbar from "./AdminTopbar";
import { compressImageClient } from "@/lib/imageCompressor";

interface ProductItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  originalPrice: number | null;
  supplierPrice: number | null;
  discountPercent: number | null;
  stockStatus: string;
  bonusText: string | null;
  order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  developer: string | null;
  thumbnailUrl: string;
  bannerUrl: string | null;
  categorySlug: string;
  badgeText: string | null;
  badgeColor: string | null;
  requiresServer: boolean;
  targetInputLabel: string;
  targetInputPlaceholder: string;
  serverInputPlaceholder: string | null;
  instructions: string | null;
  importantNotice?: string | null;
  warrantyTerms?: string | null;
  additionalNotes?: string | null;
  isPopular: boolean;
  isActive: boolean;
  category: {
    name: string;
    slug: string;
  };
  items: ProductItem[];
}

interface Category {
  name: string;
  slug: string;
}

interface AdminProdukClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function AdminProdukClient({
  initialProducts,
  categories,
}: AdminProdukClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Manage Product Modal State
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [modalTab, setModalTab] = useState<"variants" | "image_info" | "notices">("variants");
  const [modalLoading, setModalLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [syncingApi, setSyncingApi] = useState(false);
  const [syncingDigi, setSyncingDigi] = useState(false);

  // Sync products & prices directly from Digiflazz H2H API
  const handleSyncDigiflazz = async () => {
    if (
      !confirm(
        "Tarik dan petakan seluruh produk & harga modal terbaru dari Digiflazz ke katalog database sekarang?"
      )
    ) {
      return;
    }
    setSyncingDigi(true);
    try {
      const res = await fetch("/api/admin/products/sync-digiflazz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markupPercent: 8 }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchProducts(selectedCategory, searchQuery);
      } else {
        alert("Gagal sinkronisasi Digiflazz: " + (data.message || data.error));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + (err?.message || "Koneksi gagal"));
    } finally {
      setSyncingDigi(false);
    }
  };

  // Inline Variant Edit States
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editSupplierPrice, setEditSupplierPrice] = useState("");
  const [editOriginalPrice, setEditOriginalPrice] = useState("");

  // Product Image & Info Edit States
  const [editProdName, setEditProdName] = useState("");
  const [editProdThumbnail, setEditProdThumbnail] = useState("");
  const [editProdBanner, setEditProdBanner] = useState("");
  const [editProdDeveloper, setEditProdDeveloper] = useState("");
  const [editProdTagline, setEditProdTagline] = useState("");
  const [editProdDescription, setEditProdDescription] = useState("");
  const [editProdTargetLabel, setEditProdTargetLabel] = useState("");
  const [editProdInstructions, setEditProdInstructions] = useState("");
  const [editProdImportantNotice, setEditProdImportantNotice] = useState("");
  const [editProdWarrantyTerms, setEditProdWarrantyTerms] = useState("");
  const [editProdAdditionalNotes, setEditProdAdditionalNotes] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Create New Product Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState(categories[0]?.slug || "game-topup");
  const [newProdDeveloper, setNewProdDeveloper] = useState("");
  const [newProdThumbnail, setNewProdThumbnail] = useState("/images/games/mobile-legends.webp");
  const [newProdTagline, setNewProdTagline] = useState("");
  const [newProdDescription, setNewProdDescription] = useState("");
  const [newProdRequiresServer, setNewProdRequiresServer] = useState(false);
  const [newProdTargetLabel, setNewProdTargetLabel] = useState("User ID");
  const [newProdVariantName, setNewProdVariantName] = useState("Paket Utama");
  const [newProdVariantSupplierPrice, setNewProdVariantSupplierPrice] = useState("");
  const [newProdVariantPrice, setNewProdVariantPrice] = useState("");
  const [newProdVariantOriginalPrice, setNewProdVariantOriginalPrice] = useState("");
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isUploadingNewImage, setIsUploadingNewImage] = useState(false);
  const newImageFileRef = useRef<HTMLInputElement>(null);

  // Add Variant for Manual Products States
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantPrice, setNewVariantPrice] = useState("");
  const [newVariantSupplierPrice, setNewVariantSupplierPrice] = useState("");
  const [newVariantOriginalPrice, setNewVariantOriginalPrice] = useState("");
  const [newVariantStock, setNewVariantStock] = useState("AVAILABLE");
  const [isSubmittingVariant, setIsSubmittingVariant] = useState(false);

  // Helper: Cek apakah produk ditambahkan secara manual mandiri (bukan dari API supplier)
  const isManualProduct = (prod: Product | null): boolean => {
    if (!prod) return false;
    if (!prod.items || prod.items.length === 0) return true;
    if (prod.items.some((it) => it.sku?.startsWith("CUSTOM-") || it.sku?.startsWith("SKU-") || it.sku?.startsWith("MANUAL-"))) {
      return true;
    }
    const hasApiNumericSku = prod.items.some((it) => it.sku && /^\d+$/.test(it.sku));
    return !hasApiNumericSku;
  };

  // Sync supplier prices directly from Waroengkuy API
  const handleSyncApiPrices = async () => {
    if (
      !confirm(
        "Sinkronkan seluruh harga modal supplier dan status stok dengan API resmi Waroengkuy?"
      )
    ) {
      return;
    }
    setSyncingApi(true);
    try {
      const res = await fetch("/api/admin/products/sync-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        alert(
          data.message ||
            `Berhasil mensinkronkan ${data.totalUpdated} harga supplier dari API!`
        );
        fetchProducts(selectedCategory, searchQuery);
      } else {
        alert("Gagal sinkronisasi: " + (data.error || data.message));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + (err?.message || "Koneksi gagal"));
    } finally {
      setSyncingApi(false);
    }
  };

  // Refresh products list from API
  const fetchProducts = async (cat = selectedCategory, search = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat !== "ALL") params.set("category", cat);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchProducts(cat, searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(selectedCategory, searchQuery);
  };

  // 1-Click Toggle Active Status (ONLINE / OFFLINE)
  const handleToggleActive = async (prod: Product) => {
    const nextStatus = !prod.isActive;
    try {
      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, isActive: nextStatus } : p))
        );
        if (activeProduct?.id === prod.id) {
          setActiveProduct({ ...activeProduct, isActive: nextStatus });
        }
        setActionMsg(
          nextStatus
            ? `✓ Produk "${prod.name}" sekarang ONLINE (aktif & tampil di katalog pembeli).`
            : `✓ Produk "${prod.name}" sekarang OFFLINE (dinonaktifkan & disembunyikan dari pembeli).`
        );
      }
    } catch {
      alert("Gagal mengubah status aktif produk.");
    }
  };

  // Toggle Stock Status on Item (AVAILABLE <-> OUT_OF_STOCK)
  const handleToggleStock = async (item: ProductItem) => {
    if (!activeProduct) return;
    const nextStatus = item.stockStatus === "AVAILABLE" ? "OUT_OF_STOCK" : "AVAILABLE";

    try {
      const res = await fetch(`/api/admin/products/${activeProduct.id}/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockStatus: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedItems = activeProduct.items.map((i) =>
          i.id === item.id ? { ...i, stockStatus: nextStatus } : i
        );
        const updatedProd = { ...activeProduct, items: updatedItems };
        setActiveProduct(updatedProd);
        setProducts((prev) =>
          prev.map((p) => (p.id === activeProduct.id ? updatedProd : p))
        );
      }
    } catch {
      alert("Gagal memperbarui status stok.");
    }
  };

  // Save Inline Edit (Price, Supplier Cost, Original/Strikethrough Price, Name)
  const handleSaveInlineEdit = async (item: ProductItem) => {
    if (!activeProduct) return;
    setModalLoading(true);

    const priceNum = parseInt(editPrice, 10) || item.price;
    const supplierNum = editSupplierPrice ? parseInt(editSupplierPrice, 10) : (item.supplierPrice || 0);
    const origNum = editOriginalPrice ? parseInt(editOriginalPrice, 10) : null;

    try {
      const res = await fetch(`/api/admin/products/${activeProduct.id}/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim() || item.name,
          price: priceNum,
          supplierPrice: supplierNum,
          originalPrice: origNum,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedItems = activeProduct.items.map((i) =>
          i.id === item.id
            ? {
                ...i,
                name: editName.trim() || item.name,
                price: priceNum,
                supplierPrice: supplierNum,
                originalPrice: origNum,
                discountPercent: origNum && origNum > priceNum ? Math.round(((origNum - priceNum) / origNum) * 100) : null,
              }
            : i
        );
        const updatedProd = { ...activeProduct, items: updatedItems };
        setActiveProduct(updatedProd);
        setProducts((prev) =>
          prev.map((p) => (p.id === activeProduct.id ? updatedProd : p))
        );
        setEditingItemId(null);
        setActionMsg(`Varian "${item.name}" berhasil diupdate.`);
      }
    } catch {
      alert("Gagal menyimpan perubahan.");
    } finally {
      setModalLoading(false);
    }
  };

  // Open Manage Modal
  const openManageModal = (
    prod: Product,
    initialTab: "variants" | "image_info" | "notices" = "variants"
  ) => {
    setActiveProduct(prod);
    setModalTab(initialTab);
    setActionMsg("");
    setEditingItemId(null);
    setEditProdName(prod.name);
    setEditProdThumbnail(prod.thumbnailUrl || "");
    setEditProdBanner(prod.bannerUrl || "");
    setEditProdDeveloper(prod.developer || "");
    setEditProdTagline(prod.tagline || "");
    setEditProdDescription(prod.description || "");
    setEditProdTargetLabel(prod.targetInputLabel || "User ID");
    setEditProdInstructions(prod.instructions || "");
    setEditProdImportantNotice(prod.importantNotice || "");
    setEditProdWarrantyTerms(prod.warrantyTerms || "");
    setEditProdAdditionalNotes(prod.additionalNotes || "");
  };

  // Start inline editing an item
  const startEditing = (it: ProductItem) => {
    setEditingItemId(it.id);
    setEditName(it.name);
    setEditPrice(it.price.toString());
    setEditSupplierPrice(it.supplierPrice ? it.supplierPrice.toString() : "");
    setEditOriginalPrice(it.originalPrice ? it.originalPrice.toString() : "");
  };

  // Upload image to server
  const handleUploadImageFile = async (
    file: File,
    target: "edit_thumbnail" | "edit_banner" | "new_product"
  ) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Ukuran file gambar maksimal 8MB!");
      return;
    }

    if (target === "new_product") {
      setIsUploadingNewImage(true);
    } else {
      setIsUploadingImage(true);
    }

    try {
      const maxDim = target === "edit_banner" ? 1600 : 800;
      const optimizedFile = await compressImageClient(file, maxDim, maxDim, 0.88);
      const formData = new FormData();
      formData.append("file", optimizedFile);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (target === "edit_thumbnail") {
          setEditProdThumbnail(data.url);
        } else if (target === "edit_banner") {
          setEditProdBanner(data.url);
        } else if (target === "new_product") {
          setNewProdThumbnail(data.url);
        }
        setActionMsg("Gambar berhasil diupload!");
      } else {
        alert("Gagal upload gambar: " + (data.message || "Unknown error"));
      }
    } catch (err: any) {
      alert("Gagal upload gambar: " + err.message);
    } finally {
      setIsUploadingImage(false);
      setIsUploadingNewImage(false);
    }
  };

  // Save Product Image & Details
  const handleSaveProductInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    setModalLoading(true);

    const cleanLabel = editProdTargetLabel.trim() || activeProduct.targetInputLabel || "User ID";
    const autoPlaceholder =
      cleanLabel.toLowerCase() !== "user id"
        ? `Masukkan ${cleanLabel}`
        : "Masukkan User ID akun Anda";

    try {
      const res = await fetch(`/api/admin/products/${activeProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editProdName.trim() || activeProduct.name,
          thumbnailUrl: editProdThumbnail.trim() || activeProduct.thumbnailUrl,
          bannerUrl: editProdBanner.trim() || activeProduct.bannerUrl || editProdThumbnail.trim(),
          developer: editProdDeveloper.trim(),
          tagline: editProdTagline.trim(),
          description: editProdDescription.trim(),
          targetInputLabel: cleanLabel,
          targetInputPlaceholder: autoPlaceholder,
          instructions: editProdInstructions.trim(),
          importantNotice: editProdImportantNotice.trim() || null,
          warrantyTerms: editProdWarrantyTerms.trim() || null,
          additionalNotes: editProdAdditionalNotes.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedProduct: Product = {
          ...activeProduct,
          name: editProdName.trim() || activeProduct.name,
          thumbnailUrl: editProdThumbnail.trim() || activeProduct.thumbnailUrl,
          bannerUrl: editProdBanner.trim() || activeProduct.bannerUrl || editProdThumbnail.trim(),
          developer: editProdDeveloper.trim(),
          tagline: editProdTagline.trim(),
          description: editProdDescription.trim(),
          targetInputLabel: cleanLabel,
          targetInputPlaceholder: autoPlaceholder,
          instructions: editProdInstructions.trim(),
          importantNotice: editProdImportantNotice.trim() || null,
          warrantyTerms: editProdWarrantyTerms.trim() || null,
          additionalNotes: editProdAdditionalNotes.trim() || null,
        };
        setActiveProduct(updatedProduct);
        setProducts((prev) =>
          prev.map((p) => (p.id === activeProduct.id ? updatedProduct : p))
        );
        setActionMsg("Gambar dan informasi produk berhasil disimpan!");
      } else {
        alert("Gagal menyimpan: " + data.message);
      }
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Add Variant for Manual Products
  const handleAddNewVariant = async () => {
    if (!activeProduct) return;
    if (!newVariantName.trim()) return alert("Nama varian wajib diisi.");
    if (!newVariantPrice.trim()) return alert("Harga jual varian wajib diisi.");

    const price = parseInt(newVariantPrice, 10);
    if (isNaN(price) || price < 0) return alert("Harga jual tidak valid.");

    const supplierPrice = newVariantSupplierPrice.trim()
      ? parseInt(newVariantSupplierPrice, 10)
      : Math.round(price * 0.9);

    const originalPrice = newVariantOriginalPrice.trim()
      ? parseInt(newVariantOriginalPrice, 10)
      : Math.round(price * 1.15);

    setIsSubmittingVariant(true);
    try {
      const res = await fetch(`/api/admin/products/${activeProduct.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newVariantName.trim(),
          price,
          supplierPrice,
          originalPrice,
          stockStatus: newVariantStock,
        }),
      });

      const data = await res.json();
      if (data.success && data.item) {
        const updatedItems = [...activeProduct.items, data.item];
        const updatedProduct = { ...activeProduct, items: updatedItems };
        setActiveProduct(updatedProduct);
        setProducts((prev) =>
          prev.map((p) => (p.id === activeProduct.id ? updatedProduct : p))
        );
        setActionMsg(`Varian "${newVariantName.trim()}" berhasil ditambahkan!`);
        setIsAddingVariant(false);
        setNewVariantName("");
        setNewVariantPrice("");
        setNewVariantSupplierPrice("");
        setNewVariantOriginalPrice("");
      } else {
        alert("Gagal menambahkan varian: " + (data.message || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmittingVariant(false);
    }
  };

  // Delete Variant for Manual Products
  const handleDeleteVariant = async (item: ProductItem) => {
    if (!activeProduct) return;
    if (activeProduct.items.length <= 1) {
      return alert("Produk harus memiliki minimal 1 varian.");
    }
    if (!confirm(`Yakin ingin menghapus varian "${item.name}"?`)) return;

    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${activeProduct.id}/items/${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        const updatedItems = activeProduct.items.filter((i) => i.id !== item.id);
        const updatedProduct = { ...activeProduct, items: updatedItems };
        setActiveProduct(updatedProduct);
        setProducts((prev) =>
          prev.map((p) => (p.id === activeProduct.id ? updatedProduct : p))
        );
        setActionMsg(`Varian "${item.name}" berhasil dihapus.`);
      } else {
        alert("Gagal menghapus varian: " + data.message);
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Create New Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return alert("Nama produk wajib diisi.");
    if (!newProdCategory) return alert("Kategori wajib dipilih.");
    if (!newProdVariantPrice) return alert("Harga jual varian awal wajib diisi.");

    const cleanLabel = newProdTargetLabel.trim() || "User ID";
    const autoPlaceholder =
      cleanLabel.toLowerCase() !== "user id"
        ? `Masukkan ${cleanLabel}`
        : "Masukkan User ID akun Anda";

    setIsCreatingProduct(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProdName.trim(),
          categorySlug: newProdCategory,
          developer: newProdDeveloper.trim() || "Official Publisher",
          thumbnailUrl: newProdThumbnail.trim() || "/images/games/mobile-legends.webp",
          tagline: newProdTagline.trim(),
          description: newProdDescription.trim(),
          requiresServer: newProdRequiresServer,
          targetInputLabel: cleanLabel,
          targetInputPlaceholder: autoPlaceholder,
          items: [
            {
              name: newProdVariantName.trim() || `${newProdName.trim()} Paket Utama`,
              price: parseInt(newProdVariantPrice, 10),
              supplierPrice: newProdVariantSupplierPrice ? parseInt(newProdVariantSupplierPrice, 10) : Math.round(parseInt(newProdVariantPrice, 10) * 0.9),
              originalPrice: newProdVariantOriginalPrice ? parseInt(newProdVariantOriginalPrice, 10) : Math.round(parseInt(newProdVariantPrice, 10) * 1.15),
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Produk berhasil ditambahkan!");
        setIsCreateModalOpen(false);
        setNewProdName("");
        setNewProdDeveloper("");
        setNewProdThumbnail("/images/games/mobile-legends.webp");
        setNewProdTagline("");
        setNewProdDescription("");
        setNewProdVariantPrice("");
        setNewProdVariantSupplierPrice("");
        setNewProdVariantOriginalPrice("");
        fetchProducts(selectedCategory, searchQuery);
      } else {
        alert("Gagal menambahkan produk: " + (data.message || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsCreatingProduct(false);
    }
  };

  // Delete entire product
  const handleDeleteProduct = async (prod: Product) => {
    if (
      !confirm(
        `PERINGATAN: Apakah Anda yakin ingin MENGHAPUS PERMANEN produk "${prod.name}" beserta seluruh varian dan riwayatnya dari sistem?\n\nTindakan ini TIDAK DAPAT DIBATALKAN!`
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== prod.id));
        if (activeProduct?.id === prod.id) {
          setActiveProduct(null);
        }
        setActionMsg(`✓ Produk "${prod.name}" berhasil dihapus secara permanen dari sistem.`);
        alert(`✓ Sukses: Produk "${prod.name}" telah dihapus permanen dari sistem.`);
      } else {
        alert("Gagal menghapus produk: " + data.message);
      }
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopbar
        title="Katalog & Produk"
        subtitle="Kelola ketersediaan game, harga modal supplier, laba, gambar, dan produk kustom"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Controls: Search, New Product, Sync & Category Filter */}
        <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama game, aplikasi, atau publisher..."
                className="w-full pl-10 pr-24 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#27273a]"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-black text-white dark:bg-[#ffd731] dark:text-black rounded-lg text-[10px] font-black uppercase tracking-wider ink-border cursor-pointer"
              >
                Cari
              </button>
            </form>

            {/* Action Buttons: New Product, Sync API, & Refresh */}
            <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 bg-[#55db9c] hover:bg-[#43cd8c] text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-102 active:scale-98 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                title="Tambahkan produk baru ke dalam katalog toko"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tambah Produk Baru</span>
              </button>

              <button
                type="button"
                onClick={handleSyncDigiflazz}
                disabled={syncingDigi}
                className="px-4 py-2.5 bg-[#38bdf8] hover:bg-[#0284c7] text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-102 active:scale-98 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                title="Tarik & petakan seluruh produk game & PPOB langsung dari Digiflazz"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingDigi ? "animate-spin text-blue-900" : "text-black"}`} />
                <span>{syncingDigi ? "Menarik Digiflazz..." : "Tarik Digiflazz"}</span>
              </button>

              <button
                type="button"
                onClick={handleSyncApiPrices}
                disabled={syncingApi}
                className="px-4 py-2.5 bg-[#ffd731] hover:bg-[#ffdf4a] text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-102 active:scale-98 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                title="Tarik harga modal terbaru langsung dari API Waroengkuy"
              >
                <Zap className={`w-3.5 h-3.5 ${syncingApi ? "animate-spin text-orange-600" : "text-black"}`} />
                <span>{syncingApi ? "Menyinkronkan..." : "Sinkronkan Harga API"}</span>
              </button>

              <button
                type="button"
                onClick={() => fetchProducts(selectedCategory, searchQuery)}
                disabled={loading}
                className="px-4 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] hover:bg-gray-200 dark:hover:bg-[#2b2b3d] rounded-xl ink-border dark:border-[#38384a] text-xs font-black uppercase tracking-wider text-carbon dark:text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Segarkan</span>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => handleCategoryChange("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ink-border transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                selectedCategory === "ALL"
                  ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                  : "bg-[#fbfbfd] text-carbon hover:bg-gray-100 dark:bg-[#20202e] dark:text-gray-300 dark:hover:bg-[#2a2a3c] dark:border-[#38384a]"
              }`}
            >
              <span>Semua Kategori</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md font-black bg-gray-200 dark:bg-[#2e2e42] text-gray-700 dark:text-gray-300">
                {products.length}
              </span>
            </button>
            {categories.map((c) => {
              const isActive = selectedCategory === c.slug;
              const count = products.filter((p) => p.categorySlug === c.slug).length;
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => handleCategoryChange(c.slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ink-border transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                      : "bg-[#fbfbfd] text-carbon hover:bg-gray-100 dark:bg-[#20202e] dark:text-gray-300 dark:hover:bg-[#2a2a3c] dark:border-[#38384a]"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md font-black bg-gray-200 dark:bg-[#2e2e42] text-gray-700 dark:text-gray-300">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Product Cards Grid */}
        <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                Daftar Produk ({products.length})
              </h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Kelola gambar produk, harga modal supplier, harga coret, dan status online
              </p>
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Total {products.reduce((acc, p) => acc + p.items.length, 0)} Varian Nominal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const availableCount = p.items.filter((i) => i.stockStatus === "AVAILABLE").length;
              const totalItems = p.items.length;

              // Calculate min & max profit in this product
              const profits = p.items.map((i) => i.price - (i.supplierPrice || Math.round(i.price * 0.88)));
              const minProfit = profits.length > 0 ? Math.min(...profits) : 0;
              const maxProfit = profits.length > 0 ? Math.max(...profits) : 0;

              return (
                <div
                  key={p.id}
                  className="bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl p-4 shadow-[2.5px_2.5px_0px_0px_#000000] flex flex-col justify-between space-y-3 relative group"
                >
                  {/* Top: Thumbnail, Category & Active Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative group/thumb shrink-0">
                        <img
                          src={p.thumbnailUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover ink-border dark:border-[#38384a] bg-gray-100"
                        />
                        <button
                          type="button"
                          onClick={() => openManageModal(p, "image_info")}
                          className="absolute inset-0 bg-black/50 text-white rounded-xl opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                          title="Ganti Gambar Produk"
                        >
                          <ImageIcon className="w-4 h-4 text-[#ffd731]" />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black uppercase text-gray-400 block truncate">
                          {p.category.name}
                        </span>
                        <h3 className="text-xs font-black text-carbon dark:text-white truncate">
                          {p.name}
                        </h3>
                        {p.categorySlug === "akun-premium" ? (
                          (p.developer || "").toLowerCase() === "manual" ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-[#4b5563] text-white px-1.5 py-0.5 rounded ink-border w-fit mt-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              <span>Manual</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-[#4338ca] text-white px-1.5 py-0.5 rounded ink-border w-fit mt-0.5">
                              <Zap className="w-2.5 h-2.5 fill-white" />
                              <span>Instan</span>
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] text-gray-400 block truncate">
                            {p.developer || "Publisher Resmi"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick 1-Click Online Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(p)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ink-border transition-all cursor-pointer shrink-0 shadow-[1px_1px_0px_#000000] flex items-center gap-1.5 active:scale-95 ${
                        p.isActive
                          ? "bg-[#55db9c] text-black hover:bg-emerald-400"
                          : "bg-[#ffdad6] dark:bg-[#3d141a] text-[#93000a] dark:text-[#fca5a5] hover:bg-red-200"
                      }`}
                      title="Klik untuk ubah status Online / Offline di katalog pembeli"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-black" : "bg-red-600"}`} />
                      <span>{p.isActive ? "ONLINE" : "OFFLINE"}</span>
                    </button>
                  </div>

                  {/* Middle: Margin Profit & Stock stats */}
                  <div className="p-2.5 bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block">
                        Estimasi Laba:
                      </span>
                      <span className="text-xs font-black text-green-700 dark:text-[#4ade80]">
                        {profits.length > 0 ? `+Rp ${minProfit.toLocaleString("id-ID")}` : "Rp 0"}
                        {maxProfit > minProfit ? ` - Rp ${maxProfit.toLocaleString("id-ID")}` : ""}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block">
                        Kesiapan:
                      </span>
                      <span className="font-black text-carbon dark:text-white">
                        {availableCount} <span className="text-gray-400 font-normal">/ {totalItems}</span>
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openManageModal(p, "variants")}
                      className="flex-1 py-2 px-3 bg-[#ffd731] text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-[1.5px_1.5px_0px_0px_#000000] cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Kelola Harga</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openManageModal(p, "image_info")}
                      className="p-2 rounded-xl bg-white dark:bg-[#252538] hover:bg-[#dceeff] text-gray-700 dark:text-gray-300 ink-border transition-colors cursor-pointer"
                      title="Kelola Gambar & Detail Produk"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </button>

                    <Link
                      href={`/produk/${p.slug}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-white dark:bg-[#252538] hover:bg-gray-100 text-gray-600 dark:text-gray-300 ink-border transition-colors cursor-pointer"
                      title="Buka Halaman Pembeli"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p)}
                      className="p-2 rounded-xl bg-white dark:bg-[#252538] hover:bg-red-100 text-gray-400 hover:text-red-600 ink-border transition-colors cursor-pointer"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ========================================================
          MODAL KELOLA PRODUK (TAB 1: VARIAN & HARGA | TAB 2: GAMBAR & INFO)
          ======================================================== */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181824] ink-border-thick dark:border-[#38384a] rounded-3xl p-5 sm:p-7 max-w-4xl w-full shadow-[6px_6px_0px_0px_#000000] max-h-[92vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <img
                  src={activeProduct.thumbnailUrl}
                  alt={activeProduct.name}
                  className="w-12 h-12 rounded-xl object-cover ink-border bg-gray-100 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                      {activeProduct.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(activeProduct)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black ink-border uppercase flex items-center gap-1.5 shadow-[1px_1px_0px_#000000] cursor-pointer active:scale-95 transition-all ${
                        activeProduct.isActive
                          ? "bg-[#55db9c] text-black hover:bg-emerald-400"
                          : "bg-[#ffdad6] dark:bg-[#3d141a] text-[#93000a] dark:text-[#fca5a5] hover:bg-red-200"
                      }`}
                      title="Klik untuk ubah status Online / Offline di katalog pembeli"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${activeProduct.isActive ? "bg-black" : "bg-red-600"}`} />
                      <span>{activeProduct.isActive ? "ONLINE" : "OFFLINE"}</span>
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {activeProduct.category.name} • {activeProduct.developer || "Official Publisher"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(activeProduct)}
                  className="px-3 py-1.5 rounded-xl bg-[#ffdad6] dark:bg-[#3d141a] text-[#93000a] dark:text-[#fca5a5] hover:bg-red-200 dark:hover:bg-red-900/60 ink-border text-xs font-black uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-[1px_1px_0px_#000000]"
                  title="Hapus Produk Permanen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hapus Produk</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveProduct(null)}
                  className="w-8 h-8 rounded-full bg-[#f3f4f6] dark:bg-[#252538] hover:bg-[#ffdad6] dark:hover:bg-red-900/40 active:scale-95 ink-border flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
              <button
                type="button"
                onClick={() => setModalTab("variants")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ink-border flex items-center gap-2 transition-all cursor-pointer ${
                  modalTab === "variants"
                    ? "bg-black text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_#000000]"
                    : "bg-[#f3f4f6] dark:bg-[#20202e] text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Denominasi & Harga Modal ({activeProduct.items.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("image_info")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ink-border flex items-center gap-2 transition-all cursor-pointer ${
                  modalTab === "image_info"
                    ? "bg-black text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_#000000]"
                    : "bg-[#f3f4f6] dark:bg-[#20202e] text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Kelola Gambar & Detail Produk</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("notices")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ink-border flex items-center gap-2 transition-all cursor-pointer ${
                  modalTab === "notices"
                    ? "bg-black text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_#000000]"
                    : "bg-[#f3f4f6] dark:bg-[#20202e] text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Deskripsi & Ketentuan Produk</span>
              </button>
            </div>

            {/* Notification alert */}
            {actionMsg && (
              <div className="p-3 bg-[#55db9c]/20 dark:bg-[#55db9c]/10 ink-border border-[#55db9c] rounded-xl text-xs font-black text-green-800 dark:text-green-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                <span>{actionMsg}</span>
              </div>
            )}

            {/* TAB 1: DAFTAR VARIAN & HARGA */}
            {modalTab === "variants" && (() => {
              const isManual = isManualProduct(activeProduct);
              return (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black uppercase text-carbon dark:text-white">
                        Tabel Varian, Harga Modal & Laba Bersih
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {isManual
                          ? "Kelola denominasi varian custom, harga modal, harga jual toko, dan status ketersediaan stok."
                          : "Klik ikon pensil untuk mengubah harga jual toko, modal supplier, atau harga coret diskon."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-[#dceeff] dark:bg-[#152338] text-[#003a6b] dark:text-[#bae6fd] px-2.5 py-1 rounded-lg ink-border">
                        {activeProduct.items.length} Varian Terdaftar
                      </span>
                      {isManual && (
                        <button
                          type="button"
                          onClick={() => setIsAddingVariant(!isAddingVariant)}
                          className="px-3 py-1 bg-[#ffd731] hover:bg-[#ffe366] text-black text-[11px] font-black uppercase rounded-lg ink-border shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{isAddingVariant ? "Tutup Form" : "Tambah Varian Baru"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Form Tambah Varian Baru Khusus Produk Manual */}
                  {isAddingVariant && isManual && (
                    <div className="p-4 bg-white dark:bg-[#1e1e2d] ink-border rounded-2xl shadow-[3px_3px_0px_#000000] space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#55db9c] border border-black animate-pulse" />
                          <h5 className="text-xs font-black uppercase text-carbon dark:text-white">
                            Tambah Varian Baru (Produk Manual)
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddingVariant(false)}
                          className="text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-500 block">
                            Nama Varian *
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: 1 Bulan Akun Sharing"
                            value={newVariantName}
                            onChange={(e) => setNewVariantName(e.target.value)}
                            className="w-full px-3 py-2 bg-[#f3f4f6] dark:bg-[#252538] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-500 block">
                            Harga Jual (Rp) *
                          </label>
                          <input
                            type="number"
                            placeholder="Contoh: 15000"
                            value={newVariantPrice}
                            onChange={(e) => setNewVariantPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-[#f3f4f6] dark:bg-[#252538] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-500 block">
                            Modal Supplier / Beli (Rp)
                          </label>
                          <input
                            type="number"
                            placeholder="Opsional (default 90%)"
                            value={newVariantSupplierPrice}
                            onChange={(e) => setNewVariantSupplierPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-[#f3f4f6] dark:bg-[#252538] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-500 block">
                            Harga Coret / Asli (Rp)
                          </label>
                          <input
                            type="number"
                            placeholder="Opsional (diskon)"
                            value={newVariantOriginalPrice}
                            onChange={(e) => setNewVariantOriginalPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-[#f3f4f6] dark:bg-[#252538] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-gray-500">Status Stok:</span>
                          <button
                            type="button"
                            onClick={() => setNewVariantStock(newVariantStock === "AVAILABLE" ? "EMPTY" : "AVAILABLE")}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ink-border cursor-pointer transition-all ${
                              newVariantStock === "AVAILABLE"
                                ? "bg-[#55db9c] text-black"
                                : "bg-[#ffdad6] text-[#93000a]"
                            }`}
                          >
                            {newVariantStock === "AVAILABLE" ? "Tersedia" : "Stok Habis"}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingVariant(false)}
                            className="px-3 py-1.5 rounded-xl text-xs font-black uppercase bg-gray-100 dark:bg-[#252538] text-gray-600 dark:text-gray-300 ink-border hover:bg-gray-200 cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={handleAddNewVariant}
                            disabled={isSubmittingVariant}
                            className="px-4 py-1.5 rounded-xl text-xs font-black uppercase bg-[#55db9c] hover:bg-[#48c78d] text-black ink-border shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{isSubmittingVariant ? "Menyimpan..." : "Simpan Varian"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-2xl max-h-80 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f3f4f6] dark:bg-[#20202e] sticky top-0 z-10 text-gray-600 dark:text-gray-300 uppercase text-[10px] font-black">
                        <tr>
                          <th className="py-2.5 px-3">Nama Varian</th>
                          <th className="py-2.5 px-3">Harga Modal (Supplier)</th>
                          <th className="py-2.5 px-3">Harga Jual & Coret</th>
                          <th className="py-2.5 px-3 text-right">Laba / Keuntungan</th>
                          <th className="py-2.5 px-3 text-center">Status Stok</th>
                          <th className="py-2.5 px-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-bold">
                        {activeProduct.items.map((it) => {
                          const isAvailable = it.stockStatus === "AVAILABLE";
                          const isEditing = editingItemId === it.id;
                          const supplierCost = it.supplierPrice || Math.round(it.price * 0.88);
                          const profit = it.price - supplierCost;
                          const profitPercent = supplierCost > 0 ? Math.round((profit / supplierCost) * 100) : 0;

                          return (
                            <tr
                              key={it.id}
                              className="hover:bg-gray-50 dark:hover:bg-[#1a1a28] transition-colors"
                            >
                              {/* 1. Name */}
                              <td className="py-3 px-3">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="px-2 py-1 bg-white dark:bg-[#181824] rounded-lg ink-border text-xs font-bold text-carbon dark:text-white w-full"
                                  />
                                ) : (
                                  <span className="text-carbon dark:text-white">{it.name}</span>
                                )}
                              </td>

                              {/* 2. Supplier Cost */}
                              <td className="py-3 px-3">
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-400 text-[10px]">Rp</span>
                                    <input
                                      type="number"
                                      value={editSupplierPrice}
                                      onChange={(e) => setEditSupplierPrice(e.target.value)}
                                      className="px-2 py-1 bg-white dark:bg-[#181824] rounded-lg ink-border text-xs font-bold text-carbon dark:text-white w-24"
                                      placeholder="Modal API"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-carbon dark:text-white font-extrabold">
                                      Rp {supplierCost.toLocaleString("id-ID")}
                                    </span>
                                    <span className="text-[9px] text-gray-400 block font-normal">
                                      {isManual ? "Modal Beli" : "Modal Supplier"}
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* 3. Sell Price & Strikethrough */}
                              <td className="py-3 px-3">
                                {isEditing ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400 text-[10px]">Jual: Rp</span>
                                      <input
                                        type="number"
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(e.target.value)}
                                        className="px-2 py-1 bg-white dark:bg-[#181824] rounded-lg ink-border text-xs font-bold text-carbon dark:text-white w-24"
                                        placeholder="Harga Jual"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400 text-[10px]">Coret: Rp</span>
                                      <input
                                        type="number"
                                        value={editOriginalPrice}
                                        onChange={(e) => setEditOriginalPrice(e.target.value)}
                                        className="px-2 py-1 bg-white dark:bg-[#181824] rounded-lg ink-border text-xs font-bold text-gray-500 w-24"
                                        placeholder="Coret (Diskon)"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-carbon dark:text-white font-black text-sm">
                                      Rp {it.price.toLocaleString("id-ID")}
                                    </span>
                                    {it.originalPrice && it.originalPrice > it.price && (
                                      <div className="flex items-center gap-1.5 text-[10px]">
                                        <span className="line-through text-gray-400 font-normal">
                                          Rp {it.originalPrice.toLocaleString("id-ID")}
                                        </span>
                                        <span className="bg-[#55db9c] text-black font-black px-1 rounded text-[9px]">
                                          -{it.discountPercent || Math.round(((it.originalPrice - it.price) / it.originalPrice) * 100)}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* 4. Profit & Margin */}
                              <td className="py-3 px-3 text-right">
                                <div className="inline-flex flex-col items-end">
                                  <span
                                    className={`font-black text-xs ${
                                      profit > 0
                                        ? "text-green-700 dark:text-[#4ade80]"
                                        : profit === 0
                                        ? "text-gray-500"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {profit > 0 ? `+Rp ${profit.toLocaleString("id-ID")}` : `Rp ${profit.toLocaleString("id-ID")}`}
                                  </span>
                                  <span
                                    className={`text-[10px] font-black ${
                                      profit > 0
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    +{profitPercent}% margin
                                  </span>
                                </div>
                              </td>

                              {/* 5. Stock Status Toggle */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStock(it)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ink-border transition-all cursor-pointer ${
                                    isAvailable
                                      ? "bg-[#55db9c] text-black hover:bg-emerald-400"
                                      : "bg-[#ffdad6] dark:bg-[#3d141a] text-[#93000a] dark:text-[#fca5a5] hover:bg-red-200"
                                  }`}
                                  title="Klik untuk ubah status stok"
                                >
                                  {isAvailable ? "TERSEDIA" : "STOK HABIS"}
                                </button>
                              </td>

                              {/* 6. Inline Actions */}
                              <td className="py-3 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {isEditing ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveInlineEdit(it)}
                                        disabled={modalLoading}
                                        className="p-1.5 rounded bg-[#55db9c] text-black ink-border hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                        title="Simpan Perubahan"
                                      >
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingItemId(null)}
                                        className="p-1.5 rounded bg-gray-200 dark:bg-[#252538] text-gray-600 dark:text-gray-300 ink-border hover:bg-gray-300 transition-all cursor-pointer"
                                        title="Batal"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => startEditing(it)}
                                        className="p-1.5 rounded bg-[#f3f4f6] dark:bg-[#252538] hover:bg-[#ffd731] hover:text-black text-gray-600 dark:text-gray-300 ink-border transition-colors cursor-pointer"
                                        title="Edit Harga & Modal"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      {isManual && activeProduct.items.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteVariant(it)}
                                          disabled={modalLoading}
                                          className="p-1.5 rounded bg-[#ffdad6] dark:bg-[#3d141a] hover:bg-red-300 text-[#93000a] dark:text-[#fca5a5] ink-border transition-colors cursor-pointer"
                                          title="Hapus Varian"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Info Card: Supplier API vs Manual Product */}
                {isManual ? (
                  <div className="p-4 bg-[#55db9c]/10 dark:bg-[#55db9c]/5 border border-[#55db9c] rounded-2xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="text-xs font-black uppercase text-carbon dark:text-white">
                        Produk Manual Mandiri (Kelola Varian Bebas)
                      </h5>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                        Produk ini Anda tambahkan sendiri secara manual. Anda memiliki kebebasan penuh untuk menambah varian baru, menghapus varian, mengatur harga modal dan harga jual, serta mengaktifkan atau menonaktifkan status stok kapan saja tanpa batasan API supplier.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#ffd731]/10 dark:bg-[#ffd731]/5 border border-[#ffd731] rounded-2xl flex items-start gap-3">
                    <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="text-xs font-black uppercase text-carbon dark:text-white">
                        Produk Disuplai Oleh API Supplier Resmi (Digiflazz / H2H Direct)
                      </h5>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                        Denominasi produk ini disuplai otomatis dari sistem supplier. Sebagai seller, Anda dapat bebas mengatur harga modal supplier, harga jual toko, harga coret diskon, dan ketersediaan stok (Tersedia / Stok Habis) pada tabel di atas. Jika ingin membuat produk baru dengan paket custom sendiri, gunakan tombol <strong>+ Tambah Produk Baru</strong> pada halaman utama.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              );
            })()}

            {/* TAB 2: KELOLA GAMBAR & DETAIL PRODUK */}
            {modalTab === "image_info" && (
              <form onSubmit={handleSaveProductInfo} className="space-y-5">
                {/* Image Management Section */}
                <div className="p-4 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                    <ImageIcon className="w-4 h-4 text-[#fb4903]" />
                    <h4 className="text-xs font-black uppercase text-carbon dark:text-white">
                      Kelola Gambar Produk (Thumbnail & Banner)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Thumbnail Management */}
                    <div className="space-y-2.5 p-3 bg-white dark:bg-[#181824] rounded-xl ink-border">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <label className="text-[10px] font-black uppercase text-carbon dark:text-white block">
                          Gambar Thumbnail (Card Katalog):
                        </label>
                        <span className="text-[9px] font-black px-2 py-0.5 bg-[#ffd731] text-black rounded font-mono ink-border">
                          1:1 Persegi (600 × 600 px)
                        </span>
                      </div>

                      {/* Size Info Notice */}
                      <div className="p-2 bg-amber-50 dark:bg-[#25221b] border border-amber-300 dark:border-amber-700/60 rounded-lg text-[10px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Ukuran Pas:</strong> <strong>600 × 600 px</strong> (Rasio 1:1, format JPG/PNG/WEBP). Muncul sebagai ikon produk di grid Beranda & Katalog.
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={editProdThumbnail || "/images/games/mobile-legends.webp"}
                            alt="Thumbnail Preview"
                            className="w-16 h-16 rounded-xl object-cover ink-border bg-gray-100 shadow-[2px_2px_0px_#000000]"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-black text-white text-[8px] font-mono px-1 rounded ink-border">1:1</span>
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadImageFile(file, "edit_thumbnail");
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="w-full sm:w-auto px-3 py-1.5 bg-[#ffd731] hover:bg-[#ffdf4a] text-black rounded-lg ink-border text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_#000000]"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUploadingImage ? "Mengupload..." : "Upload File Gambar (1:1)"}</span>
                          </button>
                          <input
                            type="text"
                            value={editProdThumbnail}
                            onChange={(e) => setEditProdThumbnail(e.target.value)}
                            placeholder="/images/... atau URL gambar"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-[#181824] rounded-lg ink-border text-xs font-bold text-carbon dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Banner Management */}
                    <div className="space-y-2.5 p-3 bg-white dark:bg-[#181824] rounded-xl ink-border">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <label className="text-[10px] font-black uppercase text-carbon dark:text-white block">
                          Gambar Banner (Header Halaman):
                        </label>
                        <span className="text-[9px] font-black px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded font-mono ink-border">
                          16:9 Landscape (1200 × 600 px)
                        </span>
                      </div>

                      {/* Size Info Notice */}
                      <div className="p-2 bg-blue-50 dark:bg-[#1a1f36] border border-blue-300 dark:border-blue-700/60 rounded-lg text-[10px] text-blue-900 dark:text-blue-200 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Ukuran Pas:</strong> <strong>1200 × 600 px</strong> (Rasio 16:9 atau 2:1). Tampil sebagai banner lebar di atas halaman pemesanan produk.
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={editProdBanner || editProdThumbnail || "/images/games/mobile-legends.webp"}
                            alt="Banner Preview"
                            className="w-24 h-16 rounded-xl object-cover ink-border bg-gray-100 shadow-[2px_2px_0px_#000000]"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-black text-white text-[8px] font-mono px-1 rounded ink-border">16:9</span>
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <input
                            type="file"
                            ref={bannerInputRef}
                            className="hidden"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadImageFile(file, "edit_banner");
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="w-full sm:w-auto px-3 py-1.5 bg-[#ffd731] hover:bg-[#ffdf4a] text-black rounded-lg ink-border text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_#000000]"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload File Banner (16:9)</span>
                          </button>
                          <input
                            type="text"
                            value={editProdBanner}
                            onChange={(e) => setEditProdBanner(e.target.value)}
                            placeholder="/images/... atau URL gambar"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-[#181824] rounded-lg ink-border text-xs font-bold text-carbon dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Information Fields */}
                <div className="p-4 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                    <Sliders className="w-4 h-4 text-blue-500" />
                    <h4 className="text-xs font-black uppercase text-carbon dark:text-white">
                      Informasi Produk & Akun
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                        Nama Produk:
                      </label>
                      <input
                        type="text"
                        value={editProdName}
                        onChange={(e) => setEditProdName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-[#181824] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      {activeProduct.categorySlug === "akun-premium" ? (
                        <>
                          <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                            Tipe Pengiriman / Label Akun Premium:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setEditProdDeveloper("Instan")}
                              className={`p-2.5 rounded-xl ink-border text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                editProdDeveloper.toLowerCase() !== "manual"
                                  ? "bg-[#4338ca] text-white shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                                  : "bg-white dark:bg-[#181824] text-gray-600 dark:text-gray-400 hover:bg-gray-100"
                              }`}
                            >
                              <Zap className="w-3.5 h-3.5 fill-white" />
                              <span>Instan</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditProdDeveloper("Manual")}
                              className={`p-2.5 rounded-xl ink-border text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                editProdDeveloper.toLowerCase() === "manual"
                                  ? "bg-[#4b5563] text-white shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                                  : "bg-white dark:bg-[#181824] text-gray-600 dark:text-gray-400 hover:bg-gray-100"
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Manual (Via WA)</span>
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-1">
                            {editProdDeveloper.toLowerCase() === "manual"
                              ? "🕒 Kredensial tidak langsung tampil di invoice, diarahkan konfirmasi ke WhatsApp admin."
                              : "⚡ Kredensial langsung tampil di layar invoice setelah bayar sukses."}
                          </span>
                        </>
                      ) : (
                        <>
                          <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                            Developer / Publisher:
                          </label>
                          <input
                            type="text"
                            value={editProdDeveloper}
                            onChange={(e) => setEditProdDeveloper(e.target.value)}
                            placeholder="Contoh: Moonton, Tencent, Garena"
                            className="w-full px-3 py-2 bg-white dark:bg-[#181824] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                          />
                        </>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                        Label Input Target Akun:
                      </label>
                      <input
                        type="text"
                        value={editProdTargetLabel}
                        onChange={(e) => setEditProdTargetLabel(e.target.value)}
                        placeholder="Contoh: User ID / Riot ID / Email"
                        className="w-full px-3 py-2 bg-white dark:bg-[#181824] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                        Tagline Singkat:
                      </label>
                      <input
                        type="text"
                        value={editProdTagline}
                        onChange={(e) => setEditProdTagline(e.target.value)}
                        placeholder="Tagline promosi produk"
                        className="w-full px-3 py-2 bg-white dark:bg-[#181824] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                      Petunjuk / Instruksi Pembeli:
                    </label>
                    <input
                      type="text"
                      value={editProdInstructions}
                      onChange={(e) => setEditProdInstructions(e.target.value)}
                      placeholder="Contoh: Buka avatar profil untuk menemukan User ID..."
                      className="w-full px-3 py-2 bg-white dark:bg-[#181824] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                      Deskripsi Lengkap:
                    </label>
                    <textarea
                      rows={2}
                      value={editProdDescription}
                      onChange={(e) => setEditProdDescription(e.target.value)}
                      placeholder="Deskripsi layanan produk..."
                      className="w-full px-3 py-2 bg-white dark:bg-[#181824] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveProduct(null)}
                    className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-[#20202e] text-gray-700 dark:text-gray-300 font-black text-xs uppercase ink-border"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-2.5 rounded-xl bg-[#55db9c] hover:bg-[#43cd8c] text-black font-black text-xs uppercase tracking-wider ink-border shadow-[2px_2px_0px_#000000] cursor-pointer"
                  >
                    {modalLoading ? "Menyimpan..." : "Simpan Gambar & Detail Produk"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: KETENTUAN, GARANSI & CATATAN PRODUK */}
            {modalTab === "notices" && (
              <form onSubmit={handleSaveProductInfo} className="space-y-5">
                <div className="p-4 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#ffd731]" />
                      <h4 className="text-xs font-black uppercase text-carbon dark:text-white">
                        Kelola Deskripsi, Aturan & Ketentuan Pembeli
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">
                      Tampil di halaman produk
                    </span>
                  </div>

                  {/* 1. Penting Sebelum Beli */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-500" />
                        <span>Penting Sebelum Beli (1 baris per poin):</span>
                      </label>
                      <span className="text-[9.5px] text-gray-400 font-semibold">
                        Gunakan awalan <strong>✕</strong> atau <strong>-</strong> untuk aturan larangan
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={editProdImportantNotice}
                      onChange={(e) => setEditProdImportantNotice(e.target.value)}
                      placeholder={"Contoh:\n✓ Akun sharing – dipakai bersama\n✕ Hanya pakai profil yang ditentukan\n✕ Jangan ubah password, email, atau profil\n✓ Bisa di HP, laptop, tablet & smart TV\n✓ Dikirim otomatis setelah bayar"}
                      className="w-full px-3 py-2 bg-white dark:bg-[#181824] rounded-xl ink-border text-xs font-mono font-bold text-carbon dark:text-white focus:outline-none"
                    />
                    <p className="text-[10px] text-gray-500">
                      Kosongkan untuk menggunakan template otomatis kategori {activeProduct.category.name}.
                    </p>
                  </div>

                  {/* 2. Syarat & Ketentuan (Garansi) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#ffd731]" />
                      <span>Syarat & Ketentuan / Garansi (1 baris per poin):</span>
                    </label>
                    <textarea
                      rows={3}
                      value={editProdWarrantyTerms}
                      onChange={(e) => setEditProdWarrantyTerms(e.target.value)}
                      placeholder={"Contoh:\n• Mengikuti keterangan tiap varian\n• Klaim lewat halaman pesanan dengan kode transaksi"}
                      className="w-full px-3 py-2 bg-white dark:bg-[#181824] rounded-xl ink-border text-xs font-mono font-bold text-carbon dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* 3. Catatan */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Catatan Pembeli (1 baris per poin):</span>
                    </label>
                    <textarea
                      rows={3}
                      value={editProdAdditionalNotes}
                      onChange={(e) => setEditProdAdditionalNotes(e.target.value)}
                      placeholder={"Contoh:\n• Pesanan diproses otomatis 24 jam\n• Kendala? Hubungi admin dengan menyertakan kode transaksi"}
                      className="w-full px-3 py-2 bg-white dark:bg-[#181824] rounded-xl ink-border text-xs font-mono font-bold text-carbon dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveProduct(null)}
                    className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-[#20202e] text-gray-700 dark:text-gray-300 font-black text-xs uppercase ink-border"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-2.5 rounded-xl bg-[#ffd731] hover:bg-[#ebc425] text-black font-black text-xs uppercase tracking-wider ink-border shadow-[2px_2px_0px_#000000] cursor-pointer"
                  >
                    {modalLoading ? "Menyimpan..." : "Simpan Ketentuan Produk"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL TAMBAH PRODUK BARU SENDIRI
          ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181824] ink-border-thick dark:border-[#38384a] rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-[6px_6px_0px_0px_#000000] max-h-[92vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#55db9c] text-black ink-border flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                    Tambah Produk Baru
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Tambahkan game, layanan akun, atau voucher baru ke katalog toko Anda
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f3f4f6] dark:bg-[#252538] hover:bg-[#ffdad6] dark:hover:bg-red-900/40 active:scale-95 ink-border flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* Product Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                    Nama Produk *:
                  </label>
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Contoh: Honor of Kings VVIP / Netflix 1 Bulan"
                    className="w-full px-3 py-2 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                    Kategori *:
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  {newProdCategory === "akun-premium" ? (
                    <>
                      <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                        Tipe Pengiriman / Label:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewProdDeveloper("Instan")}
                          className={`p-2.5 rounded-xl ink-border text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            newProdDeveloper.toLowerCase() !== "manual"
                              ? "bg-[#4338ca] text-white shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                              : "bg-white dark:bg-[#181824] text-gray-600 dark:text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          <span>Instan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewProdDeveloper("Manual")}
                          className={`p-2.5 rounded-xl ink-border text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            newProdDeveloper.toLowerCase() === "manual"
                              ? "bg-[#4b5563] text-white shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                              : "bg-white dark:bg-[#181824] text-gray-600 dark:text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Manual (WA)</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                        Developer / Publisher:
                      </label>
                      <input
                        type="text"
                        value={newProdDeveloper}
                        onChange={(e) => setNewProdDeveloper(e.target.value)}
                        placeholder="Contoh: Riot Games / Moonton"
                        className="w-full px-3 py-2 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Thumbnail Image Upload & Preview */}
              <div className="p-3.5 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="text-[10px] font-black uppercase text-carbon dark:text-white block">
                    Gambar Thumbnail Produk:
                  </label>
                  <span className="text-[9px] font-black px-2 py-0.5 bg-[#ffd731] text-black rounded font-mono ink-border">
                    1:1 Persegi (600 × 600 px)
                  </span>
                </div>

                {/* Size guide notice */}
                <div className="p-2 bg-amber-50 dark:bg-[#25221b] border border-amber-300 dark:border-amber-700/60 rounded-lg text-[10px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Ukuran Pas:</strong> Disarankan rasio <strong>1:1 (600 × 600 px)</strong>, format JPG/PNG/WEBP. Muncul pada kartu produk di Beranda dan Katalog.
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={newProdThumbnail || "/images/games/mobile-legends.webp"}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover ink-border bg-gray-100 shadow-[2px_2px_0px_#000000]"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-black text-white text-[8px] font-mono px-1 rounded ink-border">1:1</span>
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <input
                      type="file"
                      ref={newImageFileRef}
                      className="hidden"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImageFile(file, "new_product");
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => newImageFileRef.current?.click()}
                      disabled={isUploadingNewImage}
                      className="w-full sm:w-auto px-3 py-1.5 bg-[#ffd731] hover:bg-[#ffdf4a] text-black rounded-lg ink-border text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_#000000]"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingNewImage ? "Mengupload..." : "Upload Gambar (1:1)"}</span>
                    </button>
                    <input
                      type="text"
                      value={newProdThumbnail}
                      onChange={(e) => setNewProdThumbnail(e.target.value)}
                      placeholder="/images/... atau URL gambar"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-[#181824] rounded-lg ink-border text-xs font-bold text-carbon dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Target Input & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                    Label Input Target Akun:
                  </label>
                  <input
                    type="text"
                    value={newProdTargetLabel}
                    onChange={(e) => setNewProdTargetLabel(e.target.value)}
                    placeholder="Contoh: User ID / Nomor WhatsApp"
                    className="w-full px-3 py-2 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="reqServer"
                    checked={newProdRequiresServer}
                    onChange={(e) => setNewProdRequiresServer(e.target.checked)}
                    className="w-4 h-4 rounded text-black cursor-pointer"
                  />
                  <label htmlFor="reqServer" className="text-xs font-bold text-carbon dark:text-white cursor-pointer">
                    Perlu Server / Zone ID akun
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                    Tagline Promosi:
                  </label>
                  <input
                    type="text"
                    value={newProdTagline}
                    onChange={(e) => setNewProdTagline(e.target.value)}
                    placeholder="Contoh: Layanan terpercaya proses kilat 5 detik"
                    className="w-full px-3 py-2 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                  />
                </div>
              </div>

              {/* Initial Variant Pricing */}
              <div className="p-3.5 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border rounded-2xl space-y-2.5">
                <h4 className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#fb4903]" />
                  <span>Varian / Denominasi Pertama</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                      Nama Varian *:
                    </label>
                    <input
                      type="text"
                      value={newProdVariantName}
                      onChange={(e) => setNewProdVariantName(e.target.value)}
                      placeholder="Contoh: Paket 100 Diamond"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-[#181824] rounded-lg ink-border text-xs font-bold text-carbon dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                      Modal Supplier (Rp):
                    </label>
                    <input
                      type="number"
                      value={newProdVariantSupplierPrice}
                      onChange={(e) => setNewProdVariantSupplierPrice(e.target.value)}
                      placeholder="Contoh: 12000"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-[#181824] rounded-lg ink-border text-xs font-bold text-carbon dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                      Harga Jual (Rp) *:
                    </label>
                    <input
                      type="number"
                      value={newProdVariantPrice}
                      onChange={(e) => setNewProdVariantPrice(e.target.value)}
                      placeholder="Contoh: 15000"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-[#181824] rounded-lg ink-border text-xs font-bold text-carbon dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                      Harga Coret (Rp):
                    </label>
                    <input
                      type="number"
                      value={newProdVariantOriginalPrice}
                      onChange={(e) => setNewProdVariantOriginalPrice(e.target.value)}
                      placeholder="Contoh: 18000"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-[#181824] rounded-lg ink-border text-xs font-bold text-carbon dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-[#20202e] text-gray-700 dark:text-gray-300 font-black text-xs uppercase ink-border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProduct}
                  className="px-6 py-2.5 rounded-xl bg-[#55db9c] hover:bg-[#43cd8c] text-black font-black text-xs uppercase tracking-wider ink-border shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  {isCreatingProduct ? "Menyimpan Produk..." : "Simpan & Publikasikan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
