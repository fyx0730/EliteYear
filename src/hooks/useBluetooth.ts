import { ref } from 'vue'

const MICROBLOCKS_SERVICE_UUID = 'bb37a001-b922-4018-8e74-e14824b3a638'
const MICROBLOCKS_RX_CHAR_UUID = 'bb37a002-b922-4018-8e74-e14824b3a638' // board receive characteristic
const MICROBLOCKS_TX_CHAR_UUID = 'bb37a003-b922-4018-8e74-e14824b3a638' // board transmit characteristic

// 全局蓝牙状态（单例模式）
const globalBluetoothState = {
    isConnected: ref(false),
    device: ref<BluetoothDevice | null>(null),
    rxCharacteristic: ref<BluetoothRemoteGATTCharacteristic | null>(null),
    txCharacteristic: ref<BluetoothRemoteGATTCharacteristic | null>(null),
    messageBuffer: ref<Uint8Array>(new Uint8Array()),
    receivedMessages: ref<string[]>([])
}

export function useBluetooth() {
    // 使用全局状态
    const isConnected = globalBluetoothState.isConnected
    const device = globalBluetoothState.device
    const rxCharacteristic = globalBluetoothState.rxCharacteristic
    const txCharacteristic = globalBluetoothState.txCharacteristic
    const messageBuffer = globalBluetoothState.messageBuffer
    const receivedMessages = globalBluetoothState.receivedMessages

    // 检查浏览器支持
    function checkSupport(): boolean {
        if (!navigator.bluetooth) {
            console.error('浏览器不支持 Web Bluetooth API')
            return false
        }
        return true
    }

    // 连接设备
    async function connect() {
        if (!checkSupport()) {
            throw new Error('浏览器不支持 Web Bluetooth API，请使用 Chrome 或 Edge 浏览器')
        }

        try {
            // 请求设备连接
            if (!navigator.bluetooth) {
                throw new Error('浏览器不支持 Web Bluetooth API')
            }
            device.value = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: [MICROBLOCKS_SERVICE_UUID] }
                ]
            })

            // 监听断开连接事件
            device.value.addEventListener('gattserverdisconnected', () => {
                isConnected.value = false
                console.log('蓝牙连接已断开')
            })

            // 连接到 GATT 服务器
            const server = await device.value.gatt!.connect()
            const service = await server.getPrimaryService(MICROBLOCKS_SERVICE_UUID)

            // 获取 RX 和 TX 特征
            const [rx, tx] = await Promise.all([
                service.getCharacteristic(MICROBLOCKS_RX_CHAR_UUID),
                service.getCharacteristic(MICROBLOCKS_TX_CHAR_UUID)
            ])

            rxCharacteristic.value = rx
            txCharacteristic.value = tx

            // 订阅 TX 特征的通知（接收设备发送的数据）
            await txCharacteristic.value.startNotifications()
            txCharacteristic.value.addEventListener('characteristicvaluechanged', handleNotifications)

            isConnected.value = true
            console.log('蓝牙连接成功')

            return true
        } catch (error: any) {
            console.error('蓝牙连接失败:', error)
            isConnected.value = false
            
            // 提供更友好的错误信息
            if (error.name === 'NotFoundError') {
                throw new Error('未找到 MicroBlocks 设备，请确保设备已开启并处于可发现状态')
            } else if (error.name === 'SecurityError') {
                throw new Error('蓝牙权限被拒绝，请在浏览器设置中允许蓝牙访问')
            } else if (error.name === 'NetworkError') {
                throw new Error('蓝牙连接失败，请检查设备是否在范围内')
            } else {
                throw error
            }
        }
    }

    // 断开连接
    async function disconnect() {
        try {
            if (txCharacteristic.value) {
                await txCharacteristic.value.stopNotifications()
                txCharacteristic.value.removeEventListener('characteristicvaluechanged', handleNotifications)
            }
            if (device.value?.gatt?.connected) {
                device.value.gatt.disconnect()
            }
        } catch (error) {
            console.error('断开连接时出错:', error)
        } finally {
            isConnected.value = false
            device.value = null
            rxCharacteristic.value = null
            txCharacteristic.value = null
            messageBuffer.value = new Uint8Array()
            receivedMessages.value = []
        }
    }

    // 发送数据到设备
    async function sendData(data: string) {
        // 如果当前实例没有设备，尝试从全局获取（通过事件）
        if (!device.value) {
            // 触发事件请求其他实例的设备信息
            const deviceRequestEvent = new CustomEvent('bluetooth-request-device')
            window.dispatchEvent(deviceRequestEvent)
            throw new Error('设备未连接：当前实例未连接设备。请确保已通过右上角蓝牙按钮连接设备。')
        }
        
        // 检查实际的 GATT 连接状态
        if (!device.value.gatt?.connected) {
            // 如果设备存在但未连接，尝试重新连接
            try {
                if (!device.value.gatt) {
                    throw new Error('GATT 服务器不可用')
                }
                await device.value.gatt.connect()
                // 重新连接后，更新连接状态
                isConnected.value = true
            } catch (error: any) {
                isConnected.value = false
                throw new Error(`设备未连接：GATT 连接已断开，无法重新连接。${error.message || error}`)
            }
        }
        
        // 如果 RX 特征未初始化，尝试重新获取
        if (!rxCharacteristic.value) {
            try {
                const server = device.value.gatt
                if (!server) {
                    throw new Error('GATT 服务器不可用')
                }
                const service = await server.getPrimaryService(MICROBLOCKS_SERVICE_UUID)
                rxCharacteristic.value = await service.getCharacteristic(MICROBLOCKS_RX_CHAR_UUID)
            } catch (error: any) {
                throw new Error(`设备未连接：无法获取 RX 特征。${error.message || error}`)
            }
        }

        try {
            const encoder = new TextEncoder()
            const dataBytes = encoder.encode(data)
            const length = dataBytes.length + 1

            // MicroBlocks 消息格式: [251, 27, 0, length % 256, length / 256, ...data, 254]
            const bytes = new Uint8Array([
                251, // 长消息标识
                27,  // 命令码（文本消息）
                0,   // 保留
                length % 256,
                Math.floor(length / 256),
                ...dataBytes,
                254  // 结束符
            ])

            await rxCharacteristic.value.writeValue(bytes)
            console.log('数据已发送:', data)
        } catch (error) {
            console.error('发送数据失败:', error)
            throw error
        }
    }

    // 解析 MicroBlocks 消息格式
    function matchMessages(filter: number): Uint8Array[] {
        const buf = messageBuffer.value
        const result: Uint8Array[] = []
        let i = 0
        const length = buf.length

        while (true) {
            // 跳过到下一个消息的开始（250 或 251）
            while (i < length && buf[i] !== 250 && buf[i] !== 251) {
                i += 1
            }

            const bytesRemaining = length - i
            if (bytesRemaining < 1) {
                messageBuffer.value = buf.slice(i)
                return result
            }

            const cmd = buf[i]

            // 短消息（3字节）：250 + filter + data
            if (cmd === 250 && bytesRemaining >= 3) {
                if (filter === buf[i + 1]) {
                    result.push(buf.slice(i, i + 3))
                }
                i += 3
            }
            // 长消息（>=5字节）：251 + filter + 0 + length_low + length_high + data + 254
            else if (cmd === 251 && bytesRemaining >= 5) {
                const msgLen = 256 * buf[i + 4] + buf[i + 3]
                const end = i + 5 + msgLen

                if (end > length) {
                    // 长消息还未完整接收
                    messageBuffer.value = buf.slice(i)
                    return result
                }

                if (filter === buf[i + 1]) {
                    result.push(buf.slice(i, end))
                }
                i = end
            } else {
                // 消息不完整，保留剩余数据
                messageBuffer.value = buf.slice(i)
                return result
            }
        }
    }

    // 处理接收到的通知
    function handleNotifications(event: Event) {
        const target = event.target as BluetoothRemoteGATTCharacteristic
        if (!target.value) return

        const msg = new Uint8Array(target.value.buffer)
        messageBuffer.value = new Uint8Array([...messageBuffer.value, ...msg])

        // 解析命令码 27 的消息（文本消息）
        const messages = matchMessages(27)
        const results: string[] = []

        for (const msgBytes of messages) {
            // 消息格式: [251, 27, 0, length_low, length_high, ...data, 254]
            // length 字段表示数据长度 + 1（包括结束符 254）
            if (msgBytes.length < 6) {
                console.warn('消息太短，跳过:', msgBytes)
                continue
            }
            
            // 检查结束符位置
            const lastByte = msgBytes[msgBytes.length - 1]
            const hasEndMarker = lastByte === 254
            
            // 从消息头读取长度
            const msgLen = 256 * msgBytes[4] + msgBytes[3]
            const expectedTotalLength = 5 + msgLen // 消息头(5) + 数据 + 结束符
            
            // 计算实际可用的数据长度
            // 优先使用消息头中的 length 字段，但如果消息不完整，使用实际可用长度
            let dataLength: number
            let dataEnd: number
            
            if (hasEndMarker) {
                // 有结束符，使用 length 字段计算（length 包括结束符）
                dataLength = msgLen - 1
                dataEnd = msgBytes.length - 1 // 到结束符之前
            } else {
                // 没有结束符，可能是消息不完整，使用实际可用长度
                dataLength = msgBytes.length - 5
                dataEnd = msgBytes.length
            }
            
            // 如果根据 length 字段计算的数据长度与实际消息长度不匹配，
            // 可能是 ESP32 发送的 length 字段有误，尝试从实际消息长度推断
            const actualAvailableData = msgBytes.length - 5 - (hasEndMarker ? 1 : 0)
            if (dataLength !== actualAvailableData && hasEndMarker) {
                console.warn('length 字段与实际数据长度不匹配，使用实际数据长度', {
                    lengthFromHeader: dataLength,
                    actualAvailableData,
                    msgLen,
                    msgBytesLength: msgBytes.length
                })
                // 使用实际可用的数据长度
                dataLength = actualAvailableData
            }
            
            // 提取数据部分：从索引 5 开始
            const dataStart = 5
            const dataBytes = msgBytes.slice(dataStart, dataEnd)
            
            const decoder = new TextDecoder('utf-8', { fatal: false })
            let text = decoder.decode(dataBytes)
            
            // 移除空字符和无效字符
            text = text.replace(/\x00/g, '').trim()
            
            if (text.length > 0) {
                results.push(text)
            }
        }

        if (results.length > 0) {
            receivedMessages.value = [...receivedMessages.value, ...results]

            // 触发自定义事件，供外部监听
            window.dispatchEvent(new CustomEvent('bluetooth-message', {
                detail: results
            }))

            // 根据消息内容触发不同的事件
            let hasSpecificAction = false
            for (const msg of results) {
                const upperMsg = msg.toUpperCase().trim()
                
                // 1. 进入抽奖（init/end → ready）
                const enterKeywords = ['ENTER', 'READY', '进入', '准备']
                if (enterKeywords.some(keyword => upperMsg.includes(keyword.toUpperCase()))) {
                    window.dispatchEvent(new CustomEvent('lottery-action', { detail: { action: 'enter', message: msg } }))
                    hasSpecificAction = true
                    continue
                }
                
                // 2. 开始抽奖（ready → running）
                const startKeywords = ['START', 'BEGIN', '开始']
                if (startKeywords.some(keyword => upperMsg.includes(keyword.toUpperCase()))) {
                    window.dispatchEvent(new CustomEvent('lottery-action', { detail: { action: 'start', message: msg } }))
                    hasSpecificAction = true
                    continue
                }
                
                // 3. 抽取幸运儿（running → end）
                const stopKeywords = ['STOP', 'END', '停止', '抽取', '幸运儿']
                if (stopKeywords.some(keyword => upperMsg.includes(keyword.toUpperCase()))) {
                    window.dispatchEvent(new CustomEvent('lottery-action', { detail: { action: 'stop', message: msg } }))
                    hasSpecificAction = true
                    continue
                }
                
                // 4. 继续（end → ready）
                const continueKeywords = ['CONTINUE', 'NEXT', '继续', '下一轮']
                if (continueKeywords.some(keyword => upperMsg.includes(keyword.toUpperCase()))) {
                    window.dispatchEvent(new CustomEvent('lottery-action', { detail: { action: 'continue', message: msg } }))
                    hasSpecificAction = true
                    continue
                }
            }
            
            // 兼容旧版本：如果没有匹配到特定动作，使用通用触发（根据当前状态自动判断）
            if (!hasSpecificAction) {
                const legacyKeywords = ['TRIGGER', '抽奖']
                if (results.some(msg => legacyKeywords.some(keyword => msg.toUpperCase().includes(keyword)))) {
                    window.dispatchEvent(new CustomEvent('lottery-trigger'))
                }
            }
        }
    }

    // 注意：不在 onUnmounted 中自动断开连接
    // 因为多个组件可能共享同一个蓝牙连接
    // 连接应该由用户手动控制，或者在整个应用关闭时才断开

    return {
        isConnected,
        receivedMessages,
        connect,
        disconnect,
        sendData
    }
}
