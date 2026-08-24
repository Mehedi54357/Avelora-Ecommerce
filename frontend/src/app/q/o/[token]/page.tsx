import React from 'react';
import { redirect } from 'next/navigation';
import { API_BASE_URL } from '../../../../utils/api-config';

interface OrderQrResolverProps {
  params: {
    token: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function OrderQrResolverPage({ params }: OrderQrResolverProps) {
  const token = decodeURIComponent(params.token || '').trim();

  let resolvedOrderId = '';

  try {
    const res = await fetch(`${API_BASE_URL}/api/qr/orders/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.order?.orderId) {
        resolvedOrderId = data.order.orderId;
      }
    }
  } catch (error) {
    console.error('Error resolving order tracking QR:', error);
  }

  if (resolvedOrderId) {
    redirect(`/track-order?orderId=${encodeURIComponent(resolvedOrderId)}`);
  }

  redirect('/track-order');
}
