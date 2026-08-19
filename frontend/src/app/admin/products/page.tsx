'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  UploadCloud,
  X,
  Layers,
  Image as ImageIcon,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { compressImage } from '../../../utils/image-compressor';
import { API_BASE_URL, authFetch } from '../../../utils/api-config';

const PRESET_CATEGORIES = [
  { slug: 'women-hijab', name: 'Hijab Collection (হিজাব)', department: 'women' },
  { slug: 'women-churi-bangles', name: 'Churi & Bangles (কাঁচের ও রেশমি চুড়ি)', department: 'women' },
  { slug: 'women-accessories', name: 'Accessories & Fine Jewellery (জুয়েলারি ও গহনা)', department: 'women' },
  { slug: 'women-dresses', name: 'Dresses & Modest Wear (ড্রেস ও গাউন)', department: 'women' },
  { slug: 'women-hair-accessories', name: 'Hair Accessories (হেয়ার এক্সেসরিজ)', department: 'women' },
  { slug: 'women-shoes', name: 'Shoes & Footwear (জুতা ও নাগরা)', department: 'women' },
  { slug: 'men-shoes', name: 'Shoes & Loafers (মেনস জুতা ও লোফার)', department: 'men' },
  { slug: 'men-clothing', name: 'Clothing & Panjabi (মেনস পাঞ্জাবি)', department: 'men' },
  { slug: 'kids-girls-dresses', name: 'Girls\' Dresses (বাচ্চাদের ড্রেস ও পার্টি গাউন)', department: 'kids' },
  { slug: 'kids-accessories', name: 'Kids\' Shoes & Accessories (বাচ্চাদের জুতা ও এক্সেসরিজ)', department: 'kids' },
];

