'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, UploadCloud, X, RefreshCw } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/admin/categories', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
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
    try {
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('http://localhost:3001/api/upload/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ image: dataUrl, folder: 'avelora/categories' }),
      });

      if (res.ok) {
        const data = await res.json();
        setImage(data.url);
      } else {
        setImage(dataUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError('');

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      image,
      sortOrder: Number(sortOrder),
    };

    try {
      const url = editingCategory
        ? `http://localhost:3001/api/admin/categories/${editingCategory._id}`
        : 'http://localhost:3001/api/admin/categories';
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
    if (!confirm(`Delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`http://localhost:3001/api/admin/categories/${id}`, {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#997B21]">
            Taxonomy & Navigation
          </span>
          <h1 className="text-2xl font-bold font-serif-luxury text-gray-900">
            Product Categories ({categories.length})
          </h1>
          <p className="text-xs text-gray-500">
            Manage customer catalog collections and storefront showcase categories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-slate-950 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between p-5 space-y-4"
          >
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-100 border">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 font-serif-luxury text-lg">{cat.name}</h3>
                <p className="text-[11px] text-gray-400 font-mono">/{cat.slug}</p>
                {cat.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{cat.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-[10px] text-gray-400 font-mono">Order: #{cat.sortOrder || 0}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 text-gray-600 hover:text-slate-900 hover:bg-gray-100 rounded transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat._id, cat.name)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                <div className="p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>
              )}

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-900">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fine Perfumes & Fragrances"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-medium text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-900">Slug (URL friendly)</label>
                <input
                  type="text"
                  placeholder="e.g. fine-perfumes"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-mono text-gray-700"
                />
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
              <div className="space-y-2 p-3 bg-gray-50 rounded-xl border">
                <label className="font-bold uppercase text-gray-900 flex justify-between">
                  <span>Category Image</span>
                  {uploadingImage && <span className="text-amber-600 font-normal">Uploading...</span>}
                </label>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-2 bg-slate-900 text-white rounded-lg font-bold text-[11px] uppercase cursor-pointer hover:bg-[#C5A059] transition flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <input
                    type="url"
                    placeholder="or paste image URL..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs"
                  />
                </div>

                {image && (
                  <div className="mt-2 w-20 h-14 rounded-lg overflow-hidden border">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
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
                  disabled={saving}
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
