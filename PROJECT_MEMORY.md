# PROJECT_MEMORY.md - Manipuri OTT (manipuriplus)

## Core Identity & Deployment
- Production Site: manipuriplus.vercel.app
- Tech Stack: Next.js (App Router), React, TypeScript, Tailwind CSS, Prisma, Supabase PostgreSQL, Supabase Auth.
- Concept: Netflix-style legitimate OTT for Manipuri Cinema, Sumang Leela, and Manipuri Drama via official YouTube embeds.

## Content & Data Rules
- Canonical Movies: One movie card can have multiple parts (e.g., Part 1, Part 2, Part 3) selected inside the movie details dialog.
- Unavailable/Unknown Policy: Never display "Unknown", "UNKN", private, or deleted videos to public users. Flag them for admin review.
- Content Hierarchy:
  - Full Movies
  - Leela / Sumang Leela (Playlists & Drama series)
  - Search & Discovery

## Responsive Design Standard
- Mobile-First: All views must be testable down to 360px width without horizontal viewport overflow (`overflow-x-hidden`).
- Hero Section: Responsive height (`h-[50vh] sm:h-[65vh] md:h-[75vh] lg:h-[85vh]`).
- Video Player: Always locked to `aspect-video` (16:9) responsive sizing.
- Navigation: Desktop top-nav collapses to a mobile hamburger drawer or mobile bottom-bar.

## Monetization / Donations
- UPI ID: bhusanrajlegend@oksbi
- UPI Phone: 7005814596
- Behavior: Centered modal on first visit; lightweight reminder after 10 unique movie views. Never show fake "payment successful" state.
