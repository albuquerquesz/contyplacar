# PRD: Dashboard two-column layout (main + sidebar card)

**Status:** Draft  
**Inspiration:** biip.club community page (main feed + sticky right cards)  
**Primary surface:** `src/app/dashboard/page.tsx`  
**Related product context:** `PRODUCT.md` (simple, warm, trustworthy — avoid enterprise clutter)

---

## 1. Summary

Replicate the **main + right sidebar** structure from biip.club on the Contyplacar dashboard:

| Region | Role in Contyplacar |
|--------|---------------------|
| **Header** | Unchanged: Conty logo + account menu |
| **Left (main)** | All **existing** dashboard content: “Suas Disputas”, invite button, match table, loading/error/empty states, pagination |
| **Right (sidebar)** | **New** presentational promo/info card (mock image + lorem ipsum for v1) |

The goal is layout and hierarchy, not a community feed. Do **not** port biip features (composer, filters, posts, leaderboard) in this workstream.

---

## 2. Goals

1. Widen the dashboard content area so a **primary column** and a **~320px sidebar** fit comfortably on desktop.
2. Keep **100% of current left-column product behavior** (matches load, realtime, invite modal, pagination, leave status, game mode badges).
3. Introduce a **new right-side card component** that mirrors the visual hierarchy of biip’s community card (media → title → body → optional stats → optional footer).
4. Use **placeholder content only** (lorem + mock image) so copy/art can be swapped later without layout rework.

## 3. Non-goals (explicit)

- Secondary navigation bar (Comunidade / Membros / etc.).
- “Escreva algo…” composer, topic chips, or social feed posts.
- Second sidebar widget (e.g. Leaderboard).
- Real stats from Supabase or CMS-driven content.
- Redesigning match rows, invite flow, or scoreboard pages.
- Pixel-perfect clone of biip branding (colors, mascots, “fixado” ribbon).

---

## 4. Current state (as-is)

### 4.1 Page shell

`src/app/dashboard/page.tsx`:

- Client page; loads auth user; owns invite modal + invite API call.
- Layout today:

```text
min-h-screen bg-[#F8F7F5]
└── DashboardHeader          (max-w-4xl inner)
└── main: max-w-4xl px-4 py-8
    └── DashboardMatchesSection
└── InviteModal
```

### 4.2 Components to preserve

| Component | Path | Responsibility |
|-----------|------|----------------|
| `DashboardHeader` | `src/components/dashboard/DashboardHeader.tsx` | Logo + account menu |
| `DashboardAccountMenu` | `src/components/dashboard/DashboardAccountMenu.tsx` | Avatar dropdown / sign out |
| `DashboardMatchesSection` | `src/components/dashboard/DashboardMatchesSection.tsx` | Fetch matches, empty/error/loading, “Suas Disputas” + Convidar |
| `MatchList` | `src/components/dashboard/MatchList.tsx` | Table + client pagination (PAGE_SIZE 10) |
| `InviteModal` | `src/components/ui/InviteModal.tsx` | Invite link generation UX |
| `ContyLogo` | `src/components/ui/ContyLogo.tsx` | Brand mark in header |

### 4.3 Constraint

Left column is **not** a greenfield feed. Any layout change must **mount the same `DashboardMatchesSection`** (or equivalent composition) without changing its props contract:

```ts
type DashboardMatchesSectionProps = {
  userId: string
  onInvite: () => void
  inviteDisabled?: boolean
}
```

---

## 5. Target experience (to-be)

### 5.1 Visual reference (biip → Contyplacar)

From the inspiration screenshot, the **right community card** structure is:

1. **Hero media** — full-bleed top of card, rounded top corners, illustrative art.
2. **Title** — bold product/community name.
3. **Subtitle** — short handle or secondary line (muted).
4. **Description** — multi-line body text.
5. **Stats row** — three columns (number + small label), divided by light rules.
6. **Footer action** — right-aligned text link (e.g. “sair →”); optional and non-functional in v1.

Contyplacar maps this to a **promo / product context card** (what Contyplacar is, social proof placeholders, or future CTA). Content is mock until product decides final copy.

### 5.2 Page wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ DashboardHeader  [ContyLogo]              [AccountMenu]      │  full width bar
├──────────────────────────────────────────────────────────────┤
│  max-w-6xl (or 7xl) · px-4 · py-8                            │
│  ┌─────────────────────────────┐  ┌────────────────────────┐ │
│  │ LEFT (flex-1 / 1fr)         │  │ RIGHT (~320px)         │ │
│  │                             │  │ sticky top-6           │ │
│  │ DashboardMatchesSection     │  │ DashboardPromoCard     │ │
│  │  · Suas Disputas + Convidar │  │  · mock image          │ │
│  │  · table / empty / error    │  │  · title + lorem       │ │
│  │  · pagination               │  │  · mock stats          │ │
│  │                             │  │  · optional footer     │ │
│  └─────────────────────────────┘  └────────────────────────┘ │
│  InviteModal (portal/overlay, unchanged)                     │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Responsive behavior

