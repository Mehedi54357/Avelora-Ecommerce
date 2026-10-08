import React from 'react';
import OrderQrClient from './order-qr-client';

interface OrderQrResolverProps {
  params: Promise<{
    token: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function OrderQrResolverPage({ params }: OrderQrResolverProps) {
  const resolvedParams = await params;
  const token = decodeURIComponent(resolvedParams.token || '').trim();

  return <OrderQrClient token={token} />;
}

