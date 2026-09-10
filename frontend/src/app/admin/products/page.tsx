'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  QrCode,
  Download,
  Printer,
  ExternalLink,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Star,
  Tag,
  Calendar,
  Sparkles,
  Archive,
  RotateCcw,
  ShieldAlert,
  Palette,
} from 'lucide-react';
import { processImageForUpload } from '../../../utils/image-compressor';
import { API_BASE_URL, authFetch } from '../../../utils/api-config';
import QrModal from '../../../components/qr-modal';
import { buildProductQrUrl } from '../../../utils/qr-generator';

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

export const PRESET_COLORS = [
  // Neutrals & Classics
  { name: 'Black', hex: '#0F172A', category: 'Classic & Neutral' },
  { name: 'White', hex: '#FFFFFF', category: 'Classic & Neutral' },
  { name: 'Off-White', hex: '#FDFBF7', category: 'Classic & Neutral' },
  { name: 'Ivory', hex: '#FFFFF0', category: 'Classic & Neutral' },
  { name: 'Cream', hex: '#FFFDD0', category: 'Classic & Neutral' },
  { name: 'Beige', hex: '#E8D8C8', category: 'Classic & Neutral' },
  { name: 'Nude', hex: '#CDB49B', category: 'Classic & Neutral' },
  { name: 'Sand', hex: '#C2B280', category: 'Classic & Neutral' },
  { name: 'Taupe', hex: '#8B8589', category: 'Classic & Neutral' },
  { name: 'Camel / Tan', hex: '#C19A6B', category: 'Classic & Neutral' },
  { name: 'Charcoal', hex: '#334155', category: 'Classic & Neutral' },
  { name: 'Grey', hex: '#64748B', category: 'Classic & Neutral' },
  { name: 'Silver / Ash', hex: '#CBD5E1', category: 'Classic & Neutral' },

  // Greens & Earth
  { name: 'Olive', hex: '#556B2F', category: 'Green & Earth' },
  { name: 'Sage Green', hex: '#9CAF88', category: 'Green & Earth' },
  { name: 'Bottle Green', hex: '#0B4F37', category: 'Green & Earth' },
  { name: 'Emerald Green', hex: '#16A34A', category: 'Green & Earth' },
  { name: 'Mint Green', hex: '#A8E6CF', category: 'Green & Earth' },
  { name: 'Sea Green', hex: '#2E8B57', category: 'Green & Earth' },
  { name: 'Pistachio', hex: '#93C572', category: 'Green & Earth' },
  { name: 'Moss Green', hex: '#8A9A5B', category: 'Green & Earth' },
  { name: 'Khaki', hex: '#C3B091', category: 'Green & Earth' },

  // Reds, Maroons & Rust
  { name: 'Maroon', hex: '#58111A', category: 'Red & Maroon' },
  { name: 'Burgundy', hex: '#722F37', category: 'Red & Maroon' },
  { name: 'Wine', hex: '#5B1E31', category: 'Red & Maroon' },
  { name: 'Crimson', hex: '#990000', category: 'Red & Maroon' },
  { name: 'Red', hex: '#DC2626', category: 'Red & Maroon' },
  { name: 'Ruby Red', hex: '#9B111E', category: 'Red & Maroon' },
  { name: 'Rust', hex: '#C04000', category: 'Red & Maroon' },
  { name: 'Terracotta', hex: '#E2725B', category: 'Red & Maroon' },

  // Pinks & Peaches
  { name: 'Dusty Pink', hex: '#E08B9B', category: 'Pink & Peach' },
  { name: 'Blush Pink', hex: '#FFD1DC', category: 'Pink & Peach' },
  { name: 'Baby Pink', hex: '#FFB6C1', category: 'Pink & Peach' },
  { name: 'Rose Gold', hex: '#B76E79', category: 'Pink & Peach' },
  { name: 'Hot Pink', hex: '#FF69B4', category: 'Pink & Peach' },
  { name: 'Coral', hex: '#F88379', category: 'Pink & Peach' },
  { name: 'Deep Coral', hex: '#E06352', category: 'Pink & Peach' },
  { name: 'Peach', hex: '#FFE5B4', category: 'Pink & Peach' },

  // Purples & Lilacs
  { name: 'Magenta', hex: '#D946EF', category: 'Purple & Lilac' },
  { name: 'Mauve', hex: '#E0B0FF', category: 'Purple & Lilac' },
  { name: 'Lavender', hex: '#B57EDC', category: 'Purple & Lilac' },
  { name: 'Lilac', hex: '#C8A2C8', category: 'Purple & Lilac' },
  { name: 'Plum', hex: '#4A0E4E', category: 'Purple & Lilac' },
  { name: 'Purple', hex: '#6B21A8', category: 'Purple & Lilac' },
  { name: 'Deep Violet', hex: '#2E0854', category: 'Purple & Lilac' },

  // Blues & Teals
  { name: 'Navy Blue', hex: '#1B2A4A', category: 'Blue & Teal' },
  { name: 'Royal Blue', hex: '#2563EB', category: 'Blue & Teal' },
  { name: 'Midnight Blue', hex: '#191970', category: 'Blue & Teal' },
  { name: 'Teal', hex: '#008080', category: 'Blue & Teal' },
  { name: 'Peacock Blue', hex: '#005F73', category: 'Blue & Teal' },
  { name: 'Turquoise', hex: '#40E0D0', category: 'Blue & Teal' },
  { name: 'Cyan', hex: '#06B6D4', category: 'Blue & Teal' },
  { name: 'Sky Blue', hex: '#87CEEB', category: 'Blue & Teal' },
  { name: 'Powder Blue', hex: '#B0E0E6', category: 'Blue & Teal' },
  { name: 'Ice Blue', hex: '#AFEEEE', category: 'Blue & Teal' },
  { name: 'Aqua', hex: '#00FFFF', category: 'Blue & Teal' },

  // Golds, Yellows & Browns
  { name: 'Gold', hex: '#C5A059', category: 'Gold & Brown' },
  { name: 'Champagne', hex: '#F7E7CE', category: 'Gold & Brown' },
  { name: 'Copper / Bronze', hex: '#B87333', category: 'Gold & Brown' },
  { name: 'Mustard', hex: '#DDAA00', category: 'Gold & Brown' },
  { name: 'Yellow', hex: '#EAB308', category: 'Gold & Brown' },
  { name: 'Orange', hex: '#EA580C', category: 'Gold & Brown' },
  { name: 'Amber', hex: '#FFBF00', category: 'Gold & Brown' },
  { name: 'Brown', hex: '#78350F', category: 'Gold & Brown' },
  { name: 'Chocolate', hex: '#3E2723', category: 'Gold & Brown' },
  { name: 'Coffee', hex: '#6F4E37', category: 'Gold & Brown' },
  { name: 'Caramel', hex: '#AF6E4D', category: 'Gold & Brown' },
];

