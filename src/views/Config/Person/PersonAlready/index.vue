<script setup lang='ts'>
import { useI18n } from 'vue-i18n'
import DaiysuiTable from '@/components/DaiysuiTable/index.vue'
import PageHeader from '@/components/PageHeader/index.vue'
import CustomDialog from '@/components/Dialog/index.vue'
import { useViewModel } from './useViewModel'

const { t } = useI18n()

const { 
  filteredAlreadyPersonList, 
  filteredAlreadyPersonDetail, 
  isDetail, 
  tableColumnsList, 
  tableColumnsDetail,
  prizeList,
  selectedPrizeId,
  handleBatchMoveToNotWinner,
  confirmDialogVisible,
  confirmDialogTitle,
  confirmDialogDesc,
  handleConfirmSubmit,
  handleConfirmCancel,
} = useViewModel()
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
        {{ t('viewTitle.winnerManagement') }}
      </h1>
      <p class="text-base-content/60 text-sm">
        管理已中奖人员，支持按奖项筛选和批量操作
      </p>
    </div>

    <!-- 筛选和操作区域 -->
    <div class="bg-base-200/80 backdrop-blur-sm rounded-xl shadow-md border border-base-300/50 mb-5">
      <!-- 顶部操作栏 -->
      <div class="p-4 border-b border-base-300/50">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          <!-- 获奖情况筛选 -->
          <div class="form-control lg:col-span-4">
            <label for="prize-filter-select" class="label pb-1">
              <span class="label-text text-xs font-medium text-base-content/70 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                获奖情况筛选
              </span>
            </label>
            <select 
              id="prize-filter-select"
              name="prize-filter"
              v-model="selectedPrizeId" 
              class="select select-sm select-bordered border-base-300 bg-base-100 focus:border-primary focus:outline-offset-0 transition-colors duration-150 cursor-pointer hover:border-primary/50 text-sm h-10"
            >
              <option value="all">全部奖项</option>
              <option v-for="prize in prizeList" :key="prize.id" :value="prize.id">
                {{ prize.name }}
              </option>
            </select>
          </div>

          <!-- 统计信息卡片 -->
          <div class="lg:col-span-3">
            <div class="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
              </div>
              <div>
                <div class="text-xs text-base-content/60 font-medium">中奖人数</div>
                <div class="text-2xl font-bold text-primary">{{ filteredAlreadyPersonList.length }}</div>
              </div>
            </div>
          </div>

          <!-- 详情切换 -->
          <div class="lg:col-span-2 flex items-end">
            <label class="label cursor-pointer gap-2 py-2 px-3 rounded-lg hover:bg-base-300/50 transition-colors w-full">
              <span class="label-text text-sm font-medium">{{ t('table.detail') }}</span>
              <input v-model="isDetail" type="checkbox" class="toggle toggle-sm toggle-primary cursor-pointer">
            </label>
          </div>

          <!-- 一键移入未中奖 -->
          <div class="lg:col-span-3 flex items-end">
          <button 
              class="btn btn-sm btn-warning gap-1.5 cursor-pointer hover:shadow-md transition-all duration-150 w-full h-10 normal-case font-medium"
            :disabled="filteredAlreadyPersonList.length === 0"
            @click="handleBatchMoveToNotWinner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
              <span class="hidden sm:inline">一键移入未中奖</span>
              <span class="sm:hidden">批量移入</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 筛选提示信息 -->
      <div v-if="selectedPrizeId !== 'all'" class="px-4 py-3 bg-info/5 border-b border-info/20">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 flex-1 min-w-0">
            <div class="w-6 h-6 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-base-content truncate">
                当前筛选：<span class="text-info">{{ prizeList.find(p => p.id === selectedPrizeId)?.name }}</span>
              </p>
              <p class="text-xs text-base-content/60">
                共 {{ filteredAlreadyPersonList.length }} 人获得此奖项
              </p>
            </div>
          </div>
          <button 
            class="btn btn-xs btn-ghost gap-1 cursor-pointer hover:bg-base-300/50 flex-shrink-0"
            @click="selectedPrizeId = 'all'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            清除
          </button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-base-200/80 backdrop-blur-sm rounded-xl shadow-md border border-base-300/50 overflow-hidden">
      <div v-if="filteredAlreadyPersonList.length === 0" class="text-center py-16">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-base-300/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p class="text-base-content/40 text-base font-medium mb-1">暂无中奖人员</p>
        <p class="text-base-content/30 text-sm">当前筛选条件下没有找到任何获奖记录</p>
      </div>
      <div v-else class="p-4">
      <DaiysuiTable v-if="!isDetail" :table-columns="tableColumnsList" :data="filteredAlreadyPersonList" />
        <DaiysuiTable v-else :table-columns="tableColumnsDetail" :data="filteredAlreadyPersonDetail" />
      </div>
    </div>
    
    <!-- 确认对话框 -->
    <CustomDialog
      v-model:visible="confirmDialogVisible"
      :title="confirmDialogTitle"
      :desc="confirmDialogDesc"
      :submit-func="handleConfirmSubmit"
      :cancel-func="handleConfirmCancel"
    />
  </div>
</template>

<style lang='scss' scoped>
/* 选择器样式优化 */
select {
  &:focus {
    outline: 2px solid hsl(var(--p));
    outline-offset: 2px;
  }
}

/* 按钮禁用状态 */
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 空状态动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 空状态图标呼吸效果 */
@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 应用动画 */
.text-center > div:first-child {
  animation: pulse-soft 3s ease-in-out infinite;
}

/* 卡片悬停效果 */
.bg-primary\/5 {
  transition: all 0.2s ease;
  
  &:hover {
    background-color: hsl(var(--p) / 0.08);
    border-color: hsl(var(--p) / 0.3);
  }
}

/* 表格容器平滑过渡 */
:deep(.daiysuitable) {
  transition: opacity 0.2s ease;
}

/* 响应式优化 */
@media (max-width: 640px) {
  .grid {
    gap: 0.5rem;
  }
}
</style>
