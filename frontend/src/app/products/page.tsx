'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '../../components/product-card';
import { API_BASE_URL } from '../../utils/api-config';
import {
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  ArrowLeft,
  X,
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  department?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  originalPrice: number;
  discountPercentage?: number;
  salePrice: number;
  badge?: string;
  categoryId?: any;
  variants: any[];
}

const DEPARTMENTS = [
  { id: '', name: 'All Departments' },
  { id: 'women', name: 'Women' },
  { id: 'men', name: 'Men' },
  { id: 'kids', name: 'Kids' },
];

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL state
  const departmentParam = searchParams.get('department') || '';
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'popular';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedDepartment, setSelectedDepartment] = useState(departmentParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [search, setSearch] = useState(searchParam);
  const [sort, setSort] = useState(sortParam);

  // Sync state when URL params change
  useEffect(() => {
    setSelectedDepartment(departmentParam);
    setSelectedCategory(categoryParam);
    setSearch(searchParam);
    setSort(sortParam);
  }, [departmentParam, categoryParam, searchParam, sortParam]);

  // Fetch Categories
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(data))
      .catch((err) => console.error('Error loading categories', err));
  }, []);

  // Fetch Products based on URL query
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (selectedDepartment) query.set('department', selectedDepartment);
    if (selectedCategory) query.set('category', selectedCategory);
    if (search) query.set('search', search);
    if (sort && sort !== 'popular') query.set('sort', sort);

    fetch(`${API_BASE_URL}/api/products?${query.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch((err) => {
        console.error(err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [selectedDepartment, selectedCategory, search, sort]);

  // Handler: Change Department
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartment(deptId);
    setSelectedCategory('');

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

  // Filter Subcategories by Department
  const filteredCategories = categories.filter((c) => {
    if (!selectedDepartment) return true;
    const catDept = (c.department || '').toLowerCase();
    return catDept === selectedDepartment.toLowerCase() || c.slug.startsWith(selectedDepartment);
  });

  // Header Title
  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const headerTitle = activeCategoryObj
    ? activeCategoryObj.name
    : selectedDepartment
    ? `${selectedDepartment.toUpperCase()} COLLECTION`
    : 'THE HAUTE LUXURY COLLECTION';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* 0. Elegant Breadcrumb & Quick Back Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-gray-200/80 shadow-2xs text-xs">
        <nav className="flex items-center gap-1.5 sm:gap-2 text-gray-500 font-medium overflow-x-auto scrollbar-none py-1">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-[#C5A059] transition text-gray-700 font-semibold flex-shrink-0"
          >
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <button
            onClick={handleResetFilters}
            className={`hover:text-[#C5A059] transition flex-shrink-0 ${
              !selectedDepartment && !selectedCategory ? 'text-gray-900 font-bold' : ''
            }`}
          >
            All Catalog
          </button>

          {selectedDepartment && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <button
                onClick={() => handleDepartmentChange(selectedDepartment)}
                className={`hover:text-[#C5A059] transition capitalize flex-shrink-0 ${
                  !selectedCategory ? 'text-gray-900 font-bold' : ''
                }`}
              >
                {selectedDepartment}
              </button>
            </>
          )}

          {selectedCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-[#997B21] font-bold truncate max-w-[120px] sm:max-w-[200px] flex-shrink-0">
                {activeCategoryObj?.name || selectedCategory}
              </span>
            </>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {selectedCategory ? (
            <button
              onClick={() => handleDepartmentChange(selectedDepartment || '')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[11px] sm:text-xs transition"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to {selectedDepartment ? `${selectedDepartment}` : 'All Catalog'}</span>
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[11px] sm:text-xs transition"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Home</span>
            </Link>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div className="text-center space-y-2 sm:space-y-3 py-6 sm:py-10 bg-[#0B0F19] text-white rounded-2xl sm:rounded-3xl border border-[#D4AF37]/20 relative overflow-hidden px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#E6CA85] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-[#D4AF37]/30">
          <Sparkles className="w-3 h-3" />
          <span>AVELORA Haute Collection</span>
        </div>
        <h1 className="text-xl sm:text-3xl md:text-5xl font-bold font-serif-luxury text-white">
          {headerTitle}
        </h1>
        <p className="text-[11px] sm:text-sm text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
          {selectedCategory
            ? `Showing exclusive handcrafted pieces in ${activeCategoryObj?.name || 'this collection'}.`
            : selectedDepartment
            ? `Explore the complete ${selectedDepartment} curation crafted with uncompromising quality.`
            : 'Browse bespoke Turkish Silk Hijabs, traditional কাঁচের ও রেশমি চুড়ি, Fine Jewellery, Luxury Footwear, and Kids Festive Wear.'}
        </p>
      </div>

      {/* 1. Main Department Switcher Tabs */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDepartment.toLowerCase() === dept.id.toLowerCase();
            return (
              <button
                key={dept.id}
                onClick={() => handleDepartmentChange(dept.id)}
                className={`flex-1 min-w-[100px] py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase transition-all whitespace-nowrap min-h-[40px] flex items-center justify-center ${
                  isSelected
                    ? 'bg-slate-950 text-[#E6CA85] shadow-md border-b-2 border-[#C5A059]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {dept.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Search & Sort Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              placeholder="Search Hijabs, কাঁচের চুড়ি, nagras, kurtis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] text-gray-900"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  const newParams = new URLSearchParams(searchParams.toString());
                  newParams.delete('search');
                  router.push(`/products?${newParams.toString()}`, { scroll: false });
                }}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase tracking-wider flex-shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="hidden sm:inline">Sort:</span>
            </div>
            <select
              value={sort}
              onChange={(e) => {
                const val = e.target.value;
                setSort(val);
                const newParams = new URLSearchParams(searchParams.toString());
                if (val && val !== 'popular') newParams.set('sort', val);
                else newParams.delete('sort');
                router.push(`/products?${newParams.toString()}`, { scroll: false });
              }}
              className="flex-1 sm:flex-initial py-2.5 px-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#C5A059]"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* 3. Subcategories Horizontal Scroll Filter Chips */}
        {filteredCategories.length > 0 && (
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#997B21] flex-shrink-0 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Subcategories:</span>
            </span>

            <button
              onClick={() => handleCategoryChange('')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap min-h-[32px] ${
                !selectedCategory
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All {selectedDepartment ? `${selectedDepartment}` : 'Pieces'}
            </button>

            {filteredCategories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap min-h-[32px] ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 py-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-80 sm:h-96 animate-pulse border border-gray-100 p-3 sm:p-4 space-y-3">
              <div className="bg-gray-200 aspect-[4/5] rounded-xl w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-gray-200 space-y-4 px-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FAFAF8] border border-[#D4AF37]/30 flex items-center justify-center text-[#C5A059] mx-auto">
            <Filter className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold font-serif-luxury text-gray-900 uppercase tracking-wider">
            No Luxury Pieces Found
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
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
        /*
          Adaptive Grid Breakpoints:
          - Small mobile (320-374px): 1-col
          - Standard mobile (375-767px): 2-col (min-[375px]:grid-cols-2)
          - Tablet (768-1023px): 2-col (md:grid-cols-2)
          - Laptop (1024-1439px): 3-col (lg:grid-cols-3)
          - Large Desktop (1440px+): 4-col (xl:grid-cols-4)
        */
        <div className="grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
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
