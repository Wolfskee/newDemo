import { NextRequest, NextResponse } from "next/server";

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or image URL
  image?: string; // Optional image URL
  features: string[];
  createdAt: string;
  updatedAt: string;
}

// In-memory storage (replace with database in production)
let services: Service[] = [
  {
    id: "1",
    name: "Consulting Services",
    description:
      "Expert consulting to help your business grow and succeed with tailored solutions. Our team of experienced consultants will work closely with you to identify opportunities and implement strategies that drive results.",
    icon: "💼",
    features: ["Strategic Planning", "Business Analysis", "Implementation Support"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Technical Support",
    description:
      "24/7 technical support to ensure your systems run smoothly and efficiently. Our dedicated support team is always ready to help you resolve any technical issues quickly and effectively.",
    icon: "🔧",
    features: ["24/7 Availability", "Expert Technicians", "Quick Response"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Custom Solutions",
    description:
      "Bespoke solutions designed specifically for your unique business requirements. We create tailored solutions that perfectly fit your needs and help you achieve your business goals.",
    icon: "⚙️",
    features: ["Custom Development", "Tailored Design", "Ongoing Support"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Training & Education",
    description:
      "Comprehensive training programs to help your team master new technologies and best practices. We offer both on-site and online training options.",
    icon: "📚",
    features: ["On-site Training", "Online Courses", "Certification Programs"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    return NextResponse.json(
      {
        success: true,
        services: services,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, image, features } = body;

    // Validate required fields
    if (!name || !description || !icon) {
      return NextResponse.json(
        { error: "Missing required fields (name, description, icon)" },
        { status: 400 }
      );
    }

    const newService: Service = {
      id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      icon,
      image: image || "",
      features: features || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    services.push(newService);

    return NextResponse.json(
      {
        success: true,
        service: newService,
        message: "Service created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, icon, image, features } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    const serviceIndex = services.findIndex((s) => s.id === id);
    if (serviceIndex === -1) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Update service
    services[serviceIndex] = {
      ...services[serviceIndex],
      name: name || services[serviceIndex].name,
      description: description || services[serviceIndex].description,
      icon: icon || services[serviceIndex].icon,
      image: image !== undefined ? image : services[serviceIndex].image,
      features: features || services[serviceIndex].features,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        service: services[serviceIndex],
        message: "Service updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
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
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    const serviceIndex = services.findIndex((s) => s.id === id);
    if (serviceIndex === -1) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    services.splice(serviceIndex, 1);

    return NextResponse.json(
      {
        success: true,
        message: "Service deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
