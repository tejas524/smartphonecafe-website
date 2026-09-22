/**
 * Repair content.
 *
 * Grounded strictly in what the Google listing verifies: the place is
 * categorised as a "Mobile phone repair shop" and a "Phone repair service",
 * carries a "Data recovery service" category, and its own description promises
 * "quick repairs".
 *
 * The listing publishes no service menu, price list or warranty terms, so this
 * page never states a price, a turnaround promise, a warranty or a
 * "we fix everything" guarantee. Each item is framed as an issue the shop can
 * assess — an enquiry prompt, not a quoted service.
 */

export const repairIssues = [
  {
    id: "screen",
    icon: "screenCrack",
    title: "Cracked or broken screen",
    blurb:
      "Cracked glass, dead patches, lines across the display or a screen that has stopped responding to touch.",
    tags: ["Display", "Touch", "Glass"],
  },
  {
    id: "battery",
    icon: "battery",
    title: "Battery draining or swelling",
    blurb:
      "A phone that dies quickly, shuts down unexpectedly, heats up while charging or has a swollen back panel.",
    tags: ["Backup", "Heating", "Swelling"],
  },
  {
    id: "charging",
    icon: "charge",
    title: "Not charging properly",
    blurb:
      "Loose or dead charging port, a cable that only works at an angle, or slow and intermittent charging.",
    tags: ["Port", "Cable", "Slow charge"],
  },
  {
    id: "software",
    icon: "chip",
    title: "Software & performance issues",
    blurb:
      "Hanging, restarting on its own, apps crashing, storage full or a phone that will not start up.",
    tags: ["Hanging", "Restarting", "Startup"],
  },
  {
    id: "water",
    icon: "droplet",
    title: "Water or liquid damage",
    blurb:
      "Dropped in water or exposed to rain, with the phone switched off or behaving unpredictably afterwards.",
    tags: ["Liquid", "Corrosion", "Cleaning"],
  },
  {
    id: "camera",
    icon: "camera",
    title: "Camera problems",
    blurb:
      "Blurry photos, a black preview, a cracked lens or a front camera that has stopped working.",
    tags: ["Lens", "Focus", "Front cam"],
  },
  {
    id: "audio",
    icon: "speaker",
    title: "Speaker & microphone faults",
    blurb:
      "No sound on calls, distorted audio, a muffled earpiece or callers who cannot hear you.",
    tags: ["Speaker", "Mic", "Earpiece"],
  },
  {
    id: "data",
    icon: "shieldCheck",
    title: "Data recovery",
    blurb:
      "Photos, contacts or files you need back from a phone that has stopped working properly.",
    tags: ["Photos", "Contacts", "Files"],
  },
];

/** The problem options offered in the enquiry form. */
export const repairProblems = [
  "Screen problem",
  "Battery problem",
  "Charging problem",
  "Software problem",
  "Water / liquid damage",
  "Camera problem",
  "Speaker / microphone problem",
  "Data recovery",
  "Other",
];

/**
 * How a repair enquiry works. This is a factual description of the shop's own
 * process, not a promise of outcome — the final note makes that explicit.
 */
export const repairSteps = [
  {
    n: "01",
    title: "Tell us the device and the problem",
    body: "Send the brand, model and what is going wrong. A WhatsApp message or a call is enough to start.",
  },
  {
    n: "02",
    title: "Bring the phone to the counter",
    body: "The shop is on Talegaon Station Road, open every day from 10:00 am to 9:30 pm.",
  },
  {
    n: "03",
    title: "The fault is checked in front of you",
    body: "The phone is examined and you are told what the issue is and what the options are before anything proceeds.",
  },
  {
    n: "04",
    title: "You decide, then it is repaired",
    body: "Work goes ahead only once you have agreed. Collect in store once it is ready.",
  },
];

/** Stated plainly so no customer expects a guaranteed quote from the form. */
export const repairDisclaimer =
  "Every fault is different. Submitting an enquiry or the form does not create a quote, a booking or a guaranteed repair — the phone needs to be seen at the store before anything can be confirmed.";