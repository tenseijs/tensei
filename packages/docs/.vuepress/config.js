module.exports = {
  title: "Mingo CMS",
  description: "Headless CMS",
  base: "/",

  serviceWorker: true,

  plugins: [
    '@vuepress/pwa',
    require('./plugins/metaVersion.js')
  ],

  head: [
    [
      "link",
      {
        href:
          "https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,800,800i,900,900i",
        rel: "stylesheet",
        type: "text/css"
      }
    ],
    // Used for PWA
    [
      "link",
      {
        rel: 'manifest',
        href: '/manifest.json'
      }
    ],
    [
      "link",
      {
        rel: 'icon',
        href: '/icon.png'
      }
    ]
  ],

  themeConfig: {
    logo: "/assets/img/logo.svg",
    displayAllHeaders: false,
    activeHeaderLinks: false,
    searchPlaceholder: 'Search...',
    lastUpdated: 'Last Updated', // string | boolean
    sidebarDepth: 0,

    nav: [
      { text: "Home", link: "https://mingocms.com" },
      {
        text: "Version",
        link: "/",
        items: [{ text: "1.0", link: "/1.0/" }]
      }
    ],

    sidebar: {
      "/1.0/": require("./1.0"),
      "/2.0/": require("./2.0"),
      "/3.0/": require("./3.0")
    },

    algolia: {
      indexName: 'laravel_nova',
      apiKey: '5aa44fede3f10262000a8c4f046033d5',
      algoliaOptions: {
        facetFilters: ["version:3.0.0"]
      }
    }
  }
};
