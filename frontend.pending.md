# FRONTEND PENDING WORK
_Source of truth: `srs.md` (requirements) + current backend capabilities (`backend.progress.md` + `pending.md`)_

## 1. Authentication & User Accounts

- [ ] Implement full **email verification flow**:
  - [ ] "Check your inbox" screen after registration.
  - [ ] "Email verified" success page.
  - [ ] "Resend verification email" UI and state handling.
- [ ] Add placeholders (UI) for **social login buttons** (Google/Facebook/Apple), even if backend is not ready yet.
- [ ] Implement **user profile** section for regular users:
  - [ ] View/update name, email, password, avatar.
  - [ ] See own newsletter subscription status.
- [ ] Implement **bookmarks/saved articles** UI:
  - [ ] "Save" icon on article cards and detail page.
  - [ ] "My Bookmarks" screen listing saved news.
  - [ ] States: logged-out (prompt to login), loading, empty, error.

---

## 2. Admin Panel (CMS & Management)

- [ ] Build **Homepage Layout Manager** (as required by SRS):
  - [ ] Visual UI for configuring which sections appear on homepage (hero slider, breaking ticker, featured sections, category blocks).
  - [ ] Ability to choose data sources (e.g., featured news, category X, manual curated list).
  - [ ] Persist layout config via dedicated endpoint (or config table when backend is ready).
- [ ] Implement UI for **SEO/Metadata management** (if required by SRS):
  - [ ] Simple forms to override SEO title/description/OG image for homepage, categories, and static pages.
- [ ] Add **Analytics / Stats dashboard** screens:
  - [ ] Admin overview page consuming `/api/v1/stats/dashboard`.
  - [ ] Charts for:
    - [ ] News popularity.
    - [ ] Category performance.
    - [ ] User engagement.
    - [ ] Conversion metrics (newsletter, ad clicks, reports).
  - [ ] Filters for date range (last 7/30/90 days).
- [ ] Add **Audit Log viewer**:
  - [ ] Paginated table using `AuditLog` data.
  - [ ] Filters by user, action, date range.

---

## 3. Advertiser Panel & Ad UX

- [ ] Create proper **Advertiser dashboard**:
  - [ ] Summary cards: total ads, active ads, impressions, clicks, CTR.
  - [ ] Simple charts of impressions/clicks over time.
- [ ] Replace basic ad form with a **multi-step wizard**:
  1. Ad details (title, image, link, slots, dates).
  2. Preview (simulate placement on sample layout).
  3. Pricing summary (from backend pricing API).
  4. Payment step (Stripe checkout / card form).
  5. Confirmation step.
- [ ] Implement **Stripe payment UI**:
  - [ ] Handle payment intent creation, loading states, error states.
  - [ ] Show payment status (pending, succeeded, failed) on advertiser side.
- [ ] Add **Ad analytics** views:
  - [ ] Per-ad detail screen (impressions, clicks, CTR, date filters).
  - [ ] Aggregate analytics ("My performance") using `/ads/analytics/me`.
- [ ] Prepare UI for **invoice download**:
  - [ ] "Download invoice" button on each paid ad (wire up backend when invoice PDF exists).

---

## 4. Public Frontend (News / Homepage / UX)

- [ ] Improve **CNN-style homepage layout**:
  - [ ] Larger, more visual hero slider.
  - [ ] Multiple layout blocks: Top Stories, Calabria Focus, Opinion, etc.
  - [ ] Section headings and “View all” links.
- [ ] Implement **“You may also like” / Recommended section** on article page:
  - [ ] For now, use simpler fallback (same category + most viewed).
  - [ ] Later swap to real AI recommendation endpoint when backend exists.
- [ ] Add **better skeleton/loading states**:
  - [ ] For homepage sections.
  - [ ] For article detail.
  - [ ] For weather/horoscope widgets.
- [ ] Add **proper error pages**:
  - [ ] 404 page (news/category not found).
  - [ ] 500-like generic error screen.
- [ ] Implement **bookmark/like buttons** on article cards and detail pages (hooked with user bookmarks).

---