| Breakpoint | Behavior |
|------------|----------|
| `< lg` (~1024px) | Single column: **main first**, promo card **below**. No sticky required. |
| `≥ lg` | Two columns: main left, card right; card `sticky top-6` (or `top-8`) while scrolling the match list. |

Do not hide the sidebar by default on mobile in v1 (stack is fine). Hiding can be a later product decision.

---

## 6. Layout specification (implementation detail)

### 6.1 Content container

**Change** the main content wrapper from `max-w-4xl` to **`max-w-6xl`** (preferred) or `max-w-7xl` if the table feels cramped with a 320px rail.

```tsx
// Target shape in page.tsx (illustrative)
<div className="mx-auto max-w-6xl px-4 py-8">
  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
    <div className="min-w-0">
      <DashboardMatchesSection ... />
    </div>
    <aside className="lg:sticky lg:top-6">
      <DashboardPromoCard />
    </aside>
  </div>
</div>
```

Notes:

- `minmax(0,1fr)` / `min-w-0` prevents the table from overflowing the grid track.
- Gap: `gap-6` (24px) matches the airy biip spacing on a warm off-white page.
- Background remains `#F8F7F5`.

### 6.2 Header width sync

`DashboardHeader` currently uses `max-w-4xl` for its inner flex row. **Update it to the same max width as the content** (`max-w-6xl`) so logo and avatar align with the grid edges.

File: `src/components/dashboard/DashboardHeader.tsx`

```tsx
// before: max-w-4xl
// after:  max-w-6xl  (must match page content)
```

### 6.3 Left column card chrome

`DashboardMatchesSection` already wraps content in a white rounded bordered section (`rounded-3xl border border-gray-200 bg-white p-6`). Keep that. Do not force it to look like biip feed posts.

### 6.4 Right column card chrome

Match product design principles:

- White surface, light border (`border-gray-200`), generous radius (`rounded-2xl` or `rounded-3xl`).
- Soft elevation optional (`shadow-sm`); avoid heavy drop shadows.
- Padding inside text block ~`p-5` / `p-6`.
- Type scale: title ~`text-lg`–`text-xl` semibold; body `text-sm` leading-relaxed muted gray; stats numbers semibold.

Reuse existing primitives where helpful:

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` from `src/components/ui/card.tsx` **or** a single custom `<section>` for tighter control of the hero image (full-bleed top). Custom section is recommended so the image can be edge-to-edge under rounded corners (`overflow-hidden`).

---

## 7. New component: `DashboardPromoCard`

### 7.1 Location & name

| Item | Value |
|------|--------|
| Path | `src/components/dashboard/DashboardPromoCard.tsx` |
| Export | default function `DashboardPromoCard` |
| Client/server | Presentational only; **Server Component OK** if no hooks. Prefer no `'use client'` unless needed. |

### 7.2 Anatomy (required for v1)

```text
┌─────────────────────────────┐
│ [Hero image / mock media]   │  aspect ~16/10 or fixed h-36–h-40
│                             │  object-cover, rounded with card
├─────────────────────────────┤
│ Title                       │  e.g. “Contyplacar”
│ Subtitle                    │  muted, e.g. “placar.conty” or lorem
│                             │
│ Description paragraph(s)    │  2–3 sentences lorem ipsum
│                             │
│ ──── stats ──── stats ────  │  3 columns, light dividers
│  12      4       1          │  mock numbers
│  lorem   lorem   lorem      │  small labels
│                             │
│              saiba mais →   │  optional static footer (no nav v1)
└─────────────────────────────┘
```

### 7.3 Mock content (v1 hardcode)

Use placeholder copy so designers can replace later. Suggested Portuguese-friendly placeholders (product is PT-BR):

| Slot | Mock value |
|------|------------|
| Title | `Contyplacar` |
| Subtitle | `Lorem ipsum dolor` |
| Description | `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.` |
| Stat 1 | `12` / `disputas` |
| Stat 2 | `4` / `ativas` |
| Stat 3 | `1` / `hoje` |
| Footer | `saiba mais →` (non-clickable or `button`/`span` with no handler) |

**Do not** wire real match counts in v1 even if available on the page — keeps the card independent of data loading.

### 7.4 Mock image

**Preferred:** reuse an existing public asset so no new binary is required:

- `/images/pedro-conty.jpg` or `/images/william-conty.jpg`

Implementation sketch:

```tsx
<div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
  <img
    src="/images/pedro-conty.jpg"
    alt=""
    className="h-full w-full object-cover"
  />
