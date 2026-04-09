"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { DotsLoader } from "@/components/ui/loader";
import { LuxuryLoader, VehicleCardsSkeleton } from "@/components/ui/luxury-loader";
import { notify } from "@/lib/notify";
import { formatCurrency } from "@/lib/utils";

interface Car {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  dailyRate: number;
  seats: number;
  horsepower: number;
  imageUrl: string;
  available: boolean;
}

export default function FleetManagementPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  const fetchCars = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cars?all=true");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load fleet");
      }

      setCars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load fleet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadCars() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/cars?all=true");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load fleet");
        }

        if (!cancelled) {
          setCars(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load fleet");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCars();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleAvailability = async (car: Car) => {
    const newAvail = !car.available;
    setCars((prev) => prev.map((c) => (c.id === car.id ? { ...c, available: newAvail } : c)));
    const res = await fetch(`/api/cars/${car.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: newAvail }),
    });

    if (!res.ok) {
      setCars((prev) => prev.map((c) => (c.id === car.id ? { ...c, available: car.available } : c)));
      notify.error("Could not update availability", {
        description: "Please try again in a moment.",
      });
      return;
    }

    notify.success(
      `${car.name} marked ${newAvail ? "available" : "unavailable"}`,
      {
        description: "The fleet view has been updated.",
      }
    );
  };

  const categories = [...new Set(cars.map((c) => c.category))];
  const filtered = filterCat === "all" ? cars : cars.filter((c) => c.category === filterCat);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-inter-tight)] text-2xl font-black">Fleet Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Loading..." : `${cars.length} vehicles · ${cars.filter((c) => c.available).length} available`}
          </p>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="rounded-lg bg-[#ff5f00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#ff5f00]/90"
        >
          + Add Vehicle
        </button>
      </div>

      {/* Add Vehicle Form */}
      {showAddForm && (
        <AddVehicleForm
          onClose={() => setShowAddForm(false)}
          onAdded={() => { setShowAddForm(false); fetchCars(); }}
        />
      )}

      {/* Filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => setFilterCat("all")} className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize ${filterCat === "all" ? "bg-[#ff5f00] text-white" : "bg-card text-muted-foreground hover:bg-secondary"}`}>All</button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilterCat(cat)} className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize ${filterCat === cat ? "bg-[#ff5f00] text-white" : "bg-card text-muted-foreground hover:bg-secondary"}`}>{cat}</button>
        ))}
      </div>

      {/* Fleet Grid */}
      {loading ? (
        <div className="mt-6 space-y-5">
          <LuxuryLoader
            compact
            title="Loading Fleet"
            subtitle="Syncing your latest vehicles and availability."
          />
          <VehicleCardsSkeleton count={4} layout="grid" />
        </div>
      ) : (
      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-3">
        {filtered.map((car) => (
          <div key={car.id} className="overflow-hidden rounded-xl bg-card shadow-sm">
            <div className="relative h-32 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] md:h-40">
              <Image src={car.imageUrl} alt={car.name} fill className="object-contain p-4" />
              {!car.available && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">Unavailable</span>
                </div>
              )}
            </div>
            <div className="p-3 md:p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#ff5f00]">{car.category}</p>
                  <h3 className="truncate font-[var(--font-inter-tight)] text-xs font-bold md:text-sm">{car.name}</h3>
                </div>
                <p className="shrink-0 font-[var(--font-inter-tight)] text-sm font-bold md:text-base">{formatCurrency(car.dailyRate)}<span className="text-[10px] font-normal text-muted-foreground">/day</span></p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{car.seats}s</span>
                  <span>{car.horsepower}HP</span>
                </div>
                <button
                  onClick={() => toggleAvailability(car)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${car.available ? "bg-green-500" : "bg-border"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${car.available ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

function AddVehicleForm({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("sedan");
  const [dailyRate, setDailyRate] = useState("");
  const [seats, setSeats] = useState("5");
  const [horsepower, setHorsepower] = useState("200");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      setImageUrl(data.url);
      notify.success("Vehicle image uploaded", {
        description: "The image is ready to be attached to this vehicle.",
      });
    } catch {
      notify.error("Upload failed", {
        description: "Please try another image or retry the upload.",
      });
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!name || !dailyRate) {
      notify.error("Vehicle details are incomplete", {
        description: "Add a name and daily rate before saving this vehicle.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          brand: brand || name.split(" ")[0],
          category,
          dailyRate: Math.round(parseFloat(dailyRate) * 100),
          seats: parseInt(seats),
          horsepower: parseInt(horsepower),
          imageUrl: imageUrl || "/cars/toyota-camry.png",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add vehicle");
      }
      notify.success("Vehicle added to fleet", {
        description: `${name} is now available in the admin fleet.`,
      });
      onAdded();
    } catch (err) {
      notify.error("Could not add vehicle", {
        description:
          err instanceof Error ? err.message : "Failed to add vehicle",
      });
    }
    setSaving(false);
  };

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[var(--font-inter-tight)] text-lg font-bold">Add New Vehicle</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">&times;</button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Vehicle Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="BMW 3 Series" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#ff5f00]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Brand</label>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="BMW" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#ff5f00]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#ff5f00]">
            {["sedan", "suv", "convertible", "coupe", "luxury", "van", "truck"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Daily Rate ($) *</label>
          <input type="number" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} placeholder="99" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#ff5f00]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Seats</label>
          <input type="number" value={seats} onChange={(e) => setSeats(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#ff5f00]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Horsepower</label>
          <input type="number" value={horsepower} onChange={(e) => setHorsepower(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#ff5f00]" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-foreground">Vehicle Image</label>
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition hover:bg-secondary disabled:opacity-50">
              {uploading ? (
                <span className="flex items-center gap-2">
                  <DotsLoader size="sm" className="text-[#ff5f00]" />
                  Uploading...
                </span>
              ) : (
                "Upload Image"
              )}
            </button>
            {imageUrl && <span className="text-xs text-green-600">Image uploaded</span>}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={handleSubmit} disabled={saving || !name || !dailyRate} className="rounded-lg bg-[#ff5f00] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#ff5f00]/90 disabled:opacity-50">
          {saving ? (
            <span className="flex items-center gap-2">
              <DotsLoader size="sm" className="text-white" />
              Adding...
            </span>
          ) : (
            "Add Vehicle"
          )}
        </button>
        <button onClick={onClose} className="rounded-lg border border-border px-6 py-2.5 text-sm hover:bg-secondary">Cancel</button>
      </div>
    </div>
  );
}
