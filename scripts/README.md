# Project Scripts & Tooling

This directory contains standalone utility scripts, data maintenance scripts, and image processing tools.

## Directory Structure

### `maintenance/`
Database and data catalog fix/patch scripts:
- `fix_products.cjs`: Fixes product pricing, metadata, and category mappings.
- `fix_fish.cjs`: Patches aquarium and ornamental fish catalog records.
- `fix_reptiles.cjs`: Normalizes exotic reptile listings and care specs.
- `fix_final_birds.cjs`: Updates avian species classification and mock inventory.
- `fix_pharmacy.cjs`: Sanitizes prescription pet medication data.
- `fix_pharmacy_custom.cjs`: Custom overrides for pharmacy SKU inventory.
- `fix_dashboards.cjs` & `fix_dashboards_2.cjs`: Patches mock analytics/dashboard data sets.

### `media/`
Image processing, background removal, and asset auditing tools:
- `audit-images.cjs`: Checks for broken/missing product image URLs and formats.
- `update_all_images.cjs`: Batch updates image CDN URLs across data files.
- `update_birds.cjs`: Specific asset link auditor for bird photography.
- `patch_pharmacy_images.cjs`: Associates clean product packaging imagery with pharmacy SKUs.
- `remove_bg.py`: Python script utilizing `rembg` for local AI background removal.
- `remove_bg.ps1` & `remove_bg_advanced.ps1`: PowerShell automation wrappers for image batch background removal.
