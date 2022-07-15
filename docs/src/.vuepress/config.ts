import { defineUserConfig } from "vuepress";
import { description } from "../../package.json";
import getSidebar from "./get-sidebar";
import { mixTheme } from "vuepress-theme-mix";

module.exports = defineUserConfig({
  title: "X-Robot",
  description,
  lang: "en-US",
  theme: mixTheme({
    logo: "/media/x-robot-logo.svg",
    title: "X-Robot",
    locales: {
      "/": {
        selectLanguageName: "English"
      }
    },
    navbar: [
      {
        text: "Home",
        link: "/"
      },
      {
        text: "Guide",
        link: "/guide/"
      },
      {
        text: "Api",
        link: "/api/"
      }
    ],
    collapsible: true, // enable,
    collapsed: false, // it's collapsed by default
    sidebar: getSidebar({
      apiDir: "api"
    }) as any
  }) as any,
  plugins: []
});
