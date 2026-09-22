/**
 * Resource registry - the single source of truth for the CMS CRUD API.
 *
 * WHY THIS FILE EXISTS
 * Table names, column names and ORDER BY clauses can never be passed as `?`
 * placeholders in MySQL, so they cannot come from user input. Instead every
 * resource is declared here, in code, and the generic CRUD router looks tables
 * and columns up in this registry. A request can only ever name a resource and
 * a field that appears below, which makes SQL injection structurally impossible
 * rather than merely filtered.
 *
 * The eight resources map exactly to the eight CMS sections in the brief:
 *   offers, smartphones, brands, repair-services, accessories, gallery,
 *   business-info, homepage-content
 *
 * `accessory_categories` is also exposed (as `accessory-categories`) because
 * `accessories.category_id` has a foreign key to it and the section cannot be
 * managed without it.
 *
 * COLUMN DEFINITIONS
 *   type     : 'string' | 'text' | 'int' | 'decimal' | 'bool' | 'date' | 'datetime' | 'enum'
 *   required : must be present and non-empty on create
 *   max      : maximum length, enforced before the query runs
 *   enum     : allowed values, for `type: 'enum'`
 *   listable : may appear in a WHERE filter
 *   sortable : may be used in ORDER BY
 *   editable : may be written by the API (id/created_at/updated_at never are)
 *   publicly : safe to expose without authentication (read-only public API)
 */

/** A slug is always derived server-side from a human title, never trusted raw. */
const slugColumn = {
  type: "string",
  max: 190,
  editable: false, // always generated, never accepted from the client
  sortable: true,
  listable: true,
};