## 5. Regional Modules (Weather, Horoscope, Transport)

- [ ] Weather:
  - [ ] Add city switcher UX improvements (dropdown, pills, or tabs).
  - [ ] Show “Last updated at” using cached timestamps.
  - [ ] Handle API failure / stale cache visually with warning message.
- [ ] Horoscope:
  - [ ] Separate **Daily** and **Weekly** tabs with clear state.
  - [ ] Highlight the current sign (if user chooses one).
  - [ ] Optional: allow user to “remember my sign” (local storage).
- [ ] Transport:
  - [ ] Better filters and search (type, city, keyword).
  - [ ] Display structured layouts (table or card) with times/links.
  - [ ] Optional map link where applicable.

---

## 6. External Platform Integrations (TG Aziende, Mercatino, MyDoctor, etc.)

> Backend still has these as pending; frontend should at least prepare the surface.

- [ ] Add **homepage sections or dedicated pages** for external platforms:
  - [ ] TG Aziende block (list or feed section).
  - [ ] Mercatino / marketplace block.
  - [ ] TG Calabria / MyDoctor integrations.
- [ ] For now, use:
  - [ ] Placeholders / static cards / iFrames if available.
  - [ ] Config-driven links that can be updated from admin in future.
- [ ] Make these sections optional, controlled by config (so site doesn't break if integration is missing).

---

## 7. SEO & Structured Data

- [ ] Use **SEO API endpoints** to set `<head>` data for:
  - [ ] Homepage.
  - [ ] Category pages.
  - [ ] News detail pages.
- [ ] Inject **JSON-LD structured data** on:
  - [ ] News detail (`NewsArticle` schema).
  - [ ] Category (`CollectionPage` schema).
  - [ ] Homepage (`WebSite` / `Organization` schema).
- [ ] Ensure all social share previews (OG/Twitter) match the SRS expectations:
  - [ ] Correct title, description, image, URL per page.

---

## 8. Notifications & UX Enhancements

- [ ] Implement **browser push notifications** for breaking news (once backend & infra are ready).
- [ ] Improve **breaking news ticker**:
  - [ ] Smooth continuous scrolling.
  - [ ] Pause on hover.
  - [ ] Click → open article.
- [ ] Standardize **toasts/snackbars** for all user-facing actions:
  - [ ] Newsletter subscription.
  - [ ] Report submission.
  - [ ] Ad upload.
  - [ ] Auth operations.

---

## 9. Theme, Accessibility & “Future-Proof” Features

- [ ] Implement **dark mode**:
  - [ ] Theme toggle (light/dark/system).
  - [ ] Persist preference in local storage.
  - [ ] Ensure contrast meets accessibility standards.
- [ ] Improve **accessibility**:
  - [ ] Keyboard navigation for menus, sliders, modals.
  - [ ] ARIA roles/labels for interactive components.
  - [ ] Alt text handling for images.
- [ ] Responsive polish:
  - [ ] Double-check all key templates on mobile/tablet (homepage, article, advertiser panel, admin lists).
  - [ ] Fix overflow/spacing issues.

---

## 10. Frontend Testing & Quality

- [ ] Add frontend testing setup:
  - [ ] Unit tests for components (Jest/Vitest).
  - [ ] Integration tests for critical flows (login, read news, submit report, create ad).
- [ ] Add basic **E2E tests** (Playwright/Cypress) for:
  - [ ] Homepage render.
  - [ ] Article view.
  - [ ] Newsletter subscription.
  - [ ] Simple ad creation.
- [ ] Add **linting & formatting** checks:
  - [ ] ESLint + Prettier integrated with CI.
  - [ ] Pre-commit hooks (optional, but recommended).

---

## 11. DevOps / Build for Frontend

- [ ] Document **build & deployment** steps for frontend separately:
  - [ ] Environment variables (API_BASE_URL, GA4 keys, etc.).
  - [ ] Production build commands.
  - [ ] Static file hosting/CDN strategy.
- [ ] Hook up **error tracking** (e.g., Sentry) on frontend:
  - [ ] Global error boundary.
  - [ ] Source map upload in CI.

