import React from 'react';
import Link from 'next/link';
import BadgeStrip from '../components/badge-strip';
import ProductCard from '../components/product-card';
import { ArrowRight, Sparkles, Shield, Gift, ChevronRight, Star } from 'lucide-react';
import { API_BASE_URL } from '../utils/api-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products?limit=8`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return data.products || [];
    }
  } catch (e) {
    console.error('Error fetching featured products', e);
  }
  return [];
}

export default async function HomePage() {
  const products = await getFeaturedProducts();


  const DEPARTMENTS_SHOWCASE = [
    {
      title: 'Women',
      subtitle: 'Hijabs, Churi, Dresses & Fine Jewellery',
      image: 'https://images.unsplash.com/photo-1611591475152-478311399767?auto=format&fit=crop&w=800&q=85',
      link: '/products?department=women',
      tag: '6 Collections',
    },
    {
      title: 'Men',
      subtitle: 'Artisan Leather Shoes, Panjabis & Wallets',
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=85',
      link: '/products?department=men',
      tag: '3 Collections',
    },
    {
      title: 'Kids',
      subtitle: 'Princess Gowns, Ethnic Shoes & Panjabi Sets',
      image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=85',
      link: '/products?department=kids',
      tag: '5 Collections',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Hero Section with Aarong-Grade Luxury Visual */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center bg-[#090D16] text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=90"
          alt="AVELORA Luxury Haute Heritage"
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity select-none pointer-events-none"
          style={{ objectPosition: '50% 44%' }}
        />
        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/50 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#090D16]/25 to-[#090D16]/80 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#D4AF37]/30 text-[#E6CA85] text-xs font-semibold uppercase tracking-[0.25em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bespoke Haute Heritage Collection</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white font-serif-luxury leading-[1.1]">
            Elegance In <span className="gold-gradient-text italic font-normal">Every Choice</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300 font-light leading-relaxed">
            Exquisite lifestyle curation for Women, Men & Kids — crafted with uncompromising elegance, artisanal perfection, and timeless prestige.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/products"
              className="w-full sm:w-auto px-8 py-4 bg-[#C5A059] hover:bg-[#b08b3a] text-slate-950 font-bold text-xs uppercase tracking-[0.2em] rounded-full transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/30 flex items-center justify-center gap-2 group"
            >
              <span>Explore All Departments</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/products?department=women"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs uppercase tracking-[0.2em] rounded-full transition backdrop-blur-sm"
            >
              Shop Women
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Core Value Badge Strip */}
      <BadgeStrip />

      {/* 3. Aarong-Style 3 Department Showcase (Women, Men, Kids) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
            The AVELORA Departments
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif-luxury">
            Curated For Every Generation
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DEPARTMENTS_SHOWCASE.map((dept) => (
            <Link
              key={dept.title}
              href={dept.link}
              className="group relative h-96 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-700 flex flex-col justify-end p-8 border border-gray-200"
            >
              <img
                src={dept.image}
                alt={dept.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              <div className="relative z-10 space-y-2 text-white">
                <span className="inline-block px-2.5 py-0.5 rounded bg-white/20 text-[#E6CA85] text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  {dept.tag}
                </span>
                <h3 className="text-2xl font-bold font-serif-luxury text-white group-hover:text-[#E6CA85] transition">
                  {dept.title}
                </h3>
                <p className="text-xs text-gray-300 line-clamp-2">{dept.subtitle}</p>
                <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#E6CA85] uppercase tracking-wider">
                  <span>Explore Department</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
              Hand-Selected Pieces
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif-luxury mt-1">
              Featured Trending Releases
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0F172A] hover:text-[#C5A059] transition"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
            <Sparkles className="w-8 h-8 text-[#C5A059] mx-auto" />
            <h3 className="text-base font-bold font-serif-luxury text-gray-900 uppercase tracking-wider">
              New Collections Arriving Soon
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Our master artisans are hand-crafting new pieces. Check back shortly or explore our department collections above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Brand Experience & Packaging Promise */}
      <section className="bg-[#FAF7F0] py-20 border-y border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
              The Unboxing Experience
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 font-serif-luxury leading-tight">
              Gift-Ready In Our <br />
              <span className="gold-gradient-text italic font-normal">Signature Luxury Bag</span>
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every AVELORA order arrives packaged in our signature gold-embossed structured bag, wrapped in protective acid-free tissue paper with satin ribbon detailing. Because true elegance begins the moment you receive your package.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-sm flex items-start gap-3">
                <Gift className="w-5 h-5 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Complimentary Wrapping
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Included with every single order.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-sm flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Authenticity Seal
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Every piece certified and verified.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#C5A059] transition shadow"
              >
                <span>Shop With Confidence</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <img
              src="https://images.unsplash.com/photo-1611591475152-478311399767?auto=format&fit=crop&w=1000&q=85"
              alt="AVELORA Luxury Bag and Gift Packaging"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
              <div className="text-white space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-[#E6CA85]">
                  AVELORA Atelier
                </p>
                <p className="text-lg font-bold font-serif-luxury">Handcrafted for Pure Distinction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Accolades & Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
            Patron Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif-luxury">
            Cherished by Connoisseurs
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex text-[#D4AF37] gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              "The Turkish Silk Georgette Hijab feels unbelievably soft, doesn't slip at all, and the packaging in the AVELORA signature bag made it feel like a luxury boutique."
            </p>
            <div>
              <p className="text-sm font-bold text-gray-900 font-serif-luxury">Nusrat Jahan</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Uttara, Dhaka</p>
            </div>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex text-[#D4AF37] gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              "The velvet reshmi churi box set is stunning! The colors are so rich and the gold borders give an opulent bridal touch. Truly unmatched royal quality."
            </p>
            <div>
              <p className="text-sm font-bold text-gray-900 font-serif-luxury">Tasnia Karim</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Gulshan, Dhaka</p>
            </div>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex text-[#D4AF37] gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              "Ordered the Little Princess organza gown for my daughter. The fabric is super gentle, and the stitching is perfection. Delivered in 24 hours!"
            </p>
            <div>
              <p className="text-sm font-bold text-gray-900 font-serif-luxury">Dr. Sabina Yasmin</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Dhanmondi, Dhaka</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
