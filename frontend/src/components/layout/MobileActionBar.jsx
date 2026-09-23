import Icon from "../Icon.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * Persistent mobile action bar.
 *
 * Three thumb-reachable actions that mirror the site's three conversion paths.
 * Sits above the iOS home indicator via env(safe-area-inset-bottom) and is
 * hidden from desktop, where the header already exposes the same actions.
 */
export default function MobileActionBar() {
  const { business } = useSiteData();
  const item =
    "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 font-display text-[0.6875rem] font-semibold tracking-[-0.005em] transition-colors active:bg-white/5";

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        <li className="flex flex-1">
          <a href={business.phoneTel} className={`${item} text-white`}>
            <Icon name="phone" size={19} />
            Call
          </a>
        </li>

        <li className="flex flex-1 border-x border-white/10">
          <a
            href={waLink(waMessages.general())}
            target="_blank"
            rel="noopener noreferrer"
            className={`${item} text-wa-500`}
          >
            <Icon name="whatsapp" size={19} />
            WhatsApp
          </a>
        </li>

        <li className="flex flex-1">
          <a
            href={business.google.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${item} text-white`}
          >
            <Icon name="navigation" size={19} />
            Directions
          </a>
        </li>
      </ul>
    </nav>
  );
}