import bgmAudio from '@/assets/audio/bgm.mp3'
import { ref } from 'vue'

/**
 * 背景音乐管理器
 * 支持淡入淡出效果
 */
export function useBackgroundMusic() {
    const bgm = ref<HTMLAudioElement | null>(null)
    const isPlaying = ref(false)
    const fadeInterval = ref<number | null>(null)
    const targetVolume = ref(0.5) // 目标音量
    const currentVolume = ref(0) // 当前音量
    const isInitialized = ref(false) // 是否已初始化
    const hasUserInteracted = ref(false) // 用户是否已交互

    /**
     * 初始化背景音乐
     */
    function initBGM() {
        if (bgm.value) {
            return
        }

        bgm.value = new Audio(bgmAudio)
        bgm.value.loop = true
        bgm.value.volume = 0
        currentVolume.value = 0
        isInitialized.value = true

        // 监听播放结束，自动循环
        bgm.value.addEventListener('ended', () => {
            if (isPlaying.value && bgm.value) {
                bgm.value.currentTime = 0
                bgm.value.play().catch(console.error)
            }
        })
    }

    /**
     * 尝试播放背景音乐（处理自动播放限制）
     */
    function tryPlayBGM() {
        if (!bgm.value) {
            initBGM()
        }

        if (!bgm.value) {
            return
        }

        // 如果已经在播放，不需要重复播放
        if (!bgm.value.paused) {
            return
        }

        // 尝试播放
        const playPromise = bgm.value.play()

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // 播放成功
                    hasUserInteracted.value = true
                })
                .catch((error) => {
                    // 播放失败，通常是自动播放被阻止
                    console.log('背景音乐自动播放被阻止，等待用户交互:', error.name)
                    // 不设置 hasUserInteracted，等待用户交互后再播放
                })
        }
    }

    /**
     * 淡入效果
     * @param duration 淡入时长（毫秒）
     */
    function fadeIn(duration: number = 1000) {
        if (!bgm.value) {
            initBGM()
        }

        if (!bgm.value) {
            return
        }

        // 清除之前的淡入淡出
        if (fadeInterval.value) {
            clearInterval(fadeInterval.value)
            fadeInterval.value = null
        }

        const startVolume = currentVolume.value
        const volumeDiff = targetVolume.value - startVolume
        const steps = Math.max(1, Math.floor(duration / 16)) // 每16ms更新一次（约60fps）
        const volumeStep = volumeDiff / steps
        let currentStep = 0

        // 如果还没开始播放，先尝试播放
        if (bgm.value.paused) {
            tryPlayBGM()
        }

        isPlaying.value = true

        fadeInterval.value = window.setInterval(() => {
            currentStep++
            const newVolume = Math.min(
                targetVolume.value,
                startVolume + volumeStep * currentStep
            )

            if (bgm.value) {
                bgm.value.volume = newVolume
                currentVolume.value = newVolume
            }

            if (currentStep >= steps || newVolume >= targetVolume.value) {
                if (bgm.value) {
                    bgm.value.volume = targetVolume.value
                    currentVolume.value = targetVolume.value
                }
                if (fadeInterval.value) {
                    clearInterval(fadeInterval.value)
                    fadeInterval.value = null
                }
            }
        }, 16)
    }

    /**
     * 淡出效果
     * @param duration 淡出时长（毫秒）
     */
    function fadeOut(duration: number = 1000) {
        if (!bgm.value || bgm.value.paused) {
            return
        }

        // 清除之前的淡入淡出
        if (fadeInterval.value) {
            clearInterval(fadeInterval.value)
            fadeInterval.value = null
        }

        const startVolume = currentVolume.value
        const steps = Math.max(1, Math.floor(duration / 16))
        const volumeStep = startVolume / steps
        let currentStep = 0

        fadeInterval.value = window.setInterval(() => {
            currentStep++
            const newVolume = Math.max(0, startVolume - volumeStep * currentStep)

            if (bgm.value) {
                bgm.value.volume = newVolume
                currentVolume.value = newVolume
            }

            if (currentStep >= steps || newVolume <= 0) {
                if (bgm.value) {
                    bgm.value.volume = 0
                    currentVolume.value = 0
                    bgm.value.pause()
                }
                isPlaying.value = false
                if (fadeInterval.value) {
                    clearInterval(fadeInterval.value)
                    fadeInterval.value = null
                }
            }
        }, 16)
    }

    /**
     * 开始播放背景音乐（带淡入）
     * 如果用户还未交互，会等待用户交互后再播放
     */
    function startBGM() {
        initBGM()
        
        // 如果用户已经交互过，直接播放
        if (hasUserInteracted.value) {
            fadeIn(1000)
        } else {
            // 用户还未交互，先尝试播放（可能会失败）
            tryPlayBGM()
            // 如果播放成功，开始淡入
            if (!bgm.value?.paused) {
                fadeIn(1000)
            }
        }
    }

    /**
     * 在用户交互后调用，确保背景音乐可以播放
     */
    function onUserInteraction() {
        if (!hasUserInteracted.value) {
            hasUserInteracted.value = true
            // 如果背景音乐已初始化但未播放，现在可以播放了
            if (bgm.value && bgm.value.paused && isPlaying.value) {
                tryPlayBGM()
                fadeIn(1000)
            } else if (!isInitialized.value) {
                // 如果还没初始化，初始化并播放
                startBGM()
            }
        }
    }

    /**
     * 停止播放背景音乐（带淡出）
     */
    function stopBGM() {
        fadeOut(1000)
    }

    /**
     * 切换播放/暂停状态
     */
    function toggleBGM() {
        if (!bgm.value) {
            initBGM()
        }

        if (!bgm.value) {
            return
        }

        if (bgm.value.paused) {
            // 如果暂停，尝试播放
            tryPlayBGM()
            if (!bgm.value.paused) {
                fadeIn(500)
            } else {
                // 如果播放失败（需要用户交互），标记为应该播放
                isPlaying.value = true
            }
        } else {
            // 如果正在播放，暂停
            fadeOut(500)
        }
    }

    /**
     * 暂停背景音乐（不带淡出，立即暂停）
     */
    function pauseBGM() {
        if (bgm.value && !bgm.value.paused) {
            bgm.value.pause()
            isPlaying.value = false
            currentVolume.value = 0
            if (bgm.value) {
                bgm.value.volume = 0
            }
        }
    }

    /**
     * 恢复播放背景音乐（带淡入）
     */
    function resumeBGM() {
        if (!bgm.value) {
            initBGM()
        }
        if (bgm.value && bgm.value.paused) {
            tryPlayBGM()
            if (!bgm.value.paused) {
                fadeIn(500)
            }
        }
    }

    /**
     * 设置音量
     */
    function setVolume(volume: number) {
        targetVolume.value = Math.max(0, Math.min(1, volume))
        if (bgm.value && !fadeInterval.value) {
            bgm.value.volume = targetVolume.value
            currentVolume.value = targetVolume.value
        }
    }

    /**
     * 清理资源
     */
    function cleanup() {
        if (fadeInterval.value) {
            clearInterval(fadeInterval.value)
            fadeInterval.value = null
        }
        if (bgm.value) {
            bgm.value.pause()
            bgm.value.src = ''
            bgm.value.load()
            bgm.value = null
        }
        isPlaying.value = false
    }

    // 注意：onMounted 和 onUnmounted 应该在调用此 hook 的组件中处理
    // 这里不自动调用，由调用方决定何时初始化

    return {
        startBGM,
        stopBGM,
        fadeIn,
        fadeOut,
        setVolume,
        isPlaying,
        cleanup,
        onUserInteraction,
        hasUserInteracted,
        toggleBGM,
        pauseBGM,
        resumeBGM,
    }
}
