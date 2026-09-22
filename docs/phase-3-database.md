# Phase 3 — MySQL database layer

**Status:** complete. Schema, seed and `.env.example` are in place; the database
exists on the local MySQL 8.0.46 server and the data is verified.

**Scope note:** this phase delivers the database only. No Express API, no
authentication, no admin dashboard and no public redesign were built — those are
Phases 4–8. Nothing here changes the running frontend.

---

## Files added or changed

| File | Change |
|---|---|
| `database/schema.sql` | **New.** Creates `smartphonecafe` and its ten tables. |
| `database/generate-seed.mjs` | **New.** Emits `seed.sql` from `frontend/src/data/*.js`. |
| `database/seed.sql` | **New (generated).** 75 migrated rows. |
| `database/README.md` | Rewritten from the Phase 2 placeholder. |
| `backend/.env.example` | **New.** Placeholders only. |
| `package.json` | Added the `db:seed:generate` script. |

---

## Tables created

Ten tables, all `InnoDB` / `utf8mb4_unicode_ci`, each with `id`, `created_at`
and `updated_at`:

`users`, `offers`, `brands`, `smartphones`, `repair_services`,
`accessory_categories`, `accessories`, `gallery`, `business_info`,
`homepage_content`.

`business_info` is a key/value table (`info_key` / `info_value` with an
`info_group` and a `value_type` discriminator) because the verified facts are
heterogeneous — a phone number, a latitude and a long quoted description.

## Seed / record counts

Read from the live server after applying:

| Table | Rows |
|---|---|
| `business_info` | 30 |
| `brands` | 10 |
| `gallery` | 9 |
| `homepage_content` | 9 |
| `repair_services` | 8 |
| `accessory_categories` | 6 |
| `offers` | 3 |
| `smartphones` | **0 — intentional** |
| `accessories` | **0 — intentional** |
| `users` | **0 — intentional** |
| **Total** | **75** |

### Why three tables are empty

The brief forbids inventing products, prices, stock or offers, and none has been
verified. Rather than seed plausible-looking fake rows, `smartphones` and
`accessories` are created empty; every existing page already routes the customer
to WhatsApp to ask what is genuinely available. No admin user is seeded because
that would place a working credential in the repository — the operator creates
the first account (see `database/README.md`).

## Faithfulness of the migration

Every seeded value comes from `frontend/src/data/*.js` or the verified Google
listing facts. Spot-checked against the source after applying:

| Key | Stored value |
|---|---|
| `business_name` | `SmartphoneCafe` |
| `listing_name` | `Smart Phone Cafe` |
| `phone_display` | `+91 99225 99577` |
| `phone_e164` | `+919922599577` |
| `whatsapp_number` | `919922599577` |
| `email` | `NULL` (the listing publishes none — not fabricated) |
| `hours_label` | `10:00 AM – 9:30 PM` (en-dash preserved) |
| `hours_days` | `Open all 7 days` |
| `google_place_id` | `ChIJ2XFWXZOxwjsRI58KTN0N4JY` |
| `google_plus_code` | `PMMH+86 Talegaon Dabhade R, Maharashtra` |
| `latitude` / `longitude` | `18.7333126` / `73.6780695` |

The listing description is stored verbatim, with its apostrophes correctly
escaped (`you''re`) and the em-dash intact.

## No fabricated commercial data

Every one of these must be `0`, and every one is:

| Check | Result |
|---|---|
| offers with a price | 0 |
| offers with a discount label | 0 |
| offers with start/end dates | 0 |
| repair services with a price | 0 |
| repair services with a warranty note | 0 |
| repair services with a turnaround promise | 0 |
| brands with a logo path | 0 |
| total smartphones | 0 |
| total accessories | 0 |
| admin users | 0 |

`price_amount`, `mrp_amount`, `price_from`, `discount_label`,
`stock_quantity`, `warranty_note` and `turnaround_note` are all nullable and
left NULL. **NULL means "not stated"; a `0` would be a false claim.** Money uses
`DECIMAL(10,2)`, never `FLOAT`.

The Bajaj Finserv easy-EMI and cashback signage is recorded as verified *in-store*
information with `needs_confirmation = 1` and a `source_note`. It is **not**
presented as a running online promotion. No "20% off" or "₹499" style figure was
invented.

## Persistence verification

**What was actually verified:**

1. **Committed data survives a brand-new connection.** A separate `mysql` process
   — not the one that inserted — reads all 10 brand rows. No in-process cache is
   involved.
2. **The data is on disk.** `information_schema.INNODB_TABLESPACES` lists all ten
   tablespaces as real files (`smartphonecafe/*.ibd`, 131–164 KB each), and
   `information_schema.FILES` confirms each `.ibd` with `ENGINE=InnoDB`.
3. **Durability is configured correctly.** `innodb_flush_log_at_trx_commit = 1`
   and `sync_binlog = 1`, meaning InnoDB flushes and fsyncs the redo log on every
   commit, and `innodb_file_per_table = ON`.
4. **Writes persist beyond the writing session.** A sentinel row inserted in one
   invocation was visible to later invocations, and the pipeline is idempotent —
   re-applying `schema.sql` and `seed.sql` produced identical counts and stable
   `CHECKSUM TABLE` fingerprints.

**What could NOT be verified, and why it matters:**

A **true restart-durability test was not completed.** `Restart-Service MySQL80`
failed with *"Cannot open MySQL80 service on computer '.'"* because this session
runs unelevated (`is admin: False`). The sentinel row did survive the failed
restart attempt, but that proves nothing — the original `mysqld` process never
stopped, so the row was still in the same running instance. Item 4 above is
therefore **not** evidence of crash recovery.

To close this gap, run once from an **elevated** shell:

```powershell
Restart-Service MySQL80 -Force
mysql --defaults-extra-file=_tools/.my.cnf -e "SELECT COUNT(*) FROM smartphonecafe.brands;"
# Expect 10
```

Given items 2 and 3 (files on disk plus fully durable commit settings), survival
is expected, but that is an inference from configuration — not a measurement.

---

## Issues encountered

1. **`ERROR 1054: Unknown column 'Service'` on first seed apply.** A genuine bug
   in the generator: the third offer's `badge` value was emitted unquoted
   (`'INR', Service,`). Fixed by wrapping it in `q()`, and `insert()` now
   validates every value as a rendered SQL token (NULL, number, or quoted
   literal), so a bare word can no longer reach the file. This is why the seed
   is applied and checked rather than merely generated.
2. **`.ibd` files are not readable from this session.** `C:\ProgramData\MySQL\...\Data`
   denies access to an unelevated process. Worked around by querying
   `information_schema.INNODB_TABLESPACES` / `FILES`, which MySQL exposes
   without needing filesystem rights. No escalation was attempted.
3. **`mysql -B` escapes backslashes in `@@datadir`.** An initial path read
   returned doubled separators; unescaped before use.
4. **`npm run db:seed:generate` was referenced in the README before it existed.**
   The script was added to the root `package.json`.

## Unverified / carried forward

- Restart durability, as described above.
- **Visual fidelity to the two prototype images remains unverified.** No image
  could be viewed in this project (`read_image` is unavailable and subagents
  reported `CANNOT_VIEW_IMAGES`). Prototype OCR indicated more admin sections
  than the brief permits; the brief's eight-section list governs, and invented
  prototype figures (₹499, "20% Off", "Redmi Note 13") were not copied.
- The brief's ten-brand list is broader than photographic evidence supports.
  No Apple, Motorola, POCO, Redmi/Xiaomi or Lava signage was observed, so brand
  rows carry a `note` and `category` but no availability claim.
