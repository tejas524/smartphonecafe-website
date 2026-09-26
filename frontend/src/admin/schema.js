/**
 * Admin CMS schema — a curated, UI-facing mirror of the backend resource
 * registry (backend/src/db/resources.js). The backend remains the source of
 * truth and the final validator; this file only decides how each section is
 * presented and edited in the dashboard.
 *
 * Field types: text | textarea | number | decimal | bool | select | date |
 *              ref | image
 *   - select carries `options: [{value,label}]`
 *   - ref carries `{ resource, labelKey }` and is rendered as a dropdown loaded
 *     from that resource
 *   - image edits the resource's single image column (image_path or logo_path)
 */

export const STOCK_STATUS = [
  { value: "in_stock", label: "In stock" },
  { value: "out_of_stock", label: "Out of stock" },
  { value: "unknown", label: "Unknown" },
];

const BRAND_CATEGORY = [
  { value: "premium", label: "Premium" },
  { value: "mainstream", label: "Mainstream" },
  { value: "value", label: "Value" },
];

const INFO_GROUP = [
  { value: "identity", label: "Identity" },
  { value: "contact", label: "Contact" },
  { value: "address", label: "Address" },
  { value: "hours", label: "Hours" },
  { value: "location", label: "Location" },
  { value: "listing", label: "Listing" },
  { value: "general", label: "General" },
];

const VALUE_TYPE = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "url", label: "URL" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Long text" },
];

/**
 * Sidebar order = the eight CMS sections from the brief, then the accessory
 * categories helper that the accessories section depends on.
 */
export const SECTIONS = [
  {
    resource: "homepage-content",
    label: "Homepage",
    icon: "store",
    blurb: "Section headings and copy on the home page.",
  },
  {
    resource: "offers",
    label: "Offers",
    icon: "tag",
    blurb: "Promotional artwork and deals.",
  },
  {
    resource: "smartphones",
    label: "Smartphones",
    icon: "smartphone",
    blurb: "Phone catalogue (empty by design until stocked).",
  },
  {
    resource: "brands",
    label: "Brands",
    icon: "sparkle",
    blurb: "Brand logos shown on the site.",
  },
  {
    resource: "repair-services",
    label: "Repairs",
    icon: "wrench",
    blurb: "Repair service types.",
  },
  {
    resource: "accessories",
    label: "Accessories",
    icon: "headphones",
    blurb: "Individual accessory products.",
  },
  {
    resource: "accessory-categories",
    label: "Accessory categories",
    icon: "chip",
    blurb: "The category tiles on the accessories page.",
  },
  {
    resource: "gallery",
    label: "Gallery",
    icon: "image",
    blurb: "Store photographs.",
  },
  {
    resource: "business-info",
    label: "Business info",
    icon: "mapPin",
    blurb: "Name, address, hours, phone and listing details.",
  },
];

