<script setup lang='ts'>
import type { Separate } from '@/types/storeType'
import { useVirtualList } from '@vueuse/core'
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    totalNumber: {
        type: Number,
        default: 0,
    },
    separatedNumber: {
        type: Array<Separate>,
        default: [],
    },
})
const emits = defineEmits(['submitData'])
const { t } = useI18n()
const separatedNumberRef = ref()
const { separatedNumber, totalNumber } = toRefs(props)
const scaleList = ref<number[]>([])
const quickInputMode = ref(false) // 快速输入模式
const quickInputValue = ref<number>(10) // 快速输入值：每次抽取人数
const presetTemplates = ref<number[]>([5, 10, 15, 20, 25, 30]) // 预设模板

const ITEMS_PER_ROW = 10
const ROW_HEIGHT = 52

// Group numbers into rows for virtual list
const rows = computed(() => {
    const result: number[][] = []
    for (let i = 0; i < props.totalNumber; i += ITEMS_PER_ROW) {
        const row: number[] = []
        for (let j = i; j < Math.min(i + ITEMS_PER_ROW, props.totalNumber); j++) {
            row.push(j + 1)
        }
        result.push(row)
    }
    return result
})

const { list, containerProps, wrapperProps } = useVirtualList(rows, {
    itemHeight: ROW_HEIGHT,
})

function editScale(item: number) {
    if (item === totalNumber.value) {
        return
    }
    if (scaleList.value.includes(item)) {
        const index = scaleList.value.indexOf(item)
        scaleList.value.splice(index, 1)
        separatedNumber.value.splice(index, 1)
    }
    else {
        scaleList.value.push(item)
        scaleList.value.sort((a, b) => a - b)
    }
}
function clearData() {
    emits('submitData', separatedNumber.value)
    separatedNumberRef.value.close()
}

// 快速设置：根据每次抽取人数自动分配
function applyQuickInput() {
    if (!quickInputValue.value || quickInputValue.value <= 0 || quickInputValue.value > totalNumber.value) {
        return
    }
    
    scaleList.value = [0]
    let current = 0
    
    while (current < totalNumber.value) {
        current = Math.min(current + quickInputValue.value, totalNumber.value)
        if (current < totalNumber.value) {
            scaleList.value.push(current)
        }
    }
    
    if (scaleList.value[scaleList.value.length - 1] !== totalNumber.value) {
        scaleList.value.push(totalNumber.value)
    }
    
    quickInputMode.value = false
}

// 应用预设模板
function applyPreset(preset: number) {
    quickInputValue.value = preset
    applyQuickInput()
}

// 切换快速输入模式
function toggleQuickInputMode() {
    quickInputMode.value = !quickInputMode.value
    if (quickInputMode.value) {
        // 如果已有配置，尝试推断每次抽取人数
        if (separatedNumber.value.length > 0) {
            const firstCount = separatedNumber.value[0].count
            quickInputValue.value = firstCount
        }
    }
}
watch(scaleList, (val: number[]) => {
    separatedNumber.value.length = 0
    for (let i = 1; i < scaleList.value.length; i++) {
        separatedNumber.value[i - 1] = {
            id: i.toString(),
            count: val[i] - val[i - 1],
            isUsedCount: 0,
        }
    }
}, { deep: true })

watch(totalNumber, (val) => {
    if (val <= 0) {
        return
    }
    if (separatedNumberRef.value) {
    separatedNumberRef.value.showModal()
    }
    // 恢复已有的分割点配置
    if (separatedNumber.value.length > 0) {
    scaleList.value = Array.from({ length: separatedNumber.value.length + 1 }).fill(totalNumber.value) as number[]
    for (let i = separatedNumber.value.length - 1; i >= 0; i--) {
        scaleList.value[i] = scaleList.value[i + 1] - separatedNumber.value[i].count
    }
    if (scaleList.value[0] !== 0) {
        scaleList.value.unshift(0)
        }
        // 如果有配置，推断快速输入值
        if (separatedNumber.value.length > 0) {
            quickInputValue.value = separatedNumber.value[0].count
        }
    } else {
        // 如果没有配置，初始化快速输入值为合理的默认值
        quickInputValue.value = Math.min(10, Math.floor(val / 3) || 1)
    }
})
onMounted(() => {
    // 阻止esc事件
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault()
        }
    })
})
</script>

