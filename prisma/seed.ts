import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const cars = [
  { slug: "bmw-7-series", name: "BMW 7 Series", brand: "BMW", category: "luxury", tagline: "The pinnacle of driving luxury", description: "The BMW 7 Series redefines executive luxury.", dailyRate: 28900, depositAmount: 100000, seats: 5, doors: 4, transmission: "automatic", fuelType: "gasoline", horsepower: 375, acceleration: "0-60 in 4.8s", luggage: "2 suitcases, 2 bags", imageUrl: "/cars/bmw-7-series.png", galleryUrls: [], featured: true },
  { slug: "mercedes-g-class", name: "Mercedes-Benz G-Class", brand: "Mercedes-Benz", category: "luxury", tagline: "Iconic. Unstoppable. Luxurious.", description: "The G-Class combines legendary off-road capability with luxury.", dailyRate: 34900, depositAmount: 125000, seats: 5, doors: 5, transmission: "automatic", fuelType: "gasoline", horsepower: 416, acceleration: "0-60 in 5.6s", luggage: "2 suitcases, 2 bags", imageUrl: "/cars/mercedes-g-class.png", galleryUrls: [], featured: true },
  { slug: "ford-mustang-convertible", name: "Ford Mustang Convertible", brand: "Ford", category: "convertible", tagline: "Feel the freedom", description: "Drop the top and feel the wind with iconic American muscle.", dailyRate: 18900, depositAmount: 75000, seats: 4, doors: 2, transmission: "automatic", fuelType: "gasoline", horsepower: 310, acceleration: "0-60 in 5.1s", luggage: "1 suitcase, 2 bags", imageUrl: "/cars/ford-mustang.png", galleryUrls: [], featured: true },
  { slug: "bmw-4-convertible", name: "BMW 4 Series Convertible", brand: "BMW", category: "convertible", tagline: "Open-air luxury", description: "Elegant design with exhilarating performance.", dailyRate: 21900, depositAmount: 80000, seats: 4, doors: 2, transmission: "automatic", fuelType: "gasoline", horsepower: 255, acceleration: "0-60 in 5.3s", luggage: "1 suitcase, 2 bags", imageUrl: "/cars/bmw-4-convertible.png", galleryUrls: [], featured: false },
  { slug: "bmw-4-coupe", name: "BMW 4 Series Coupe", brand: "BMW", category: "coupe", tagline: "Precision meets passion", description: "Sleek, sporty, and sophisticated.", dailyRate: 19900, depositAmount: 75000, seats: 4, doors: 2, transmission: "automatic", fuelType: "gasoline", horsepower: 255, acceleration: "0-60 in 5.3s", luggage: "2 suitcases, 2 bags", imageUrl: "/cars/bmw-4-coupe.png", galleryUrls: [], featured: false },
  { slug: "bmw-2-coupe", name: "BMW 2 Series Coupe", brand: "BMW", category: "coupe", tagline: "Compact. Athletic. Fun.", description: "Great things come in small packages.", dailyRate: 14900, depositAmount: 60000, seats: 4, doors: 2, transmission: "automatic", fuelType: "gasoline", horsepower: 255, acceleration: "0-60 in 5.5s", luggage: "2 suitcases, 2 bags", imageUrl: "/cars/bmw-2-coupe.png", galleryUrls: [], featured: false },
  { slug: "chevrolet-suburban", name: "Chevrolet Suburban", brand: "Chevrolet", category: "suv", tagline: "Room for the whole crew", description: "Full-size SUV perfect for family road trips.", dailyRate: 15900, depositAmount: 60000, seats: 8, doors: 5, transmission: "automatic", fuelType: "gasoline", horsepower: 355, acceleration: "0-60 in 6.7s", luggage: "4 suitcases", imageUrl: "/cars/chevrolet-suburban.png", galleryUrls: [], featured: false },
  { slug: "jeep-wrangler", name: "Jeep Wrangler", brand: "Jeep", category: "suv", tagline: "Go anywhere. Do anything.", description: "The ultimate adventure vehicle.", dailyRate: 13900, depositAmount: 55000, seats: 5, doors: 5, transmission: "automatic", fuelType: "gasoline", horsepower: 285, acceleration: "0-60 in 6.8s", luggage: "2 suitcases, 2 bags", imageUrl: "/cars/jeep-wrangler.png", galleryUrls: [], featured: false },
  { slug: "toyota-camry", name: "Toyota Camry", brand: "Toyota", category: "sedan", tagline: "Reliable. Refined. Ready.", description: "The benchmark for mid-size sedans.", dailyRate: 7900, depositAmount: 35000, seats: 5, doors: 4, transmission: "automatic", fuelType: "gasoline", horsepower: 203, acceleration: "0-60 in 7.6s", luggage: "2 suitcases, 2 bags", imageUrl: "/cars/toyota-camry.png", galleryUrls: [], featured: false },
  { slug: "nissan-versa", name: "Nissan Versa", brand: "Nissan", category: "sedan", tagline: "Smart value, big comfort", description: "Surprising interior space and fuel efficiency.", dailyRate: 4900, depositAmount: 25000, seats: 5, doors: 4, transmission: "automatic", fuelType: "gasoline", horsepower: 122, acceleration: "0-60 in 9.4s", luggage: "1 suitcase, 2 bags", imageUrl: "/cars/nissan-versa.png", galleryUrls: [], featured: false },
  { slug: "chrysler-pacifica", name: "Chrysler Pacifica", brand: "Chrysler", category: "van", tagline: "Family travel, elevated", description: "The ultimate family minivan.", dailyRate: 11900, depositAmount: 50000, seats: 7, doors: 5, transmission: "automatic", fuelType: "gasoline", horsepower: 287, acceleration: "0-60 in 7.3s", luggage: "2 suitcases, 2 bags", imageUrl: "/cars/chrysler-pacifica.png", galleryUrls: [], featured: false },
  { slug: "toyota-tacoma", name: "Toyota Tacoma", brand: "Toyota", category: "truck", tagline: "Built for the long haul", description: "The mid-size truck that does it all.", dailyRate: 12900, depositAmount: 50000, seats: 5, doors: 4, transmission: "automatic", fuelType: "gasoline", horsepower: 278, acceleration: "0-60 in 7.7s", luggage: "2 suitcases, 2 bags", imageUrl: "/cars/toyota-tacoma.png", galleryUrls: [], featured: false },
  { slug: "mercedes-a-class", name: "Mercedes-Benz A-Class", brand: "Mercedes-Benz", category: "sedan", tagline: "Entry to luxury", description: "Luxury in the compact segment.", dailyRate: 8900, depositAmount: 40000, seats: 5, doors: 5, transmission: "automatic", fuelType: "gasoline", horsepower: 188, acceleration: "0-60 in 7.0s", luggage: "3 bags", imageUrl: "/cars/mercedes-a-class.png", galleryUrls: [], featured: true },
  { slug: "bmw-1-series", name: "BMW 1 Series", brand: "BMW", category: "sedan", tagline: "The joy of driving, distilled", description: "Signature BMW driving in a compact package.", dailyRate: 7900, depositAmount: 35000, seats: 5, doors: 5, transmission: "automatic", fuelType: "gasoline", horsepower: 178, acceleration: "0-60 in 7.3s", luggage: "3 bags", imageUrl: "/cars/bmw-1-series.png", galleryUrls: [], featured: false },
  { slug: "mercedes-a-class-sedan", name: "Mercedes-Benz A-Class Sedan", brand: "Mercedes-Benz", category: "sedan", tagline: "Elegance in every line", description: "Three-box elegance with compact luxury.", dailyRate: 9500, depositAmount: 42000, seats: 5, doors: 4, transmission: "automatic", fuelType: "gasoline", horsepower: 188, acceleration: "0-60 in 7.0s", luggage: "2 suitcases, 2 bags", imageUrl: "/cars/mercedes-a-class-sedan.png", galleryUrls: [], featured: false },
];

