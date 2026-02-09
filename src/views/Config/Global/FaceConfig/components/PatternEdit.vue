<script setup lang='ts'>
import { computed } from 'vue'

const props = defineProps({
    rowCount: {
        type: Number,
        default: 17,
    },
    cardColor: {
        type: String,
        default: '#fff',
    },
    patternColor: {
        type: String,
        default: '#000',
    },
    patternList: {
        type: Array,
        default: () => [],
    },
})
const data = computed(() => {
    return props
})

function updatePatternList(event: Event, item: number) {
    if (data.value.patternList.includes(item)) {
        const index = data.value.patternList.indexOf(item)
        data.value.patternList.splice(index, 1)
    }
    else {
        data.value.patternList.push(item)
    }
    // emits
}
</script>

<template>
  <div class="w-full h-auto">
    <ul class="pattern-list" :style="{ gridTemplateColumns: `repeat(${data.rowCount},1fr)` }">
      <li v-for="item in data.rowCount * 7" :key="item" class="pattern-item" :style="{ backgroundColor: data.patternList.includes(item) ? data.patternColor : data.cardColor }" @click.stop="(event) => updatePatternList(event, item)" />
    </ul>
  </div>
</template>

<style lang='scss' scoped>
    .pattern-list{
        margin: 0;
        padding: 2px;
        display: grid;
        grid-template-rows: repeat(7, 1fr);
        gap: 2px;
        border: 2px solid hsl(var(--bc) / 0.2);
        border-radius: 0.5rem;
        background-color: hsl(var(--bc) / 0.1);
        aspect-ratio: auto;
        
        .pattern-item {
            cursor: pointer;
            min-width: 20px;
            min-height: 20px;
            border-radius: 2px;
            transition: all 0.15s ease;
            
            &:hover {
                transform: scale(0.95);
                box-shadow: inset 0 0 0 2px hsl(var(--p));
            }
            
            &:active {
                transform: scale(0.9);
            }
        }
    }
</style>
