<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface CornerImage {
  topLeft?: string
  topRight?: string
  bottomLeft?: string
  bottomRight?: string
}

const props = defineProps<{
  images?: CornerImage
}>()

// 获取base路径（处理Vite的base配置）
// public目录下的文件会被直接复制到输出目录根目录，所以路径需要包含base
const baseUrl = import.meta.env.BASE_URL || '/'
// 确保baseUrl以/结尾
const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`

// 默认图片路径（相对于public目录）
// public目录下的文件在Vite中会被直接复制到输出目录，路径从根目录开始
const defaultImages = {
  topLeft: `${normalizedBaseUrl}images/corner-decorations/top-left.png`,
  topRight: `${normalizedBaseUrl}images/corner-decorations/top-right.png`,
  bottomLeft: `${normalizedBaseUrl}images/corner-decorations/bottom-left.png`,
  bottomRight: `${normalizedBaseUrl}images/corner-decorations/bottom-right.png`,
}

const cornerImages = ref<CornerImage>({})
const imageLoaded = ref({
  topLeft: false,
  topRight: false,
  bottomLeft: false,
  bottomRight: false,
})

// 检查图片是否存在
function checkImageExists(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => {
      console.warn(`Failed to load corner decoration image: ${src}`)
      resolve(false)
    }
    // 使用绝对路径，避免相对路径问题
    // 如果src已经是完整URL或绝对路径，直接使用；否则添加baseUrl
    if (src.startsWith('http') || src.startsWith('/')) {
      img.src = src
    } else {
      img.src = `${normalizedBaseUrl}${src}`
    }
  })
}

// 验证图片并更新显示
onMounted(async () => {
  const images = props.images || defaultImages
  
  // 检查每个图片是否存在，只有存在时才设置
  if (images.topLeft) {
    const exists = await checkImageExists(images.topLeft)
    if (exists) {
      cornerImages.value.topLeft = images.topLeft
      imageLoaded.value.topLeft = true
    }
  }
  
  if (images.topRight) {
    const exists = await checkImageExists(images.topRight)
    if (exists) {
      cornerImages.value.topRight = images.topRight
      imageLoaded.value.topRight = true
    }
  }
  
  if (images.bottomLeft) {
    const exists = await checkImageExists(images.bottomLeft)
    if (exists) {
      cornerImages.value.bottomLeft = images.bottomLeft
      imageLoaded.value.bottomLeft = true
    }
  }
  
  if (images.bottomRight) {
    const exists = await checkImageExists(images.bottomRight)
    if (exists) {
      cornerImages.value.bottomRight = images.bottomRight
      imageLoaded.value.bottomRight = true
    }
  }
})
</script>

<template>
  <div class="corner-decorations fixed inset-0 pointer-events-none z-0">
    <!-- 左上角 -->
    <div
      v-if="imageLoaded.topLeft && cornerImages.topLeft"
      class="absolute top-0 left-0"
    >
      <img
        :src="cornerImages.topLeft"
        alt="Top Left Decoration"
        class="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 max-w-[200px] max-h-[200px] object-contain"
        @error="imageLoaded.topLeft = false"
      />
    </div>

    <!-- 右上角 -->
    <div
      v-if="imageLoaded.topRight && cornerImages.topRight"
      class="absolute top-0 right-0"
    >
      <img
        :src="cornerImages.topRight"
        alt="Top Right Decoration"
        class="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 max-w-[200px] max-h-[200px] object-contain"
        @error="imageLoaded.topRight = false"
      />
    </div>

    <!-- 左下角 -->
    <div
      v-if="imageLoaded.bottomLeft && cornerImages.bottomLeft"
      class="absolute bottom-0 left-0 corner-bottom-left"
    >
      <img
        :src="cornerImages.bottomLeft"
        alt="Bottom Left Decoration"
        class="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 max-w-[200px] max-h-[200px] object-contain"
        @error="imageLoaded.bottomLeft = false"
      />
    </div>

    <!-- 右下角 -->
    <div
      v-if="imageLoaded.bottomRight && cornerImages.bottomRight"
      class="absolute bottom-0 right-0 corner-bottom-right"
    >
      <img
        :src="cornerImages.bottomRight"
        alt="Bottom Right Decoration"
        class="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 max-w-[200px] max-h-[200px] object-contain"
        @error="imageLoaded.bottomRight = false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.corner-decorations {
  // 确保装饰元素在背景层之上，但不会阻挡交互
  z-index: 1;
  
  img {
    // 添加平滑过渡效果
    transition: opacity 0.3s ease-in-out;
    
    // 可选：添加轻微的阴影效果
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
  }
  
  // 左下角和右下角图片紧靠底部边缘
  .corner-bottom-left,
  .corner-bottom-right {
    display: flex;
    align-items: flex-end;
    margin: 0;
    padding: 0;
    
    img {
      display: block;
      object-position: bottom;
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }
  }
}
</style>