<template>
  <dialog id="my_modal_1" ref="separatedNumberRef" class="z-50 overflow-hidden border-none modal">
    <div class="overflow-hidden modal-box max-h-[70vh] flex flex-col">
      <h3 class="pb-4 text-lg font-bold shrink-0">
        {{ t('dialog.titleTip') }}
      </h3>
      <p class="pb-4 shrink-0 text-sm text-base-content/70">
        {{ t('dialog.dialogSingleDrawLimit') }}
      </p>
      
      <!-- 快速设置区域 -->
      <div class="mb-4 p-4 rounded-xl bg-base-200/50 border border-base-300 shrink-0">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-semibold">快速设置</span>
          <button 
            class="btn btn-xs btn-ghost"
            @click="toggleQuickInputMode"
          >
            {{ quickInputMode ? '收起' : '展开' }}
          </button>
        </div>
        
        <div v-if="quickInputMode" class="space-y-3">
          <!-- 预设模板 -->
          <div>
            <div class="text-xs text-base-content/60 mb-2">预设模板（点击应用）：</div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in presetTemplates"
                :key="preset"
                class="btn btn-xs btn-outline"
                :class="quickInputValue === preset ? 'btn-primary' : ''"
                @click="applyPreset(preset)"
              >
                每次{{ preset }}人
              </button>
            </div>
          </div>
          
          <!-- 自定义输入 -->
          <div class="flex items-center gap-2">
            <label class="form-control flex-1">
              <div class="label py-0">
                <span class="label-text text-xs">每次抽取人数：</span>
              </div>
              <input
                v-model.number="quickInputValue"
                type="number"
                min="1"
                :max="totalNumber"
                class="input input-sm input-bordered"
                placeholder="输入每次抽取人数"
              />
            </label>
            <button
              class="btn btn-sm btn-primary mt-6"
              @click="applyQuickInput"
            >
              应用
            </button>
          </div>
          
          <div class="text-xs text-base-content/50 mt-2">
            <div>当前总数：<strong>{{ totalNumber }}</strong> 人</div>
            <div v-if="quickInputValue > 0 && quickInputValue <= totalNumber">
              将分为 <strong>{{ Math.ceil(totalNumber / quickInputValue) }}</strong> 批抽取
            </div>
          </div>
        </div>
      </div>
      
      <!-- 当前配置预览 -->
      <div v-if="separatedNumber.length > 0" class="mb-4 p-3 rounded-lg bg-info/10 border border-info/30 shrink-0">
        <div class="text-xs font-semibold mb-2">当前配置预览：</div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(se, index) in separatedNumber"
            :key="se.id"
            class="badge badge-info badge-sm"
          >
            第{{ index + 1 }}批：{{ se.count }}人
          </span>
        </div>
      </div>
      
      <div class="text-xs text-base-content/60 mb-2 shrink-0">
        或手动选择分割点（点击数字标记分割点）：
      </div>
      <!-- Virtual scrolling container -->
      <div
        v-bind="containerProps"
        class="flex-1 min-h-0 px-3 overflow-y-auto"
        :style="`max-height: ${quickInputMode ? 'calc(70vh - 380px)' : 'calc(70vh - 280px)'};`"
      >
        <div v-bind="wrapperProps">
          <div
            v-for="{ data: row, index } in list"
            :key="index"
            class="grid grid-cols-10 gap-1 text-center pb-2"
            :style="{ height: `${ROW_HEIGHT}px` }"
          >
            <div
              v-for="item in row"
              :key="item"
              class="flex flex-col items-center justify-start cursor-pointer rounded hover:bg-base-200 transition-colors pt-1"
              :data-tip="t('tooltip.leftClick')"
              @click.left="editScale(item)"
            >
              <span>{{ item }}</span>
              <span :class="scaleList.includes(item) ? 'text-red-500 font-extrabold' : ''" class="leading-none">|</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-action shrink-0">
        <form method="dialog">
          <!-- if there is a button in form, it will close the modal -->
          <button class="btn" @click="clearData">
            {{ t('button.close') }}
          </button>
        </form>
      </div>
    </div>
  </dialog>
</template>

<style lang='scss' scoped></style>
