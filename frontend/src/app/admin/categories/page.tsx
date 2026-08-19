'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, Plus, Edit2, Trash2, UploadCloud, X, RefreshCw, AlertCircle, Check, ArrowLeft, ChevronRight, ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../../../utils/image-compressor';
import { API_BASE_URL } from '../../../utils/api-config';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [department, setDepartment] = useState<'women' | 'men' | 'kids' | 'all'>('women');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/categories`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/admin/products`, { credentials: 'include' }),
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData || []);
      }
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDepartment('women');
    setDescription('');
    setImage('');
    setSortOrder(categories.length + 1);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDepartment(cat.department || 'women');
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setSortOrder(cat.sortOrder || 0);
    setError('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    try {
      // Compress client-side to ensure fast loading and prevent payload limits
      const compressedDataUrl = await compressImage(file, 1200, 0.85);

      // Try uploading to backend upload endpoint
      try {
        const res = await fetch(`${API_BASE_URL}/api/upload/image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ image: compressedDataUrl, folder: 'avelora/categories' }),
        });

        if (res.ok) {
          const data = await res.json();
          setImage(data.url || compressedDataUrl);
        } else {
          setImage(compressedDataUrl);
        }
      } catch {
        setImage(compressedDataUrl);
      }
    } catch (err) {
      console.error(err);
      setError('ছবি প্রসেস করতে সমস্যা হয়েছে। অন্য ছবি চেষ্টা করুন।');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('ক্যাটাগরির নাম দেওয়া আবশ্যক।');
      return;
    }

    setSaving(true);
    setError('');

    const autoSlug = slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const payload = {
      name: name.trim(),
      slug: autoSlug,
      department,
      description: description.trim(),
      image,
      sortOrder: Number(sortOrder),
    };

    try {
      const url = editingCategory
        ? `${API_BASE_URL}/api/admin/categories/${editingCategory._id}`
        : `${API_BASE_URL}/api/admin/categories`;
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save category');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAllDemoCategories = async () => {
    if (
      !confirm(
        '⚠️ Are you sure you want to delete ALL demo categories? You will be able to create your own fresh collections from scratch.',
      )
    )
      return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/categories-clear-all`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 0. Breadcrumb & Quick Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm text-xs">
        <nav className="flex items-center gap-2 text-gray-500 font-medium py-1">
          <Link href="/admin/dashboard" className="hover:text-[#C5A059] transition text-gray-700 font-semibold">
            Admin Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-bold">Categories & Collections</span>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-[#C5A059] text-white hover:text-slate-950 font-bold text-xs transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Manage Products</span>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#997B21]">
            Taxonomy & Showcase Management
          </span>
          <h1 className="text-2xl font-bold font-serif-luxury text-gray-900">
            Product Categories ({categories.length})
          </h1>
          <p className="text-xs text-gray-500">
            Manage customer catalog collections and storefront showcase categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {categories.length > 0 && (
            <button
              onClick={handleClearAllDemoCategories}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 border border-red-200 shadow-sm"
              title="Clear all categories"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={fetchCategories}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-slate-950 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-xs text-gray-500">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
          <Layers className="w-10 h-10 text-gray-400 mx-auto" />
          <p className="text-sm font-bold text-gray-700">No categories created yet.</p>
          <p className="text-xs text-gray-400">Click "Add New Category" to create your first collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => {
            // Find products belonging to this category
            const matchingProducts = products.filter(
              (p) =>
                p.categoryId?._id === cat._id ||
                p.categoryId === cat._id ||
                p.categoryId?.slug === cat.slug ||
                (p.categoryId && typeof p.categoryId === 'string' && p.categoryId === cat.slug)
            );

            // Auto-fallback image: Category Image -> First product's image -> Default placeholder
            const displayImage =
              cat.image && cat.image.trim() !== ''
                ? cat.image
                : matchingProducts.find((p) => Array.isArray(p.images) && p.images.length > 0 && p.images[0])?.images[0] ||
                  '';

            return (
              <div
                key={cat._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between p-5 space-y-4 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative group">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs font-medium space-y-1 bg-gray-50">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                        <span>No Image Attached</span>
                      </div>
                    )}
                    {cat.department && (
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-slate-950/80 text-[#E6CA85] text-[9px] font-bold uppercase tracking-wider rounded backdrop-blur-sm shadow">
                        {cat.department}
                      </span>
                    )}

                    {/* Product count pill on image */}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-white/90 text-slate-900 text-[10px] font-bold rounded-md shadow-sm border border-gray-200">
                      {matchingProducts.length} {matchingProducts.length === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 font-serif-luxury text-base sm:text-lg">{cat.name}</h3>
                    <p className="text-[11px] text-gray-400 font-mono">/{cat.slug}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{cat.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <span className="text-[10px] text-gray-400 font-mono">Priority: #{cat.sortOrder || 0}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2 text-gray-600 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition"
                      title="Edit Category Details & Banner"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id, cat.name)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-serif-luxury text-[#E6CA85]">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-xs text-gray-400">Configure category branding and display order</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs text-gray-700">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-900">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Churi & Bangles (কাঁচের চুড়ি)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-medium text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Department</label>
                  <select
                    value={department}
                    onChange={(e: any) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-semibold text-gray-800"
                  >
                    <option value="women">Women (মহিলা)</option>
                    <option value="men">Men (পুরুষ)</option>
                    <option value="kids">Kids (বাচ্চা)</option>
                    <option value="all">All / General</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Slug (URL friendly)</label>
                  <input
                    type="text"
                    placeholder="e.g. women-churi-bangles"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-mono text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-900">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short tagline or category intro..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>

              {/* Image upload & URL */}
              <div className="space-y-2 p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <label className="font-bold uppercase text-gray-900 flex justify-between items-center">
                  <span>Category Banner Image</span>
                  {uploadingImage && <span className="text-amber-600 font-semibold">Processing photo...</span>}
                </label>

                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2 bg-slate-900 text-white rounded-lg font-bold text-[11px] uppercase cursor-pointer hover:bg-[#C5A059] transition flex items-center gap-1.5 shadow-sm">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <input
                    type="url"
                    placeholder="or paste direct image URL..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs"
                  />
                </div>

                {image && (
                  <div className="mt-2 relative w-28 h-18 rounded-lg overflow-hidden border border-gray-300 group">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-900">Sort Priority Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold uppercase rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-5 py-2 bg-slate-950 hover:bg-[#C5A059] text-white font-bold uppercase rounded-lg shadow disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
