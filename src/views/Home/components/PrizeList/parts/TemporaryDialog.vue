<script setup lang='ts'>
import type { IImage, IPrizeConfig } from '@/types/storeType'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
    changePersonCount: () => void
    selectPrize: (prize: IPrizeConfig) => void
    localImageList: IImage[]
    submitTemporaryPrize: () => void
    addTemporaryPrize: () => void
    submitData: (separatedNumber: any) => void
}>()
const { t } = useI18n()
const dialogRef = ref<HTMLDialogElement | null>(null)
const temporaryPrize = defineModel<IPrizeConfig>('temporaryPrize', { required: true })
const selectedPrize = defineModel<IPrizeConfig | null>('selectedPrize', { required: true })
function showDialog() {
    dialogRef.value?.showModal()
}
defineExpose({
    showDialog,
    closed,
})
</script>

<template>
  <EditSeparateDialog
    :total-number="selectedPrize?.count" :separated-number="selectedPrize?.separateCount.countList"
    @submit-data="submitData"
  />
  <dialog id="my_modal_1" ref="dialogRef" class="border-none modal backdrop-blur-sm">
    <div class="modal-box bg-base-200/95 backdrop-blur-md shadow-2xl">
      <h3 class="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {{ t('dialog.titleTemporary') }}
      </h3>
      <div class="flex flex-col gap-4">
        <div class="form-control w-full">
          <label for="temporary-prize-name" class="label">
            <span class="label-text font-medium">{{ t('table.name') }}</span>
          </label>
          <input
            id="temporary-prize-name"
            name="temporary-prize-name"
            v-model="temporaryPrize.name" type="text" :placeholder="t('placeHolder.name')"
            class="input input-bordered input-primary w-full focus:ring-2 focus:ring-primary transition-all duration-200"
          >
          </div>
        <div class="form-control">
          <label for="temporary-prize-is-all" class="label cursor-pointer justify-start gap-3">
          <input
            id="temporary-prize-is-all"
            name="temporary-prize-is-all"
            type="checkbox" :checked="temporaryPrize.isAll"
              class="checkbox checkbox-primary"
            @change="temporaryPrize.isAll = !temporaryPrize.isAll"
          >
            <span class="label-text font-medium">{{ t('table.fullParticipation') }}</span>
        </label>
          </div>
        <div class="form-control w-full">
          <label for="temporary-prize-count" class="label">
            <span class="label-text font-medium">{{ t('table.setLuckyNumber') }}</span>
          </label>
          <input
            id="temporary-prize-count"
            name="temporary-prize-count"
            v-model="temporaryPrize.count" type="number" :placeholder="t('placeHolder.winnerCount')" 
            class="input input-bordered input-primary w-full focus:ring-2 focus:ring-primary transition-all duration-200"
            @change="changePersonCount"
          >
        </div>
        <div class="form-control w-full">
          <label for="temporary-prize-used-count" class="label">
            <span class="label-text font-medium">{{ t('table.luckyPeopleNumber') }}</span>
        </label>
          <input
            id="temporary-prize-used-count"
            name="temporary-prize-used-count"
            v-model="temporaryPrize.isUsedCount" disabled type="number" :placeholder="t('placeHolder.winnerCount')"
            class="input input-bordered w-full bg-base-300/50"
          >
        </div>
        <div v-if="temporaryPrize.separateCount" class="form-control w-full">
          <label class="label">
            <span class="label-text font-medium">{{ t('table.onceNumber') }}</span>
        </label>
          <div class="flex justify-start min-h-[2.5rem] items-center" @click="selectPrize(temporaryPrize)">
            <ul
              v-if="temporaryPrize.separateCount.countList.length"
              class="flex flex-wrap w-full gap-2 p-2 m-0 cursor-pointer bg-base-300/30 rounded-lg hover:bg-base-300/50 transition-all duration-200"
            >
              <li
                v-for="se in temporaryPrize.separateCount.countList"
                :key="se.id" class="relative flex items-center justify-center w-10 h-10 bg-primary/20 rounded-lg separated hover:scale-110 transition-transform duration-200"
              >
                <div
                  class="flex items-center justify-center w-full h-full tooltip"
                  :data-tip="`${t('tooltip.doneCount') + se.isUsedCount}/${se.count}`"
                >
                  <div
                    class="absolute left-0 z-10 h-full bg-primary/40 rounded-l-lg transition-all duration-300"
                    :style="`width:${se.isUsedCount * 100 / se.count}%`"
                  />
                  <span class="relative z-20 font-semibold">{{ se.count }}</span>
                </div>
              </li>
            </ul>
            <button v-else class="btn btn-primary btn-sm hover:scale-105 transition-all duration-200">
              {{ t('button.setting') }}
            </button>
          </div>
        </div>
        <div class="form-control w-full">
          <label for="temporary-prize-picture" class="label">
            <span class="label-text font-medium">{{ t('table.image') }}</span>
        </label>
          <select id="temporary-prize-picture" name="temporary-prize-picture" v-model="temporaryPrize.picture" class="select select-bordered select-primary w-full focus:ring-2 focus:ring-primary transition-all duration-200">
            <option v-if="temporaryPrize.picture.id" :value="{ id: '', name: '', url: '' }">
              ❌ 清除图片
            </option>
            <option disabled selected>{{ t('table.selectPicture') }}</option>
            <option v-for="picItem in localImageList" :key="picItem.id" :value="picItem">
              {{ picItem.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="modal-action mt-6">
        <form method="dialog" class="flex gap-3 w-full justify-end">
          <button class="btn btn-outline hover:scale-105 transition-all duration-200">
            {{ t('button.cancel') }}
          </button>
          <button class="btn btn-primary hover:scale-105 hover:shadow-lg transition-all duration-200" @click="submitTemporaryPrize">
            {{ t('button.confirm') }}
          </button>
        </form>
      </div>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
.modal-box {
  max-width: 600px;
  border-radius: 1rem;
}

.form-control {
  .label-text {
    color: hsl(var(--bc) / 0.8);
  }
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1;
}

.separated {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
