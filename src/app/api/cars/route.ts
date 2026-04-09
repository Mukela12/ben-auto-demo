import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const slug = searchParams.get("slug");
  const all = searchParams.get("all");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const mode = searchParams.get("mode"); // "rent" | "buy" | null

  const where: Record<string, unknown> = {};
  if (slug) where.slug = slug;

  // For admin (all=true), show everything. Otherwise filter by status
  if (!all) {
    where.status = { notIn: ["sold", "unlisted"] };
    where.available = true;
  }

  if (category && category !== "all") where.category = category;
  if (featured === "true") where.featured = true;

  // Filter by listing mode
  if (mode === "buy") {
    where.listingType = { in: ["buy", "both"] };
  } else if (mode === "rent") {
    where.listingType = { in: ["rent", "both"] };
  }

  if (start && end) {
    where.bookings = {
      none: {
        status: { in: ["confirmed", "active"] },
        pickupDate: { lt: new Date(end) },
        returnDate: { gt: new Date(start) },
      },
    };
  }

  if (slug) {
    const car = await prisma.car.findFirst({ where });
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }
    return NextResponse.json(car);
  }

  const cars = await prisma.car.findMany({
    where,
    orderBy: [{ featured: "desc" }, { dailyRate: "asc" }],
  });

  return NextResponse.json(cars);
}

export async function POST(request: Request) {
  try {
    const adminSession = await getAdminSessionFromRequest(request);
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const brand =
      typeof body.brand === "string" && body.brand.trim().length > 0
        ? body.brand.trim()
        : name.split(" ")[0];
    const tagline =
      typeof body.tagline === "string" && body.tagline.trim().length > 0
        ? body.tagline.trim()
        : "Premium comfort, polished design, and effortless daily driving.";
    const description =
      typeof body.description === "string" && body.description.trim().length > 0
        ? body.description.trim()
        : `${name} delivers a premium experience with refined comfort, confident performance, and the practicality you expect.`;

    if (!name) {
      return NextResponse.json({ error: "Vehicle name is required" }, { status: 400 });
    }

    const dailyRate = Math.max(1000, Number(body.dailyRate) || 0);
    const listingType = body.listingType || "rent";

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const car = await prisma.car.create({
      data: {
        slug: `${slug}-${Date.now().toString(36)}`,
        name,
        brand,
        category: body.category || "sedan",
        tagline,
        description,
        dailyRate,
        depositAmount:
          Math.max(Number(body.depositAmount) || 0, Math.max(dailyRate * 2, 30000)) || 50000,
        seats: Math.max(Number(body.seats) || 5, 1),
        doors: Math.max(Number(body.doors) || 4, 2),
        transmission: body.transmission || "automatic",
        fuelType: body.fuelType || "gasoline",
        horsepower: Math.max(Number(body.horsepower) || 200, 70),
        acceleration: body.acceleration || "Smooth and responsive",
        luggage: body.luggage || "2 suitcases",
        imageUrl: body.imageUrl || "/cars/toyota-camry.png",
        galleryUrls: Array.isArray(body.galleryUrls) ? body.galleryUrls : [],
        featured: Boolean(body.featured),
        available: body.available !== false,
        // Buy/sale fields
        listingType,
        salePrice: listingType !== "rent" ? (Number(body.salePrice) || null) : null,
        mileage: listingType !== "rent" ? (Number(body.mileage) || null) : null,
        year: listingType !== "rent" ? (Number(body.year) || null) : null,
        condition: listingType !== "rent" ? (body.condition || null) : null,
        status: body.status || "available",
      },
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    console.error("Create car error:", error);
    return NextResponse.json({ error: "Failed to create car" }, { status: 500 });
  }
}
