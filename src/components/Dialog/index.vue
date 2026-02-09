<script setup lang='ts'>
import { onMounted, ref, toRefs, watch } from 'vue'
import i18n from '@/locales/i18n'

interface Props {
    title: string
    desc?: string
    cancelText?: string
    submitText?: string
    submitFunc?: () => void
    cancelFunc?: () => void
    footer?: null | 'center' | 'left' | 'right'
    dialogClass?: string // 添加动态class属性
}
const props = withDefaults(defineProps<Props>(), {
    cancelText: i18n.global.t('button.cancel'),
    submitText: i18n.global.t('button.confirm'),
    cancelFunc: () => {},
    footer: 'right',
    dialogClass: '',
})
const visible = defineModel('visible', {
    type: Boolean,
    default: false,
})

const dialogRef = ref <HTMLDialogElement | null> (null)
function defaultCancelFunc() {
    dialogRef.value?.close()
    visible.value = false
}

function showDialog() {
    dialogRef.value?.showModal()
}
defineExpose({
    showDialog,
    closed,
})

// 监听 visible 变化，显示或隐藏对话框
watch(visible, (newVal) => {
    if (dialogRef.value) {
        if (newVal) {
            dialogRef.value.showModal()
        } else {
            dialogRef.value.close()
        }
    }
})

onMounted(() => {
    if (dialogRef.value) {
        dialogRef.value.addEventListener('close', () => {
            visible.value = false
        })
        // 如果初始状态是 visible，显示对话框
        if (visible.value) {
            dialogRef.value.showModal()
        }
    }
})
const { title, desc, cancelText, submitText, submitFunc, cancelFunc = defaultCancelFunc } = toRefs(props)
</script>

<template>
  <dialog id="my_modal" ref="dialogRef" class="border-none modal">
    <div class="modal-box" :class="[dialogClass]">
      <h3 v-if="title" class="text-lg font-bold text-center">
        {{ title }}
      </h3>
      <p v-if="desc" class="py-4 whitespace-pre-line text-center">
        {{ desc }}
      </p>
      <div class="text-center">
        <slot name="content" />
      </div>
      <div class="modal-action" :class="{ 'flex justify-center': footer === 'center' }">
        <form method="dialog" class="flex gap-3">
          <!-- if there is a button in form, it will close the modal -->
          <button class="btn" @click="cancelFunc">
            {{ cancelText }}
          </button>
          <button class="btn" @click="submitFunc">
            {{ submitText }}
          </button>
        </form>
      </div>
    </div>
  </dialog>
</template>

<style scoped>

</style>
