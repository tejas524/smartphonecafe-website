import { Link } from "react-router-dom";
import PageHero from "../components/sections/PageHero.jsx";
import { LegalSection, Placeholder, LegalNotice } from "../components/sections/LegalDoc.jsx";
import Icon from "../components/Icon.jsx";
import { useSiteData } from "../context/SiteData.jsx";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";
import { analyticsConfigured } from "../context/Privacy.jsx";

/**
 * Privacy Policy.
 *
 * Every statement here describes the website's ACTUAL, verified behaviour:
 *   - optional maps and configured analytics require a visitor choice;
 *   - enquiry forms submit nothing to a server — they open WhatsApp;
 *   - no customer personal data is stored on this website's server;
 *   - fonts are self-hosted (no Google Fonts CDN request);
 *   - the only embedded third party is the Google Maps location map.
 *
 * Anything that cannot be verified from the code (legal entity, grievance
 * contact, retention periods) is shown as an explicit, owner-editable
 * placeholder rather than invented. This page is transparency information, not
 * legal advice.
 */

// Owner-editable: set to the date this policy was last reviewed/published.
const LAST_UPDATED = "19 October 2026";

export default function PrivacyPolicy() {
  const { business } = useSiteData();
  usePageMeta({
    title: "Privacy Policy",
    description:
      "How SmartphoneCafe handles enquiries, privacy choices, optional maps and visitor analytics.",
    path: "/privacy-policy",
  });

  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Privacy Policy"
        lead="This page explains, in plain terms, what our website does and does not do with your information."
      >
        <p className="text-[0.9375rem] text-ink-500">
          Last updated: {LAST_UPDATED}
        </p>
      </PageHero>

      <div className="shell py-12 lg:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          <LegalNotice>
            This policy describes how the website works and is provided for
            transparency. It is not legal advice and is not a claim of
            compliance with any specific law. It should be reviewed by the shop
            owner and, where needed, a qualified professional before launch —
            particularly as India's Digital Personal Data Protection Act, 2023
            and its rules come into force.
          </LegalNotice>

          <LegalSection id="who-we-are" heading="Who we are">
            <p>
              This website is operated by {business.name}, a mobile phone store
              and repair shop located at {business.address.line1},{" "}
              {business.address.line2}, {business.address.region}{" "}
              {business.address.postalCode}. You can reach us by phone or
              WhatsApp on{" "}
              <a
                href={business.phoneTel}
                className="font-medium text-accent-600 hover:text-accent-700"
              >
                {business.phoneDisplay}
              </a>
              .
            </p>
            <p>
              Registered business name and GST details (if applicable):{" "}
              <Placeholder>owner to confirm</Placeholder>.
            </p>
          </LegalSection>

          <LegalSection id="what-we-collect" heading="Information this website collects">
            <p>
              <strong className="font-semibold text-ink-800">
                Public visitors do not need an account. Enquiry details are not
                submitted to a website database; the private admin area is for store staff.
              </strong>{" "}
              We have verified the following about how the site behaves:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                It does <strong>not</strong> set any cookies of its own.
              </li>
              <li>
                {analyticsConfigured ? "Optional Vercel Web Analytics records public page visits only after you allow analytics. It does not use tracking cookies. We exclude admin pages and remove URL query strings and fragments before sending page URLs. We do not send form values or custom events." : "Visitor analytics is currently disabled. No advertising pixels or marketing trackers are installed."}
              </li>
              <li>
                It saves your privacy preferences on this device using local storage.
                These preferences contain only your choices, not your enquiry details.
                You can change them using Privacy settings in the footer.
              </li>
              <li>
                Our enquiry forms do <strong>not</strong> send your details to a
                database. When you fill one in and choose to send, your device
                opens WhatsApp with a ready-made message that you send to us
                directly — so your information goes to us through WhatsApp, not
                through a form on this site.
              </li>
            </ul>
          </LegalSection>

          <LegalSection id="how-we-use" heading="How we use the information you send us">
            <p>
              If you contact us on WhatsApp or by phone, we use your phone number
              and the details you share only to reply to your enquiry — for
              example to answer a question about a phone, an accessory or a
              repair. We do not use it for marketing unless you separately ask us
              to.
            </p>
            <p>
              Because these conversations happen on WhatsApp and by phone, the
              messages are also handled by those services and stored on your
              device and ours. How long we keep enquiry messages:{" "}
              <Placeholder>owner to decide and state a period</Placeholder>.
            </p>
          </LegalSection>

          <LegalSection id="third-parties" heading="Third-party services on this site">
            <p>The website relies on a small number of outside services:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>WhatsApp (Meta):</strong> our contact buttons and enquiry
                forms open WhatsApp so you can message us. WhatsApp's own privacy
                terms apply to those messages.
              </li>
              <li>
                <strong>Google Maps:</strong> our Contact/Location section can
                show an embedded Google map. To respect your privacy, the map is
                <strong> not loaded until you allow maps in your privacy choices or click Load Google Map</strong>. Once you
                load it, Google may receive your IP address and may set its own
                cookies, under Google's privacy terms. You can always use the
                "Get directions" link instead, which opens Google Maps in a new
                tab only when you choose to.
              </li>
              <li>
                <strong>Hosting:</strong> our hosting provider processes network requests and may keep operational/security logs, including IP addresses and request details. Those logs are separate from optional visitor analytics.
              </li>
              <li>
                <strong>Fonts:</strong> the site's fonts are served from our own
                website, so loading a page does not send a request to Google's
                font servers.
              </li>
            </ul>
          </LegalSection>

          <LegalSection id="cookies" heading="Cookies">
            <p>
              This website does not set any cookies for visitors browsing the
              public pages. The only cookie the system uses is a secure,
              sign-in-only cookie for the shop owner's private admin area — it is
              never set for ordinary visitors.
            </p>
            <p>
              The embedded Google Map, if you choose to load it, may set
              third-party cookies controlled by Google. That is why we keep it
              off until you allow it. Privacy settings lets you turn off maps and optional analytics again. Turning off maps removes the embedded map; it does not clear cookies Google may already have set. Your browser's cookie controls can remove those.
            </p>
          </LegalSection>

          <LegalSection id="your-choices" heading="Your choices and requests">
            <p>
              Since we do not store your personal information on this website,
              there is usually nothing held here to change or delete. For
              anything you have shared with us over WhatsApp or by phone, you can
              ask us to delete those messages from our device by contacting us
              on{" "}
              <a
                href={waLink(waMessages.general())}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent-600 hover:text-accent-700"
              >
                WhatsApp
              </a>{" "}
              or by phone.
            </p>
            <p>
              Grievance / contact person for privacy questions:{" "}
              <Placeholder>owner to name a contact and email</Placeholder>.
            </p>
          </LegalSection>

          <LegalSection id="children" heading="Children">
            <p>
              This is an ordinary local shop website. It is not directed at
              children and does not knowingly collect information from them.
            </p>
          </LegalSection>

          <LegalSection id="changes" heading="Changes to this policy">
            <p>
              We may update this page if the way the website works changes. The
              "last updated" date at the top shows when it was last reviewed.
            </p>
          </LegalSection>

          <LegalSection id="contact" heading="Contact us">
            <p>
              For any question about this policy or your enquiry, message us on{" "}
              <a
                href={waLink(waMessages.general())}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent-600 hover:text-accent-700"
              >
                WhatsApp
              </a>
              , call{" "}
              <a
                href={business.phoneTel}
                className="font-medium text-accent-600 hover:text-accent-700"
              >
                {business.phoneDisplay}
              </a>
              , or visit the store. See also our{" "}
              <Link
                to="/terms-and-conditions"
                className="font-medium text-accent-600 hover:text-accent-700"
              >
                Terms &amp; Conditions
              </Link>
              .
            </p>
          </LegalSection>
        </div>
      </div>
    </>
  );
}