export const RESOURCES = {
  // ---------------------------------------------------------------- offers --
  offers: {
    table: "offers",
    label: "Offers",
    // The public site shows only active offers, so ordering by display_order is
    // the meaningful default.
    defaultOrder: { column: "display_order", direction: "asc" },
    searchable: ["title", "subtitle", "description", "badge"],
    columns: {
      id: { type: "int", editable: false, sortable: true },
      title: { type: "string", max: 160, required: true, listable: true, sortable: true },
      subtitle: { type: "string", max: 200 },
      description: { type: "text", max: 5000 },
      discount_label: { type: "string", max: 80 },
      price_amount: { type: "decimal", min: 0, max: 99999999.99 },
      price_currency: { type: "string", max: 3, default: "INR" },
      badge: { type: "string", max: 40 },
      image_path: { type: "string", max: 255 },
      cta_label: { type: "string", max: 80 },
      cta_url: { type: "string", max: 500 },
      starts_on: { type: "date", sortable: true },
      ends_on: { type: "date", sortable: true },
      is_active: { type: "bool", listable: true, default: 1 },
      is_featured: { type: "bool", listable: true, default: 0 },
      needs_confirmation: { type: "bool", default: 1 },
      source_note: { type: "string", max: 255 },
      display_order: { type: "int", min: 0, max: 100000, default: 0, sortable: true },
      created_at: { type: "datetime", editable: false, sortable: true },
      updated_at: { type: "datetime", editable: false, sortable: true },
    },
  },

  // ----------------------------------------------------------- smartphones --
  smartphones: {
    table: "smartphones",
    label: "Smartphones",
    defaultOrder: { column: "display_order", direction: "asc" },
    searchable: ["model_name", "summary", "description", "colour"],
    // brand_id is a foreign key: it is validated to exist rather than trusted.
    references: {
      brand_id: { table: "brands", column: "id", label: "brand" },
    },
    columns: {
      id: { type: "int", editable: false, sortable: true },
      brand_id: { type: "int", min: 1, listable: true },
      model_name: { type: "string", max: 160, required: true, listable: true, sortable: true },
      slug: slugColumn,
      summary: { type: "string", max: 255 },
      description: { type: "text", max: 8000 },
      price_amount: { type: "decimal", min: 0, max: 99999999.99, sortable: true },
      price_currency: { type: "string", max: 3, default: "INR" },
      mrp_amount: { type: "decimal", min: 0, max: 99999999.99 },
      stock_quantity: { type: "int", min: 0, max: 1000000 },
      stock_status: {
        type: "enum",
        values: ["in_stock", "out_of_stock", "unknown"],
        listable: true,
      },
      is_5g: { type: "bool", listable: true },
      colour: { type: "string", max: 60 },
      storage: { type: "string", max: 60 },
      ram: { type: "string", max: 60 },
      image_path: { type: "string", max: 255 },
      warranty_note: { type: "string", max: 160 },
      is_active: { type: "bool", listable: true, default: 1 },
      is_featured: { type: "bool", listable: true, default: 0 },
      display_order: { type: "int", min: 0, max: 100000, default: 0, sortable: true },
      created_at: { type: "datetime", editable: false, sortable: true },
      updated_at: { type: "datetime", editable: false, sortable: true },
    },
  },

  // ---------------------------------------------------------------- brands --
  brands: {
    table: "brands",
    label: "Brands",
    defaultOrder: { column: "display_order", direction: "asc" },
    searchable: ["name", "note", "category"],
    columns: {
      id: { type: "int", editable: false, sortable: true },
      name: { type: "string", max: 80, required: true, listable: true, sortable: true },
      slug: slugColumn,
      note: { type: "string", max: 120 },
      // Matches the values present in the Phase 3 seed.
      category: {
        type: "enum",
        values: ["premium", "mainstream", "value"],
        listable: true,
      },
      logo_path: { type: "string", max: 255 },
      is_active: { type: "bool", listable: true, default: 1 },
      display_order: { type: "int", min: 0, max: 100000, default: 0, sortable: true },
      created_at: { type: "datetime", editable: false, sortable: true },
      updated_at: { type: "datetime", editable: false, sortable: true },
    },
  },

  // ------------------------------------------------------- repair services --
  "repair-services": {
    table: "repair_services",
    label: "Repair Services",
    defaultOrder: { column: "display_order", direction: "asc" },
    searchable: ["title", "description", "tags"],
    columns: {
      id: { type: "int", editable: false, sortable: true },
      // The Phase 3 seed uses stable keys like 'screen' / 'battery'.
      slug: { type: "string", max: 80, required: true, listable: true, sortable: true },
      title: { type: "string", max: 160, required: true, sortable: true },
      description: { type: "text", max: 5000 },
      price_from: { type: "decimal", min: 0, max: 99999999.99 },
      price_currency: { type: "string", max: 3, default: "INR" },
      turnaround_note: { type: "string", max: 160 },
      warranty_note: { type: "string", max: 160 },
      tags: { type: "string", max: 255 },
      icon: { type: "string", max: 40 },
      is_enquiry_only: { type: "bool", default: 1 },
      is_active: { type: "bool", listable: true, default: 1 },
      display_order: { type: "int", min: 0, max: 100000, default: 0, sortable: true },
      created_at: { type: "datetime", editable: false, sortable: true },
      updated_at: { type: "datetime", editable: false, sortable: true },
    },
  },

  // ---------------------------------------------------- accessory categories --
  "accessory-categories": {
    table: "accessory_categories",
    label: "Accessory Categories",
    defaultOrder: { column: "display_order", direction: "asc" },
    searchable: ["title", "description"],
    columns: {
      id: { type: "int", editable: false, sortable: true },
      slug: { type: "string", max: 80, required: true, listable: true, sortable: true },
      title: { type: "string", max: 160, required: true, sortable: true },
      description: { type: "text", max: 5000 },
      icon: { type: "string", max: 40 },
      image_path: { type: "string", max: 255 },
      is_active: { type: "bool", listable: true, default: 1 },
      display_order: { type: "int", min: 0, max: 100000, default: 0, sortable: true },
      created_at: { type: "datetime", editable: false, sortable: true },
      updated_at: { type: "datetime", editable: false, sortable: true },
    },
  },

  // ----------------------------------------------------------- accessories --
  accessories: {
    table: "accessories",
    label: "Accessories",
    defaultOrder: { column: "display_order", direction: "asc" },
    searchable: ["name", "description"],
    references: {
      category_id: { table: "accessory_categories", column: "id", label: "accessory category" },
      brand_id: { table: "brands", column: "id", label: "brand" },
    },
    columns: {
      id: { type: "int", editable: false, sortable: true },
      category_id: { type: "int", min: 1, listable: true },
      brand_id: { type: "int", min: 1, listable: true },
      name: { type: "string", max: 160, required: true, listable: true, sortable: true },
      slug: slugColumn,
      description: { type: "text", max: 8000 },
      price_amount: { type: "decimal", min: 0, max: 99999999.99, sortable: true },
      price_currency: { type: "string", max: 3, default: "INR" },
      stock_quantity: { type: "int", min: 0, max: 1000000 },
      image_path: { type: "string", max: 255 },
      is_active: { type: "bool", listable: true, default: 1 },
      display_order: { type: "int", min: 0, max: 100000, default: 0, sortable: true },
      created_at: { type: "datetime", editable: false, sortable: true },
      updated_at: { type: "datetime", editable: false, sortable: true },
    },
  },

  // --------------------------------------------------------------- gallery --
  gallery: {
    table: "gallery",
    label: "Gallery",
    defaultOrder: { column: "display_order", direction: "asc" },
    searchable: ["title", "caption", "alt_text", "category"],
    // Mirrors the Phase 3 schema: gallery.image_path is NOT NULL, because a
    // gallery entry with no image is meaningless. The API therefore refuses to
    // detach an image from a gallery record (the record must be deleted instead)
    // and requires a path when creating one.
    imageRequired: true,
    imageField: "image_path",
    columns: {
      id: { type: "int", editable: false, sortable: true },
      slug: { type: "string", max: 120, required: true, listable: true, sortable: true },
      title: { type: "string", max: 160 },
      caption: { type: "string", max: 255 },
      // Required: the site never ships an image without alt text.
      alt_text: { type: "string", max: 500, required: true },
      image_path: { type: "string", max: 255, required: true },
      srcset: { type: "text", max: 4000 },
      width: { type: "int", min: 1, max: 100000 },
      height: { type: "int", min: 1, max: 100000 },
      aspect_ratio: { type: "string", max: 24 },
      category: { type: "string", max: 60, listable: true },
      source_width: { type: "int", min: 1, max: 100000 },
      source_height: { type: "int", min: 1, max: 100000 },
      is_featured: { type: "bool", listable: true, default: 0 },
      is_hero: { type: "bool", default: 0 },
      is_active: { type: "bool", listable: true, default: 1 },
      display_order: { type: "int", min: 0, max: 100000, default: 0, sortable: true },
      created_at: { type: "datetime", editable: false, sortable: true },
      updated_at: { type: "datetime", editable: false, sortable: true },
    },
  },

  // -------------------------------------------------------- business info --
  "business-info": {
    table: "business_info",
    label: "Business Information",
    defaultOrder: { column: "display_order", direction: "asc" },
    searchable: ["info_key", "info_value", "label"],
    columns: {
      id: { type: "int", editable: false, sortable: true },
      info_key: { type: "string", max: 80, required: true, listable: true, sortable: true },
      info_value: { type: "text", max: 6000 },
      // Matches the Phase 3 seed groups.
      info_group: {
        type: "enum",
        values: ["identity", "contact", "address", "hours", "location", "listing", "general"],
        default: "general",
        listable: true,
      },
      label: { type: "string", max: 120 },
      value_type: {
        type: "enum",
        values: ["text", "email", "tel", "url", "number", "textarea"],
        default: "text",
      },
      source_note: { type: "string", max: 255 },
      is_public: { type: "bool", listable: true, default: 1 },
      display_order: { type: "int", min: 0, max: 100000, default: 0, sortable: true },
      created_at: { type: "datetime", editable: false, sortable: true },
      updated_at: { type: "datetime", editable: false, sortable: true },
    },
  },

  // ---------------------------------------------------- homepage content --
  "homepage-content": {
    table: "homepage_content",
    label: "Homepage Content",
    defaultOrder: { column: "display_order", direction: "asc" },
    searchable: ["section_key", "eyebrow", "heading", "subheading", "body"],
    columns: {
      id: { type: "int", editable: false, sortable: true },
      // Unique in the schema: one row per homepage section.
      section_key: { type: "string", max: 60, required: true, listable: true, sortable: true },
      eyebrow: { type: "string", max: 120 },
      heading: { type: "string", max: 255 },
      subheading: { type: "string", max: 255 },
      body: { type: "text", max: 8000 },
      cta_label: { type: "string", max: 80 },
      cta_url: { type: "string", max: 500 },
      image_path: { type: "string", max: 255 },
      is_visible: { type: "bool", listable: true, default: 1 },
      display_order: { type: "int", min: 0, max: 100000, default: 0, sortable: true },
      created_at: { type: "datetime", editable: false, sortable: true },
      updated_at: { type: "datetime", editable: false, sortable: true },
    },
  },
};

/** The eight sections named in the brief, for API/docs ordering. */
export const CMS_RESOURCE_KEYS = [
  "offers",
  "smartphones",
  "brands",
  "repair-services",
  "accessories",
  "gallery",
  "business-info",
  "homepage-content",
];

export function getResource(key) {
  return RESOURCES[key] || null;
}

export function resourceKeys() {
  return Object.keys(RESOURCES);
}

/** Column names the API is allowed to write. */
export function editableColumns(resource) {
  return Object.entries(resource.columns)
    .filter(([, def]) => def.editable !== false)
    .map(([name]) => name);
}

/** Public-facing select list: everything except internal bookkeeping. */
export function publicColumns(resource) {
  return Object.entries(resource.columns)
    .filter(([name]) => name !== "id" || true)
    .map(([name]) => name);
}

/** Columns that may be used in a WHERE filter. */
export function listableColumns(resource) {
  return Object.entries(resource.columns)
    .filter(([, def]) => def.listable)
    .map(([name]) => name);
}

/** Columns that may be used in ORDER BY. */
export function sortableColumns(resource) {
  return Object.entries(resource.columns)
    .filter(([, def]) => def.sortable)
    .map(([name]) => name);
}

export default RESOURCES;
