import { defineConfig } from 'vitepress';
import typedocSidebar from '../api/typedoc-sidebar.json';

export default defineConfig({
  title: 'Truenums',
  description: 'Type-safe, zero-cost TypeScript enums with runtime validation',

  base: '/', // Set this to your repo name if deploying to GitHub Pages

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/ethan-wickstrom/truenums' },
    ],

    sidebar: {
      '/api/': [
        {
          text: 'API Reference',
          items: typedocSidebar,
        },
      ],
      '/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/' },
            { text: 'Basic Usage', link: '/guide/basic-usage' },
            { text: 'Advanced Features', link: '/guide/advanced-features' },
          ],
        },
        {
          text: 'Examples',
          items: [
            { text: 'Basic Examples', link: '/examples/' },
            { text: 'I18n Support', link: '/examples/i18n' },
            { text: 'Pattern Matching', link: '/examples/pattern-matching' },
          ],
        },
      ],
    },

    search: {
      provider: 'local',
    },

    // Ensure proper rewrites for TypeDoc generated paths
    rewrites: {
      'api/:page*': 'api/:page*',
    },
  },

  // Required for proper path resolution
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/api\//,
          replacement: '/api/',
        },
      ],
    },
  },
});
