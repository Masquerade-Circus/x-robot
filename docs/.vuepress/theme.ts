import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar";
import sidebar from "./sidebar";

export default hopeTheme({
  pure: true,
  // hostname: "https://vuepress-theme-hope-v2-demo.mrhope.site",

  author: {
    name: "Masquerade Circus",
    url: "https://masquerade-circus.net"
  },

  iconAssets: "iconfont",

  logo: "/media/x-robot-logo.svg",

  repo: "masquerade-circus/x-robot",

  repoLabel: "GitHub",
  fullscreen: true,

  docsDir: "docs",

  // navbar
  navbar: navbar,

  // sidebar
  sidebar: sidebar,

  footer:
    'Made by <a href="https://masquerade-circus.net" target="_blank">Masquerade Circus</a> with ❤',

  displayFooter: true,

  copyright: false,

  pageInfo: ["Original", "Date", "Category", "Tag", "Word", "ReadingTime"],

  navbarLayout: {
    left: ["Brand"],
    center: ["Links"],
    right: ["Search", "Language", "Repo", "Outlook"]
  },

  encrypt: {
    config: {
      // "/guide/encrypt.html": ["1234"]
    }
  },

  plugins: {
    mdEnhance: {
      enableAll: true,
      presentation: {
        plugins: ["highlight", "math", "search", "notes", "zoom"]
      }
    },
    copyCode: {},
    photoSwipe: {}
  }
});
