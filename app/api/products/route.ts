import { NextRequest, NextResponse } from "next/server";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string; // Base64 or URL
  createdAt: string;
  updatedAt: string;
}

// In-memory storage (replace with database in production)
let products: Product[] = [
  {
    id: "1",
    name: "Premium Product 1",
    description: "High-quality product designed for excellence",
    price: "$99.99",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Premium Product 2",
    description: "Innovative solution for modern needs",
    price: "$149.99",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Premium Product 3",
    description: "Cutting-edge technology at your fingertips",
    price: "$199.99",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    return NextResponse.json(
      {
        success: true,
        products: products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, image } = body;

    // Validate required fields
    if (!name || !description || !price || !image) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newProduct: Product = {
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      price,
      image,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.push(newProduct);

    return NextResponse.json(
      {
        success: true,
        product: newProduct,
        message: "Product created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price, image } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const productIndex = products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Update product
    products[productIndex] = {
      ...products[productIndex],
      name: name || products[productIndex].name,
      description: description || products[productIndex].description,
      price: price || products[productIndex].price,
      image: image || products[productIndex].image,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        product: products[productIndex],
        message: "Product updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const productIndex = products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    products.splice(productIndex, 1);

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
