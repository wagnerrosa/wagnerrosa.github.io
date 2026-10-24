import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';

// Static output only. `build.format: 'preserve'` keeps the URLs of the legacy site:
// about.astro → /about.html, case-studies/index.astro → /case-studies/index.html.

// External links in articles open in a new tab and carry the same analytics attributes the hand-written links had.
function rehypeExternalLinks() {
  const walk = node => {
    if (node.type === 'element' && node.tagName === 'a' && /^https?:\/\//.test(String(node.properties?.href ?? ''))) {
      const host = new URL(node.properties.href).hostname.replace(/^www\./, '').replace(/\W+/g, '_');
      Object.assign(node.properties, {
        target: '_blank',
        rel: 'noopener noreferrer',
        'data-track': `outbound_${host}`,
        'data-category': 'outbound',
        'data-location': 'article',
      });
    }
    node.children?.forEach(walk);
  };
  return tree => walk(tree);
}

export default defineConfig({
  site: 'https://wagnerrosa.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'preserve', inlineStylesheets: 'auto' },
  // smartypants off: the text keeps its straight quotes and hyphens exactly as written
  markdown: { processor: unified({ smartypants: false, rehypePlugins: [rehypeExternalLinks] }) },
  integrations: [mdx()],
  devToolbar: { enabled: false },
});
