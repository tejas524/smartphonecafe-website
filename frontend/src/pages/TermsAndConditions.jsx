import { Link } from "react-router-dom";
import PageHero from "../components/sections/PageHero.jsx";
import { LegalSection, Placeholder, LegalNotice } from "../components/sections/LegalDoc.jsx";
import { useSiteData } from "../context/SiteData.jsx";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";

/**
 * Terms & Conditions.
 *
 * Grounded in how the site and business actually work today:
 *   - it is an information/catalogue website, NOT an online shop;
 *   - there is no online checkout or payment on the site;
 *   - prices, stock and specifications are confirmed in store or on WhatsApp;
 *   - brand names are used only to describe the kinds of phones customers ask
 *     about (this disclaimer already appears in the site footer).
 *
 * Store-specific commercial terms (returns, repair warranty, deposits) are the
 * owner's real-world policy and are flagged as placeholders for the owner /
 * legal reviewer — none are invented here.
 */

const LAST_UPDATED = "19 October 2026";

export default function TermsAndConditions() {
  const { business } = useSiteData();
  usePageMeta({
    title: "Terms & Conditions",
    description:
      "Terms for using the SmartphoneCafe website. It is an information and catalogue site; there is no online checkout — purchases and repairs happen in store.",
    path: "/terms-and-conditions",
  });

  return (
    <>
      <PageHero
        eyebrow="Terms"
        title="Terms & Conditions"
        lead="These terms cover the use of this website. They are written for a local shop and kept intentionally simple."
      >
        <p className="text-[0.9375rem] text-ink-500">
          Last updated: {LAST_UPDATED}
        </p>
      </PageHero>

      <div className="shell py-12 lg:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          <LegalNotice>
            These terms describe how the website is intended to be used. They are
            not legal advice and are not a guarantee of any particular legal
            outcome. The shop owner should review them — and add real store
            policies where marked — before publishing, with professional advice
            where needed.
          </LegalNotice>

          <LegalSection id="about" heading="About this website">
            <p>
              This website belongs to {business.name}, a mobile phone store and
              repair shop in {business.address.region}. It exists to show the
              kinds of smartphones, accessories and repair services we offer, to
              share our store location and hours, and to let you contact us
              easily.
            </p>
          </LegalSection>

          <LegalSection id="no-online-sales" heading="This is not an online shop">
            <p>
              <strong className="font-semibold text-ink-800">
                There is no online checkout, cart or payment on this website.
              </strong>{" "}
              You cannot buy a product or pay for a repair through the site.
              Everything on the site is for information and enquiry only.
              Purchases and repairs are completed in person at the store (or as
              otherwise arranged with us directly).
            </p>
          </LegalSection>

          <LegalSection id="prices" heading="Prices, stock and product information">
            <p>
              We try to keep the information on this site accurate, but prices,
              availability, colours, specifications and offers can change and may
              not always be up to date online. Nothing on this website is a
              binding offer to sell at a stated price.
            </p>
            <p>
              Please confirm the current price, stock and exact model with us in
              store or on{" "}
              <a
                href={waLink(waMessages.general())}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent-600 hover:text-accent-700"
              >
                WhatsApp
              </a>{" "}
              before making a decision.
            </p>
          </LegalSection>

          <LegalSection id="brands" heading="Brand names and trademarks">
            <p>
              Brand and product names shown on this website belong to their
              respective owners and are used only to indicate the kinds of phones
              and accessories customers commonly ask us about. Their appearance
              here does not state or imply any authorised dealership, partnership
              or endorsement.
            </p>
          </LegalSection>

          <LegalSection id="repairs" heading="Repairs">
            <p>
              Sending a repair enquiry does not confirm a repair, a price or a
              timeline. Any quote or estimate can only be given after we have
              seen the device at the store.
            </p>
            <p>
              Repair warranty, turnaround, data-handling during repair and any
              deposit terms:{" "}
              <Placeholder>owner to state the shop's actual repair terms</Placeholder>
              . These should be reviewed with a professional where relevant.
            </p>
          </LegalSection>

          <LegalSection id="returns" heading="Purchases, returns and cancellations">
            <p>
              Because there is no online sale or payment on this website, there
              is no online order to cancel or return here. Any returns,
              exchanges, cancellations or refunds relate to a purchase made with
              the store directly and follow the store's own policy and your
              rights under applicable law.
            </p>
            <p>
              The store's actual return / exchange / refund / warranty terms:{" "}
              <Placeholder>owner to state the shop's real policy</Placeholder>.
              This section must be reviewed by the owner (and, where needed, a
              legal professional) before launch. Do not treat the wording here as
              a guarantee.
            </p>
          </LegalSection>

          <LegalSection id="external-links" heading="Links and embedded content">
            <p>
              The site links to and embeds a few external services — for example
              WhatsApp and Google Maps. We are not responsible for the content or
              privacy practices of those third-party services. See our{" "}
              <Link
                to="/privacy-policy"
                className="font-medium text-accent-600 hover:text-accent-700"
              >
                Privacy Policy
              </Link>{" "}
              for details on how they are used.
            </p>
          </LegalSection>

          <LegalSection id="acceptable-use" heading="Acceptable use">
            <p>
              Please use this website lawfully and do not attempt to disrupt it,
              access areas you are not authorised to use (such as the admin
              area), or misuse the contact channels for spam or abuse.
            </p>
          </LegalSection>

          <LegalSection id="liability" heading="Limitation of liability">
            <p>
              The website is provided on an "as is" basis for general
              information. To the extent permitted by law, we are not liable for
              decisions made solely on the basis of website information that has
              since changed; always confirm details with us directly.
            </p>
            <p>
              Any additional liability wording specific to your business:{" "}
              <Placeholder>owner / legal to confirm</Placeholder>.
            </p>
          </LegalSection>

          <LegalSection id="governing-law" heading="Governing law">
            <p>
              These terms are intended to be governed by the laws of India, with
              jurisdiction at <Placeholder>owner to confirm city/court</Placeholder>
              .
            </p>
          </LegalSection>

          <LegalSection id="contact" heading="Contact">
            <p>
              Questions about these terms? Message us on{" "}
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
              , or visit the store.
            </p>
          </LegalSection>
        </div>
      </div>
    </>
  );
}
