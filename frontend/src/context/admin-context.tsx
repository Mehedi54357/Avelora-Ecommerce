'use client';

import React, { createContext, useContext } from 'react';

export interface AdminUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface AdminContextType {
  currentUser: AdminUser | null;
  userRole: string;
}

export const AdminContext = createContext<AdminContextType>({
  currentUser: null,
  userRole: 'STAFF',
});

export const useAdmin = () => useContext(AdminContext);