const locations = [
  { name: "LAX Airport", address: "1 World Way, Los Angeles, CA 90045", city: "Los Angeles" },
  { name: "JFK Airport", address: "Queens, NY 11430", city: "New York" },
  { name: "Miami International Airport", address: "2100 NW 42nd Ave, Miami, FL 33142", city: "Miami" },
  { name: "San Francisco Airport", address: "San Francisco, CA 94128", city: "San Francisco" },
  { name: "Downtown Los Angeles", address: "800 S Figueroa St, Los Angeles, CA 90017", city: "Los Angeles" },
  { name: "Manhattan - Midtown", address: "310 W 40th St, New York, NY 10018", city: "New York" },
  { name: "Miami Beach", address: "1111 Lincoln Rd, Miami Beach, FL 33139", city: "Miami" },
  { name: "Las Vegas Strip", address: "3570 S Las Vegas Blvd, Las Vegas, NV 89109", city: "Las Vegas" },
];

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.car.deleteMany();
  await prisma.location.deleteMany();

  // Seed cars
  for (const car of cars) {
    await prisma.car.create({ data: car });
  }
  console.log(`Seeded ${cars.length} cars`);

  // Seed locations
  for (const loc of locations) {
    await prisma.location.create({ data: loc });
  }
  console.log(`Seeded ${locations.length} locations`);

  // Seed demo bookings
  const allCars = await prisma.car.findMany();
  const gClass = allCars.find(c => c.slug === "mercedes-g-class");
  const bmw7 = allCars.find(c => c.slug === "bmw-7-series");
  const mustang = allCars.find(c => c.slug === "ford-mustang-convertible");

  if (gClass && bmw7 && mustang) {
    await prisma.booking.createMany({
      data: [
        { bookingRef: "BK-2026-A7K2", status: "confirmed", pickupDate: new Date("2026-04-01"), returnDate: new Date("2026-04-05"), pickupLocation: "LAX Airport", returnLocation: "LAX Airport", totalPrice: 139600, depositAmount: 125000, depositStatus: "held", customerName: "James Wilson", customerEmail: "james.wilson@email.com", customerPhone: "+1 (310) 555-0142", extras: { insurance: true, gps: false, childSeat: 0 }, carId: gClass.id },
        { bookingRef: "BK-2026-M3P9", status: "active", pickupDate: new Date("2026-03-26"), returnDate: new Date("2026-03-30"), pickupLocation: "JFK Airport", returnLocation: "Manhattan - Midtown", totalPrice: 115600, depositAmount: 100000, depositStatus: "held", customerName: "Sarah Chen", customerEmail: "sarah.chen@company.com", customerPhone: "+1 (212) 555-0198", extras: { insurance: true, gps: true, childSeat: 0 }, carId: bmw7.id },
        { bookingRef: "BK-2026-R5T1", status: "completed", pickupDate: new Date("2026-03-20"), returnDate: new Date("2026-03-24"), pickupLocation: "Miami International Airport", returnLocation: "Miami Beach", totalPrice: 75600, depositAmount: 75000, depositStatus: "released", customerName: "Michael Torres", customerEmail: "m.torres@gmail.com", extras: { insurance: false, gps: true, childSeat: 0 }, carId: mustang.id },
      ],
    });
    console.log("Seeded 3 demo bookings");
  }

  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
