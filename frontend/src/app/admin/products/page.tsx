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
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [isPublished, setIsPublished] = useState(true);

  // Dynamic Variants
  const [variants, setVariants] = useState<
    Array<{
      sku: string;
      color: string;
      size: string;
      price: number;
      costPrice: number;
      stock: number;
    }>
  >([
    { sku: '', color: '', size: '', price: 0, costPrice: 0, stock: 10 },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/products', { credentials: 'include' }),
        fetch('http://localhost:3001/api/categories'),
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
    setSlug('');
    setCategoryId(categories[0]?._id || '');
    setDescription('');
    setImages([]);
    setImageInput('');
    setOriginalPrice(0);
    setDiscountPercentage(0);
    setSalePrice(0);
    setIsPublished(true);
    setVariants([{ sku: `AVE-${Date.now().toString().slice(-4)}`, color: 'Standard', size: 'Standard', price: 0, costPrice: 0, stock: 10 }]);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: any) => {
    setEditingProduct(prod);
    setName(prod.name || '');
    setSlug(prod.slug || '');
    setCategoryId(prod.categoryId?._id || prod.categoryId || '');
    setDescription(prod.description || '');
    setImages(prod.images || []);
    setImageInput('');
    setOriginalPrice(prod.originalPrice || 0);
    setDiscountPercentage(prod.discountPercentage || 0);
    setSalePrice(prod.salePrice || 0);
    setIsPublished(prod.isPublished !== false);
    setVariants(
      prod.variants?.length > 0
        ? prod.variants
        : [{ sku: `AVE-${prod.slug}`, color: 'Standard', size: 'Standard', price: prod.salePrice, costPrice: 0, stock: 10 }],
    );
    setError('');
    setIsModalOpen(true);
  };

  // Image Upload handler from Local File / Device
  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        const dataUrl: string = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Send to backend upload service
        const res = await fetch('http://localhost:3001/api/upload/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ image: dataUrl }),
        });

        if (res.ok) {
          const data = await res.json();
          setImages((prev) => [...prev, data.url]);
        } else {
          // If upload endpoint gives error, store dataUrl directly
          setImages((prev) => [...prev, dataUrl]);
        }
      }
    } catch (err) {
      console.error('Error uploading image', err);
      setError('Could not process image file.');
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

  // Variant Controls
  const addVariantRow = () => {
    const skuSuffix = Math.floor(100 + Math.random() * 900);
    setVariants((prev) => [
      ...prev,
      { sku: `AVE-${skuSuffix}`, color: '', size: '', price: salePrice, costPrice: 0, stock: 10 },
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

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      categoryId: categoryId || undefined,
      description: description.trim(),
      images,
      originalPrice: Number(originalPrice) || 0,
      discountPercentage: Number(discountPercentage) || 0,
      salePrice: Number(salePrice) || Number(originalPrice) || 0,
      isPublished,
      variants: variants.map((v) => ({
        sku: v.sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        color: v.color.trim(),
        size: v.size.trim(),
        price: Number(v.price) || Number(salePrice) || 0,
        costPrice: Number(v.costPrice) || 0,
        stock: Number(v.stock) || 0,
      })),
    };

    try {
      const url = editingProduct
        ? `http://localhost:3001/api/admin/products/${editingProduct._id}`
        : 'http://localhost:3001/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const res = await fetch(`http://localhost:3001/api/admin/products/${id}`, {
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#997B21]">
            Catalog & Inventory Management
          </span>
          <h1 className="text-2xl font-bold font-serif-luxury text-gray-900">
            Products & Embedded Variants ({products.length})
          </h1>
          <p className="text-xs text-gray-500">
            Create pieces, upload photos directly from your device, and manage SKUs, COGS & prices.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-slate-950 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
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
          <div className="p-12 text-center text-xs text-gray-500">No products found.</div>
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
                  const totalStock = prod.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0;
                  return (
                    <tr key={prod._id} className="hover:bg-gray-50/60">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=100&q=80'}
                            alt={prod.name}
                            className="w-12 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900 font-serif-luxury text-sm">{prod.name}</p>
                            <p className="text-[11px] text-gray-400 font-mono">{prod.slug}</p>
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
                          {totalStock} units available
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
                  {editingProduct ? 'Edit Luxury Product' : 'Add New Luxury Piece'}
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
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Title, Category & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold uppercase text-gray-900">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AVELORA Royal Velvet Clutch"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] bg-white text-gray-900 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] bg-white font-medium text-gray-900"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
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
                  <span>Product Imagery (Cloudinary CDN Direct Upload)</span>
                  {uploadingImage && <span className="text-amber-600 font-normal">Uploading file...</span>}
                </label>

                {/* Local File Picker Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] transition cursor-pointer flex items-center justify-center gap-2">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload From Laptop / Device</span>
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
                      placeholder="https://images.unsplash.com/..."
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
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
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
                  <label className="font-bold uppercase text-gray-900">Sale Price (৳)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-[#0F172A]"
                  />
                </div>
              </div>

              {/* Embedded Variants Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <label className="font-bold uppercase text-gray-900 text-sm">
                    Product Variants (Color, Size, SKU, Cost Price, Stock)
                  </label>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-[#C5A059] transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Variant
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-6 gap-2 items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Color</span>
                        <input
                          type="text"
                          placeholder="e.g. Gold"
                          value={v.color}
                          onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Size</span>
                        <input
                          type="text"
                          placeholder="e.g. M / 50ml"
                          value={v.size}
                          onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">SKU *</span>
                        <input
                          type="text"
                          required
                          value={v.sku}
                          onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Selling ৳</span>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Cost Price (COGS)</span>
                        <input
                          type="number"
                          value={v.costPrice}
                          onChange={(e) => updateVariant(idx, 'costPrice', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white font-mono text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">Stock</span>
                          <input
                            type="number"
                            value={v.stock}
                            onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                            className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white font-mono text-xs"
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
                  disabled={saving}
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
