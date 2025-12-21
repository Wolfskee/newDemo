"use client";

import { Activity, useEffect } from "react";
import ProductHeader from "./components/ProductHeader";
import ProductCard from "./components/ProductCard";
import FlyingAnimation from "@/lib/animation/FlyingAnimation";
import { AnimatePresence } from "framer-motion";
import NoProductAlert from "./components/NoProductAlert";
import { useProductsStore } from "./store/useProductsStore";

import ProductsLoadingSkeleton from "./components/ProductsLoadingSkeleton";
import ProductsError from "./components/ProductsError";
import { useAddToCart } from "./hooks/useAddToCart";

export default function ProductsPage() {
  // use products store
  const products = useProductsStore((state) => state.products);
  const loading = useProductsStore((state) => state.loading);
  const error = useProductsStore((state) => state.error);
  const flyingItems = useProductsStore((state) => state.flyingItems);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);

  // Local hooks
  const { handleAddToCart } = useAddToCart();

  // fetch products
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return <ProductsLoadingSkeleton />;
  }

  if (error) {
    return <ProductsError message={error} onRetry={fetchProducts} />;
  }

  // 只显示状态为 ACTIVE 的产品
  const activeProducts = products.filter(
    (product) => !product.status || product.status === "ACTIVE"
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 relative">

      {/* flying animation */}
      <AnimatePresence>
        {flyingItems.map((flyingItem) => (
          <FlyingAnimation key={flyingItem.id} flyingItem={flyingItem} />
        ))}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/*Product page header*/}
        <ProductHeader />

        {/* Products Grid (show when have products)*/}
        <Activity mode={activeProducts.length > 0 ? "visible" : "hidden"}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                handleAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </Activity>

        {/* No product alert (show when no products)*/}
        <Activity mode={activeProducts.length === 0 ? "visible" : "hidden"}>
          <NoProductAlert />
        </Activity>
      </div >
    </div >
  );
}
