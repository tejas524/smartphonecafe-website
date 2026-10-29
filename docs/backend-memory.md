# Backend memory tuning

The default MySQL pool now permits three connections, retains at most one idle
connection, and closes excess idle connections after 60 seconds. Each connection
caches at most 100 prepared statements. Extra queries wait; no API or CMS feature
is removed. Set `DB_POOL_SIZE` (1–20) if measurements justify a different limit.

Image processing runs one image at a time with one libvips worker and its
operation cache disabled. The existing 5 MB upload limit, 40-megapixel decoded
limit, accepted formats, WebP quality, responsive sizes and metadata stripping
are unchanged. Concurrent admin uploads wait and may complete more slowly.
Queued upload buffers, Node.js, MySQL and other native allocations still consume
memory; this is not a hard process-memory cap.

## Local measurement

On October 29, 2026, a fresh Node.js 24.13 process processed four concurrent
5000 × 4000 JPEG uploads. RSS was sampled every 5 ms. Each produced WebP widths
2000, 1200 and 700. A corrupt input was also checked for rejection.

| Upload-only workload | Before | After |
| --- | --- | --- |
| Initial RSS | 53.0 MiB | 53.4 MiB |
| Peak RSS | 327.5 MiB | 88.3 MiB |
| Elapsed time | 0.63 seconds | 1.68 seconds |

This is a synthetic local image test, not a total hosted-server measurement.
It excludes a running MySQL server, HTTP overhead and real traffic. Different
image content, formats, host allocators and concurrent requests can change the
result. Verify actual GoDaddy peak memory under uploads and visitor traffic.
