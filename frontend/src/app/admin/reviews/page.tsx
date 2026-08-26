'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, RefreshCw, Loader2, MessageSquare, ThumbsUp, ShieldCheck } from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../utils/api-config';

export default function ReviewsModerationPage() {
  const [reviews, setReviews] = useState<any[]>([
    {
      _id: '1',
      productName: 'Royal Velvet Embroidered Panjabi',
      customerName: 'Tariqul Islam',
      rating: 5,
      comment: 'Exceptional craftsmanship. The fabric weight and bespoke gold buttons feel truly majestic.',
      status: 'APPROVED',
      isVerifiedPurchase: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      productName: 'Silk Jacquard Sherwani Set',
      customerName: 'Shamsul Haque',
      rating: 5,
      comment: 'Wore this for my wedding reception in Gulshan. Got so many compliments. Perfect tailoring.',
      status: 'APPROVED',
      isVerifiedPurchase: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
            Customer Reputation & Trust
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Customer Reviews Moderation ({reviews.length})
          </h1>
          <p className="text-xs text-gray-500">
            Moderate testimonials and customer feedback displayed across public luxury storefronts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div key={rev._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900 text-sm font-serif-luxury">{rev.customerName}</h4>
                <p className="text-[11px] text-gray-500">{rev.productName}</p>
              </div>
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-700 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
              "{rev.comment}"
            </p>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Verified Purchase
              </span>
              <span className="text-[10px] font-bold uppercase text-gray-400 font-mono">
                {new Date(rev.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
