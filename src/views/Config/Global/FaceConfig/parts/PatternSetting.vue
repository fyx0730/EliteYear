<script setup lang='ts'>
import { useI18n } from 'vue-i18n'
import PatternEdit from '../components/PatternEdit.vue'

interface Props {
    rowCount: number
    cardColor: string
    patternColor: string
    patternList: number[]
    clearPattern: () => void
    resetPattern: () => void
}
defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <fieldset class="p-6 border-2 fieldset bg-base-200/60 backdrop-blur-sm border-base-300/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full">
    <legend class="fieldset-legend px-4 text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
      {{ t('table.patternSetting') }}
    </legend>
    
    <div class="space-y-5 mt-2">
      <div class="form-control">
        <label class="label">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-primary rounded-full" />
            <span class="label-text text-base font-medium">{{ t('table.patternSetting') }}</span>
          </div>
        </label>
        <div class="p-4 rounded-xl bg-base-300/20 border border-base-300/50 overflow-auto">
          <PatternEdit
            :row-count="rowCount" 
            :card-color="cardColor" 
            :pattern-color="patternColor"
            :pattern-list="patternList"
          />
        </div>
      </div>
      
      <div class="flex flex-wrap gap-3">
        <button 
          class="btn btn-warning btn-sm gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 flex-1 min-w-[140px]" 
          @click.stop="clearPattern"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>{{ t('button.clearPattern') }}</span>
        </button>
        
        <div class="tooltip flex-1 min-w-[140px]" :data-tip="t('tooltip.defaultLayout')">
          <button 
            class="btn btn-secondary btn-sm gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 w-full" 
            @click="resetPattern"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ t('button.DefaultPattern') }}</span>
          </button>
        </div>
      </div>
    </div>
  </fieldset>
</template>

<style scoped>

</style>
