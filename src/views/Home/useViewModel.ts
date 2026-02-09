import type { Material, Object3D } from 'three'
import type { TargetType } from './type'
import type { IPersonConfig } from '@/types/storeType'
import * as TWEEN from '@tweenjs/tween.js'
import { storeToRefs } from 'pinia'
import { PerspectiveCamera, Scene } from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three-css3d'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useToast } from 'vue-toast-notification'
import dongSound from '@/assets/audio/end.mp3'
import enterAudio from '@/assets/audio/enter.wav'
import worldCupAudio from '@/assets/audio/worldcup.mp3'
import { SINGLE_TIME_MAX_PERSON_COUNT } from '@/constant/config'
import { useBackgroundMusicInstance } from '@/hooks/useBackgroundMusicInstance'
import { useBluetooth } from '@/hooks/useBluetooth'
import { useElementPosition, useElementStyle } from '@/hooks/useElement'
import i18n from '@/locales/i18n'
import useStore from '@/store'
import { selectCard } from '@/utils'
import { rgba } from '@/utils/color'
import { LotteryStatus } from './type'
import { confettiFire, createSphereVertices, createTableVertices, getRandomElements, initTableData } from './utils'

const maxAudioLimit = 10
export function useViewModel() {
    const toast = useToast()
    // store里面存储的值
    const { personConfig, globalConfig, prizeConfig } = useStore()
    const {
        getAllPersonList: allPersonList,
        getNotPersonList: notPersonList,
        getNotThisPrizePersonList: notThisPrizePersonList,
    } = storeToRefs(personConfig)
    const { getCurrentPrize: currentPrize } = storeToRefs(prizeConfig)
    const {
        getCardColor: cardColor,
        getPatterColor: patternColor,
        getPatternList: patternList,
        getTextColor: textColor,
        getLuckyColor: luckyColor,
        getCardSize: cardSize,
        getTextSize: textSize,
        getRowCount: rowCount,
        getIsShowAvatar: isShowAvatar,
        getTitleFont: titleFont,
        getTitleFontSyncGlobal: titleFontSyncGlobal,
        getDefiniteTime: definiteTime,
        getWinMusic: isPlayWinMusic,
        getCardOpacity: cardOpacity,
    } = storeToRefs(globalConfig)
    // three初始值
    const ballRotationY = ref(0)
    const containerRef = ref<HTMLElement>()
    const canOperate = ref(true)
    const cameraZ = ref(3000)
    const scene = ref()
    const camera = ref()
    const renderer = ref()
    const controls = ref()
    const objects = ref<any[]>([])
    const targets: TargetType = {
        grid: [],
        helix: [],
        table: [],
        sphere: [],
    }
    // 页面数据初始值
    const currentStatus = ref<LotteryStatus>(LotteryStatus.init) // 0为初始状态， 1为抽奖准备状态，2为抽奖中状态，3为抽奖结束状态
    const tableData = ref<any[]>([])
    const luckyTargets = ref<any[]>([])
    const luckyCardList = ref<number[]>([])
    const luckyCount = ref(10)
    const personPool = ref<IPersonConfig[]>([])
    const intervalTimer = ref<any>(null)
    const isInitialDone = ref<boolean>(false)
    const animationFrameId = ref<any>(null)
    // 跟踪每个卡牌索引对应的人员ID，确保不重复显示
    const cardToPersonMap = ref<Map<number, number>>(new Map())
    const playingAudios = ref<HTMLAudioElement[]>([])

    // 抽奖音乐相关
    const lotteryMusic = ref<HTMLAudioElement | null>(null)

    // 背景音乐管理器（使用全局实例）
    const bgmController = useBackgroundMusicInstance()
    const { startBGM, stopBGM, fadeIn: fadeInBGM, fadeOut: fadeOutBGM, pauseBGM, onUserInteraction: bgmUserInteraction } = bgmController

    function initThreeJs() {
        const felidView = 40
        const width = window.innerWidth
        const height = window.innerHeight
        const aspect = width / height
        const nearPlane = 1
        const farPlane = 10000
        const WebGLoutput = containerRef.value

        scene.value = new Scene()
        camera.value = new PerspectiveCamera(felidView, aspect, nearPlane, farPlane)
        camera.value.position.z = cameraZ.value
        renderer.value = new CSS3DRenderer()
        renderer.value.setSize(width, height * 0.9)
        renderer.value.domElement.style.position = 'absolute'
        // 垂直居中
        renderer.value.domElement.style.paddingTop = '50px'
        renderer.value.domElement.style.top = '50%'
        renderer.value.domElement.style.left = '50%'
        renderer.value.domElement.style.transform = 'translate(-50%, -50%)'
        WebGLoutput!.appendChild(renderer.value.domElement)

        controls.value = new TrackballControls(camera.value, renderer.value.domElement)
        controls.value.rotateSpeed = 1
        controls.value.staticMoving = true
        controls.value.minDistance = 500
        controls.value.maxDistance = 6000
        controls.value.addEventListener('change', render)

        const tableLen = tableData.value.length
        // 初始化卡牌到人员的映射
        cardToPersonMap.value.clear()
        for (let i = 0; i < tableLen; i++) {
            let element = document.createElement('div')
            element.className = 'element-card'

            const number = document.createElement('div')
            number.className = 'card-id'
            // 使用 originalIndex + 1 作为编号，对应人员在 allPersonList 中的位置
            const originalIndex = tableData.value[i].originalIndex !== undefined ? tableData.value[i].originalIndex : i
            number.textContent = (originalIndex + 1).toString()
            if (isShowAvatar.value)
                number.style.display = 'none'
            element.appendChild(number)

            const symbol = document.createElement('div')
            symbol.className = 'card-name'
            symbol.textContent = tableData.value[i].name
            if (isShowAvatar.value)
                symbol.className = 'card-name card-avatar-name'
            element.appendChild(symbol)

            const detail = document.createElement('div')
            detail.className = 'card-detail'
            detail.innerHTML = `${tableData.value[i].department}`
            if (isShowAvatar.value)
                detail.style.display = 'none'
            element.appendChild(detail)

            if (isShowAvatar.value) {
                const avatar = document.createElement('img')
                avatar.className = 'card-avatar'
                avatar.src = tableData.value[i].avatar
                avatar.alt = 'avatar'
                avatar.style.width = '140px'
                avatar.style.height = '140px'
                element.appendChild(avatar)
            }
            else {
                const avatarEmpty = document.createElement('div')
                avatarEmpty.style.display = 'none'
                element.appendChild(avatarEmpty)
            }

            element = useElementStyle({
                element,
                person: tableData.value[i],
                index: i,
                patternList: patternList.value,
                patternColor: patternColor.value,
                cardColor: cardColor.value,
                cardSize: cardSize.value,
                scale: 1,
                textSize: textSize.value,
                mod: 'default',
                cardOpacity: cardOpacity.value,
            },
            )
            const object = new CSS3DObject(element)
            object.position.x = Math.random() * 4000 - 2000
            object.position.y = Math.random() * 4000 - 2000
            object.position.z = Math.random() * 4000 - 2000
            scene.value.add(object)

            objects.value.push(object)
            // 记录卡牌索引对应的人员ID
            if (tableData.value[i] && tableData.value[i].id) {
                cardToPersonMap.value.set(i, tableData.value[i].id)
            }
        }
        // 创建横铺的界面
        const tableVertices = createTableVertices({ tableData: tableData.value, rowCount: rowCount.value, cardSize: cardSize.value })
        targets.table = tableVertices
        // 创建球体
        const sphereVertices = createSphereVertices({ objectsLength: objects.value.length })
        targets.sphere = sphereVertices
        window.addEventListener('resize', onWindowResize, false)
        transform(targets.table, 1000)
        render()
    }
    function render() {
        if (renderer.value) {
            renderer.value.render(scene.value, camera.value)
        }
    }
    /**
     * @description: 位置变换
     * @param targets 目标位置
     * @param duration 持续时间
     */
    function transform(targets: any[], duration: number) {
        TWEEN.removeAll()
        if (intervalTimer.value) {
            clearInterval(intervalTimer.value)
            intervalTimer.value = null
            randomBallData('sphere')
        }

        return new Promise((resolve) => {
            const objLength = objects.value.length
            const targetLength = targets.length
            
            // 检查数组长度是否匹配
            if (objLength !== targetLength) {
                console.warn(`Objects length (${objLength}) doesn't match targets length (${targetLength}), using minimum length`)
            }
            
            const minLength = Math.min(objLength, targetLength)
            
            for (let i = 0; i < minLength; ++i) {
                const object = objects.value[i]
                const target = targets[i]
                
                // 安全检查：确保 object 和 target 都存在且有 position 和 rotation 属性
                if (!object || !object.position || !object.rotation) {
                    console.warn(`Object at index ${i} is invalid, skipping animation`)
                    continue
                }
                
                if (!target || !target.position || !target.rotation) {
                    console.warn(`Target at index ${i} is invalid, skipping animation`)
                    continue
                }
                
                new TWEEN.Tween(object.position)
                    .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start()

                new TWEEN.Tween(object.rotation)
                    .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start()
                    .onComplete(() => {
                        if (luckyCardList.value.length) {
                            luckyCardList.value.forEach((cardIndex: any) => {
                                const item = objects.value[cardIndex]
                                if (item && item.element) {
                                    useElementStyle({
                                        element: item.element,
                                        person: {} as any,
                                        index: i,
                                        patternList: patternList.value,
                                        patternColor: patternColor.value,
                                        cardColor: cardColor.value,
                                        cardSize: cardSize.value,
                                        scale: 1,
                                        textSize: textSize.value,
                                        mod: 'sphere',
                                        cardOpacity: cardOpacity.value,
                                    })
                                }
                            })
                        }
                        luckyTargets.value = []
                        luckyCardList.value = []
                        canOperate.value = true
                    })
            }
            
            // 如果没有任何有效的动画，立即 resolve
            if (minLength === 0) {
                resolve(undefined)
                return
            }

            // 这个补间用来在位置与旋转补间同步执行，通过onUpdate在每次更新数据后渲染scene和camera
            new TWEEN.Tween({})
                .to({}, duration * 2)
                .onUpdate(render)
                .start()
                .onComplete(() => {
                    canOperate.value = true
                    resolve('')
                })
        })
    }
    /**
     * @description: 窗口大小改变时重新设置渲染器的大小
     */
    function onWindowResize() {
        camera.value.aspect = window.innerWidth / window.innerHeight
        camera.value.updateProjectionMatrix()

        renderer.value.setSize(window.innerWidth, window.innerHeight)
        render()
    }

    /**
     * [animation update all tween && controls]
     */
    function animation() {
        TWEEN.update()
        if (controls.value) {
            controls.value.update()
        }
        // 设置自动旋转
        // 设置相机位置
        animationFrameId.value = requestAnimationFrame(animation)
    }
    /**
     * @description: 旋转的动画
     * @param rotateY 绕y轴旋转圈数
     * @param duration 持续时间，单位秒
     */
    function rollBall(rotateY: number, duration: number) {
        TWEEN.removeAll()

        return new Promise((resolve) => {
            scene.value.rotation.y = 0
            ballRotationY.value = Math.PI * rotateY * 1000
            const rotateObj = new TWEEN.Tween(scene.value.rotation)
            rotateObj
                .to(
                    {
                        // x: Math.PI * rotateX * 1000,
                        x: 0,
                        y: ballRotationY.value,
                        // z: Math.PI * rotateZ * 1000
                        z: 0,
                    },
                    duration * 1000,
                )
                .onUpdate(render)
                .start()
                .onStop(() => {
                    resolve('')
                })
                .onComplete(() => {
                    resolve('')
                })
        })
    }
    /**
     * @description: 视野转回正面
     */
    function resetCamera() {
        new TWEEN.Tween(camera.value.position)
            .to(
                {
                    x: 0,
                    y: 0,
                    z: 3000,
                },
                1000,
            )
            .onUpdate(render)
            .start()
            .onComplete(() => {
                new TWEEN.Tween(camera.value.rotation)
                    .to(
                        {
                            x: 0,
                            y: 0,
                            z: 0,
                        },
                        1000,
                    )
                    .onUpdate(render)
                    .start()
                    .onComplete(() => {
                        canOperate.value = true
                        // camera.value.lookAt(scene.value.position)
                        camera.value.position.y = 0
                        camera.value.position.x = 0
                        camera.value.position.z = 3000
                        camera.value.rotation.x = 0
                        camera.value.rotation.y = 0
                        camera.value.rotation.z = -0
                        controls.value.reset()
                    })
            })
    }

    /**
     * @description: 开始抽奖音乐
     */
    function startLotteryMusic() {
        if (!isPlayWinMusic.value) {
            return
        }
        if (lotteryMusic.value) {
            lotteryMusic.value.pause()
            lotteryMusic.value = null
        }

        lotteryMusic.value = new Audio(worldCupAudio)
        lotteryMusic.value.loop = true
        lotteryMusic.value.volume = 0.7

        lotteryMusic.value.play().catch((error) => {
            console.error('播放抽奖音乐失败:', error)
        })
    }

    /**
     * @description: 停止抽奖音乐
     */
    function stopLotteryMusic() {
        if (!isPlayWinMusic.value) {
            return
        }
        if (lotteryMusic.value) {
            lotteryMusic.value.pause()
            lotteryMusic.value = null
        }
    }

    /**
     * @description: 播放结束音效
     */
    function playEndSound() {
        if (!isPlayWinMusic.value) {
            return
        }
        console.log('准备播放结束音效', dongSound)

        // 清理已结束的音频
        playingAudios.value = playingAudios.value.filter(audio => !audio.ended)

        try {
            const endSound = new Audio(dongSound)
            endSound.volume = 1.0

            // 简化播放逻辑
            const playPromise = endSound.play()

            if (playPromise) {
                playPromise
                    .then(() => {
                        console.log('结束音效播放成功')
                        playingAudios.value.push(endSound)
                    })
                    .catch((err) => {
                        console.error('播放失败:', err.name, err.message)
                        if (err.name === 'NotAllowedError') {
                            console.warn('自动播放被阻止，需用户交互后播放')
                        }
                    })
            }

            endSound.onended = () => {
                console.log('结束音效播放完成')
                const index = playingAudios.value.indexOf(endSound)
                if (index > -1)
                    playingAudios.value.splice(index, 1)
            }
        }
        catch (error) {
            console.error('创建音频对象失败:', error)
        }
    }

    /**
     * @description: 重置音频状态
     */
    function resetAudioState() {
        if (!isPlayWinMusic.value) {
            return
        }
        // 停止抽奖音乐
        stopLotteryMusic()

        // 清理所有正在播放的音频
        playingAudios.value.forEach((audio) => {
            if (!audio.ended && !audio.paused) {
                audio.pause()
            }
        })
        playingAudios.value = []
    }

    /**
     * @description: 开始抽奖，由横铺变换为球体（或其他图形）
     * @returns 随机抽取球数据
     */
    /// <IP_ADDRESS>description 进入抽奖准备状态
    async function enterLottery() {
        if (!canOperate.value) {
            return
        }

        // 进入抽奖时保留背景音乐，不淡出

        // 重置音频状态
        resetAudioState()

        // 预加载音频资源以解决浏览器自动播放策略
        try {
            const audioContext = window.AudioContext || (window as any).webkitAudioContext
            if (audioContext) {
                console.log('音频上下文可用')
            }
        }
        catch (e) {
            console.warn('音频上下文不可用:', e)
        }

        if (!intervalTimer.value) {
            randomBallData()
        }
        if (patternList.value.length) {
            for (let i = 0; i < patternList.value.length; i++) {
                if (i < rowCount.value * 7) {
                    objects.value[patternList.value[i] - 1].element.style.backgroundColor = rgba(cardColor.value, Math.max(0, Math.min(1, cardOpacity.value + (Math.random() - 0.5) * 0.1)))
                }
            }
        }
        canOperate.value = false
        await transform(targets.sphere, 1000)
        currentStatus.value = LotteryStatus.ready
        rollBall(0.1, 2000)
    }
    /**
     * @description 开始抽奖
     */
    function startLottery() {
        if (!canOperate.value) {
            return
        }
        // 验证是否已抽完全部奖项
        if (currentPrize.value.isUsed || !currentPrize.value) {
            toast.open({
                message: i18n.global.t('error.personIsAllDone'),
                type: 'warning',
                position: 'top-right',
                duration: 10000,
            })

            return
        }
        // personPool.value = currentPrize.value.isAll ? notThisPrizePersonList.value : notPersonList.value
        personPool.value = currentPrize.value.isAll ? [...notThisPrizePersonList.value] : [...notPersonList.value]
        // 验证抽奖人数是否还够
        if (personPool.value.length < currentPrize.value.count - currentPrize.value.isUsedCount) {
            toast.open({
                message: i18n.global.t('error.personNotEnough'),
                type: 'warning',
                position: 'top-right',
                duration: 10000,
            })

            return
        }
        // 默认置为单次抽奖最大个数
        luckyCount.value = SINGLE_TIME_MAX_PERSON_COUNT
        // 还剩多少人未抽
        let leftover = currentPrize.value.count - currentPrize.value.isUsedCount
        const customCount = currentPrize.value.separateCount
        if (customCount && customCount.enable && customCount.countList.length > 0) {
            for (let i = 0; i < customCount.countList.length; i++) {
                if (customCount.countList[i].isUsedCount < customCount.countList[i].count) {
                    // 根据自定义人数来抽取
                    leftover = customCount.countList[i].count - customCount.countList[i].isUsedCount
                    break
                }
            }
        }
        luckyCount.value = leftover < luckyCount.value ? leftover : luckyCount.value
        // 重构抽奖函数
        luckyTargets.value = getRandomElements(personPool.value, luckyCount.value)
        luckyTargets.value.forEach((item) => {
            const index = personPool.value.findIndex(person => person.id === item.id)
            if (index > -1) {
                personPool.value.splice(index, 1)
            }
        })

        toast.open({
            // message: `现在抽取${currentPrize.value.name} ${leftover}人`,
            message: i18n.global.t('error.startDraw', { count: currentPrize.value.name, leftover }),
            type: 'default',
            position: 'top-right',
            duration: 8000,
        })

        // 点击开始抽奖后，立即停止背景音乐（避免与抽奖音乐重叠）
        pauseBGM()

        // 开始播放抽奖音乐
        startLotteryMusic()

        currentStatus.value = LotteryStatus.running
        rollBall(10, 3000)
        
        // 球体进入快速转动后，发送状态到蓝牙设备
        sendBluetoothData('running')
            .then(() => {
                // 发送成功，不显示提示
            })
            .catch((error: any) => {
                console.error('发送蓝牙状态失败:', error)
                // 不显示错误提示，避免干扰用户体验
            })
        if (definiteTime.value) {
            setTimeout(() => {
                if (currentStatus.value === LotteryStatus.running) {
                    stopLottery()
                }
            }, definiteTime.value * 1000)
        }
    }
    /**
     * @description: 停止抽奖，抽出幸运人
     */
    async function stopLottery() {
        if (!canOperate.value) {
            return
        }
        // 停止抽奖音乐
        stopLotteryMusic()

        // 播放结束音效
        playEndSound()

        //   clearInterval(intervalTimer.value)
        //   intervalTimer.value = null
        canOperate.value = false
        rollBall(0, 1)

        const windowSize = { width: window.innerWidth, height: window.innerHeight }
        luckyTargets.value.forEach((person: IPersonConfig, index: number) => {
            const cardIndex = selectCard(luckyCardList.value, tableData.value.length, person.id)
            luckyCardList.value.push(cardIndex)
            const totalLuckyCount = luckyTargets.value.length
            const item = objects.value[cardIndex]
            const { xTable, yTable, scale } = useElementPosition(
                item,
                rowCount.value,
                totalLuckyCount,
                { width: cardSize.value.width, height: cardSize.value.height },
                windowSize,
                index,
            )
            // 找到中奖人员在 allPersonList 中的索引
            const originalIndex = allPersonList.value.findIndex(p => p.id === person.id)
            const personWithIndex = { ...person, originalIndex: originalIndex >= 0 ? originalIndex : cardIndex }
            new TWEEN.Tween(item.position)
                .to({
                    x: xTable,
                    y: yTable,
                    z: 1000,
                }, 1200)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onStart(() => {
                    item.element = useElementStyle({
                        element: item.element,
                        person: personWithIndex,
                        index: cardIndex,
                        patternList: patternList.value,
                        patternColor: patternColor.value,
                        cardColor: luckyColor.value,
                        cardSize: { width: cardSize.value.width, height: cardSize.value.height },
                        scale,
                        textSize: textSize.value,
                        mod: 'lucky',
                        cardOpacity: cardOpacity.value,
                    })
                })
                .start()
                .onComplete(() => {
                    canOperate.value = true
                    currentStatus.value = LotteryStatus.end
                })
            new TWEEN.Tween(item.rotation)
                .to({
                    x: 0,
                    y: 0,
                    z: 0,
                }, 900)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start()
                .onComplete(() => {
                    playWinMusic()

                    confettiFire()
                    resetCamera()
                })
        })
    }
    // 播放音频，中将卡片越多audio对象越多，声音越大
    function playWinMusic() {
        if (!isPlayWinMusic.value) {
            // 即使不播放中奖音效，也要在延迟后恢复背景音乐
            setTimeout(() => {
                fadeInBGM(1000)
            }, 500)
            return
        }
        // 清理已结束的音频
        playingAudios.value = playingAudios.value.filter(audio => !audio.ended && !audio.paused)

        if (playingAudios.value.length > maxAudioLimit) {
            console.log('音频播放数量已达到上限，请勿重复播放')
            // 即使达到上限，也要恢复背景音乐
            setTimeout(() => {
                fadeInBGM(1000)
            }, 500)
            return
        }

        const enterNewAudio = new Audio(enterAudio)
        enterNewAudio.volume = 0.8

        playingAudios.value.push(enterNewAudio)
        enterNewAudio.play()
            .then(() => {
                // 当音频播放结束后，从数组中移除，并恢复背景音乐
                enterNewAudio.onended = () => {
                    const index = playingAudios.value.indexOf(enterNewAudio)
                    if (index > -1) {
                        playingAudios.value.splice(index, 1)
                    }
                    // enter.wav 播放完成后，淡入背景音乐
                    fadeInBGM(1000)
                }
            })
            .catch((error) => {
                console.error('播放音频失败:', error)
                // 如果播放失败，也从数组中移除，并恢复背景音乐
                const index = playingAudios.value.indexOf(enterNewAudio)
                if (index > -1) {
                    playingAudios.value.splice(index, 1)
                }
                // 播放失败时也恢复背景音乐
                setTimeout(() => {
                    fadeInBGM(1000)
                }, 500)
            })

        // 播放错误时从数组中移除，并恢复背景音乐
        enterNewAudio.onerror = () => {
            const index = playingAudios.value.indexOf(enterNewAudio)
            if (index > -1) {
                playingAudios.value.splice(index, 1)
            }
            // 播放错误时也恢复背景音乐
            setTimeout(() => {
                fadeInBGM(1000)
            }, 500)
        }
    }
    /**
     * @description: 继续,意味着这抽奖作数，计入数据库
     */
    async function continueLottery() {
        if (!canOperate.value) {
            return
        }
        
        // 点击继续按钮后，背景音乐淡入
        fadeInBGM(1000)
        
        const customCount = currentPrize.value.separateCount
        if (customCount && customCount.enable && customCount.countList.length > 0) {
            for (let i = 0; i < customCount.countList.length; i++) {
                if (customCount.countList[i].isUsedCount < customCount.countList[i].count) {
                    customCount.countList[i].isUsedCount += luckyCount.value
                    break
                }
            }
        }
        currentPrize.value.isUsedCount += luckyCount.value
        luckyCount.value = 0
        if (currentPrize.value.isUsedCount >= currentPrize.value.count) {
            currentPrize.value.isUsed = true
            currentPrize.value.isUsedCount = currentPrize.value.count
        }
        personConfig.addAlreadyPersonList(luckyTargets.value, currentPrize.value)
        prizeConfig.updatePrizeConfig(currentPrize.value)
        
        // 恢复所有中奖卡牌的内容为 tableData 中对应的人员信息
        // 确保编号、姓名、部门一一对应
        if (luckyCardList.value.length > 0) {
            // 重新初始化 tableData，确保使用最新的人员列表
            tableData.value = initTableData({ allPersonList: allPersonList.value, rowCount: rowCount.value })
            
            // 恢复所有中奖卡牌的内容
            luckyCardList.value.forEach((cardIndex: number) => {
                if (cardIndex >= 0 && cardIndex < tableData.value.length && cardIndex < objects.value.length) {
                    const person = tableData.value[cardIndex]
                    // 确保 originalIndex 正确
                    const originalIndex = person.originalIndex !== undefined ? person.originalIndex : cardIndex
                    const personWithIndex = { ...person, originalIndex }
                    
                    // 恢复卡牌内容为 tableData 中对应的人员信息
                    objects.value[cardIndex].element = useElementStyle({
                        element: objects.value[cardIndex].element,
                        person: personWithIndex,
                        index: cardIndex,
                        patternList: patternList.value,
                        patternColor: patternColor.value,
                        cardColor: cardColor.value,
                        cardSize: { width: cardSize.value.width, height: cardSize.value.height },
                        scale: 1,
                        textSize: textSize.value,
                        mod: 'default',
                        cardOpacity: cardOpacity.value,
                    })
                    
                    // 更新映射
                    if (person && person.id) {
                        cardToPersonMap.value.set(cardIndex, person.id)
                    }
                }
            })
            // 清空中奖卡牌列表
            luckyCardList.value = []
        }
        
        await enterLottery()
    }
    /**
     * @description: 放弃本次抽奖，回到初始状态
     */
    function quitLottery() {
        // 停止抽奖音乐
        stopLotteryMusic()

        // 放弃抽奖时，恢复背景音乐
        fadeInBGM(1000)

        // 恢复所有中奖卡牌的内容为 tableData 中对应的人员信息
        // 确保编号、姓名、部门一一对应
        if (luckyCardList.value.length > 0) {
            // 重新初始化 tableData，确保使用最新的人员列表
            tableData.value = initTableData({ allPersonList: allPersonList.value, rowCount: rowCount.value })
            
            // 恢复所有中奖卡牌的内容
            luckyCardList.value.forEach((cardIndex: number) => {
                if (cardIndex >= 0 && cardIndex < tableData.value.length && cardIndex < objects.value.length) {
                    const person = tableData.value[cardIndex]
                    // 确保 originalIndex 正确
                    const originalIndex = person.originalIndex !== undefined ? person.originalIndex : cardIndex
                    const personWithIndex = { ...person, originalIndex }
                    
                    // 恢复卡牌内容为 tableData 中对应的人员信息
                    objects.value[cardIndex].element = useElementStyle({
                        element: objects.value[cardIndex].element,
                        person: personWithIndex,
                        index: cardIndex,
                        patternList: patternList.value,
                        patternColor: patternColor.value,
                        cardColor: cardColor.value,
                        cardSize: { width: cardSize.value.width, height: cardSize.value.height },
                        scale: 1,
                        textSize: textSize.value,
                        mod: 'default',
                        cardOpacity: cardOpacity.value,
                    })
                    
                    // 更新映射
                    if (person && person.id) {
                        cardToPersonMap.value.set(cardIndex, person.id)
                    }
                }
            })
            // 清空中奖卡牌列表
            luckyCardList.value = []
        }

        enterLottery()
        currentStatus.value = LotteryStatus.init
    }

    /**
     * @description: 随机替换卡片中的数据（不改变原有的值，只是显示）
     * @param {string} mod 模式
     */
    function randomBallData(mod: 'default' | 'lucky' | 'sphere' = 'default') {
        // 两秒执行一次
        intervalTimer.value = setInterval(() => {
            // 产生随机数数组
            const indexLength = 4
            const cardRandomIndexArr: number[] = []
            const personRandomIndexArr: number[] = []
            
            // 使用 Set 来跟踪已选择的卡牌和人员，避免重复
            const usedCardIndices = new Set<number>()
            const usedPersonIndices = new Set<number>()
            
            // 从映射中收集当前所有卡牌上显示的人员ID，确保实时准确
            const currentlyDisplayedPersonIds = new Set<number>()
            cardToPersonMap.value.forEach((personId, cardIdx) => {
                // 跳过中奖卡牌
                if (!luckyCardList.value.includes(cardIdx)) {
                    currentlyDisplayedPersonIds.add(personId)
                }
            })
            
            for (let i = 0; i < indexLength; i++) {
                let randomCardIndex: number
                let randomPersonIndex: number
                let cardAttempts = 0
                let personAttempts = 0
                const maxAttempts = 100 // 防止无限循环
                
                // 确保卡牌索引不重复且不在中奖列表中
                do {
                    randomCardIndex = Math.floor(Math.random() * (tableData.value.length - 1))
                    cardAttempts++
                } while (
                    (usedCardIndices.has(randomCardIndex) || 
                     luckyCardList.value.includes(randomCardIndex)) && 
                    cardAttempts < maxAttempts &&
                    tableData.value.length > usedCardIndices.size + luckyCardList.value.length
                )
                
                // 确保人员索引不重复，且不在当前显示的卡牌上
                do {
                    randomPersonIndex = Math.floor(Math.random() * (allPersonList.value.length - 1))
                    personAttempts++
                    const selectedPerson = allPersonList.value[randomPersonIndex]
                    // 检查：1. 人员索引不重复 2. 人员ID不在当前显示的卡牌上
                    if (selectedPerson && currentlyDisplayedPersonIds.has(selectedPerson.id)) {
                        // 如果这个人员已经在其他卡牌上显示，继续寻找
                        continue
                    }
                } while (
                    (usedPersonIndices.has(randomPersonIndex) || 
                     (allPersonList.value[randomPersonIndex] && currentlyDisplayedPersonIds.has(allPersonList.value[randomPersonIndex].id))) && 
                    personAttempts < maxAttempts &&
                    allPersonList.value.length > usedPersonIndices.size
                )
                
                // 如果达到最大尝试次数仍未找到，跳过本次循环
                if (cardAttempts >= maxAttempts || personAttempts >= maxAttempts) {
                    continue
                }
                
                const selectedPerson = allPersonList.value[randomPersonIndex]
                if (!selectedPerson) {
                    continue
                }
                
                usedCardIndices.add(randomCardIndex)
                usedPersonIndices.add(randomPersonIndex)
                // 将新选择的人员ID添加到已显示集合中
                currentlyDisplayedPersonIds.add(selectedPerson.id)
                cardRandomIndexArr.push(randomCardIndex)
                personRandomIndexArr.push(randomPersonIndex)
            }
            
            for (let i = 0; i < cardRandomIndexArr.length; i++) {
                if (!objects.value[cardRandomIndexArr[i]]) {
                    continue
                }
                // personRandomIndexArr[i] 就是该人员在 allPersonList 中的 originalIndex
                const person = allPersonList.value[personRandomIndexArr[i]]
                const personWithIndex = { ...person, originalIndex: personRandomIndexArr[i] }
                
                // 更新卡牌显示
                objects.value[cardRandomIndexArr[i]].element = useElementStyle({
                    element: objects.value[cardRandomIndexArr[i]].element,
                    person: personWithIndex,
                    index: cardRandomIndexArr[i],
                    patternList: patternList.value,
                    patternColor: patternColor.value,
                    cardColor: cardColor.value,
                    cardSize: { width: cardSize.value.width, height: cardSize.value.height },
                    textSize: textSize.value,
                    scale: 1,
                    mod,
                    type: 'change',
                    cardOpacity: cardOpacity.value,
                })
                
                // 更新映射：记录这个卡牌现在显示的人员ID
                cardToPersonMap.value.set(cardRandomIndexArr[i], person.id)
            }
        }, 200)
    }
    /**
     * @description: 键盘监听，快捷键操作
     */
    function listenKeyboard(e: any) {
        // ESC 键处理
        if (e.keyCode === 27 && currentStatus.value === LotteryStatus.running) {
            quitLottery()
            return
        }
        
        // 空格键处理
        if (e.keyCode === 32) {
            // 空格键：发送 "init" 消息到 MicroBlocks
            // 直接尝试发送，让 sendData 函数内部检查连接状态
            sendBluetoothData('init')
                .then(() => {
                    // 发送成功，不显示提示
                })
                .catch((error: any) => {
                    console.error('发送蓝牙消息失败:', error)
                    const errorMessage = error?.message || error?.toString() || '未知错误'
                    if (errorMessage.includes('设备未连接') || errorMessage.includes('未连接')) {
                        toast.open({
                            message: '蓝牙设备未连接或连接已断开。请先点击右上角蓝牙按钮连接设备。',
                            type: 'warning',
                            position: 'top-right',
                            duration: 3000,
                        })
                    } else {
                        toast.open({
                            message: `发送失败: ${errorMessage}`,
                            type: 'error',
                            position: 'top-right',
                            duration: 3000,
                        })
                    }
                })
            
            // 原有的空格键功能保持不变（需要 canOperate 检查）
            if (!canOperate.value) {
                return
            }
            
            switch (currentStatus.value) {
                case LotteryStatus.init:
                    enterLottery()
                    break
                case LotteryStatus.ready:
                    startLottery()
                    break
                case LotteryStatus.running:
                    stopLottery()
                    break
                case LotteryStatus.end:
                    continueLottery()
                    break
                default:
                    break
            }
        }
    }
    /**
     * @description: 清理资源，避免内存溢出
     */
    function cleanup() {
        // 停止所有Tween动画
        TWEEN.removeAll()

        // 清理动画循环
        if ((window as any).cancelAnimationFrame) {
            (window as any).cancelAnimationFrame(animationFrameId.value)
        }
        clearInterval(intervalTimer.value)
        intervalTimer.value = null

        // 停止抽奖音乐
        stopLotteryMusic()

        // 清理所有音频资源
        playingAudios.value.forEach((audio) => {
            if (!audio.ended && !audio.paused) {
                audio.pause()
            }
            // 释放音频资源
            audio.src = ''
            audio.load()
        })
        playingAudios.value = []

        if (scene.value) {
            scene.value.traverse((object: Object3D) => {
                if ((object as any).material) {
                    if (Array.isArray((object as any).material)) {
                        (object as any).material.forEach((material: Material) => {
                            material.dispose()
                        })
                    }
                    else {
                        (object as any).material.dispose()
                    }
                }
                if ((object as any).geometry) {
                    (object as any).geometry.dispose()
                }
                if ((object as any).texture) {
                    (object as any).texture.dispose()
                }
            })
            scene.value.clear()
        }

        if (objects.value) {
            objects.value.forEach((object) => {
                if (object.element) {
                    object.element.remove()
                }
            })
            objects.value = []
        }

        if (controls.value) {
            controls.value.removeEventListener('change')
            controls.value.dispose()
        }
        //   移除所有事件监听
        window.removeEventListener('resize', onWindowResize)
        scene.value = null
        camera.value = null
        renderer.value = null
        controls.value = null
    }
    /**
     * @description: 设置默认人员列表
     */
    function setDefaultPersonList() {
        personConfig.setDefaultPersonList()
        // 刷新页面
        window.location.reload()
    }
    const init = () => {
        const startTime = Date.now()
        const maxWaitTime = 2000 // 2秒

        const checkAndInit = () => {
            // 如果人员列表有数据或者等待时间超过2秒，则执行初始化
            if (allPersonList.value.length > 0 || (Date.now() - startTime) >= maxWaitTime) {
                console.log('初始化完成')
                tableData.value = initTableData({ allPersonList: allPersonList.value, rowCount: rowCount.value })
                initThreeJs()
                animation()
                containerRef.value!.style.color = `${textColor}`
                randomBallData()
                window.addEventListener('keydown', listenKeyboard)
                isInitialDone.value = true
            }
            else {
                console.log('等待人员列表数据...')
                // 继续等待
                setTimeout(checkAndInit, 100) // 每100毫秒检查一次
            }
        }

        checkAndInit()
    }
    // 监听用户交互事件，用于触发背景音乐播放
    function setupUserInteractionListener() {
        const events = ['click', 'touchstart', 'keydown']
        const handleInteraction = () => {
            bgmUserInteraction()
            // 移除所有事件监听器（只需要一次交互）
            events.forEach(event => {
                document.removeEventListener(event, handleInteraction)
            })
        }
        
        events.forEach(event => {
            document.addEventListener(event, handleInteraction, { once: true, passive: true })
        })
    }

    // 监听卡片透明度变化，实时更新所有卡片
    watch(cardOpacity, (newOpacity) => {
        if (!objects.value || objects.value.length === 0) {
            return
        }
        
        const baseOpacity = newOpacity ?? 0.5
        const opacityVariation = 0.1
        
        objects.value.forEach((object, index) => {
            if (object.element) {
                const element = object.element
                const isPattern = patternList.value.includes(index + 1)
                
                if (isPattern) {
                    // 图案卡片使用较高的透明度
                    const patternOpacity = Math.min(1, baseOpacity + opacityVariation * 2 + Math.random() * 0.2)
                    element.style.backgroundColor = rgba(patternColor.value, patternOpacity)
                } else {
                    // 普通卡片使用配置的透明度，允许小幅随机变化
                    const randomVariation = (Math.random() - 0.5) * opacityVariation * 2
                    const cardOpacityValue = Math.max(0, Math.min(1, baseOpacity + randomVariation))
                    element.style.backgroundColor = rgba(cardColor.value, cardOpacityValue)
                }
            }
        })
    }, { immediate: false })

    // 蓝牙相关功能
    const { 
        isConnected: isBluetoothConnected, 
        connect: connectBluetooth, 
        disconnect: disconnectBluetooth,
        receivedMessages: bluetoothMessages,
        sendData: sendBluetoothData
    } = useBluetooth()

    // 处理蓝牙触发抽奖（兼容旧版本，根据当前状态自动判断）
    function handleBluetoothTrigger() {
        // 只有在 ready 状态时才触发抽奖
        if (currentStatus.value === LotteryStatus.ready) {
            startLottery()
            toast.open({
                message: '蓝牙按钮触发抽奖',
                type: 'success',
                position: 'top-right',
                duration: 2000,
            })
        } else if (currentStatus.value === LotteryStatus.running) {
            // 如果正在抽奖，可以触发停止
            stopLottery()
            toast.open({
                message: '蓝牙按钮停止抽奖',
                type: 'info',
                position: 'top-right',
                duration: 2000,
            })
        } else {
            toast.open({
                message: `当前状态无法触发抽奖（状态：${currentStatus.value}）`,
                type: 'warning',
                position: 'top-right',
                duration: 2000,
            })
        }
    }

    // 处理蓝牙状态特定动作
    function handleBluetoothAction(event: CustomEvent) {
        const { action, message } = event.detail
        
        switch (action) {
            case 'enter':
                // 1. 进入抽奖（init/end → ready）
                if (currentStatus.value === LotteryStatus.init || currentStatus.value === LotteryStatus.end) {
                    enterLottery()
                    toast.open({
                        message: `蓝牙消息 "${message}"：进入抽奖`,
                        type: 'success',
                        position: 'top-right',
                        duration: 2000,
                    })
                } else {
                    toast.open({
                        message: `当前状态无法执行"进入抽奖"操作（状态：${currentStatus.value}）`,
                        type: 'warning',
                        position: 'top-right',
                        duration: 2000,
                    })
                }
                break
                
            case 'start':
                // 2. 开始抽奖（ready → running）
                if (currentStatus.value === LotteryStatus.ready) {
                    startLottery()
                    // 不显示成功提示
                } else {
                    toast.open({
                        message: `当前状态无法执行"开始抽奖"操作（状态：${currentStatus.value}）`,
                        type: 'warning',
                        position: 'top-right',
                        duration: 2000,
                    })
                }
                break
                
            case 'stop':
                // 3. 抽取幸运儿（running → end）
                if (currentStatus.value === LotteryStatus.running) {
                    stopLottery()
                    // 不显示成功提示
                } else {
                    toast.open({
                        message: `当前状态无法执行"抽取幸运儿"操作（状态：${currentStatus.value}）`,
                        type: 'warning',
                        position: 'top-right',
                        duration: 2000,
                    })
                }
                break
                
            case 'continue':
                // 4. 继续（end → ready）
                if (currentStatus.value === LotteryStatus.end) {
                    continueLottery()
                    // 不显示成功提示
                } else {
                    toast.open({
                        message: `当前状态无法执行"继续"操作（状态：${currentStatus.value}）`,
                        type: 'warning',
                        position: 'top-right',
                        duration: 2000,
                    })
                }
                break
                
            default:
                console.warn('未知的蓝牙动作:', action)
        }
    }

    onMounted(() => {
        init()
        // 设置用户交互监听
        setupUserInteractionListener()
        // 尝试自动播放背景音乐（可能会被浏览器阻止，等待用户交互）
        setTimeout(() => {
            startBGM()
        }, 1000)
        // 监听蓝牙触发事件（兼容旧版本）
        window.addEventListener('lottery-trigger', handleBluetoothTrigger)
        // 监听来自 RightButton 的蓝牙触发事件
        window.addEventListener('bluetooth-trigger-lottery', handleBluetoothTrigger)
        // 监听蓝牙状态特定动作事件
        window.addEventListener('lottery-action', handleBluetoothAction as EventListener)
    })

    onUnmounted(() => {
        nextTick(() => {
            cleanup()
        })
        clearInterval(intervalTimer.value)
        // 注意：不在这里停止背景音乐，因为背景音乐应该在全局范围内持续播放
        // 背景音乐由 useBackgroundMusicInstance 全局管理，不应该因为页面切换而停止
        intervalTimer.value = null
        window.removeEventListener('keydown', listenKeyboard)
        // 清理蓝牙事件监听（不在这里断开连接，因为蓝牙连接在 RightButton 中管理）
        window.removeEventListener('lottery-trigger', handleBluetoothTrigger)
        window.removeEventListener('bluetooth-trigger-lottery', handleBluetoothTrigger)
        window.removeEventListener('lottery-action', handleBluetoothAction as EventListener)
    })

    return {
        setDefaultPersonList,
        startLottery,
        continueLottery,
        quitLottery,
        containerRef,
        stopLottery,
        enterLottery,
        tableData,
        currentStatus,
        isInitialDone,
        titleFont,
        titleFontSyncGlobal,
    }
}
