import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('vital_agro_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('vital_agro_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cart]);

  const addToCart = (product, sizeOption, quantity = 1) => {
    setCart((prev) => {
      const cartId = `${product.slug || product.id}-${sizeOption.size}`;
      const existing = prev.find((item) => item.cartId === cartId);

      if (existing) {
        return prev.map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          cartId,
          id: product.id || product.slug,
          slug: product.slug || product.id,
          name: product.name,
          category: product.category,
          imageUrl: product.imageUrl,
          pngUrl: product.pngUrl,
          productCode: product.productCode,
          size: sizeOption,
          quantity,
        },
      ];
    });
    // Automatically open cart drawer for visual feedback
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const cartSubtotal = cart.reduce(
    (acc, item) => acc + Number(item.size.price || item.size.rate || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
