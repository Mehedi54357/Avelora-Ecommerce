'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  image: string;
  color?: string;
  size?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxStock: number;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('avelora_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('avelora_cart', JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [cart, isLoaded]);

  const addItem = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.sku === newItem.sku);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(
          updated[existingIndex].maxStock || 99,
          updated[existingIndex].quantity + newItem.quantity,
        );
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        return [...prev, newItem];
      }
    });
    setIsCartOpen(true);
  };

  const removeItem = (sku: string) => {
    setCart((prev) => prev.filter((item) => item.sku !== sku));
  };

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(sku);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.sku === sku) {
          const validQty = Math.min(item.maxStock || 99, quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      }),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