export const RESOURCE_SCHEMA = {
  "homepage-content": {
    label: "Homepage content",
    titleKey: "section_key",
    image: "image_path",
    toggle: "is_visible",
    reorderable: true,
    list: [
      { key: "section_key", label: "Section" },
      { key: "heading", label: "Heading" },
    ],
    fields: [
      { key: "section_key", label: "Section key", type: "text", required: true, help: "Stable id, e.g. hero, about, repairs." },
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "text", full: true },
      { key: "body", label: "Body", type: "textarea", full: true },
      { key: "cta_label", label: "Button label", type: "text" },
      { key: "cta_url", label: "Button link", type: "text" },
      { key: "image_path", label: "Image", type: "image" },
      { key: "is_visible", label: "Visible on site", type: "bool" },
      { key: "display_order", label: "Order", type: "number" },
    ],
  },

  offers: {
    label: "Offers",
    titleKey: "title",
    image: "image_path",
    toggle: "is_active",
    reorderable: true,
    list: [
      { key: "title", label: "Title" },
      { key: "is_featured", label: "Featured", type: "bool" },
    ],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "subtitle", label: "Subtitle", type: "text", full: true },
      { key: "description", label: "Description", type: "textarea", full: true },
      { key: "badge", label: "Badge", type: "text" },
      { key: "discount_label", label: "Discount label", type: "text" },
      { key: "image_path", label: "Artwork", type: "image" },
      { key: "cta_label", label: "Button label", type: "text" },
      { key: "cta_url", label: "Button link (WhatsApp / URL)", type: "text", full: true },
      { key: "starts_on", label: "Starts on", type: "date" },
      { key: "ends_on", label: "Ends on", type: "date" },
      { key: "is_active", label: "Active", type: "bool" },
      { key: "is_featured", label: "Featured", type: "bool" },
      { key: "needs_confirmation", label: "Needs confirmation", type: "bool" },
      { key: "display_order", label: "Order", type: "number" },
    ],
  },

  smartphones: {
    label: "Smartphones",
    titleKey: "model_name",
    image: "image_path",
    toggle: "is_active",
    reorderable: true,
    list: [
      { key: "model_name", label: "Model" },
      { key: "brand_id", label: "Brand", type: "ref", resource: "brands", labelKey: "name" },
      { key: "stock_status", label: "Stock", type: "select", options: STOCK_STATUS },
    ],
    fields: [
      { key: "model_name", label: "Model name", type: "text", required: true },
      { key: "brand_id", label: "Brand", type: "ref", resource: "brands", labelKey: "name" },
      { key: "summary", label: "Summary", type: "text", full: true },
      { key: "description", label: "Description", type: "textarea", full: true },
      { key: "price_amount", label: "Price", type: "decimal" },
      { key: "mrp_amount", label: "MRP", type: "decimal" },
      { key: "stock_status", label: "Stock status", type: "select", options: STOCK_STATUS },
      { key: "stock_quantity", label: "Stock qty", type: "number" },
      { key: "colour", label: "Colour", type: "text" },
      { key: "storage", label: "Storage", type: "text" },
      { key: "ram", label: "RAM", type: "text" },
      { key: "is_5g", label: "5G", type: "bool" },
      { key: "image_path", label: "Photo", type: "image" },
      { key: "warranty_note", label: "Warranty note", type: "text", full: true },
      { key: "is_active", label: "Active", type: "bool" },
      { key: "is_featured", label: "Featured", type: "bool" },
      { key: "display_order", label: "Order", type: "number" },
    ],
  },

  brands: {
    label: "Brands",
    titleKey: "name",
    image: "logo_path",
    toggle: "is_active",
    reorderable: true,
    list: [
      { key: "name", label: "Name" },
      { key: "category", label: "Tier", type: "select", options: BRAND_CATEGORY },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "note", label: "Note", type: "text", full: true },
      { key: "category", label: "Tier", type: "select", options: BRAND_CATEGORY },
      { key: "logo_path", label: "Logo", type: "image" },
      { key: "is_active", label: "Active", type: "bool" },
      { key: "display_order", label: "Order", type: "number" },
    ],
  },

  "repair-services": {
    label: "Repair services",
    titleKey: "title",
    image: "image_path",
    toggle: "is_active",
    reorderable: true,
    list: [
      { key: "title", label: "Service" },
      { key: "slug", label: "Slug" },
    ],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true, help: "Stable key, e.g. screen, battery." },
      { key: "description", label: "Description", type: "textarea", full: true },
      { key: "image_path", label: "Photo", type: "image", help: "Optional. Falls back to the icon when empty." },
      { key: "tags", label: "Tags", type: "text", full: true, help: "Comma separated." },
      { key: "icon", label: "Icon name", type: "text", help: "Fallback when no photo, e.g. screenCrack, battery, charge." },
      { key: "turnaround_note", label: "Turnaround note", type: "text", full: true },
      { key: "warranty_note", label: "Warranty note", type: "text", full: true },
      { key: "price_from", label: "Price from", type: "decimal" },
      { key: "is_enquiry_only", label: "Enquiry only", type: "bool" },
      { key: "is_active", label: "Active", type: "bool" },
      { key: "display_order", label: "Order", type: "number" },
    ],
  },

  accessories: {
    label: "Accessories",
    titleKey: "name",
    image: "image_path",
    toggle: "is_active",
    reorderable: true,
    list: [
      { key: "name", label: "Name" },
      { key: "category_id", label: "Category", type: "ref", resource: "accessory-categories", labelKey: "title" },
      { key: "stock_status", label: "Stock", type: "select", options: STOCK_STATUS },
    ],
    fields: [
      { key: "name", label: "Product name", type: "text", required: true },
      { key: "category_id", label: "Category", type: "ref", resource: "accessory-categories", labelKey: "title", required: true },
      { key: "brand_id", label: "Brand", type: "ref", resource: "brands", labelKey: "name" },
      { key: "summary", label: "Summary", type: "text", full: true, help: "Short one-line description shown on the card." },
      { key: "description", label: "Description", type: "textarea", full: true },
      { key: "price_amount", label: "Price", type: "decimal" },
      { key: "mrp_amount", label: "MRP", type: "decimal" },
      { key: "stock_status", label: "Stock status", type: "select", options: STOCK_STATUS },
      { key: "stock_quantity", label: "Stock qty", type: "number" },
      { key: "colour", label: "Colour / variant", type: "text" },
      { key: "compatibility", label: "Compatibility", type: "text", full: true, help: "e.g. USB-C phones, most popular models." },
      { key: "image_path", label: "Photo", type: "image" },
      { key: "is_active", label: "Active", type: "bool" },
      { key: "is_featured", label: "Featured", type: "bool" },
      { key: "display_order", label: "Order", type: "number" },
    ],
  },

  "accessory-categories": {
    label: "Accessory categories",
    titleKey: "title",
    image: "image_path",
    toggle: "is_active",
    reorderable: true,
    list: [
      { key: "title", label: "Title" },
      { key: "slug", label: "Slug" },
    ],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea", full: true },
      { key: "icon", label: "Icon name", type: "text" },
      { key: "image_path", label: "Image", type: "image" },
      { key: "is_active", label: "Active", type: "bool" },
      { key: "display_order", label: "Order", type: "number" },
    ],
  },

  gallery: {
    label: "Gallery",
    titleKey: "title",
    image: "image_path",
    imageRequired: true,
    toggle: "is_active",
    reorderable: true,
    list: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "is_hero", label: "Hero", type: "bool" },
      { key: "is_featured", label: "Featured", type: "bool" },
    ],
    fields: [
      { key: "image_path", label: "Photograph", type: "image" },
      { key: "alt_text", label: "Alt text", type: "text", required: true, full: true, help: "Describes the photo for screen readers." },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "title", label: "Title", type: "text" },
      { key: "caption", label: "Caption", type: "text", full: true },
      { key: "category", label: "Category", type: "text", help: "e.g. interior, store, smartphones." },
      { key: "is_hero", label: "Hero image", type: "bool" },
      { key: "is_featured", label: "Featured", type: "bool" },
      { key: "is_active", label: "Active", type: "bool" },
      { key: "display_order", label: "Order", type: "number" },
    ],
  },

  "business-info": {
    label: "Business info",
    titleKey: "label",
    image: null,
    toggle: "is_public",
    reorderable: true,
    list: [
      { key: "label", label: "Label" },
      { key: "info_key", label: "Key" },
      { key: "info_group", label: "Group", type: "select", options: INFO_GROUP },
    ],
    fields: [
      { key: "info_key", label: "Key", type: "text", required: true, help: "Stable id, e.g. phone_display." },
      { key: "label", label: "Label", type: "text" },
      { key: "info_value", label: "Value", type: "textarea", full: true },
      { key: "info_group", label: "Group", type: "select", options: INFO_GROUP },
      { key: "value_type", label: "Value type", type: "select", options: VALUE_TYPE },
      { key: "is_public", label: "Public", type: "bool" },
      { key: "display_order", label: "Order", type: "number" },
    ],
  },
};

export function schemaFor(resource) {
  return RESOURCE_SCHEMA[resource] || null;
}

export function sectionFor(resource) {
  return SECTIONS.find((s) => s.resource === resource) || null;
}
