'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface CartItem {
  cartItemId: string; // id + size
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  size?: string;
}

interface CartState {
  items: CartItem[];
  isPanelOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'INCREMENT_QTY'; payload: string }
  | { type: 'DECREMENT_QTY'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_PANEL' }
  | { type: 'CLOSE_PANEL' }
  | { type: 'HYDRATE'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  isPanelOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const payloadCartItemId = `${action.payload.id}-${action.payload.size || ''}`;
      const existingItemIndex = state.items.findIndex(item => item.cartItemId === payloadCartItemId);
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (action.payload.quantity || 1)
        };
        return { ...state, items: updatedItems };
      }
      return { ...state, items: [...state.items, { ...action.payload, cartItemId: payloadCartItemId }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.cartItemId !== action.payload) };
    case 'INCREMENT_QTY':
      return {
        ...state,
        items: state.items.map(item =>
          item.cartItemId === action.payload ? { ...item, quantity: item.quantity + 1 } : item
        )
      };
    case 'DECREMENT_QTY':
      return {
        ...state,
        items: state.items.map(item =>
          item.cartItemId === action.payload ? { ...item, quantity: item.quantity - 1 } : item
        ).filter(item => item.quantity > 0)
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'OPEN_PANEL':
      return { ...state, isPanelOpen: true };
    case 'CLOSE_PANEL':
      return { ...state, isPanelOpen: false };
    case 'HYDRATE':
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  isPanelOpen: boolean;
  addItem: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeItem: (cartItemId: string) => void;
  incrementQty: (cartItemId: string) => void;
  decrementQty: (cartItemId: string) => void;
  clearCart: () => void;
  openPanel: () => void;
  closePanel: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const isMounted = React.useRef(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('solecraft-cart');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          dispatch({ type: 'HYDRATE', payload: parsed });
        } catch (e) {
          console.error("Failed to parse cart from local storage", e);
        }
      }
    }
  }, []);

  // Save to localStorage on change, but skip the initial mount
  useEffect(() => {
    if (isMounted.current) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('solecraft-cart', JSON.stringify(state.items));
      }
    } else {
      isMounted.current = true;
    }
  }, [state.items]);

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items: state.items,
    isPanelOpen: state.isPanelOpen,
    addItem: (item: Omit<CartItem, 'cartItemId'>) => dispatch({ type: 'ADD_ITEM', payload: item as CartItem }),
    removeItem: (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
    incrementQty: (id: string) => dispatch({ type: 'INCREMENT_QTY', payload: id }),
    decrementQty: (id: string) => dispatch({ type: 'DECREMENT_QTY', payload: id }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    openPanel: () => dispatch({ type: 'OPEN_PANEL' }),
    closePanel: () => dispatch({ type: 'CLOSE_PANEL' }),
    subtotal,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
