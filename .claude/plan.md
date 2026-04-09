# Ben Auto — Buy Flow + Deployment Plan

## Research Summary

Based on analysis of Enterprise Car Sales, Hertz Rent2Buy, Carvana, CarMax, and AutoTrader:

**Key finding:** No major platform lets the same car be simultaneously available for long-term rental AND outright purchase without guard rails. The safest pattern is: a car can be listed in both modes, but once a purchase inquiry reaches "serious" status (PENDING_SALE), new rentals are blocked. When SOLD, the car is hidden from everything.

**Quote request flow** (not online purchase): Luxury/premium buyers expect negotiation. Display an indicative sale price, collect minimal lead info (name, email, phone), send immediate confirmation email with vehicle details, and have admin follow up. Keep the form short — 3-4 required fields max for conversion.

**Admin CRM pipeline:** NEW → CONTACTED → NEGOTIATING → SOLD / LOST

---

## Phase 1: Database Schema Changes

### Car Model Changes
Add these fields to the `Car` model:

```prisma
// Listing mode
listingType    String   @default("rent")    // "rent" | "buy" | "both"

// Sale-specific fields
salePrice      Int?     // cents (e.g., 4500000 = $45,000)
mileage        Int?     // in miles
year           Int?     // model year (e.g., 2024)
condition      String?  // "new" | "like_new" | "excellent" | "good"

// Status replaces simple `available` boolean
status         String   @default("available") // "available" | "rented" | "pending_sale" | "sold" | "maintenance" | "unlisted"
```

Keep `available` for backwards compatibility but derive it from `status === "available"`.

### New QuoteRequest Model

