'use client';

import React from 'react';
import { Award, Package, Truck, Sparkles } from 'lucide-react';

export default function BadgeStrip() {
  return (
    <div className="w-full bg-[#111622] text-[#F3E7C4] border-y border-[#D4AF37]/20 py-4 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-6 text-center text-xs md:text-sm uppercase tracking-widest font-medium">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 text-[#D4AF37]">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-white tracking-wider">PREMIUM QUALITY</p>
            <p className="text-[10px] text-gray-400 normal-case tracking-normal">Handcrafted Finest Materials</p>
          </div>
        </div>

        <div className="hidden sm:block h-6 w-px bg-white/10" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 text-[#D4AF37]">
            <Package className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-white tracking-wider">CAREFULLY PACKED</p>
            <p className="text-[10px] text-gray-400 normal-case tracking-normal">Signature Luxury Packaging</p>
          </div>
        </div>

        <div className="hidden sm:block h-6 w-px bg-white/10" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 text-[#D4AF37]">
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-white tracking-wider">DELIVERED WITH CARE</p>
            <p className="text-[10px] text-gray-400 normal-case tracking-normal">Fast & Insured Nationwide</p>
          </div>
        </div>
      </div>
    </div>
  );
}
