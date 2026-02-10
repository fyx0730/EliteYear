<script setup lang='ts'>
import type { IPrizeConfig } from '@/types/storeType'
import { ref, watch } from 'vue'
import defaultPrizeImage from '@/assets/images/龙.png'
import { useGsap } from './useGsap'

const props = defineProps<{
    isMobile: boolean
    localPrizeList: IPrizeConfig[]
    currentPrize: IPrizeConfig
    temporaryPrizeShow: boolean
    addTemporaryPrize: () => void
}>()

const prizeShow = defineModel<boolean>('prizeShow')
const scrollContainerRef = ref<any>(null)
const ulContainerRef = ref<any>(null)
const isScroll = ref(false)
const liRefs = ref([])
const isAnimating = ref(false)

const {
    showUpButton,
    showDownButton,
    handleScroll,
} = useGsap(scrollContainerRef, liRefs, isScroll, prizeShow, props.temporaryPrizeShow)

// 获取ulContainerRef的高度
function getUlContainerHeight() {
    if (ulContainerRef.value) {
        return ulContainerRef.value.offsetHeight
    }
    return 0
}
// 获取scrollContainerRef的高度
function getScrollContainerHeight() {
    if (scrollContainerRef.value) {
        return scrollContainerRef.value.offsetHeight
    }
    return 0
}

function getIsScroll() {
    const ulHeight = getUlContainerHeight()
    const scrollHeight = getScrollContainerHeight()
    if (ulHeight > scrollHeight + 20) {
        isScroll.value = true
    }
    else {
        isScroll.value = false
        scrollContainerRef.value.style.height = `${ulHeight}px`
    }
}

watch ([prizeShow, () => props.temporaryPrizeShow], (val) => {
    if (!val[0]) {
        return
    }
    setTimeout (() => {
        getIsScroll()
    }, 0)
}, { immediate: true })
</script>

<template>
  <transition 
    name="prize-list" 
    class="h-full" 
    :appear="true"
    @before-enter="isAnimating = true"
    @after-enter="isAnimating = false"
    @before-leave="isAnimating = true"
    @after-leave="isAnimating = false"
  >
    <div v-if="prizeShow && !isMobile && !temporaryPrizeShow" class="flex items-center h-full relative prize-list-wrapper" :class="{ 'is-animating': isAnimating }">
      <div v-if="isScroll" class="w-full h-8 flex justify-center scroll-button scroll-button-up absolute top-0 z-50">
        <SvgIcon v-show="showUpButton" name="chevron-up" size="32px" class="text-gray-200/80 cursor-pointer" @click="handleScroll(-80)" />
      </div>
      <div ref="scrollContainerRef" :class="isScroll ? (showDownButton ? 'scroll-container' : 'scroll-container-end') : 'no-scroll bg-slate-500/50'" class="h-full no-before overflow-y-auto overflow-x-hidden  scroll-smooth hide-scrollbar before:bg-slate-500/50 z-20 rounded-xl">
        <ul ref="ulContainerRef" class="flex flex-col gap-1 p-2">
          <li
            v-for="item in localPrizeList"
            ref="liRefs" :key="item.id"
            :class="currentPrize.id === item.id ? 'current-prize' : ''"
          >
            <div
              v-if="item.isShow"
              class="relative flex flex-row items-center justify-between w-52 h-14 px-2 gap-2 shadow-lg card bg-base-100 prize-card"
            >
              <div
                v-if="item.isUsed"
                class="absolute z-50 w-full left-0 h-full bg-gray-800/70 item-mask rounded-xl"
              />
              <figure class="w-11 h-11 rounded flex-shrink-0">
                <ImageSync v-if="item.picture.url" :img-item="item.picture" />
                <img
                  v-else :src="defaultPrizeImage" alt="Prize"
                  class="object-cover h-full rounded"
                >
              </figure>
              <div class="flex-1 min-w-0 flex flex-col justify-center">
                <div class="tooltip tooltip-left w-full" :data-tip="item.name">
                  <h2
                    class="text-xs font-semibold p-0 m-0 overflow-hidden whitespace-nowrap text-ellipsis leading-tight"
                  >
                    {{ item.name }}
                  </h2>
                </div>
                <div class="relative mt-0.5">
                  <progress
                    class="w-full h-2.5 progress bg-[#52545b] progress-primary" :value="item.isUsedCount"
                    :max="item.count"
                  />
                  <p class="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 text-[9px] text-gray-900 font-semibold z-10 leading-none drop-shadow-sm pointer-events-none">
                    {{ item.isUsedCount }}/{{ item.count }}
                  </p>
                </div>
              </div>
            </div>
          </li>
        </ul>
        <div v-if="isScroll" class="h-24" />
      </div>
      <div v-if="isScroll" class="w-full h-8 flex justify-center scroll-button scroll-button-down absolute bottom-0 z-50">
        <SvgIcon v-show="showDownButton" name="chevron-down" size="32px" class="text-gray-200/80 cursor-pointer" @click="handleScroll(80)" />
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
@use "./index.scss";
</style>
