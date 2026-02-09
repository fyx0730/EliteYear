<script setup lang='ts'>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import UploadJsonModal from '../components/UploadDialog.vue'

interface Props {
    resetData: () => void
    exportAllConfigData: () => void
    importAllConfigData: (data: any) => void
}

defineProps<Props>()

const { t } = useI18n()
const resetDataDialogRef = ref()
const uploadVisible = ref(false)
</script>

<template>
  <fieldset class="p-6 border-2 fieldset bg-base-200/60 backdrop-blur-sm border-base-300/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full h-full flex flex-col">
    <legend class="fieldset-legend px-4 text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
      {{ t('table.dataSetting') }}
    </legend>
    
    <dialog id="my_modal_1" ref="resetDataDialogRef" class="border-none modal backdrop-blur-sm">
      <div class="modal-box rounded-2xl shadow-2xl border border-base-300/50">
        <h3 class="text-xl font-bold mb-2">
          {{ t('dialog.titleTip') }}
        </h3>
        <p class="py-4 text-base-content/70">
          {{ t('dialog.dialogResetAllData') }}
        </p>
        <div class="modal-action">
          <form method="dialog" class="flex gap-3">
            <button class="btn btn-ghost hover:bg-base-300 cursor-pointer" @click="resetDataDialogRef.close()">
              {{ t(`button.cancel`) }}
            </button>
            <button class="btn btn-error cursor-pointer hover:shadow-lg" @click="resetData">
              {{ t('button.confirm') }}
            </button>
          </form>
        </div>
      </div>
    </dialog>
    
    <UploadJsonModal v-model:visible="uploadVisible" :import-all-config-data="importAllConfigData" />
    
    <div class="space-y-4 mt-2 flex-1 flex flex-col justify-center">
      <!-- 重置所有数据 -->
      <div class="form-control">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-1 h-5 bg-error rounded-full" />
          <span class="label-text text-base font-medium">{{ t('table.resetAllData') }}</span>
        </div>
        <button 
          class="btn btn-sm btn-error btn-outline gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 w-full" 
          @click="resetDataDialogRef.showModal()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
              {{ t('button.resetAllData') }}
            </button>
          </div>

      <!-- 导出数据 -->
      <div class="form-control">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-1 h-5 bg-success rounded-full" />
          <span class="label-text text-base font-medium">导出数据</span>
        </div>
        <button 
          class="btn btn-sm btn-success btn-outline gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 w-full" 
          @click="exportAllConfigData"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
              导出全部数据
            </button>
          </div>

      <!-- 导入数据 -->
      <div class="form-control">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-1 h-5 bg-info rounded-full" />
          <span class="label-text text-base font-medium">导入数据</span>
        </div>
        <button 
          class="btn btn-sm btn-info btn-outline gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 w-full" 
          @click="uploadVisible = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
              导入设置
            </button>
          </div>
        </div>
  </fieldset>
</template>

<style scoped>

</style>
