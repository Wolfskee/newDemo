"use client";

import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Image, Input } from "@heroui/react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalItems } = useCart();
  const { user } = useAuth();

  // 如果未登录，重定向到登录页面
  if (!user) {
    router.push("/login");
    return null;
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
            Shopping Cart
          </h1>
          <Card>
            <CardBody className="text-center py-16">
              <p className="text-2xl text-gray-600 dark:text-gray-400 mb-4">
                Cart is Empty
              </p>
              <Button
                color="primary"
                onPress={() => router.push("/products")}
              >
                Continue Shopping
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Shopping Cart ({getTotalItems()} {getTotalItems() === 1 ? "item" : "items"})
          </h1>
          <Button
            color="danger"
            variant="flat"
            onPress={clearCart}
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id}>
                <CardBody>
                  <div className="flex gap-4">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={120}
                      height={120}
                      className="object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                      {item.category && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {item.category}
                        </p>
                      )}
                      <p className="text-lg font-bold text-primary mb-4">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm">Quantity:</label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity.toString()}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 1;
                              updateQuantity(item.id, qty);
                            }}
                            className="w-20"
                            size="sm"
                          />
                        </div>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => removeFromCart(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                      <p className="text-lg font-semibold mt-2">
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold">Order Summary</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${(totalPrice * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>${(totalPrice * 1.1).toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  color="primary"
                  size="lg"
                  fullWidth
                  className="mt-4"
                >
                  Proceed to Checkout
                </Button>
                <Button
                  color="default"
                  variant="flat"
                  fullWidth
                  onPress={() => router.push("/products")}
                >
                  Continue Shopping
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
