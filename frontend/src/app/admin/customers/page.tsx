'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, ShoppingBag, DollarSign, MapPin, Phone, RefreshCw } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const res = await fetch(`http://localhost:3001/api/admin/customers?${params.toString()}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#997B21]">
            Patron Profiles & CRM
          </span>
          <h1 className="text-2xl font-bold font-serif-luxury text-gray-900">
            Customer Directory ({customers.length})
          </h1>
          <p className="text-xs text-gray-500">
            Lifetime orders, contact info, and spending volume for registered and guest patrons.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center max-w-md">
        <input
          type="text"
          placeholder="Search by customer name, mobile, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-2 pr-4 py-1 text-xs text-gray-900 focus:outline-none bg-transparent"
        />
        <Search className="w-4 h-4 text-gray-400" />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading customer profiles...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 bg-gray-50">
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Primary District / Address</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4">Lifetime Spent</th>
                  <th className="py-3.5 px-4">Account Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900 font-serif-luxury text-sm">{c.name}</p>
                      {c.email && <p className="text-[11px] text-gray-400">{c.email}</p>}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-gray-700">{c.mobile}</td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {c.addresses?.[0] ? `${c.addresses[0].district} • ${c.addresses[0].fullAddress}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {c.totalOrders || 0} orders
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      ৳{(c.totalSpent || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.isGuest ? 'bg-gray-100 text-gray-600' : 'bg-[#D4AF37]/20 text-[#997B21]'
                      }`}>
                        {c.isGuest ? 'Guest Patron' : 'Registered Member'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
