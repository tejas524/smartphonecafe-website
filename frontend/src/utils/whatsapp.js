import { business } from "../data/site.js";

/**
 * Build a wa.me deep link with a pre-filled, context-aware message.
 * The message is always URL-encoded so punctuation in a customer's own
 * problem description can never break the link.
 */
export function waLink(message) {
  const base = `https://wa.me/${business.whatsappNumber}`;
  const text = (message || "").trim();
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

const OPENER = `Hello ${business.name},`;

/** Message templates — each keeps the enquiry specific so the shop can reply fast. */
export const waMessages = {
  general: () =>
    `${OPENER} I found you online and I would like to know more about your smartphones and repair services.`,

  smartphones: () =>
    `${OPENER} I am looking for a smartphone. Please let me know the available options.`,

  brand: (brand) =>
    `${OPENER} I am looking for a ${brand} smartphone. Could you please share the available options?`,

  budget: (range) =>
    `${OPENER} I am looking for a smartphone in the ${range} range. Could you please share the available options?`,

  availability: (subject) =>
    subject
      ? `${OPENER} Is the ${subject} available at your store? Please let me know.`
      : `${OPENER} I would like to check smartphone availability. Please let me know the options.`,

  accessories: () =>
    `${OPENER} I would like to know about the mobile accessories you have available.`,

  accessoryCategory: (name) =>
    `${OPENER} I would like to know about ${String(name || "accessories").toLowerCase()} you have available.`,

  repairs: () =>
    `${OPENER} I need to repair my phone. I would like to know the repair options.`,

  repairDetail: ({ brand, model, problem }) => {
    const device = [brand, model].filter(Boolean).join(" ").trim();
    const parts = [];
    if (device) parts.push(device);
    if (problem) parts.push(`with a ${problem.toLowerCase()}`);
    const subject = parts.length
      ? `I have a ${parts.join(" ")}`
      : "I have a phone that needs repair";
    return `${OPENER} ${subject}. I would like to know the repair options.`;
  },

  directions: () =>
    `${OPENER} Could you please share your exact location so I can visit the store?`,

  offers: () =>
    `${OPENER} Could you please share your current smartphone offers and deals?`,
};

/** Compose a structured repair enquiry into a single readable WhatsApp message. */
export function repairEnquiryMessage({
  name,
  phone,
  brand,
  model,
  problem,
  message,
}) {
  const device = [brand, model].filter(Boolean).join(" ").trim();
  const lines = [
    `${OPENER} I would like to enquire about a phone repair.`,
    "",
    `Name: ${name || "—"}`,
    `Contact: ${phone || "—"}`,
    `Device: ${device || "—"}`,
    `Issue: ${problem || "—"}`,
  ];
  if (message && message.trim()) {
    lines.push("", `Details: ${message.trim()}`);
  }
  return lines.join("\n");
}