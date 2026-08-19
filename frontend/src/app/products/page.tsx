'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '../../components/product-card';
import { Search, Filter, SlidersHorizontal, Sparkles, X, RotateCcw } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api-config';

const DEPARTMENTS = [
  { id: '', label: 'All Departments' },
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'kids', label: 'Kids' },
];

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<string>('popular');

  // Sync state from URL query parameters whenever searchParams changes
  useEffect(() => {
    const dept = searchParams.get('department') || '';
    const cat = searchParams.get('category') || '';
    const q = searchParams.get('search') || '';
    const s = searchParams.get('sort') || 'popular';

    setSelectedDepartment(dept);
    setSelectedCategory(cat);
    setSearch(q);
    setSort(s);
  }, [searchParams]);

  // Fetch available categories list once
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  // If a category is selected from URL but department is empty, auto-detect department from category
  useEffect(() => {
    if (selectedCategory && !selectedDepartment && categories.length > 0) {
      const match = categories.find((c) => c.slug === selectedCategory);
      if (match && match.department) {
        setSelectedDepartment(match.department);
      }
    }
  }, [selectedCategory, selectedDepartment, categories]);

  // Categories visible in subcategory pills based on current department
  const visibleCategories = selectedDepartment
    ? categories.filter((c) => c.department === selectedDepartment)
    : categories;

  // Fetch products from backend whenever filters change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();

    if (selectedCategory) {
      params.set('category', selectedCategory);
    } else if (selectedDepartment) {
      params.set('department', selectedDepartment);
    }

    if (search.trim()) {
      params.set('search', search.trim());
    }

    if (sort) {
      params.set('sort', sort);
    }

    fetch(`${API_BASE_URL}/api/products?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [selectedDepartment, selectedCategory, search, sort]);

  // Handler: Change Department
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartment(deptId);
    setSelectedCategory(''); // Reset subcategory when switching department

    const newParams = new URLSearchParams();
    if (deptId) newParams.set('department', deptId);
    if (search) newParams.set('search', search);
    if (sort && sort !== 'popular') newParams.set('sort', sort);

    const queryStr = newParams.toString();
    router.push(`/products${queryStr ? `?${queryStr}` : ''}`, { scroll: false });
  };

  // Handler: Change Subcategory
  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);

    const newParams = new URLSearchParams();
    if (catSlug) {
      newParams.set('category', catSlug);
      // Retain department if available
      if (selectedDepartment) newParams.set('department', selectedDepartment);
    } else if (selectedDepartment) {
      newParams.set('department', selectedDepartment);
    }
    if (search) newParams.set('search', search);
    if (sort && sort !== 'popular') newParams.set('sort', sort);

    const queryStr = newParams.toString();
    router.push(`/products${queryStr ? `?${queryStr}` : ''}`, { scroll: false });
  };

  // Handler: Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (selectedCategory) newParams.set('category', selectedCategory);
    else if (selectedDepartment) newParams.set('department', selectedDepartment);
    if (search.trim()) newParams.set('search', search.trim());
    if (sort && sort !== 'popular') newParams.set('sort', sort);

    const queryStr = newParams.toString();
    router.push(`/products${queryStr ? `?${queryStr}` : ''}`, { scroll: false });
  };

  // Handler: Reset All Filters
  const handleResetFilters = () => {
    setSelectedDepartment('');
    setSelectedCategory('');
    setSearch('');
    setSort('popular');
    router.push('/products', { scroll: false });
  };

  // Header Title
  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const headerTitle = activeCategoryObj
    ? activeCategoryObj.name
    : selectedDepartment
    ? `${selectedDepartment.toUpperCase()} COLLECTION`
    : 'THE HAUTE LUXURY COLLECTION';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3 py-10 bg-[#0B0F19] text-white rounded-3xl border border-[#D4AF37]/20 relative overflow-hidden px-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-[#E6CA85] text-[10px] font-bold uppercase tracking-widest border border-[#D4AF37]/30">
          <Sparkles className="w-3 h-3" />
          <span>AVELORA Haute Collection</span>
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-serif-luxury text-white">
          {headerTitle}
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto font-light">
          {selectedCategory
            ? `Showing exclusive handcrafted pieces in ${activeCategoryObj?.name || 'this collection'}.`
            : selectedDepartment
            ? `Explore the complete ${selectedDepartment} curation crafted with uncompromising quality.`
            : 'Browse bespoke Turkish Silk Hijabs, traditional কাঁচের ও রেশমি চুড়ি, Fine Jewellery, Luxury Footwear, and Kids Festive Wear.'}
        </p>
      </div>

      {/* 1. Main Department Switcher Tabs */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 border-b border-gray-200 pb-4 overflow-x-auto scrollbar-none">
        {DEPARTMENTS.map((dept) => {
          const isActive = selectedDepartment === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => handleDepartmentChange(dept.id)}
              className={`px-5 sm:px-7 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-950 text-white shadow-lg scale-105 border border-slate-950'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
              }`}
            >
              {dept.label}
            </button>
          );
        })}
      </div>

      {/* 2. Filter, Search & Subcategory Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search products by name or style..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs sm:text-sm text-gray-900 bg-gray-50/50"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  const newParams = new URLSearchParams();
                  if (selectedCategory) newParams.set('category', selectedCategory);
                  else if (selectedDepartment) newParams.set('department', selectedDepartment);
                  router.push(`/products${newParams.toString() ? `?${newParams.toString()}` : ''}`, { scroll: false });
                }}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Sort Selector & Active Count */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-gray-500 font-medium">
              {loading ? 'Searching...' : `${products.length} Products`}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden sm:inline">Sort:</span>
              </div>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  const newParams = new URLSearchParams();
                  if (selectedCategory) newParams.set('category', selectedCategory);
                  else if (selectedDepartment) newParams.set('department', selectedDepartment);
                  if (search) newParams.set('search', search);
                  if (e.target.value !== 'popular') newParams.set('sort', e.target.value);
                  router.push(`/products${newParams.toString() ? `?${newParams.toString()}` : ''}`, { scroll: false });
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:border-[#C5A059]"
              >
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Subcategory Pills Bar */}
        {visibleCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 border-t border-gray-100 scrollbar-none">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === ''
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {selectedDepartment ? `All ${selectedDepartment}` : 'All Categories'}
            </button>
            {visibleCategories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#C5A059] text-slate-950 font-bold shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Products Grid Showcase */}
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
            {selectedCategory
              ? `No products currently available in "${activeCategoryObj?.name || selectedCategory}".`
              : 'Try adjusting your search terms or selecting a different department.'}
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#C5A059] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
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

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
          Loading catalog...
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
