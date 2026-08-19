'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/product-card';
import { Search, Filter, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api-config';

const DEPARTMENTS = [
  { id: '', label: 'All Departments' },
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'kids', label: 'Kids' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<string>('popular');

  // Load URL query params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dept = params.get('department');
      const cat = params.get('category');
      const q = params.get('search');
      if (dept) setSelectedDepartment(dept);
      if (cat) setSelectedCategory(cat);
      if (q) setSearch(q);
    }
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  // Filter categories by department
  const visibleCategories = selectedDepartment
    ? categories.filter((c) => c.department === selectedDepartment)
    : categories;

    // Fetch products with filters
    useEffect(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.set('category', selectedCategory);
      } else if (selectedDepartment) {
        params.set('department', selectedDepartment);
      }
      if (search) params.set('search', search);
      if (sort) params.set('sort', sort);

      fetch(`${API_BASE_URL}/api/products?${params.toString()}`)
        .then((res) => (res.ok ? res.json() : { products: [] }))
        .then((data) => {
          setProducts(data.products || []);
        })
        .catch((err) => {
          console.error(err);
          setProducts([]);
        })
        .finally(() => setLoading(false));
    }, [selectedDepartment, selectedCategory, search, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3 py-10 bg-[#0B0F19] text-white rounded-3xl border border-[#D4AF37]/20 relative overflow-hidden px-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-[#E6CA85] text-[10px] font-bold uppercase tracking-widest border border-[#D4AF37]/30">
          <Sparkles className="w-3 h-3" />
          <span>Aarong-Style Curated Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif-luxury text-white">
          {selectedDepartment
            ? `${selectedDepartment.toUpperCase()} COLLECTION`
            : 'THE HAUTE LUXURY COLLECTION'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto font-light">
          Browse bespoke Turkish Silk Hijabs, traditional কাঁচের ও রেশমি চুড়ি, Fine Jewellery, Luxury Footwear, and Kids' Festive Designer Gowns.
        </p>
      </div>

      {/* Department Tabs */}
      <div className="flex items-center justify-center gap-3 border-b border-gray-200 pb-4">
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept.id}
            onClick={() => {
              setSelectedDepartment(dept.id);
              setSelectedCategory('');
            }}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all ${
              selectedDepartment === dept.id
                ? 'bg-slate-950 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {dept.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search silk hijabs, churi sets, jhumkas, nagras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs sm:text-sm text-gray-900 bg-gray-50/50"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <span>Sort By:</span>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:border-[#C5A059]"
            >
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Subcategory Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 border-t border-gray-100 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedCategory === ''
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Subcategories ({products.length})
          </button>
          {visibleCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat.slug
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-96 animate-pulse border border-gray-100 p-4 space-y-4">
              <div className="bg-gray-200 aspect-[4/5] rounded-xl w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAFAF8] border border-[#D4AF37]/30 flex items-center justify-center text-[#C5A059] mx-auto">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold font-serif-luxury text-gray-900 uppercase tracking-wider">
            No Luxury Pieces Found
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search terms or choosing a different department or category.
          </p>
          <button
            onClick={() => {
              setSelectedDepartment('');
              setSelectedCategory('');
              setSearch('');
            }}
            className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#C5A059] transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
