# Preflight evidence index

Run **2026-11-14-lab-pf-952b4** · source manifest SHA-256 `c999d9cc03a1236cabdb1a900c9f9145acad28304d4f6e3e684e63a085fde912`.

[Report](FIRST_ENCOUNTER_LAB_PREFLIGHT_REPORT.md) · [Source manifest](PREFLIGHT_SOURCE_MANIFEST.json) · [Report checksum](PREFLIGHT_REPORT.sha256)

The active workspace was used for audit output only. Source pins, archive identity, deferred inputs and exact paths are in the manifest. ROOM evidence targets the baseline plus checkpoint overlay in scratch. M3 execution targets the commit export at 76a92fd.

## Primary evidence

- [checkpoint-integrity.log](logs/checkpoint-integrity.log) — Archive verification, manifest and corrected documents. First parser attempt treated the size column as path, then corrected and verified all 289 entries and sizes.
- [archive-integrity.log](logs/archive-integrity.log) — Room, Arcade, Goose and Brifern outer hashes and safe extraction.
- [room-combat-internal-manifest.log](logs/room-combat-internal-manifest.log) — Independent checksum verification of the 950 ROOM payload members.
- [room-overlay-diff.json](logs/room-overlay-diff.json) — 44 overlay paths with original and candidate hashes.
- [room-node-summary.json](logs/room-node-summary.json) — Each suite, exact command, exit/timeout, duration and corresponding output.
- [room-checks.log](logs/room-checks.log) — Scratch assembly, source-image equivalence and rebuild results.
- [physical-asset-audit.log](logs/physical-asset-audit.log) — Independent authored-frame and decoded portrait RGBA checks.
- [physical-geometry.log](logs/physical-geometry.log) — Counter crossing/cross-story geometry probe on ROOM core.
- [encounter-access.log](logs/encounter-access.log) — Remote DNS limitation and alternate local commit archive.
- [encounter-pinned.log](logs/encounter-pinned.log) — Historical branch object IDs and bounded M3 scratch export.
- [design-source-audit.log](logs/design-source-audit.log) — A2/A3 exact source comparisons and worked totals.
- [a7-independent-review.md](logs/a7-independent-review.md) — A7 authority, suite interpretation and scene/HTML comparisons.
- [owner-preservation.log](logs/owner-preservation.log) — Current workspace unchanged outside report directory, selected source hashes and external refs.
- [m3.test.log](logs/m3.test.log) — Fresh one-command M3 TAP and exit. Retain the documented IR3-25 qualification.
- [run-independent-m3-r3.log](logs/run-independent-m3-r3.log) — Fresh one-command M3 TAP and exit. Retain the documented IR3-25 qualification.

## Limitations

No new Windows browser screenshots. Historical stills are in checkpoint member `1_room_creator_changes/verification/lab_v01/screens/`. Supplied stills show editor chrome and staged gestures only. Native Windows launch, exact room smoke harness coverage, controls parity and final package remain unverified. No production code was written.
