import Hero from "../components/sections/Hero.jsx";
import StoreHighlights from "../components/sections/StoreHighlights.jsx";
import LazyRoute from "../components/LazyRoute.jsx";
import usePageMeta from "../utils/usePageMeta.js";

const loadContent = () => import("./HomeContent.jsx");

/** Paint the first screen before downloading carousel and lower-page code. */
export default function Home() {
  usePageMeta({
    title: null,
    description: "SmartphoneCafe is a mobile phone store and repair shop on Talegaon Station Road, Talegaon Dabhade. Browse smartphones, pick up accessories and get your phone repaired. Open 10 am – 9:30 pm daily.",
    path: "/",
  });
  return <><Hero /><StoreHighlights /><LazyRoute loader={loadContent} name="home content" /></>;
}