const PRESET_COLORS = [
  { name: 'Olive', hex: '#556B2F' },
  { name: 'Black', hex: '#0F172A' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Dusty Pink', hex: '#E08B9B' },
  { name: 'Maroon', hex: '#58111A' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Navy Blue', hex: '#1B2A4A' },
  { name: 'Grey', hex: '#64748B' },
  { name: 'Purple', hex: '#6B21A8' },
  { name: 'Beige', hex: '#E8D8C8' },
  { name: 'Nude', hex: '#CDB49B' },
  { name: 'Gold', hex: '#C5A059' },
  { name: 'Emerald Green', hex: '#16A34A' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Magenta', hex: '#D946EF' },
  { name: 'Brown', hex: '#78350F' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [badge, setBadge] = useState('BEST SELLER');
  const [unitBadge, setUnitBadge] = useState('');
  const [rating, setRating] = useState<number>(4.8);
  const [reviewsCount, setReviewsCount] = useState<number>(256);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [isPublished, setIsPublished] = useState(true);

  // Dynamic 5 Features List (Highlights beside photo)
  const [features, setFeatures] = useState<Array<{ title: string; subtitle: string }>>([
    { title: 'Soft & Comfortable', subtitle: 'Gentle on skin and non-irritating' },
    { title: 'Premium Artisan Quality', subtitle: 'Crafted from finest materials' },
    { title: 'Lightweight & Breathable', subtitle: 'Designed for effortless all-day wear' },
    { title: 'Glossy & Elegant Finish', subtitle: 'Flawless look that enhances beauty' },
    { title: 'Perfect For Every Occasion', subtitle: 'Festivals, parties, weddings & daily styling' },
  ]);

  // Dynamic Variants (Color Swatches, Size, Price, Stock)
  const [variants, setVariants] = useState<
    Array<{
      sku: string;
      color: string;
      colorHex: string;
      size: string;
      price: number;
      costPrice: number;
      stock: number;
    }>
  >([
    { sku: '', color: 'Olive', colorHex: '#556B2F', size: 'Standard', price: 0, costPrice: 0, stock: 10 },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/admin/products`),
        fetch(`${API_BASE_URL}/api/categories`),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSubtitle('');
    setSlug('');
    setCategoryId(categories[0]?._id || '');
    setBadge('BEST SELLER');
    setUnitBadge('');
    setRating(4.8);
    setReviewsCount(256);
    setDescription('');
    setImages([]);
    setImageInput('');
    setOriginalPrice(0);
    setDiscountPercentage(0);
    setSalePrice(0);
    setIsPublished(true);
    setFeatures([
      { title: 'Soft & Comfortable', subtitle: 'Gentle on skin and non-irritating' },
      { title: 'Premium Artisan Quality', subtitle: 'Crafted from finest materials' },
      { title: 'Lightweight & Breathable', subtitle: 'Designed for effortless all-day wear' },
      { title: 'Glossy & Elegant Finish', subtitle: 'Flawless look that enhances beauty' },
      { title: 'Perfect For Every Occasion', subtitle: 'Festivals, parties, weddings & daily styling' },
    ]);
    setVariants([
      { sku: `AVE-${Date.now().toString().slice(-5)}`, color: 'Olive', colorHex: '#556B2F', size: 'Standard', price: 0, costPrice: 0, stock: 10 },
    ]);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: any) => {
    setEditingProduct(prod);
    setName(prod.name || '');
    setSubtitle(prod.subtitle || '');
    setSlug(prod.slug || '');
    setCategoryId(prod.categoryId?._id || prod.categoryId || '');
    setBadge(prod.badge || 'BEST SELLER');
    setUnitBadge(prod.unitBadge || '');
    setRating(prod.rating || 4.8);
    setReviewsCount(prod.reviewsCount || 256);
    setDescription(prod.description || '');
    setImages(prod.images || []);
    setImageInput('');
    setOriginalPrice(prod.originalPrice || 0);
    setDiscountPercentage(prod.discountPercentage || 0);
    setSalePrice(prod.salePrice || 0);
    setIsPublished(prod.isPublished !== false);
    if (prod.features && prod.features.length > 0) {
      setFeatures(prod.features.map((f: any) => ({ title: f.title || '', subtitle: f.subtitle || '' })));
    } else {
      setFeatures([
        { title: 'Soft & Comfortable', subtitle: 'Gentle on skin and non-irritating' },
        { title: 'Premium Artisan Quality', subtitle: 'Crafted from finest materials' },
        { title: 'Lightweight & Breathable', subtitle: 'Designed for effortless all-day wear' },
        { title: 'Glossy & Elegant Finish', subtitle: 'Flawless look that enhances beauty' },
        { title: 'Perfect For Every Occasion', subtitle: 'Festivals, parties, weddings & daily styling' },
      ]);
    }
    setVariants(
      prod.variants?.length > 0
        ? prod.variants.map((v: any) => ({
            sku: v.sku || '',
            color: v.color || '',
            colorHex: v.colorHex || '#0F172A',
            size: v.size || '',
            price: v.price || prod.salePrice || 0,
            costPrice: v.costPrice || 0,
            stock: v.stockQuantity !== undefined ? v.stockQuantity : (v.stock || 0),
          }))
        : [{ sku: `AVE-${prod.slug || Date.now().toString().slice(-4)}`, color: 'Olive', colorHex: '#556B2F', size: 'Standard', price: prod.salePrice, costPrice: 0, stock: 10 }],
    );
    setError('');
    setIsModalOpen(true);
  };

  // Image Upload handler with client-side auto compression
  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Client-side auto-compression to 1200px max width
        const compressedDataUrl = await compressImage(file, 1200, 0.85);

        try {
          const res = await authFetch(`${API_BASE_URL}/api/upload/image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: compressedDataUrl, folder: 'avelora/products' }),
          });

          if (res.ok) {
            const data = await res.json();
            setImages((prev) => [...prev, data.url || compressedDataUrl]);
          } else {
            setImages((prev) => [...prev, compressedDataUrl]);
          }
        } catch {
          setImages((prev) => [...prev, compressedDataUrl]);
        }
      }
    } catch (err) {
      console.error('Error uploading image', err);
      setError('ছবি আপলোড করতে সমস্যা হয়েছে। অন্য ছবি চেষ্টা করুন।');
    } finally {
      setUploadingImage(false);
    }
  };

  const addManualImageUrl = () => {
    if (imageInput.trim()) {
      setImages((prev) => [...prev, imageInput.trim()]);
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Feature Controls
  const updateFeature = (index: number, field: 'title' | 'subtitle', value: string) => {
    setFeatures((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Variant Controls
  const addPresetColorVariant = (preset: { name: string; hex: string }) => {
    const exists = variants.some((v) => v.color.toLowerCase() === preset.name.toLowerCase());
    if (exists) return;

    const skuSuffix = Math.floor(100 + Math.random() * 900);
    if (variants.length === 1 && (variants[0].color === 'Standard' || !variants[0].color)) {
      setVariants([
        {
          sku: `AVE-${skuSuffix}`,
          color: preset.name,
          colorHex: preset.hex,
          size: 'Standard',
          price: salePrice || originalPrice || 0,
          costPrice: 0,
          stock: 15,
        },
      ]);
    } else {
      setVariants((prev) => [
        ...prev,
        {
          sku: `AVE-${skuSuffix}`,
          color: preset.name,
          colorHex: preset.hex,
          size: 'Standard',
          price: salePrice || originalPrice || 0,
          costPrice: 0,
          stock: 15,
        },
      ]);
    }
  };

  const addVariantRow = () => {
    const skuSuffix = Math.floor(100 + Math.random() * 900);
    setVariants((prev) => [
      ...prev,
      { sku: `AVE-${skuSuffix}`, color: '', colorHex: '#0F172A', size: '', price: salePrice, costPrice: 0, stock: 10 },
    ]);
  };

  const removeVariantRow = (index: number) => {
    if (variants.length === 1) return;
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product title is required.');
      return;
    }

    setSaving(true);
    setError('');

    const cleanSlug = name.trim().toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, '-').replace(/(^-|-$)/g, '');
    const autoSlug = slug.trim() || (cleanSlug && cleanSlug !== '-' ? cleanSlug : `prod-${Date.now().toString().slice(-6)}`);

    const payload = {
      name: name.trim(),
      subtitle: subtitle.trim(),
      slug: autoSlug,
      categoryId: categoryId && categoryId.trim() !== '' ? categoryId : undefined,
      badge: badge.trim(),
      unitBadge: unitBadge.trim(),
      rating: Number(rating) || 4.8,
      reviewsCount: Number(reviewsCount) || 256,
      features: features.filter((f) => f.title.trim() !== ''),
      description: description.trim(),
      images,
      originalPrice: Number(originalPrice) || 0,
      discountPercentage: Number(discountPercentage) || 0,
      salePrice: Number(salePrice) || Number(originalPrice) || 0,
      isPublished,
      variants: variants.map((v) => ({
        sku: v.sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        color: v.color.trim(),
        colorHex: v.colorHex ? v.colorHex.trim() : '#0F172A',
        size: v.size.trim(),
        price: Number(v.price) || Number(salePrice) || 0,
        costPrice: Number(v.costPrice) || 0,
        stockQuantity: Number(v.stock) || 0,
      })),
    };

    try {
      const url = editingProduct
        ? `${API_BASE_URL}/api/admin/products/${editingProduct._id}`
        : `${API_BASE_URL}/api/admin/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save product');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAllDemoProducts = async () => {
    if (
      !confirm(
        '⚠️ Are you sure you want to delete ALL demo products? This will completely clear the database so you can add your original real products manually.',
      )
    )
      return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products-clear-all`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#997B21]">
            Catalog & Inventory Management
          </span>
          <h1 className="text-2xl font-bold font-serif-luxury text-gray-900">
            Products & Variants ({products.length})
          </h1>
          <p className="text-xs text-gray-500">
            Create pieces, upload photos directly from your device, and manage SKUs, COGS & prices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {products.length > 0 && (
            <button
              onClick={handleClearAllDemoProducts}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 border border-red-200 shadow-sm"
              title="Clear all demo products"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Demo</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-slate-950 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search products by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs text-gray-900 bg-gray-50"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <button
          onClick={fetchData}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-sm font-bold text-gray-700">No products created yet.</p>
            <p className="text-xs text-gray-400">Click "Add New Product" to manually publish your first piece.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 bg-gray-50">
                  <th className="py-3.5 px-4">Piece & Image</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Sale Price</th>
                  <th className="py-3.5 px-4">Variants & Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredProducts.map((prod) => {
                  const totalStock = prod.variants?.reduce((acc: number, v: any) => acc + (v.stockQuantity !== undefined ? v.stockQuantity : (v.stock || 0)), 0) || 0;
                  return (
                    <tr key={prod._id} className="hover:bg-gray-50/60">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {prod.images?.[0] ? (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-12 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-14 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400 text-[10px]">
                              No Photo
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 font-serif-luxury text-sm">{prod.name}</p>
                            <p className="text-[11px] text-gray-400 font-mono">/{prod.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        {prod.categoryId?.name || 'General'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 font-mono">৳{prod.salePrice?.toLocaleString()}</span>
                        {prod.originalPrice > prod.salePrice && (
                          <span className="text-[10px] text-gray-400 line-through ml-1.5">
                            ৳{prod.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-800">{prod.variants?.length || 0} variants</p>
                        <p className={`text-[10px] font-mono ${totalStock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {totalStock} units in stock
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          prod.isPublished !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}>
                          {prod.isPublished !== false ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 text-gray-600 hover:text-slate-900 hover:bg-gray-100 rounded transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod._id, prod.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal with Local Device Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-serif-luxury text-[#E6CA85]">
                  {editingProduct ? 'Edit Product' : 'Add New Luxury Piece'}
                </h3>
                <p className="text-xs text-gray-400">Configure details, upload imagery, and specify variants</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-xs text-gray-700">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Title, Category & Slug */}
              {/* Title, Subtitle, Category & Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold uppercase text-gray-900">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ceri Hijab or Reshmi Churi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] bg-white text-gray-900 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Subtitle / Variant Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Olive or 24 Pcs Set"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] bg-white text-gray-900 font-medium"
                  />
                </div>
              </div>

              {/* Category, Badge, Unit Badge & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold uppercase text-gray-900">
                      Category (প্রোডাক্টের ক্যাটাগরি) *
                    </label>
                    <a
                      href="/admin/categories"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#997B21] hover:underline font-bold"
                    >
                      + Manage Categories
                    </a>
                  </div>

                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-[#C5A059] bg-white font-semibold text-gray-900 text-xs shadow-sm"
                  >
                    <option value="">-- সিলেক্ট ক্যাটাগরি (Select Category) --</option>

                    {/* Women Collection */}
                    <optgroup label="👗 WOMEN COLLECTION (মহিলা)">
                      {PRESET_CATEGORIES.filter((c) => c.department === 'women').map((c) => {
                        const dbCat = categories.find((d) => d.slug === c.slug);
                        const val = dbCat?._id || c.slug;
                        return (
                          <option key={c.slug} value={val}>
                            {c.name}
                          </option>
                        );
                      })}
                    </optgroup>

                    {/* Men Collection */}
                    <optgroup label="👔 MEN COLLECTION (পুরুষ)">
                      {PRESET_CATEGORIES.filter((c) => c.department === 'men').map((c) => {
                        const dbCat = categories.find((d) => d.slug === c.slug);
                        const val = dbCat?._id || c.slug;
                        return (
                          <option key={c.slug} value={val}>
                            {c.name}
                          </option>
                        );
                      })}
                    </optgroup>

                    {/* Kids Collection */}
                    <optgroup label="🧸 KIDS COLLECTION (বাচ্চা)">
                      {PRESET_CATEGORIES.filter((c) => c.department === 'kids').map((c) => {
                        const dbCat = categories.find((d) => d.slug === c.slug);
                        const val = dbCat?._id || c.slug;
                        return (
                          <option key={c.slug} value={val}>
                            {c.name}
                          </option>
                        );
                      })}
                    </optgroup>
                  </select>

                  {categoryId && (
                    <div className="pt-0.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        ✓ Selected: {
                          categories.find((c) => c._id === categoryId || c.slug === categoryId)?.name ||
                          PRESET_CATEGORIES.find((c) => c.slug === categoryId)?.name ||
                          categoryId
                        }
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Showcase Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. BEST SELLER"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Unit Badge (Top-Right)</label>
                  <input
                    type="text"
                    placeholder="e.g. 24 PCS"
                    value={unitBadge}
                    onChange={(e) => setUnitBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-medium"
                  />
                </div>
              </div>

              {/* 5 Dynamic Feature Highlights (ছবি পাশের ৫টি পয়েন্ট) */}
              <div className="space-y-3 p-4 bg-[#F8F9FA] rounded-xl border border-gray-200">
                <label className="font-bold uppercase text-gray-900 flex items-center justify-between">
                  <span>Product Highlight Features (ছবি পাশের ৫টি বিশেষ বৈশিষ্ট্য)</span>
                  <span className="text-[10px] text-gray-400 font-normal">Customer screen visual list</span>
                </label>

                <div className="space-y-2.5">
                  {features.map((feat, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Point #{idx + 1} Title</span>
                        <input
                          type="text"
                          placeholder="e.g. Soft & Comfortable"
                          value={feat.title}
                          onChange={(e) => updateFeature(idx, 'title', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Point #{idx + 1} Subtitle</span>
                        <input
                          type="text"
                          placeholder="e.g. Gentle on skin and non-irritating"
                          value={feat.subtitle}
                          onChange={(e) => updateFeature(idx, 'subtitle', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-900">Description & Artisan Notes</label>
                <textarea
                  rows={3}
                  placeholder="Material specs, provenance, sizing details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] bg-white"
                />
              </div>

              {/* Direct Image Upload from Device & Cloudinary CDN */}
              <div className="space-y-3 p-4 bg-[#FAFAF8] rounded-xl border border-gray-200">
                <label className="font-bold uppercase text-gray-900 flex items-center justify-between">
                  <span>Product Photos (Multiple Image Upload)</span>
                  {uploadingImage && <span className="text-amber-600 font-semibold">Compressing & uploading photo...</span>}
                </label>

                {/* Local File Picker Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] transition cursor-pointer flex items-center justify-center gap-2 shadow-sm">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload From Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleLocalImageUpload}
                      className="hidden"
                    />
                  </label>

                  <span className="text-gray-400 text-[11px]">— or paste URL —</span>

                  <div className="flex-1 flex gap-2 w-full">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={addManualImageUrl}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Uploaded Images Preview Strip */}
                {images.length > 0 && (
                  <div className="flex items-center gap-3 overflow-x-auto pt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-20 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0 group">
                        <img src={img} alt="Product" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition shadow-sm"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Original Price (৳)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => {
                      const orig = Number(e.target.value);
                      setOriginalPrice(orig);
                      if (discountPercentage > 0) {
                        setSalePrice(Math.round(orig * (1 - discountPercentage / 100)));
                      } else {
                        setSalePrice(orig);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Discount (%)</label>
                  <input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => {
                      const disc = Number(e.target.value);
                      setDiscountPercentage(disc);
                      if (originalPrice > 0) {
                        setSalePrice(Math.round(originalPrice * (1 - disc / 100)));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Sale Price (৳) *</label>
                  <input
                    type="number"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-[#0F172A]"
                  />
                </div>
              </div>

              {/* Embedded Variants Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 gap-2">
                  <div>
                    <label className="font-bold uppercase text-gray-900 text-sm">
                      Product Variants & Stock (রঙ, সাইজ ও স্টক সংখ্যা)
                    </label>
                    <p className="text-[11px] text-gray-500">
                      নিচে ক্লিক করে আপনার স্টকে থাকা কালারগুলো যুক্ত করুন (Click to add colors in stock):
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-[#C5A059] transition flex items-center gap-1 w-fit"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Custom Variant
                  </button>
                </div>

                {/* 1-Click Color Preset Buttons (Screenshot Color Swatches) */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
                    🎨 Quick-Add Color to Stock (এক ক্লিকে কালার যুক্ত করুন):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((preset) => {
                      const isAdded = variants.some((v) => v.color.toLowerCase() === preset.name.toLowerCase());
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => addPresetColorVariant(preset)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                            isAdded
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                          title={`Add ${preset.name} with color ${preset.hex}`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/20 flex-shrink-0"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span>{preset.name}</span>
                          {isAdded && <Check className="w-3 h-3 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-2 sm:grid-cols-7 gap-2 items-center bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-2xs">
                      {/* Color Name */}
                      <div className="sm:col-span-2 space-y-0.5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Color Name & Swatch</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={v.colorHex || '#556B2F'}
                            onChange={(e) => updateVariant(idx, 'colorHex', e.target.value)}
                            className="w-7 h-7 rounded-full border border-gray-300 cursor-pointer p-0.5 bg-white flex-shrink-0"
                            title="Choose swatch color"
                          />
                          <input
                            type="text"
                            placeholder="e.g. Olive"
                            value={v.color}
                            onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                            className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold"
                          />
                        </div>
                      </div>

                      {/* Size */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Size</span>
                        <input
                          type="text"
                          placeholder="e.g. Standard"
                          value={v.size}
                          onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white text-xs"
                        />
                      </div>

                      {/* SKU */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">SKU *</span>
                        <input
                          type="text"
                          required
                          value={v.sku}
                          onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white font-mono text-xs"
                        />
                      </div>

                      {/* Selling Price */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Selling ৳</span>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white font-mono text-xs font-bold"
                        />
                      </div>

                      {/* Cost Price */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Cost ৳</span>
                        <input
                          type="number"
                          value={v.costPrice}
                          onChange={(e) => updateVariant(idx, 'costPrice', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white font-mono text-xs"
                        />
                      </div>

                      {/* Stock Quantity & Delete */}
                      <div className="flex items-center gap-2 space-y-0.5">
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Stock</span>
                          <input
                            type="number"
                            value={v.stock}
                            onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                            className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white font-mono text-xs font-bold text-emerald-700"
                          />
                        </div>
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariantRow(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 mt-4"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 text-slate-950 rounded border-gray-300 focus:ring-[#C5A059]"
                />
                <label htmlFor="isPublished" className="font-bold text-gray-800 uppercase">
                  Publish to Public Customer Storefront
                </label>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold uppercase rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-[#C5A059] text-white font-bold uppercase rounded-lg shadow disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
