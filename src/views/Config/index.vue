<script setup lang="ts">
import dayjs from 'dayjs'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { configRoutes } from '../../router'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const menuList = ref<any[]>(configRoutes.children)
const currentYear = dayjs().year()

function cleanMenuList(menu: any) {
    const newList = menu
    for (let i = 0; i < newList.length; i++) {
        if (newList[i].children) {
            cleanMenuList(newList[i].children)
        }
        if (!newList[i].meta) {
            newList.splice(i, 1)
            i--
        }
    }

    return newList
}

menuList.value = cleanMenuList(menuList.value)

function skip(path: string) {
    router.push(path)
}
</script>

<template>
  <div class="h-full main-container-content flex flex-col min-h-screen">
    <div class="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 px-2 sm:px-4 md:px-6 lg:px-8 py-4 lg:py-8">
      <!-- 侧边栏导航 - 优化样式和交互，响应式设计 -->
      <aside class="w-full lg:w-64 lg:min-w-[16rem] lg:sticky lg:top-8 lg:self-start">
        <nav class="bg-base-200/80 backdrop-blur-sm rounded-2xl shadow-lg border border-base-300/50 overflow-hidden transition-all duration-300 hover:shadow-xl">
          <ul class="menu p-4 space-y-1">
      <li v-for="item in menuList" :key="item.name">
              <details v-if="item.children && !item.meta.hidden" open class="group">
                <summary class="font-semibold text-base py-3 px-4 rounded-lg hover:bg-base-300/50 cursor-pointer transition-all duration-200">
                  {{ item.meta.title }}
                </summary>
                <ul class="mt-1 ml-2 space-y-0.5">
            <li v-for="subItem in item.children" :key="subItem.name">
                    <details v-if="subItem.children" open class="group/sub">
                      <summary class="text-sm py-2.5 px-3 rounded-lg hover:bg-base-300/40 cursor-pointer transition-all duration-200">
                        {{ subItem.meta!.title }}
                      </summary>
                      <ul class="mt-0.5 ml-3 space-y-0.5">
                  <li v-for="subSubItem in subItem.children" :key="subSubItem.name">
                    <a
                            class="text-sm py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-base-300/40 hover:translate-x-1"
                            :class="subSubItem.name === route.name ? 'bg-primary text-primary-content font-medium shadow-sm' : ''"
                      @click="skip(subItem.path)"
                          >
                            {{ subSubItem.meta!.title }}
                          </a>
                  </li>
                </ul>
              </details>
              <a
                      v-else
                      class="text-sm py-2.5 px-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-base-300/40 hover:translate-x-1 block"
                      :class="subItem.name === route.name ? 'bg-primary text-primary-content font-medium shadow-sm' : ''"
                @click="skip(subItem.path)"
                    >
                      {{ subItem.meta!.title }}
                    </a>
            </li>
          </ul>
        </details>
        <a
                v-else-if="!item.meta.hidden"
                class="py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-base-300/50 hover:translate-x-1 block"
                :class="item.name === route.name ? 'bg-primary text-primary-content font-medium shadow-sm' : ''"
          @click="skip(item.path)"
              >
                {{ item.meta!.title }}
              </a>
        <div v-else />
      </li>
    </ul>
      </nav>
      </aside>

      <!-- 主内容区 - 优化间距和容器 -->
      <main class="flex-1 min-w-0">
        <div class="animate-fadeIn">
          <router-view />
        </div>
      </main>
  </div>
    <footer class="mt-auto p-10 rounded-t-3xl footer footer-center bg-base-200/60 backdrop-blur-sm border-t border-base-300/50 text-base-content">
      <div class="text-lg font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        英荔 AI，放飞孩子的想象力和创造力
      </div>
  </footer>
  </div>
</template>

<style scoped></style>
