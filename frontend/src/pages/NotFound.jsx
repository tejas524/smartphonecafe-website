import Button from "../components/ui/Button.jsx";
import { business, nav } from "../data/site.js";
import usePageMeta from "../utils/usePageMeta.js";

export default function NotFound() {
  usePageMeta({
    title: "Page not found",
    description:
      "The page you were looking for could not be found. Browse smartphones, repairs, the gallery or contact SmartphoneCafe in Talegaon Dabhade.",
    path: "/404",
    noIndex: true,
  });

  return (
    <section className="shell flex min-h-[62vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow text-accent-600">Error 404</p>
      <h1 className="mt-4 text-[2rem] sm:text-[2.75rem]">This page has moved on.</h1>
      <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-ink-600">
        The page you were looking for is not here. Try one of these instead.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        {nav.map((item) => (
          <Button key={item.to} to={item.to} variant="outline" size="md">
            {item.label}
          </Button>
        ))}
      </div>

      <div className="mt-8">
        <Button href={business.phoneTel} variant="primary" size="lg" icon="phone">
          Call {business.phoneDisplay}
        </Button>
      </div>
    </section>
  );
}
