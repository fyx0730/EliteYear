import { useBackgroundMusic } from './useBackgroundMusic'

// 创建全局单例实例
let bgmInstance: ReturnType<typeof useBackgroundMusic> | null = null

/**
 * 获取全局背景音乐管理器实例
 */
export function useBackgroundMusicInstance() {
    if (!bgmInstance) {
        bgmInstance = useBackgroundMusic()
    }
    return bgmInstance
}