</div>
```

**Fallback:** if image is undesirable, a soft blue gradient block (`bg-gradient-to-br from-blue-100 to-blue-200`) with optional ContyLogo watermark is acceptable; document the choice in the PR when implementing.

Decorative image: empty `alt` if purely decorative; if it becomes product photography later, use a real alt string.

### 7.5 Props (optional, for future)

v1 may hardcode content. Optional props for easier iteration:

```ts
type DashboardPromoCardProps = {
  title?: string
  subtitle?: string
  description?: string
  imageSrc?: string
  imageAlt?: string
  stats?: Array<{ value: string | number; label: string }>
  footerLabel?: string
}
```

Defaults = mock content above. No required props for mount: `<DashboardPromoCard />`.

### 7.6 Accessibility

- Card is complementary content: wrap in `<aside aria-label="Sobre o Contyplacar">` (or similar) at the page or component root.
- Stats: expose as a list or `dl` so numbers/labels are associated.
- Footer control: if non-functional, use `<span>` not a dead `<a href="#">`. If using a button, `disabled` or omit until destination exists.
- Focus: no trap; sticky sidebar must not obscure keyboard focus rings on the table.

---

## 8. Changes to `src/app/dashboard/page.tsx`

### 8.1 Keep unchanged

- Auth `useEffect` / `loadUser`
- Invite state: `generating`, `inviteModalOpen`, `inviteLink`
- `openInviteModal`, `handleInviteCopy`
- `InviteModal` mounting and props

### 8.2 Change

1. Import `DashboardPromoCard`.
2. Replace single-column content div with the **grid layout** in §6.1.
3. Left: existing `DashboardMatchesSection` with same props.
4. Right: `<DashboardPromoCard />` inside sticky aside.

### 8.3 Do not change

- Match fetch logic (lives in `DashboardMatchesSection`).
- Invite API payload.
- Route protection behavior (redirect to `/login` if no user).

---

## 9. File change checklist

| Action | File |
|--------|------|
| Create | `src/components/dashboard/DashboardPromoCard.tsx` |
| Edit | `src/app/dashboard/page.tsx` — grid + mount promo card |
| Edit | `src/components/dashboard/DashboardHeader.tsx` — sync `max-w-*` with page |
| Optional | `src/components/ui/card.tsx` — only if reusing Card primitives |
| Docs | This PRD (`docs/prd-dashboard-sidebar-layout.md`) |

No backend, migration, or env changes.

---

## 10. Design tokens (align with current dashboard)

| Token | Value / guidance |
|-------|------------------|
| Page bg | `#F8F7F5` |
| Card bg | `white` |
| Border | `border-gray-200` |
| Radius (matches section) | `rounded-3xl` |
| Radius (promo card) | `rounded-2xl` or `rounded-3xl` |
| Brand blue (logo / CTAs) | `#2984f6` / existing `blue-600` buttons |
| Body muted | `text-gray-500` / `text-gray-600` |
| Title | `text-gray-900` font-semibold |

Primary CTA remains **Convidar** on the left section, not on the promo card, unless product later decides a secondary CTA.

---

## 11. Acceptance criteria

- [ ] Desktop (`≥ lg`): two columns; match table/list on the **left**; promo card on the **right**.
- [ ] Promo card shows **hero mock image**, **title**, **description (lorem)**, and **mock stats** with hierarchy similar to biip community card.
- [ ] Sidebar card is **sticky** while scrolling a long match list on desktop.
- [ ] Mobile: stacked layout; main content still usable first.
- [ ] “Suas Disputas”, Convidar, table columns, pagination, empty/error/loading, and invite modal behave as before.
- [ ] Header content width aligns with the new page content max-width.
- [ ] Promo card has **no API calls** and no dependency on `userId` / matches data.
- [ ] No TypeScript/lint regressions on touched files.

---

## 12. Testing notes

Manual:

1. Log in → `/dashboard`.
2. Confirm logo + avatar still correct; horizontal alignment with content.
3. With 0 matches: empty state left + promo card right (or stacked).
4. With >10 matches: pagination still works; sticky card remains visible on scroll (desktop).
5. Open Convidar → modal still works; copy invite still works.
6. Narrow viewport: stack order main → promo.

No new automated tests required for pure layout/mock UI unless the project already snapshots dashboard.

---

## 13. Future follow-ups (out of this PRD’s implementation scope)

1. Replace lorem + mock image with final Conty marketing copy and art.
2. Optional real stats (active matches, friends invited) fed from parent or API.
3. Footer CTA linking to docs, Conty site, or onboarding.
4. Additional sidebar widgets (tips, leaderboard) — only if product asks.
5. Shared layout constant for `MAX_CONTENT_WIDTH` used by header + page to avoid drift.

---

## 14. Implementation order (when building)

1. Create `DashboardPromoCard` with mock content and polish card chrome.
2. Update `page.tsx` grid + mount card; widen container.
3. Sync `DashboardHeader` max-width.
4. Visual pass at desktop + mobile; fix overflow on table (`min-w-0`).
5. Smoke-test invite + pagination.

---

## 15. Open questions (resolved for v1)

| Question | v1 decision |
|----------|-------------|
| Real stats? | No — mock only |
| Leaderboard card? | No |
| Promo card data source? | Hardcoded defaults / optional props |
| Image source? | Existing `/images/*.jpg` or gradient fallback |
| Header width? | Match content `max-w-6xl` |
| Mobile hide sidebar? | No — stack below main |
