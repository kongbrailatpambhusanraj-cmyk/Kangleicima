# Manipuri Film Platform Project Memory

## PROJECT SUMMARY
Manipuri-focused OTT/discovery streaming platform with Netflix-style browsing, search, title details, user accounts, My List, playback, and legitimate embedded video sources.

## CURRENT FUNCTIONALITY
* ~438 movies discovered
* Posters loading
* Playback working
* **Search relevance improved (basic ranking implemented in API)**
* Content discovery pipeline active
* Next.js (Turbopack) frontend
* Prisma/PostgreSQL backend
* YouTube-based player technology
* Initial authentication implemented
* **My List authenticated CRUD implemented**

## KNOWN PROBLEMS
* Missing important Manipuri films (audit ongoing, Thasana and Yaiskul Pakhang Angouba canonical records consolidated)
* Massive playlist scraping via API/library failing; manually added specific video sources as a bridge.
* Search relevance needs refinement
* Profiles/authentication needs completion
* Playback association needs further verification
* Duplicate movie detection needs refinement

## IMPLEMENTATION HISTORY
* 2026-09-09: Initialized Project Memory and backed up catalogue (436 movies).
* 2026-09-09: Created `discovery-audit.md` and `essential_titles.json` for missing films.
* 2026-09-09: Implemented `movie-matcher.js`.
* 2026-09-09: Manually added Yaiskul Pakhang Angouba and VDF Thasana sources via `scripts/add-manual-sources.js`.
* 2026-09-09: Implemented rank-based search in `app/api/movies/search/route.ts`.
* 2026-09-09: Implemented user-specific `My List` retrieval in `app/api/movies/route.ts`.
* 2026-09-09: Implemented user-specific `My List` add/remove via `app/api/movies/[id]/mylist/route.ts`.
* 2026-09-12: Updated UI labels: Changed "Support Manipuri OTT" to "SUPPORT ME" and "Leela" to "Sumang Leela".


## DONATION AND MULTIPART RULES (PERMANENT)

### Donation System
* First-visit donation modal (persistent dismissal via `localStorage`).
* More-than-10-distinct-movie reminder (small popup, persistent dismissal).
* Donation UPI configuration: bhusanrajlegend@oksbi (7005814596).
* UX: Respectful, optional, never interrupts playback.

### Multipart System
* Canonical movie grouping (via `groupId` in Prisma schema).
* Multipart films appear as a single card in browsable lists.
* Part selector available on Movie Info page.
* Same grouping/playback behavior for Leela/Sumang Leela.
* Grouping should be evidence-based to avoid over-merging.
