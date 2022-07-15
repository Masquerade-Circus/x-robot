import { defineAsyncComponent } from 'vue'

export const layoutComponents = {
  "404": defineAsyncComponent(() => import("/home/masquerade-circus/NodeJs/ownprojects/x-robot/docs/node_modules/vuepress-theme-mix/lib/client/layouts/404.vue")),
  "Layout": defineAsyncComponent(() => import("/home/masquerade-circus/NodeJs/ownprojects/x-robot/docs/node_modules/vuepress-theme-mix/lib/client/layouts/Layout.vue")),
}
