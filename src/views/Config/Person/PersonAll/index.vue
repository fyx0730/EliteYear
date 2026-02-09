<!-- eslint-disable vue/no-parsing-error -->
<script setup lang='ts'>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DaiysuiTable from '@/components/DaiysuiTable/index.vue'
import CustomDialog from '@/components/Dialog/index.vue'
import CustomDrawer from '@/components/Drawer/index.vue'
import PageHeader from '@/components/PageHeader/index.vue'
import SinglePersonContent from './components/SinglePerson.vue'
import { useViewModel } from './useViewModel'

const resetDataDialogRef = ref()
const delAllDataDialogRef = ref()
const exportInputFileRef = ref()
const addOnePersonDrawerRef = ref()
const {
    resetData,
    deleteAll,
    handleFileChange,
    exportData,
    addOnePerson,
    singlePersonData,
    alreadyPersonList,
    allPersonList,
    tableColumnList,
    downloadTemplate,
} = useViewModel({ exportInputFileRef })
const { t } = useI18n()
const limitType = '.xlsx,.xls'
</script>

<template>
  <CustomDialog
    ref="resetDataDialogRef"
    :title="t('dialog.titleTip')"
    :desc="t('dialog.dialogResetWinner')"
    :submit-func="resetData"
    class="backdrop-blur-sm"
  />
  <CustomDialog
    ref="delAllDataDialogRef"
    :title="t('dialog.titleTip')"
    :desc="t('dialog.dialogDelAllPerson')"
    :submit-func="deleteAll"
    class="backdrop-blur-sm"
  />
  <CustomDrawer ref="addOnePersonDrawerRef">
    <template #content>
      <SinglePersonContent
        v-model:single-person-data="singlePersonData"
        :add-one-person-drawer-ref="addOnePersonDrawerRef"
        :add-one-person="addOnePerson"
      />
    </template>
  </CustomDrawer>

  <div class="w-full max-w-full overflow-x-auto space-y-6 animate-fadeIn">
    <PageHeader :title="t('viewTitle.personManagement')">
      <template #buttons>
        <div class="flex flex-wrap gap-2 sm:gap-3 items-center w-full">
          <button 
            class="btn btn-primary btn-sm gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
            @click="addOnePersonDrawerRef.showDrawer()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {{ t('button.add') }}
          </button>
          
          <div class="tooltip tooltip-bottom" :data-tip="t('tooltip.downloadTemplateTip')">
            <button 
              class="no-underline btn btn-secondary btn-sm gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
              @click="downloadTemplate"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {{ t('button.downloadTemplate') }}
            </button>
          </div>
          
              <div class="tooltip tooltip-bottom" :data-tip="t('tooltip.uploadExcelTip')">
            <label for="explore" class="cursor-pointer">
                <input
                id="explore" 
                ref="exportInputFileRef" 
                type="file" 
                class="hidden"
                :accept="limitType" 
                @change="handleFileChange"
                >
              <span class="btn btn-accent btn-sm gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {{ t('button.importData') }}
              </span>
            </label>
          </div>
          
          <button 
            class="btn btn-info btn-sm gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
            @click="exportData"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ t('button.exportResult') }}
          </button>
          
          <button 
            class="btn btn-warning btn-sm gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
            @click="resetDataDialogRef.showDialog()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ t('button.resetData') }}
          </button>
          
          <button 
            class="btn btn-error btn-sm gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
            @click="delAllDataDialogRef.showDialog()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {{ t('button.allDelete') }}
          </button>
          
          <div class="flex items-center gap-2 px-4 py-2 rounded-lg bg-base-200/60 backdrop-blur-sm border border-base-300/50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span class="font-medium">{{ t('table.luckyPeopleNumber') }}:</span>
            <span class="font-bold text-primary">{{ alreadyPersonList.length }}</span>
            <span class="text-base-content/50">/</span>
            <span class="font-bold">{{ allPersonList.length }}</span>
          </div>
        </div>
      </template>
    </PageHeader>

    <div class="rounded-2xl overflow-hidden shadow-lg border border-base-300/50 bg-base-200/40 backdrop-blur-sm">
    <DaiysuiTable :table-columns="tableColumnList" :data="allPersonList" />
    </div>
  </div>
</template>

<style lang='scss' scoped></style>
