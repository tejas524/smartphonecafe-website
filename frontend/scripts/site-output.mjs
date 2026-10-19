import fs from "node:fs";
import path from "node:path";

const paths = ["/", "/smartphones", "/accessories", "/gallery", "/about", "/contact", "/privacy-policy", "/terms-and-conditions"];
export function siteOutput({ preview, siteUrl }) {
  const escape = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return {
    name: "site-output",
    transformIndexHtml(html) {
      return html.replaceAll("https://smartphonecafe.in", siteUrl)
        .replace('content="index, follow, max-image-preview:large"', preview ? 'content="noindex, nofollow"' : 'content="index, follow, max-image-preview:large"');
    },
    generateBundle() {
      const urls = [...paths];
      if (preview) {
        const snapshot = JSON.parse(fs.readFileSync(new URL("../public/preview-content.json", import.meta.url), "utf8"));
        for (const phone of snapshot.data.smartphones || []) urls.push(`/smartphones/${encodeURIComponent(phone.slug || phone.id)}`);
      }
      this.emitFile({ type: "asset", fileName: "robots.txt", source: preview
        ? "User-agent: *\nDisallow: /\n"
        : `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${siteUrl}/sitemap.xml\n` });
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(p => `  <url><loc>${escape(siteUrl + p)}</loc></url>`).join("\n")}\n</urlset>\n` });
    },
    writeBundle(options) {
      const directory = options.dir || "dist";
      const html = fs.readFileSync(path.join(directory, "index.html"), "utf8");
      fs.writeFileSync(path.join(directory, "404.html"), html.replace(/<title>.*?<\/title>/, "<title>Page not found | SmartphoneCafe</title>").replace(/<meta name="robots" content="[^"]*"\s*\/?\s*>/, '<meta name="robots" content="noindex, nofollow" />'));
    },
  };
}