```prisma
model QuoteRequest {
  id              String   @id @default(cuid())
  referenceNumber String   @unique
  status          String   @default("new")    // "new" | "contacted" | "negotiating" | "quoted" | "sold" | "lost"
  
  // Car reference
  carId           String
  car             Car      @relation(fields: [carId], references: [id])
  
  // Customer info
  customerName    String
  customerEmail   String
  customerPhone   String
  message         String?
  
  // Optional fields
  financingInterest  Boolean @default(false)
  tradeInInterest    Boolean @default(false)
  
  // Admin tracking
  adminNotes      String?
  contactedAt     DateTime?
  closedAt        DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

Add relation to Car: `quoteRequests QuoteRequest[]`

### Migration Strategy
1. Add new fields with defaults (non-breaking)
2. Set `listingType = "rent"` for all existing cars
3. Set `status = "available"` for cars where `available = true`, `"unlisted"` otherwise
4. Keep `available` column for now, update all queries to use `status`

---

## Phase 2: Landing Page Changes

### Hero Section Modifications
1. **Remove** the "Drive / Premium" h1 text (both mobile and desktop versions)
2. **Replace** with the Ben Auto logo at larger size:
   - Mobile: `h-24 w-auto` (centered)
   - Desktop: `h-36 w-auto` (centered)
3. Keep the subtitle: "Premium car rental at prices you'll love..."

### Rent/Buy Toggle
Add a **segmented control** (pill toggle) above the search bar:
- Two options: **Rent** (default) | **Buy**
- Style: Glass morphism matching the search bar, orange active state
- Position: Centered, between subtitle text and search bar

**When "Rent" is active:** Show the existing search bar (location + dates + "Show Cars")
**When "Buy" is active:** Show a simplified search — just a "Browse Cars for Sale" button (no dates/location needed for purchase inquiries). Optionally add a category filter dropdown.

Toggle navigates to:
- Rent → `/fleet?mode=rent` (existing flow)
- Buy → `/fleet?mode=buy` (new filtered view)

---

## Phase 3: Buy Flow (Frontend)

### Fleet Page Updates (`/fleet`)
- Read `mode` query param (default: "rent")
- Add mode toggle at top of fleet page too
- When `mode=buy`:
  - Fetch cars with `listingType` in ["buy", "both"] and `status` not in ["sold", "unlisted"]
  - Card shows: **sale price** prominently, mileage, year, condition
  - CTA button: "Request Quote" instead of "Book Now"
- When `mode=rent`:
  - Existing behavior (daily rate, book now)
- Cars listed as "both" appear in both modes with appropriate info

### Car Detail Page (`/fleet/[slug]`)
- If car `listingType` is "both": show **two sections**
  - "Rent This Car" box: daily rate, date picker link, Book Now
  - "Buy This Car" box: sale price, mileage, condition, "Request Quote"
- If "buy" only: show only the buy section
- If "rent" only: existing behavior

### Quote Request Flow (New Pages)

#### `/buy/quote` — Quote Request Form
- Auto-populated car info from URL params (`?car=slug`)
- Shows: car image, name, sale price, specs
- Form fields:
  1. Full Name (required)
  2. Email (required)
  3. Phone Number (required)
  4. Interested in financing? (yes/no toggle)
  5. Have a trade-in? (yes/no toggle)
  6. Message / Notes (optional textarea)
- Submit → POST `/api/quotes`
- On success → redirect to `/buy/confirmation?ref=QR-XXXXX`

#### `/buy/confirmation` — Quote Confirmation
- Success icon + reference number
- Summary: car details, customer info, what happens next
- "A Ben Auto specialist will contact you within 24 hours"
- Email confirmation sent automatically

---

## Phase 4: Buy Flow (Backend)

### New API Routes

#### `POST /api/quotes` — Create Quote Request
**Request:**
```json
{
  "carId": "string",
  "customerName": "string",
  "customerEmail": "string",
  "customerPhone": "string",
  "message": "string?",
  "financingInterest": false,
  "tradeInInterest": false
}
```

**Logic:**
1. Validate required fields
2. Fetch car, verify it's for sale (listingType in ["buy","both"]) and status is "available"
3. Generate reference number: `QR-${timestamp.toString(36).toUpperCase()}`
4. Create QuoteRequest in DB
5. Send confirmation email via Resend
6. Return `{ quoteId, referenceNumber }`

#### `POST /api/email/quote-confirmation` — Send Quote Email
**HTML email template:**
- Ben Auto branding header
- "Quote Request Received!" heading
- Reference number
- Vehicle details: name, year, mileage, condition, sale price
- Customer details echoed back
- Financing interest / trade-in noted
- "What happens next" section: "A Ben Auto specialist will review your request and contact you within 24 hours"
- Direct contact info

#### `GET /api/quotes` — List Quote Requests (Admin)
**Auth:** Requires admin session
**Query:** `?status=new` filter
**Response:** Array of quotes with car relation, ordered by createdAt desc

#### `PATCH /api/quotes/:id` — Update Quote Request (Admin)
**Auth:** Requires admin session
**Body:** `{ status, adminNotes, contactedAt }`

### Updated Car API
- `GET /api/cars` — Add `listingType` and `mode` filter params
- `PATCH /api/cars/:id` — Support new fields (salePrice, mileage, year, condition, listingType, status)
- When status changes to "sold": cascade logic
  - Check for active/future bookings → warn admin
  - Auto-hide from all listings

---

## Phase 5: Admin Dashboard Updates

### New "Quotes" Section
- Add "Quotes" to admin sidebar navigation
- `/admin/quotes` page:
  - Table: Reference, Customer, Car, Sale Price, Status, Date, Actions
  - Filter by status (new, contacted, negotiating, quoted, sold, lost)
  - Status badge colors: new=blue, contacted=yellow, negotiating=orange, sold=green, lost=red
  - Click into quote detail → view full info + add notes + change status

### Fleet Management Updates
- Add new fields to "Add Vehicle" form:
  - Listing Type selector: "Rent Only" / "Buy Only" / "Rent and Buy"
  - When buy is selected: sale price, mileage, year, condition fields appear
- Car cards show listing type badge
- Status selector (available/maintenance/unlisted) instead of simple toggle
- "Mark as Sold" button with confirmation dialog + warning about active bookings

### Dashboard Metrics
- Add 2 new metric cards:
  - "Quote Requests" (new count this month)
  - "Pending Sales" (status = negotiating count)

---

## Phase 6: Deployment

### Railway Backend
1. Create new Railway project "Ben-Auto" via CLI
2. Provision PostgreSQL database in the project
3. Deploy Next.js app as a Railway service (connected to GitHub repo)
4. Configure environment variables:
   - DATABASE_URL (from Railway PostgreSQL)
   - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
   - RESEND_API_KEY
   - ADMIN_EMAIL, ADMIN_PASSWORD
   - ADMIN_AUTH_SECRET
5. Run Prisma migrations
6. Seed database with car data

### Vercel Frontend
1. Deploy to Vercel via CLI with project name "ben-auto"
2. Configure same environment variables
3. Set up custom domain or use ben-auto.vercel.app
4. Configure build command: `prisma generate && next build`

### Database Migration
1. Run `prisma migrate dev` to create migration for new fields
2. Run seed script to populate sale data on existing cars

---

## Implementation Order

1. **Schema changes** — Prisma migration with new Car fields + QuoteRequest model
2. **Seed data update** — Add sale prices, mileage, year, condition to existing cars
3. **Landing page** — Logo enlargement, remove "Drive Premium", add Rent/Buy toggle
4. **API routes** — Quote request endpoints, updated car endpoints
5. **Buy flow pages** — Fleet buy mode, quote form, confirmation
6. **Quote email template** — Detailed HTML email for quote confirmation
7. **Admin updates** — Quotes management, fleet management fields, dashboard metrics
8. **Sold cascade logic** — Backend logic for marking cars as sold
9. **Testing** — End-to-end flow testing
10. **Railway deployment** — Create project, provision DB, deploy, configure env
11. **Vercel deployment** — Deploy frontend, configure env
12. **Final verification** — Test deployed app
