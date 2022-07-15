import { containerPlugin } from "@vuepress/plugin-container";
import { defineUserConfig } from "vuepress";
import { description } from "../../package.json";
import { path } from "@vuepress/utils";
import { registerComponentsPlugin } from "@vuepress/plugin-register-components";
import { searchPlugin } from "@vuepress/plugin-search";
import theme from "./theme";

export default defineUserConfig({
  lang: "en-US",
  title: "X-Robot",
  description,
  base: "/",

  theme,

  plugins: [
    searchPlugin({
      hotKeys: [
        {
          key: "f",
          ctrl: true
        }
      ]
    }),
    registerComponentsPlugin({
      componentsDir: path.resolve(__dirname, "./components")
    }),
    containerPlugin({
      type: "custom",
      before: (info) => `<div class="${info}">`,
      after: () => "</div>"
    })
  ]
});
