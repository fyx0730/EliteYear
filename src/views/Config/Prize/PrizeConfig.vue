<script setup lang='ts'>
import { Grip } from 'lucide-vue-next'
import { VueDraggable } from 'vue-draggable-plus'
import { useI18n } from 'vue-i18n'
import { HoverTip } from '@/components/index'
import EditSeparateDialog from '@/components/NumberSeparate/EditSeparateDialog.vue'
import PageHeader from '@/components/PageHeader/index.vue'
import { usePrizeConfig } from './usePrizeConfig'

const { addPrize, resetDefault, delAll, delItem, prizeList, currentPrize, selectedPrize, submitData, changePrizePerson, changePrizeStatus, selectPrize, localImageList } = usePrizeConfig()
const { t } = useI18n()
</script>

<template>
  <div class="space-y-6 animate-fadeIn max-w-full overflow-x-hidden">
    <PageHeader :title="t('viewTitle.prizeManagement')">
      <template #buttons>
        <div class="flex flex-wrap w-full gap-2 sm:gap-3">
          <button 
            class="btn btn-primary btn-sm gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
            @click="addPrize"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ t('button.add') }}
          </button>
          <button 
            class="btn btn-secondary btn-sm gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
            @click="resetDefault"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ t('button.resetDefault') }}
          </button>
          <button 
            class="btn btn-error btn-sm gap-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
            @click="delAll"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {{ t('button.allDelete') }}
          </button>
        </div>
      </template>
      <template #alerts>
        <div role="alert" class="w-full my-4 alert alert-info border border-info/30 shadow-lg rounded-xl backdrop-blur-sm bg-info/10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current shrink-0">
            <path
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-sm">{{ t('dialog.tipResetPrize') }}</span>
        </div>
      </template>
    </PageHeader>
    <VueDraggable
      v-model="prizeList"
      :animation="200"
      handle=".handle"
      class="p-0 m-0 space-y-4"
    >
      <div
        v-for="item in prizeList" 
        :key="item.id" 
        class="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6 p-4 lg:p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl"
        :class="currentPrize.id === item.id 
          ? 'border-primary bg-primary/5 shadow-lg' 
          : 'border-base-300 bg-base-200/40 backdrop-blur-sm hover:border-primary/50'"
      >
        <!-- 拖拽手柄 - 在移动端显示在顶部 -->
        <div class="flex items-center justify-between lg:justify-start gap-4 lg:block">
          <label class="flex items-center justify-center handle form-control cursor-move">
            <Grip class="w-6 h-6 lg:w-8 lg:h-8 text-base-content/40 hover:text-primary transition-colors duration-200 cursor-move handle" />
        </label>
          <!-- 当前奖项标识（仅移动端显示） -->
          <span v-if="currentPrize.id === item.id" class="lg:hidden badge badge-primary badge-sm">当前奖项</span>
        </div>

        <!-- 表单字段容器 - 响应式网格布局 -->
        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row gap-3 lg:gap-6 items-start lg:items-center"
        >
          <!-- 奖品名称 -->
          <label :for="`prize-name-${item.id}`" class="form-control w-full md:col-span-2 lg:flex-1 lg:min-w-[150px]">
            <div class="label pb-1">
              <span class="label-text font-medium text-sm">{{ t('table.prizeName') }}</span>
          </div>
          <input
              :id="`prize-name-${item.id}`"
              :name="`prize-name-${item.id}`"
              v-model="item.name" 
              type="text" 
              :placeholder="t('placeHolder.name')"
              class="w-full input input-sm input-bordered border-2 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200"
          >
        </label>

          <!-- 全员参与 -->
          <label :for="`prize-is-all-${item.id}`" class="form-control">
            <div class="label pb-1">
              <span class="label-text font-medium text-sm">{{ t('table.fullParticipation') }}</span>
          </div>
            <div class="flex items-center h-8">
          <input
                :id="`prize-is-all-${item.id}`"
                :name="`prize-is-all-${item.id}`"
                type="checkbox" 
                :checked="item.isAll" 
                class="checkbox checkbox-primary cursor-pointer hover:scale-110 transition-transform duration-200"
            @change="item.isAll = !item.isAll"
          >
            </div>
        </label>

          <!-- 抽奖人数 -->
          <label :for="`prize-count-${item.id}`" class="form-control lg:flex-1 lg:min-w-[140px]">
            <div class="label pb-1">
              <span class="label-text font-medium text-sm">{{ t('table.numberParticipants') }}</span>
          </div>
          <input
              :id="`prize-count-${item.id}`"
              :name="`prize-count-${item.id}`"
              v-model="item.count" 
              type="number" 
              :placeholder="t('placeHolder.winnerCount')" 
              class="w-full input input-sm input-bordered border-2 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200"
            @change="changePrizePerson(item)"
          >
            <div class="tooltip tooltip-bottom w-full mt-1" :data-tip="`${t('table.isDone') + item.isUsedCount}/${item.count}`">
              <progress 
                class="progress progress-primary w-full h-1.5 rounded-full shadow-sm" 
                :value="item.isUsedCount" 
                :max="item.count" 
              />
          </div>
        </label>

          <!-- 已完成 -->
          <label :for="`prize-is-used-${item.id}`" class="form-control">
            <div class="label pb-1">
              <span class="label-text font-medium text-sm">{{ t('table.isDone') }}</span>
          </div>
            <div class="flex items-center h-8">
          <input
                :id="`prize-is-used-${item.id}`"
                :name="`prize-is-used-${item.id}`"
                type="checkbox" 
                :checked="item.isUsed" 
                class="checkbox checkbox-success cursor-pointer hover:scale-110 transition-transform duration-200"
            @change="changePrizeStatus(item)"
          >
            </div>
        </label>

          <!-- 图片选择 -->
          <label :for="`prize-picture-${item.id}`" class="form-control md:col-span-2 lg:flex-1 lg:min-w-[150px]">
            <div class="label pb-1">
              <span class="label-text font-medium text-sm">{{ t('table.image') }}</span>
          </div>
            <select 
              :id="`prize-picture-${item.id}`"
              :name="`prize-picture-${item.id}`"
              v-model="item.picture" 
              class="truncate select select-sm select-bordered border-2 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200 cursor-pointer hover:border-primary/50"
            >
              <option v-if="item.picture.id" :value="{ id: '', name: '', url: '' }">🚫 清除图片</option>
            <option disabled selected>{{ t('table.selectPicture') }}</option>
              <option 
                v-for="picItem in localImageList" 
                :key="picItem.id" 
                :title="picItem.name" 
                class="w-full" 
                :value="picItem"
              >
                {{ picItem.name }}
            </option>
          </select>
        </label>

          <!-- 单次抽奖人数 -->
          <label v-if="item.separateCount" class="form-control md:col-span-2 lg:flex-1 lg:min-w-[180px]">
            <div class="label pb-1">
              <span class="label-text font-medium text-sm flex items-center gap-2">
                {{ t('table.onceNumber') }}
                <HoverTip :tip="t('tooltip.onceNumberMax')" />
              </span>
          </div>

            <div 
              class="flex justify-start w-full cursor-pointer p-2 rounded-xl border-2 border-base-300 hover:border-primary/50 transition-all duration-200 bg-base-300/20 min-h-[40px]" 
              @click="selectPrize(item)"
            >
            <ul
              v-if="item.separateCount.countList.length"
                class="flex flex-wrap w-full gap-1.5 p-0 m-0"
            >
              <li
                v-for="se in item.separateCount.countList"
                  :key="se.id" 
                  class="relative flex items-center justify-center w-9 h-9 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  <div
                    class="flex items-center justify-center w-full h-full tooltip relative z-10 font-semibold text-sm"
                    :data-tip="`${t('tooltip.doneCount') + se.isUsedCount}/${se.count}`"
                  >
                    <div
                      class="absolute left-0 top-0 h-full bg-primary/30 transition-all duration-300"
                    :style="`width:${se.isUsedCount * 100 / se.count}%`"
                  />
                    <span class="relative z-20">{{ se.count }}</span>
                </div>
              </li>
            </ul>
              <button 
                v-else 
                class="btn btn-secondary btn-xs gap-1.5 cursor-pointer hover:shadow-lg transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ t('button.setting') }}
              </button>
          </div>
        </label>
          </div>

        <!-- 操作按钮 - 单独一行 -->
        <div class="flex justify-end pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-base-300/50 lg:pl-4">
          <button 
            class="btn btn-error btn-sm gap-1.5 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
            @click="delItem(item)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span class="hidden sm:inline">{{ t('button.delete') }}</span>
            <span class="sm:hidden">删除</span>
          </button>
          </div>
      </div>
    </VueDraggable>
    <EditSeparateDialog
      :total-number="selectedPrize?.count" :separated-number="selectedPrize?.separateCount.countList"
      @submit-data="submitData"
    />
  </div>
</template>

<style lang='scss' scoped></style>
