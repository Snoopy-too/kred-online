# KRED Game Manual Overview

KRED is a multiplayer board game of deception and strategy for 3-5 players, built with `boardgame.io`. Players compete to fill their Domain with pieces through drafting, campaign moves, tile bluffing, challenges, and bureaucracy.

---

## Documentation Structure

Detailed game manuals and technical references are split into modular guides:

1. **[Gameplay Rules & Mechanics](file:///c:/xampp/htdocs/testKredBGIO/docs/GAMEPLAY_RULES.md)**
   - Domain Spatial Structure & Support Invariants
   - Six Basic Board Actions (Advance, Withdraw, Organize, Assist, Remove, Influence)
   - Campaign Turn Structure (Submission, Receipt, Challenge, Resolution)
   - Credibility System & Penalties

2. **[Bureaucracy, Components & Victory Reference](file:///c:/xampp/htdocs/testKredBGIO/docs/BUREAUCRACY_AND_COMPONENTS.md)**
   - Piece Types (Mark, Heel, Pawn) & Counts
   - Complete Tile Deck Specification & Funding Checksums
   - Bureaucracy Phase Funding Calculation & Action Pricing
   - Winning Conditions (6 Seats + 2 Rostrum Heels + 1 Office Pawn)

---

## Quick Reference: Invariants & Verification Rules

1. **Funding Checksum**: Face-down Bank tiles + face-up Bank tiles = 100 total.
2. **Piece Conservation**: Total pieces across domains + community = initial pool size.
3. **Support Rule**: Rostrum requires seat support; Office requires rostrum support. Auto-cascades on vacancy.
4. **Max 1 Pawn**: A player may only ever own 1 Pawn.
5. **Tile Persistence**: Tiles persist across campaigns; no re-drafting.