interface ProductImageEntry {
  url: string;
  public_id?: string;
  sortOrder: number;
  isPrimary: boolean;
  alt?: string;
  width?: number;
  height?: number;
  variantColor?: string;
}

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
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrProduct, setQrProduct] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrPublicCode, setQrPublicCode] = useState<string>('');

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

  // Structured Image Gallery State
  const [productImages, setProductImages] = useState<ProductImageEntry[]>([]);
  const [imageInput, setImageInput] = useState('');

  // Pricing & Authoritative Discount Fields
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [isDiscountActive, setIsDiscountActive] = useState<boolean>(true);
  const [discountStartDate, setDiscountStartDate] = useState<string>('');
  const [discountEndDate, setDiscountEndDate] = useState<string>('');

  const [isPublished, setIsPublished] = useState(true);
  const [dataMode, setDataMode] = useState<'PRODUCTION' | 'TEST'>('PRODUCTION');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'HIDDEN' | 'ARCHIVED'>('ACTIVE');

  // Filters
  const [dataModeFilter, setDataModeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Dependency Guard Feedback Modal
  const [dependencyModal, setDependencyModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
    message: string;
  }>({
    isOpen: false,
    productId: '',
    productName: '',
    message: '',
  });

  // Dynamic 5 Features List
  const [features, setFeatures] = useState<Array<{ title: string; subtitle: string; icon: string }>>([
    { title: 'Soft & Comfortable', subtitle: 'Gentle on skin and non-irritating', icon: 'feather' },
    { title: 'Premium Artisan Quality', subtitle: 'Crafted from finest materials', icon: 'layers' },
    { title: 'Lightweight & Breathable', subtitle: 'Designed for effortless all-day wear', icon: 'wind' },
    { title: 'Glossy & Elegant Finish', subtitle: 'Flawless look that enhances beauty', icon: 'waves' },
    { title: 'Perfect For Every Occasion', subtitle: 'Festivals, parties, weddings & daily styling', icon: 'check' },
  ]);

  // Color Preset Search & Filter State
  const [colorSearch, setColorSearch] = useState('');
  const [selectedColorCategory, setSelectedColorCategory] = useState('ALL');

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
  >([]);

  // Unsaved changes protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isModalOpen && isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isModalOpen, isDirty]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/admin/products`),
        fetch(`${API_BASE_URL}/api/categories`),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : prodData?.products || []);
      } else {
        // Fallback: If admin auth has issues, fetch via public endpoint
        const fallbackRes = await fetch(`${API_BASE_URL}/api/products?limit=200`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setProducts(fallbackData.products || []);
        }
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData || []);
      }
    } catch (e) {
      console.error('Error fetching admin product catalog', e);
      try {
        const fallbackRes = await fetch(`${API_BASE_URL}/api/products?limit=200`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setProducts(fallbackData.products || []);
        }
      } catch (err2) {
        console.error('Fallback fetch error:', err2);
      }
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
    setCategoryId('');
    setBadge('BEST SELLER');
    setUnitBadge('');
    setRating(4.8);
    setReviewsCount(256);
    setDescription('');
    setProductImages([]);
    setImageInput('');
    setOriginalPrice(0);
    setSalePrice(0);
    setDiscountPercentage(0);
    setIsDiscountActive(true);
    setDiscountStartDate('');
    setDiscountEndDate('');
    setIsPublished(true);
    setDataMode('PRODUCTION');
    setStatus('ACTIVE');
    setFeatures([
      { title: 'Soft & Comfortable', subtitle: 'Gentle on skin and non-irritating', icon: 'feather' },
      { title: 'Premium Artisan Quality', subtitle: 'Crafted from finest materials', icon: 'layers' },
      { title: 'Lightweight & Breathable', subtitle: 'Designed for effortless all-day wear', icon: 'wind' },
      { title: 'Glossy & Elegant Finish', subtitle: 'Flawless look that enhances beauty', icon: 'waves' },
      { title: 'Perfect For Every Occasion', subtitle: 'Festivals, parties, weddings & daily styling', icon: 'check' },
    ]);
    setVariants([]);
    setColorSearch('');
    setSelectedColorCategory('ALL');
    setError('');
    setIsDirty(false);
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

    // Map Images & Metadata
    if (Array.isArray(prod.productImages) && prod.productImages.length > 0) {
      setProductImages(
        prod.productImages.map((img: any, idx: number) => ({
          url: img.url || '',
          public_id: img.public_id || '',
          sortOrder: img.sortOrder !== undefined ? img.sortOrder : idx,
          isPrimary: Boolean(img.isPrimary) || idx === 0,
          alt: img.alt || '',
          width: img.width || 0,
          height: img.height || 0,
          variantColor: img.variantColor || '',
        })),
      );
    } else if (Array.isArray(prod.images) && prod.images.length > 0) {
      setProductImages(
        prod.images.map((url: string, idx: number) => ({
          url,
          public_id: '',
          sortOrder: idx,
          isPrimary: idx === 0,
          alt: '',
          width: 0,
          height: 0,
          variantColor: '',
        })),
      );
    } else {
      setProductImages([]);
    }

    setImageInput('');
    setOriginalPrice(prod.originalPrice || 0);
    setSalePrice(prod.salePrice || 0);
    setDiscountPercentage(prod.discountPercentage || 0);
    setIsDiscountActive(prod.isDiscountActive !== false);

    // Format ISO string to datetime-local format
    if (prod.discountStartDate) {
      try {
        setDiscountStartDate(new Date(prod.discountStartDate).toISOString().slice(0, 16));
      } catch {
        setDiscountStartDate('');
      }
    } else {
      setDiscountStartDate('');
    }

    if (prod.discountEndDate) {
      try {
        setDiscountEndDate(new Date(prod.discountEndDate).toISOString().slice(0, 16));
      } catch {
        setDiscountEndDate('');
      }
    } else {
      setDiscountEndDate('');
    }

    setIsPublished(prod.isPublished !== false);
    setDataMode(prod.dataMode || 'PRODUCTION');
    setStatus(prod.status || 'ACTIVE');

    if (prod.features && prod.features.length > 0) {
      setFeatures(
        prod.features.map((f: any) => ({
          title: f.title || '',
          subtitle: f.subtitle || '',
          icon: f.icon || 'feather',
        })),
      );
    } else {
      setFeatures([
        { title: 'Soft & Comfortable', subtitle: 'Gentle on skin and non-irritating', icon: 'feather' },
        { title: 'Premium Artisan Quality', subtitle: 'Crafted from finest materials', icon: 'layers' },
        { title: 'Lightweight & Breathable', subtitle: 'Designed for effortless all-day wear', icon: 'wind' },
        { title: 'Glossy & Elegant Finish', subtitle: 'Flawless look that enhances beauty', icon: 'waves' },
        { title: 'Perfect For Every Occasion', subtitle: 'Festivals, parties, weddings & daily styling', icon: 'check' },
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
        : [],
    );
    setColorSearch('');
    setSelectedColorCategory('ALL');

    setError('');
    setIsDirty(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        return;
      }
    }
    setIsModalOpen(false);
  };

  // High-Fidelity Multi-Image Upload Handler
  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError('');
    setIsDirty(true);

    try {
      const newItems: ProductImageEntry[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgressText(`Processing & uploading image ${i + 1} of ${files.length}...`);

        try {
          const processed = await processImageForUpload(file, 1800, 0.90);

          const res = await authFetch(`${API_BASE_URL}/api/upload/image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: processed.dataUrl, folder: 'avelora/products' }),
          });

          let uploadedUrl = processed.dataUrl;
          let publicId = '';

          if (res.ok) {
            const data = await res.json();
            uploadedUrl = data.url || processed.dataUrl;
            publicId = data.public_id || '';
          }

          const currentLen = productImages.length + newItems.length;
          newItems.push({
            url: uploadedUrl,
            public_id: publicId,
            sortOrder: currentLen,
            isPrimary: currentLen === 0,
            alt: name || '',
            width: processed.width,
            height: processed.height,
          });
        } catch (itemErr: any) {
          console.error(`Error processing file ${file.name}:`, itemErr);
          setError(`Warning on "${file.name}": ${itemErr.message}`);
        }
      }

      if (newItems.length > 0) {
        setProductImages((prev) => {
          const combined = [...prev, ...newItems];
          // Ensure first image is marked primary if none was
          if (!combined.some((img) => img.isPrimary) && combined.length > 0) {
            combined[0].isPrimary = true;
          }
          return combined;
        });
      }
    } catch (err: any) {
      console.error('Error in batch upload:', err);
      setError(err.message || 'Image upload encountered an issue.');
    } finally {
      setUploadingImage(false);
      setUploadProgressText('');
      // Reset input value so same files can be re-selected if desired
      e.target.value = '';
    }
  };

  const addManualImageUrl = () => {
    if (imageInput.trim()) {
      const currentLen = productImages.length;
      setProductImages((prev) => [
        ...prev,
        {
          url: imageInput.trim(),
          public_id: '',
          sortOrder: currentLen,
          isPrimary: currentLen === 0,
          alt: name || '',
        },
      ]);
      setImageInput('');
      setIsDirty(true);
    }
  };

  const removeImage = (index: number) => {
    setIsDirty(true);
    setProductImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      // Re-index sort order
      const reindexed = filtered.map((img, idx) => ({ ...img, sortOrder: idx }));
      // If deleted image was primary, make new first image primary
      if (prev[index]?.isPrimary && reindexed.length > 0) {
        reindexed[0].isPrimary = true;
      }
      return reindexed;
    });
  };

  const setPrimaryImage = (index: number) => {
    setIsDirty(true);
    setProductImages((prev) => {
      const target = prev[index];
      if (!target) return prev;
      const rest = prev.filter((_, idx) => idx !== index);
      const reordered = [{ ...target, isPrimary: true, sortOrder: 0 }, ...rest.map((img, idx) => ({ ...img, isPrimary: false, sortOrder: idx + 1 }))];
      return reordered;
    });
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= productImages.length) return;

    setIsDirty(true);
    setProductImages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;

      // Update sortOrder indexes
      return updated.map((img, idx) => ({
        ...img,
        sortOrder: idx,
        isPrimary: idx === 0,
      }));
    });
  };

  const updateImageVariant = (index: number, colorName: string) => {
    setIsDirty(true);
    setProductImages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], variantColor: colorName };
      return updated;
    });
  };

  // Feature Controls
  const updateFeature = (index: number, field: 'title' | 'subtitle' | 'icon', value: string) => {
    setIsDirty(true);
    setFeatures((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const applyFeaturePreset = (type: 'hijab' | 'churi' | 'men') => {
    setIsDirty(true);
    if (type === 'hijab') {
      setFeatures([
        { title: 'Soft & Comfortable', subtitle: 'Gentle on skin', icon: 'feather' },
        { title: 'Premium Ceri Fabric', subtitle: 'High quality material', icon: 'layers' },
        { title: 'Lightweight & Breathable', subtitle: 'All day comfort', icon: 'wind' },
        { title: 'Elegant Drape', subtitle: 'Perfect fall & flow', icon: 'waves' },
        { title: 'Easy to Style', subtitle: 'Hijab friendly fabric', icon: 'check' },
      ]);
    } else if (type === 'churi') {
      setFeatures([
        { title: 'Soft & Comfortable', subtitle: 'Gentle on skin and non-irritating', icon: 'feather' },
        { title: 'Premium Artisan Quality', subtitle: 'Crafted from finest materials', icon: 'layers' },
        { title: 'Lightweight & Breathable', subtitle: 'Designed for effortless all-day wear', icon: 'wind' },
        { title: 'Glossy & Elegant Finish', subtitle: 'Flawless look that enhances beauty', icon: 'waves' },
        { title: 'Perfect For Every Occasion', subtitle: 'Festivals, parties, weddings & daily styling', icon: 'check' },
      ]);
    } else if (type === 'men') {
      setFeatures([
        { title: '100% Genuine Leather', subtitle: 'Handcrafted artisan premium finish', icon: 'award' },
        { title: 'Orthopedic Cushioned Insole', subtitle: 'Supreme all-day step comfort', icon: 'feather' },
        { title: 'Anti-Skid Rubber Outsole', subtitle: 'Maximum traction and road grip', icon: 'layers' },
        { title: 'Breathable Leather Lining', subtitle: 'Prevents moisture and odor buildup', icon: 'wind' },
        { title: 'Bespoke Luxury Packaging', subtitle: 'Includes protective dust bag & shoe horn', icon: 'crown' },
      ]);
    }
  };

  // Variant Controls: 1-Click Toggle ON/OFF
  const togglePresetColorVariant = (preset: { name: string; hex: string }) => {
    setIsDirty(true);
    const existingIndex = variants.findIndex(
      (v) => v.color.toLowerCase().trim() === preset.name.toLowerCase().trim(),
    );

    if (existingIndex >= 0) {
      // Toggle OFF: Remove this color variant
      setVariants((prev) => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      // Toggle ON: Add this color variant
      const skuSuffix = Math.floor(100 + Math.random() * 900);
      if (
        variants.length === 1 &&
        (!variants[0].color || variants[0].color === 'Standard')
      ) {
        setVariants([
          {
            sku: variants[0].sku || `AVE-${skuSuffix}`,
            color: preset.name,
            colorHex: preset.hex,
            size: variants[0].size || 'Standard',
            price: salePrice || originalPrice || variants[0].price || 0,
            costPrice: variants[0].costPrice || 0,
            stock: variants[0].stock || 15,
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
    }
  };

  const clearAllVariants = () => {
    setIsDirty(true);
    setVariants([]);
  };

  const addVariantRow = () => {
    setIsDirty(true);
    const skuSuffix = Math.floor(100 + Math.random() * 900);
    setVariants((prev) => [
      ...prev,
      { sku: `AVE-${skuSuffix}`, color: '', colorHex: '#C5A059', size: 'Standard', price: salePrice || originalPrice || 0, costPrice: 0, stock: 10 },
    ]);
  };

  const removeVariantRow = (index: number) => {
    setIsDirty(true);
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setIsDirty(true);
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product title is required.');
      return;
    }

    if (isDiscountActive && originalPrice > 0 && salePrice > 0 && salePrice >= originalPrice) {
      setError(`Discount Sale Price (৳${salePrice}) must be strictly less than Regular Price (৳${originalPrice}).`);
      return;
    }

    if (discountStartDate && discountEndDate) {
      if (new Date(discountEndDate).getTime() <= new Date(discountStartDate).getTime()) {
        setError('Discount End Date must be after Start Date.');
        return;
      }
    }

    setSaving(true);
    setError('');

    const cleanSlug = name.trim().toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, '-').replace(/(^-|-$)/g, '');
    const autoSlug = slug.trim() || (cleanSlug && cleanSlug !== '-' ? cleanSlug : `prod-${Date.now().toString().slice(-6)}`);

    // Authoritative image order with primary first
    const sortedImages = [...productImages].sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : a.sortOrder - b.sortOrder));
    sortedImages.forEach((img, idx) => {
      img.sortOrder = idx;
    });

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
      productImages: sortedImages,
      images: sortedImages.map((img) => img.url),
      originalPrice: Number(originalPrice) || 0,
      salePrice: Number(salePrice) || Number(originalPrice) || 0,
      discountPercentage: Number(discountPercentage) || 0,
      isDiscountActive,
      discountStartDate: discountStartDate ? new Date(discountStartDate).toISOString() : undefined,
      discountEndDate: discountEndDate ? new Date(discountEndDate).toISOString() : undefined,
      isPublished,
      dataMode,
      status,
      variants:
        variants.length > 0
          ? variants.map((v) => {
              const colorName = v.color ? v.color.trim() : 'Standard';
              const lower = colorName.toLowerCase();
              const mappedHex = PRESET_COLORS.find((p) => p.name.toLowerCase() === lower)?.hex || '#0F172A';
              return {
                sku: v.sku.trim() || `AVE-${Math.floor(1000 + Math.random() * 9000)}`,
                color: colorName,
                colorHex: v.colorHex && v.colorHex.trim() !== '' ? v.colorHex.trim() : mappedHex,
                size: v.size.trim() || 'Standard',
                price: Number(v.price) > 0 ? Number(v.price) : Number(salePrice) || Number(originalPrice) || 0,
                costPrice: Number(v.costPrice) || 0,
                stockQuantity: Number(v.stock) >= 0 ? Number(v.stock) : 10,
              };
            })
          : [
              {
                sku: `AVE-${Date.now().toString().slice(-5)}`,
                color: 'Standard',
                colorHex: '#C5A059',
                size: 'Standard',
                price: Number(salePrice) || Number(originalPrice) || 0,
                costPrice: 0,
                stockQuantity: 10,
              },
            ],
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

      setIsDirty(false);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenQrModal = async (prod: any) => {
    setQrProduct(prod);
    const existingCode = prod.qr?.publicCode || `PRD-${prod._id.substring(prod._id.length - 6).toUpperCase()}`;
    setQrPublicCode(existingCode);
    setQrModalOpen(true);

    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/qr/products/${prod._id}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.publicCode) {
          setQrPublicCode(data.publicCode);
        }
      }
    } catch (e) {
      console.error('Error generating product QR code:', e);
    }
  };

  const handleArchiveProduct = async (id: string) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/products/${id}/archive`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setDependencyModal({ isOpen: false, productId: '', productName: '', message: '' });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to archive product');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to archive product');
    }
  };

  const handleRestoreProduct = async (id: string) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/products/${id}/restore`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to restore product');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to restore product');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        if (data.message && data.message.includes('Archive the product instead')) {
          setDependencyModal({
            isOpen: true,
            productId: id,
            productName: name,
            message: data.message,
          });
        } else {
          alert(data.message || 'Failed to delete product.');
        }
      }
    } catch (e: any) {
      alert(e.message || 'Failed to delete product.');
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

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase());
    const matchesDataMode =
      dataModeFilter === 'ALL' || (p.dataMode || 'PRODUCTION') === dataModeFilter;
    const matchesStatus =
      statusFilter === 'ALL' || (p.status || 'ACTIVE') === statusFilter;
    return matchesSearch && matchesDataMode && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#997B21]">
            Catalog &amp; Inventory Management
          </span>
          <h1 className="text-2xl font-bold font-serif-luxury text-gray-900">
            Products &amp; Variants ({filteredProducts.length}/{products.length})
          </h1>
          <p className="text-xs text-gray-500">
            Create pieces, upload photos directly from your device, and manage SKUs, COGS &amp; prices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {products.some((p) => p.dataMode === 'TEST') && (
            <button
              onClick={handleClearAllDemoProducts}
              className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 border border-purple-200 shadow-sm"
              title="Clear all test products"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clean Test Products</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-slate-950 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search products by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Data Mode Filter */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setDataModeFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                dataModeFilter === 'ALL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              All Data
            </button>
            <button
              type="button"
              onClick={() => setDataModeFilter('PRODUCTION')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                dataModeFilter === 'PRODUCTION' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Production
            </button>
            <button
              type="button"
              onClick={() => setDataModeFilter('TEST')}
              className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                dataModeFilter === 'TEST' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-700 hover:text-purple-900'
              }`}
            >
              <span>🧪 Test Only</span>
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#C5A059]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DRAFT">DRAFT</option>
            <option value="HIDDEN">HIDDEN</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#C5A059]" />
            <span className="text-xs font-medium">Loading catalog products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-4">
            <Sparkles className="w-10 h-10 text-[#C5A059] mx-auto opacity-70" />
            <div className="space-y-1">
              <p className="text-base font-bold text-gray-800">No products found</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No products match the selected filters or search terms.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={openCreateModal}
                className="px-5 py-2.5 bg-slate-900 hover:bg-[#C5A059] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Product</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price / Discount</th>
                  <th className="py-3 px-4">Variants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((prod) => {
                  const firstImg = prod.images?.[0] || 'https://images.unsplash.com/photo-1611591475152-478311399767?auto=format&fit=crop&w=300&q=80';
                  const hasDiscount = prod.originalPrice > prod.salePrice && prod.salePrice > 0;
                  const isTest = prod.dataMode === 'TEST';
                  const prodStatus = prod.status || 'ACTIVE';

                  return (
                    <tr key={prod._id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={firstImg}
                          alt=""
                          className="w-10 h-12 rounded-lg object-cover border border-gray-200 shadow-2xs"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 line-clamp-1">{prod.name}</p>
                            {isTest && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-100 text-purple-800 border border-purple-200 tracking-wider uppercase">
                                🧪 TEST
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">/{prod.slug}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-semibold">
                          {prod.categoryId?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-baseline gap-1.5 font-mono">
                          <span className="font-bold text-gray-900">৳{prod.salePrice || prod.originalPrice}</span>
                          {hasDiscount && (
                            <>
                              <span className="text-gray-400 line-through text-[10px]">৳{prod.originalPrice}</span>
                              <span className="text-[10px] font-bold text-emerald-600">({prod.discountPercentage}% OFF)</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-semibold text-gray-700">
                          {prod.variants?.length || 1} Variant(s)
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prodStatus === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : prodStatus === 'ARCHIVED'
                              ? 'bg-gray-100 text-gray-700 border border-gray-300'
                              : prodStatus === 'HIDDEN'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {prodStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenQrModal(prod)}
                          className="p-1.5 text-gray-500 hover:text-[#C5A059] hover:bg-[#C5A059]/10 rounded transition cursor-pointer"
                          title="Generate & Print QR Code"
                        >
                          <QrCode className="w-4 h-4 text-[#C5A059]" />
                        </button>

                        {prodStatus !== 'ARCHIVED' ? (
                          <button
                            onClick={() => handleArchiveProduct(prod._id)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition cursor-pointer"
                            title="Archive Product"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestoreProduct(prod._id)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition cursor-pointer"
                            title="Restore to Active"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 text-gray-600 hover:text-slate-900 hover:bg-gray-100 rounded transition cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod._id, prod.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
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

      {/* Add / Edit Product Modal */}
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
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 cursor-pointer"
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

              {/* Data Mode & Status Selector */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-gray-900 block text-xs">Catalog Data Mode</span>
                  <span className="text-[11px] text-gray-500">Choose between real production catalog or sandboxed test/demo item</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDataMode('PRODUCTION');
                      setIsDirty(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                      dataMode === 'PRODUCTION'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    Production Catalog
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDataMode('TEST');
                      setIsDirty(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                      dataMode === 'TEST'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-white text-purple-700 border border-purple-300'
                    }`}
                  >
                    🧪 Test / Demo Item
                  </button>
                </div>
              </div>

              {/* Lifecycle Status & Publishing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Product Lifecycle Status</label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as any);
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="ACTIVE">ACTIVE (Storefront Visible)</option>
                    <option value="DRAFT">DRAFT (Unpublished / Work in progress)</option>
                    <option value="HIDDEN">HIDDEN (Direct link / Catalog hidden)</option>
                    <option value="ARCHIVED">ARCHIVED (Discontinued / No longer active)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Public Visibility Toggle</label>
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="isPub"
                      checked={isPublished}
                      onChange={(e) => {
                        setIsPublished(e.target.checked);
                        setIsDirty(true);
                      }}
                      className="w-4 h-4 text-[#C5A059] rounded focus:ring-[#C5A059]"
                    />
                    <label htmlFor="isPub" className="text-xs font-semibold text-gray-700 cursor-pointer">
                      Published on Public Storefront
                    </label>
                  </div>
                </div>
              </div>

              {/* Title, Subtitle, Category & Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold uppercase text-gray-900">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ceri Hijab or Reshmi Churi"
                    value={name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setName(val);
                      setIsDirty(true);
                      // Intelligent Category Auto-Detection for Admin convenience
                      if (!editingProduct && (!categoryId || categoryId === '')) {
                        const lower = val.toLowerCase();
                        if (
                          lower.includes('curi') ||
                          lower.includes('churi') ||
                          lower.includes('চুড়ি') ||
                          lower.includes('চুড়ি') ||
                          lower.includes('bangle') ||
                          lower.includes('reshmi') ||
                          lower.includes('resmi') ||
                          lower.includes('kasmeri') ||
                          lower.includes('kashmiri') ||
                          lower.includes('kacer') ||
                          lower.includes('kacher') ||
                          lower.includes('কাঁচের') ||
                          lower.includes('bala') ||
                          lower.includes('কঙ্কন')
                        ) {
                          const found = categories.find((c) => c.slug === 'women-churi-bangles') || PRESET_CATEGORIES.find((c) => c.slug === 'women-churi-bangles');
                          if (found) setCategoryId((found as any)._id || found.slug);
                        } else if (
                          lower.includes('hijab') ||
                          lower.includes('হিজাব') ||
                          lower.includes('abaya') ||
                          lower.includes('scarf') ||
                          lower.includes('popcorn') ||
                          lower.includes('ceri') ||
                          lower.includes('cherry') ||
                          lower.includes('jafran')
                        ) {
                          const found = categories.find((c) => c.slug === 'women-hijab') || PRESET_CATEGORIES.find((c) => c.slug === 'women-hijab');
                          if (found) setCategoryId((found as any)._id || found.slug);
                        } else if (
                          lower.includes('jhumka') ||
                          lower.includes('ঝুমকা') ||
                          lower.includes('jewel') ||
                          lower.includes('kundan') ||
                          lower.includes('necklace') ||
                          lower.includes('earring') ||
                          lower.includes('payel')
                        ) {
                          const found = categories.find((c) => c.slug === 'women-accessories') || PRESET_CATEGORIES.find((c) => c.slug === 'women-accessories');
                          if (found) setCategoryId((found as any)._id || found.slug);
                        } else if (
                          lower.includes('hair') ||
                          lower.includes('হেয়ার') ||
                          lower.includes('হেয়ার') ||
                          lower.includes('clip')
                        ) {
                          const found = categories.find((c) => c.slug === 'women-hair-accessories') || PRESET_CATEGORIES.find((c) => c.slug === 'women-hair-accessories');
                          if (found) setCategoryId((found as any)._id || found.slug);
                        } else if (lower.includes('panjabi') || lower.includes('পাঞ্জাবি') || lower.includes('punjabi')) {
                          const found = categories.find((c) => c.slug === 'men-clothing') || PRESET_CATEGORIES.find((c) => c.slug === 'men-clothing');
                          if (found) setCategoryId((found as any)._id || found.slug);
                        } else if (lower.includes('loafer') || lower.includes('লোফার')) {
                          const found = categories.find((c) => c.slug === 'men-shoes') || PRESET_CATEGORIES.find((c) => c.slug === 'men-shoes');
                          if (found) setCategoryId((found as any)._id || found.slug);
                        } else if (lower.includes('nagra') || lower.includes('নাগরা') || lower.includes('জুতা')) {
                          const found = categories.find((c) => c.slug === 'women-shoes') || PRESET_CATEGORIES.find((c) => c.slug === 'women-shoes');
                          if (found) setCategoryId((found as any)._id || found.slug);
                        } else if (lower.includes('dress') || lower.includes('gown') || lower.includes('kurti')) {
                          const found = categories.find((c) => c.slug === 'women-dresses') || PRESET_CATEGORIES.find((c) => c.slug === 'women-dresses');
                          if (found) setCategoryId((found as any)._id || found.slug);
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] bg-white text-gray-900 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Subtitle / Variant Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Olive or 24 Pcs Set"
                    value={subtitle}
                    onChange={(e) => {
                      setSubtitle(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] bg-white text-gray-900 font-medium"
                  />
                </div>
              </div>

              {/* Category, Badge, Unit Badge */}
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
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-[#C5A059] bg-white font-semibold text-gray-900 text-xs shadow-sm"
                  >
                    <option value="">-- সিলেক্ট ক্যাটাগরি (Select Category) --</option>
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
                    {/* Custom Categories created by user */}
                    {categories.filter((c) => !PRESET_CATEGORIES.some((p) => p.slug === c.slug)).length > 0 && (
                      <optgroup label="✨ CUSTOM / USER CATEGORIES (অন্যান্য ক্যাটাগরি)">
                        {categories
                          .filter((c) => !PRESET_CATEGORIES.some((p) => p.slug === c.slug))
                          .map((c) => (
                            <option key={c._id || c.slug} value={c._id || c.slug}>
                              {c.name}
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Showcase Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. BEST SELLER"
                    value={badge}
                    onChange={(e) => {
                      setBadge(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Unit Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. 24 PCS"
                    value={unitBadge}
                    onChange={(e) => {
                      setUnitBadge(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-medium"
                  />
                </div>
              </div>

              {/* Enhanced Dynamic Multi-Image Gallery Manager */}
              <div className="space-y-3 p-4 bg-[#FAFAF8] rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold uppercase text-gray-900 block">
                      Product Gallery ({productImages.length} images)
                    </label>
                    <span className="text-[10px] text-gray-500">
                      Upload high-res images, set Primary cover image (⭐), and reorder.
                    </span>
                  </div>
                  {uploadingImage && (
                    <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{uploadProgressText || 'Uploading image...'}</span>
                    </span>
                  )}
                </div>

                {/* Local File Picker Button + Manual URL */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] transition cursor-pointer flex items-center justify-center gap-2 shadow-sm">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload High-Res Photos</span>
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

                {/* Reorderable Image Preview Cards */}
                {productImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                    {productImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border bg-white p-1.5 flex flex-col justify-between group transition ${
                          img.isPrimary
                            ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30 shadow-md'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {/* Thumbnail Image */}
                        <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-gray-100 mb-1.5">
                          <img src={img.url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />

                          {/* Primary Badge */}
                          {img.isPrimary ? (
                            <span className="absolute top-1 left-1 bg-[#C5A059] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" /> Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(idx)}
                              className="absolute top-1 left-1 bg-black/60 hover:bg-[#C5A059] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition shadow"
                              title="Set as Primary Cover Image"
                            >
                              ⭐ Set Cover
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-full shadow transition opacity-90 hover:opacity-100"
                            title="Remove Image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Variant Association Dropdown */}
                        <div className="space-y-1">
                          <select
                            value={img.variantColor || ''}
                            onChange={(e) => updateImageVariant(idx, e.target.value)}
                            className="w-full text-[10px] px-1 py-1 rounded border border-gray-200 bg-gray-50 text-gray-700 font-medium"
                          >
                            <option value="">All Colors (Default)</option>
                            {variants.map((v, vIdx) => (
                              <option key={vIdx} value={v.color || `Variant ${vIdx + 1}`}>
                                Color: {v.color || `Variant ${vIdx + 1}`}
                              </option>
                            ))}
                          </select>

                          {/* Reorder Buttons */}
                          <div className="flex items-center justify-between text-gray-500 pt-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveImage(idx, -1)}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                              title="Move Left"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <span className="text-[10px] font-mono text-gray-400">#{idx + 1}</span>
                            <button
                              type="button"
                              disabled={idx === productImages.length - 1}
                              onClick={() => moveImage(idx, 1)}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                              title="Move Right"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing & Authoritative Discount Configuration */}
              <div className="space-y-3 p-4 bg-[#F8F9FA] rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase text-gray-900 block text-xs">
                    Pricing & Discount Campaign (মূল্য ও অফার)
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDiscountActive}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setIsDiscountActive(enabled);
                        setIsDirty(true);
                        if (!enabled) {
                          setDiscountPercentage(0);
                          if (originalPrice > 0) {
                            setSalePrice(originalPrice);
                            setVariants((prev) =>
                              prev.map((v) => ({ ...v, price: originalPrice }))
                            );
                          }
                        }
                      }}
                      className="w-4 h-4 text-[#556B2F] rounded border-gray-300"
                    />
                    <span className="text-xs font-bold text-gray-800">Discount Enabled</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-gray-900">Regular / Original Price (৳) *</label>
                    <input
                      type="number"
                      required
                      value={originalPrice}
                      onChange={(e) => {
                        const orig = Number(e.target.value);
                        setOriginalPrice(orig);
                        setIsDirty(true);
                        if (discountPercentage > 0) {
                          const newSale = Math.round(orig * (1 - discountPercentage / 100));
                          setSalePrice(newSale);
                          setVariants((prev) => prev.map((v) => ({ ...v, price: newSale })));
                        } else if (!isDiscountActive || !salePrice) {
                          setSalePrice(orig);
                          setVariants((prev) => prev.map((v) => ({ ...v, price: orig })));
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
                        setIsDirty(true);
                        if (originalPrice > 0 && disc > 0) {
                          const newSale = Math.round(originalPrice * (1 - disc / 100));
                          setSalePrice(newSale);
                          setVariants((prev) => prev.map((v) => ({ ...v, price: newSale })));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase text-gray-900">Sale / Discount Price (৳) *</label>
                    <input
                      type="number"
                      required
                      value={salePrice}
                      onChange={(e) => {
                        const sale = Number(e.target.value);
                        const oldSale = salePrice;
                        setSalePrice(sale);
                        setIsDirty(true);
                        if (originalPrice > 0 && sale > 0 && sale < originalPrice) {
                          setDiscountPercentage(Math.round(((originalPrice - sale) / originalPrice) * 100));
                        }
                        setVariants((prev) =>
                          prev.map((v) => (v.price === 0 || v.price === oldSale ? { ...v, price: sale } : v))
                        );
                      }}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-[#0F172A]"
                    />
                  </div>
                </div>

                {/* Optional Schedule Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>Discount Start Date (Optional)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={discountStartDate}
                      onChange={(e) => {
                        setDiscountStartDate(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>Discount End Date (Optional)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={discountEndDate}
                      onChange={(e) => {
                        setDiscountEndDate(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs"
                    />
                  </div>
                </div>

                {/* Live Discount Calculation Summary Card */}
                {isDiscountActive && originalPrice > salePrice && salePrice > 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span>
                        <strong>Storefront Preview:</strong> Customer pays <strong>৳{salePrice.toLocaleString()}</strong>{' '}
                        (saves ৳{(originalPrice - salePrice).toLocaleString()} / {Math.round(((originalPrice - salePrice) / originalPrice) * 100)}% OFF)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic 5 Feature Highlights */}
              <div className="space-y-3 p-4 bg-[#F8F9FA] rounded-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold uppercase text-gray-900 block">
                      Product Highlight Features (ছবি পাশের ৫টি বিশেষ বৈশিষ্ট্য)
                    </label>
                    <span className="text-[10px] text-gray-500">Visual bullet points shown under stock on product page</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Presets:</span>
                    <button
                      type="button"
                      onClick={() => applyFeaturePreset('hijab')}
                      className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-[10px] font-semibold text-gray-700 shadow-2xs"
                    >
                      Hijab
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFeaturePreset('churi')}
                      className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-[10px] font-semibold text-gray-700 shadow-2xs"
                    >
                      Churi / Jewellery
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFeaturePreset('men')}
                      className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-[10px] font-semibold text-gray-700 shadow-2xs"
                    >
                      Men / Shoes
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {features.map((feat, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs items-end">
                      <div className="sm:col-span-3">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Icon #{idx + 1}</span>
                        <select
                          value={feat.icon || 'feather'}
                          onChange={(e) => updateFeature(idx, 'icon', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white text-xs font-medium"
                        >
                          <option value="feather">Feather (Soft/Skin) 🪶</option>
                          <option value="layers">Layers (Fabric/Quality) 🥞</option>
                          <option value="wind">Wind (Lightweight/Air) 💨</option>
                          <option value="waves">Waves (Drape/Finish) 🌊</option>
                          <option value="check">Check (Style/Occasion) ✔️</option>
                          <option value="award">Award (Handcrafted) 🏆</option>
                          <option value="crown">Crown (Royal Luxury) 👑</option>
                          <option value="shield">Shield (Durable) 🛡️</option>
                          <option value="heart">Heart (Comfort) ❤️</option>
                          <option value="sparkles">Sparkles (Glossy) ✨</option>
                        </select>
                      </div>
                      <div className="sm:col-span-4">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Title</span>
                        <input
                          type="text"
                          placeholder="e.g. Soft & Comfortable"
                          value={feat.title}
                          onChange={(e) => updateFeature(idx, 'title', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Subtitle / Description</span>
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
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] bg-white"
                />
              </div>

              {/* Variants Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 gap-2">
                  <div>
                    <label className="font-bold uppercase text-gray-900 text-sm flex items-center gap-2">
                      <Palette className="w-4 h-4 text-[#C5A059]" />
                      <span>Product Colors & Variants ({variants.length} Selected)</span>
                    </label>
                    <p className="text-[11px] text-gray-500">
                      নিচের ৬০+ প্রিমিয়াম কালার থেকে ১-ক্লিকে স্টক যোগ করুন বা বাদ দিন (Click to toggle color variants):
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {variants.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllVariants}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold text-[11px] transition"
                      >
                        Clear All ({variants.length})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={addVariantRow}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-[#C5A059] transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Custom Variant
                    </button>
                  </div>
                </div>

                {/* 60+ Color Palette with Fast Search & Categories */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3">
                  {/* Top Bar: Search + Category Filter */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-between">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search 60+ colors (e.g. Sage, Burgundy, Teal)..."
                        value={colorSearch}
                        onChange={(e) => setColorSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-[#C5A059]"
                      />
                      {colorSearch && (
                        <button
                          type="button"
                          onClick={() => setColorSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                      {['ALL', 'Classic & Neutral', 'Green & Earth', 'Red & Maroon', 'Pink & Peach', 'Purple & Lilac', 'Blue & Teal', 'Gold & Brown'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedColorCategory(cat)}
                          className={`px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition ${
                            selectedColorCategory === cat
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          {cat === 'ALL' ? 'All (60+)' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1-Click Toggle Color Chips */}
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {PRESET_COLORS.filter((preset) => {
                      const matchesCat = selectedColorCategory === 'ALL' || preset.category === selectedColorCategory;
                      const matchesSearch = !colorSearch.trim() || preset.name.toLowerCase().includes(colorSearch.toLowerCase().trim());
                      return matchesCat && matchesSearch;
                    }).map((preset) => {
                      const isAdded = variants.some((v) => v.color.toLowerCase() === preset.name.toLowerCase());
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => togglePresetColorVariant(preset)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition select-none ${
                            isAdded
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                          title={`Click to ${isAdded ? 'remove' : 'add'} ${preset.name} (${preset.hex})`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/20 flex-shrink-0"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span>{preset.name}</span>
                          {isAdded && <Check className="w-3 h-3 text-emerald-600 font-bold" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Variants List / Empty Placeholder */}
                {variants.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-4 space-y-1">
                    <Palette className="w-6 h-6 text-gray-400 mx-auto" />
                    <p className="text-xs font-bold text-gray-700">কোনো কালার সিলেক্ট করা নেই (No Colors Selected)</p>
                    <p className="text-[11px] text-gray-500 max-w-md mx-auto">
                      উপরের প্যালেট থেকে পছন্দের কালার বাটনে ক্লিক করে এক ক্লিকে স্টকে যোগ করুন অথবা &quot;+ Custom Variant&quot; দিয়ে যুক্ত করুন।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {variants.map((v, idx) => (
                      <div key={idx} className="grid grid-cols-2 sm:grid-cols-7 gap-2 items-center bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-2xs">
                        {/* Color Name & Swatch */}
                        <div className="sm:col-span-2 space-y-0.5">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Color Name & Swatch</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={v.colorHex || '#C5A059'}
                              onChange={(e) => updateVariant(idx, 'colorHex', e.target.value)}
                              className="w-7 h-7 rounded-full border border-gray-300 cursor-pointer p-0.5 bg-white flex-shrink-0"
                              title="Choose swatch color"
                            />
                            <input
                              type="text"
                              placeholder="e.g. Sage Green"
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
                          <button
                            type="button"
                            onClick={() => removeVariantRow(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg mt-4 transition"
                            title="Remove this variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => {
                    setIsPublished(e.target.checked);
                    setIsDirty(true);
                  }}
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
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold uppercase rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-[#C5A059] text-white font-bold uppercase rounded-lg shadow disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product QR Code Preview & Label Printing Modal */}
      {qrModalOpen && qrProduct && (
        <QrModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          title={qrProduct.name}
          subtitle={`Catalog Piece • ${qrProduct.categoryId?.name || 'Luxury Collection'}`}
          badge="PERMANENT PRODUCT QR"
          payload={buildProductQrUrl(qrPublicCode || `PRD-${qrProduct._id.substring(qrProduct._id.length - 6).toUpperCase()}`)}
          displayCode={qrPublicCode || `PRD-${qrProduct._id.substring(qrProduct._id.length - 6).toUpperCase()}`}
          filenamePrefix={`AVELORA-Product-${qrPublicCode || 'PRD'}`}
          purposeDescription="Points to permanent catalog deep link /q/p/[code]. Will never break even if product title or slug changes."
        />
      )}

      {/* Transaction Dependency Guard Modal */}
      {dependencyModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-amber-200 text-slate-900 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Protected Historical Record</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-bold text-slate-900">&quot;{dependencyModal.productName}&quot;</span> has associated transactional history (Customer Orders, Purchase Invoices, Returns, or Inventory Ledgers).
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900 font-medium">
                {dependencyModal.message}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDependencyModal({ isOpen: false, productId: '', productName: '', message: '' })}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-xl transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleArchiveProduct(dependencyModal.productId)}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Archive className="w-4 h-4" />
                <span>Archive Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
