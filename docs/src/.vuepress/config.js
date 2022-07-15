const { description } = require("../../package");
const { defineUserConfig } = require("vuepress");
const { mixTheme } = require("vuepress-theme-mix");
const { palettePlugin } = require("@vuepress/plugin-palette");

const getSidebar = require("./get-sidebar");

module.exports = defineUserConfig({
  title: "X-Robot",
  lang: "en-US",
  locales: {
    // The key is the path for the locale to be nested under.
    // As a special case, the default locale can use '/' as its path.
    "/": {
      lang: "en-US",
      title: "VuePress",
      description: "Vue-powered Static Site Generator"
    },
    "/zh/": {
      lang: "zh-CN",
      title: "VuePress",
      description: "Vue 驱动的静态网站生成器"
    }
  },
  theme: mixTheme({
    logo: "/media/x-robot-logo.svg",
    title: "X-Robot",
    // navbar: [
    //   {
    //     text: "Home",
    //     link: "/"
    //   },
    //   {
    //     text: "Guide",
    //     link: "/guide/"
    //   },
    //   {
    //     text: "Api",
    //     link: "/api/"
    //   },
    //   {
    //     text: "Github",
    //     link: "https://google.com/"
    //   }
    // ],
    navbar: [
      // one inline link，to /README.md
      {
        text: "Home",
        link: "/"
      },
      // or (In this case, the system will automatically generate menu name
      // based on the first-level headings within the document.)
      // '/',

      // one outline link
      // {
      //   text: "VuePress",
      //   link: "https://v2.vuepress.vuejs.org/"
      // },
      // or
      "https://v2.vuepress.vuejs.org/",

      // dropdown navigation group
      {
        text: "Programming Languages",
        children: [
          // nav link,
          // currently, only one level of navigation group is supported,
          // i.e. the elements within children cannot be a navigation group.
          "/programming-languages/js.md",
          "/programming-languages/go.md",
          {
            text: "PHP",
            link: "/programming-languages/php.md"
          }
        ]
      }
    ],
    collapsible: true, // enable,
    collapsed: false, // it's collapsed by default
    sidebar: getSidebar({
      apiDir: "api"
    })
  }),
  plugins: [palettePlugin({ preset: "sass" })]
});
