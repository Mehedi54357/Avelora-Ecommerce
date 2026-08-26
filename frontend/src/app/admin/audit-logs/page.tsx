'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  RefreshCw,
  Loader2,
  Calendar,
  User,
  Activity,
  Code,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../utils/api-config';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/audit-logs`);
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (l.action || '').toLowerCase().includes(s) ||
      (l.entityType || '').toLowerCase().includes(s) ||
      (l.adminId?.name || '').toLowerCase().includes(s) ||
      (l.entityId || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
            Security & Compliance Governance
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Immutable Audit Trail ({logs.length})
          </h1>
          <p className="text-xs text-gray-500">
            Cryptographically stamped event history for every order booking, stock change, financial record, and status transition.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search action, admin user, entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#D4AF37] text-xs bg-gray-50"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Payload Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-sans">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 font-sans">
                    No audit records matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp || log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-gray-700 font-sans">
                      <span className="font-bold text-slate-950">{log.entityType}</span>
                      <span className="text-[10px] text-gray-400 font-mono block">{log.entityId}</span>
                    </td>

                    <td className="py-3.5 px-4 font-sans text-gray-800">
                      {log.adminId?.name || log.adminId?.email || log.newData?.actor || 'ADMIN'}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-gray-500 font-mono">
                      {JSON.stringify(log.newData || log.oldData || {})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
