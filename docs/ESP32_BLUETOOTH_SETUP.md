# ESP32 蓝牙抽奖按钮设置指南

## 概述

本项目支持通过 ESP32 + MicroBlocks BLE 协议实现蓝牙按钮触发抽奖功能。

## 方案选择

### 方案1：使用 MicroBlocks（推荐）

MicroBlocks 是一个图形化编程环境，支持 ESP32，使用简单。

#### 步骤：

1. **安装 MicroBlocks**
   - 下载地址：https://microblocks.fun/
   - 支持 Windows、Mac、Linux

2. **连接 ESP32**
   - 使用 USB 线连接 ESP32 到电脑
   - 在 MicroBlocks 中选择对应的串口

3. **编写代码**
   ```
   当按钮按下时
     发送消息 "TRIGGER" 通过 BLE
   结束
   ```

4. **上传代码**
   - 点击 MicroBlocks 的"上传"按钮
   - 等待上传完成

### 方案2：使用 Arduino IDE

如果你熟悉 Arduino，可以使用以下代码：

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

#define SERVICE_UUID "bb37a001-b922-4018-8e74-e14824b3a638"
#define RX_CHAR_UUID "bb37a002-b922-4018-8e74-e14824b3a638"
#define TX_CHAR_UUID "bb37a003-b922-4018-8e74-e14824b3a638"

BLEServer* pServer = NULL;
BLECharacteristic* pTxCharacteristic = NULL;
bool deviceConnected = false;

const int buttonPin = 0; // GPIO0 (ESP32开发板上的BOOT按钮)
bool lastButtonState = HIGH;
bool currentButtonState = HIGH;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("设备已连接");
    }
    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("设备已断开");
    }
};

// 发送 MicroBlocks 格式的消息
void sendMicroBlocksMessage(String text) {
    if (!deviceConnected || !pTxCharacteristic) return;
    
    uint8_t length = text.length() + 1;
    uint8_t message[5 + text.length() + 1];
    
    message[0] = 251;  // 长消息标识
    message[1] = 27;   // 命令码（文本消息）
    message[2] = 0;    // 保留
    message[3] = length % 256;
    message[4] = length / 256;
    
    // 复制文本数据
    for (int i = 0; i < text.length(); i++) {
        message[5 + i] = text.charAt(i);
    }
    message[5 + text.length()] = 254; // 结束符
    
    pTxCharacteristic->setValue(message, 5 + text.length() + 1);
    pTxCharacteristic->notify();
    Serial.println("发送消息: " + text);
}

void setup() {
    Serial.begin(115200);
    pinMode(buttonPin, INPUT_PULLUP);
    
    // 初始化 BLE
    BLEDevice::init("抽奖按钮"); // 蓝牙设备名称
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());
    
    BLEService *pService = pServer->createService(SERVICE_UUID);
    
    // 创建 TX 特征（用于发送数据到客户端）
    pTxCharacteristic = pService->createCharacteristic(
        TX_CHAR_UUID,
        BLECharacteristic::PROPERTY_READ |
        BLECharacteristic::PROPERTY_NOTIFY
    );
    
    pTxCharacteristic->setValue("Ready");
    pService->start();
    
    // 开始广播
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(false);
    pAdvertising->setMinPreferred(0x0);
    BLEDevice::startAdvertising();
    
    Serial.println("等待客户端连接...");
}

void loop() {
    // 检测按钮按下（下降沿触发）
    currentButtonState = digitalRead(buttonPin);
    
    if (lastButtonState == HIGH && currentButtonState == LOW && deviceConnected) {
        // 发送触发信号
        sendMicroBlocksMessage("TRIGGER");
        delay(200); // 防抖
    }
    
    lastButtonState = currentButtonState;
    delay(10);
}
```

#### 需要的库：

在 Arduino IDE 中安装以下库：
- ESP32 BLE Arduino（通常已包含在 ESP32 开发板支持包中）

## 硬件连接

### ESP32 开发板按钮

- **GPIO0 (BOOT按钮)**：ESP32 开发板上通常有一个 BOOT 按钮连接到 GPIO0
- **自定义按钮**：你也可以连接外部按钮到任意 GPIO 引脚

### 外部按钮连接（可选）

如果需要使用外部按钮：

```
ESP32         按钮
GPIO2  --------[按钮]-------- GND
```

注意：需要添加上拉电阻或使用 `INPUT_PULLUP` 模式。

## 使用步骤

1. **上传代码到 ESP32**
   - 使用 MicroBlocks 或 Arduino IDE 上传代码

2. **打开抽奖页面**
   - 使用 Chrome 或 Edge 浏览器（Safari 不支持 Web Bluetooth）
   - 访问抽奖页面

3. **连接蓝牙**
   - 点击页面右上角的"连接蓝牙"按钮
   - 在浏览器弹出的设备选择对话框中选择你的 ESP32 设备
   - 等待连接成功（按钮变为绿色"蓝牙已连接"）

4. **触发抽奖**
   - 按下 ESP32 上的按钮
   - 如果当前状态为"准备抽奖"，会自动触发抽奖
   - 如果正在抽奖，按下按钮会停止抽奖

## 故障排除

### 1. 浏览器不支持 Web Bluetooth

**问题**：点击连接按钮没有反应

**解决**：
- 使用 Chrome 或 Edge 浏览器
- Safari 不支持 Web Bluetooth API

### 2. 找不到设备

**问题**：浏览器设备选择对话框中没有显示设备

**解决**：
- 确保 ESP32 已上电并运行代码
- 检查 ESP32 是否在广播（Serial Monitor 应该显示"等待客户端连接..."）
- 尝试重启 ESP32
- 确保设备在蓝牙范围内（5-10米）

### 3. 连接失败

**问题**：选择设备后连接失败

**解决**：
- 检查 ESP32 Serial Monitor 是否有错误信息
- 确保代码正确上传
- 尝试重新上传代码
- 检查蓝牙权限（浏览器可能会要求权限）

### 4. 按钮无响应

**问题**：按下按钮但没有触发抽奖

**解决**：
- 检查 Serial Monitor 是否显示"发送消息: TRIGGER"
- 检查页面右上角蓝牙连接状态（应该是"蓝牙已连接"）
- 检查当前抽奖状态（只有在"准备抽奖"状态才能触发）
- 查看浏览器控制台是否有错误信息

## 消息格式说明

MicroBlocks BLE 协议使用特定的消息格式：

- **短消息**：`[250, 命令码, 数据]`（3字节）
- **长消息**：`[251, 命令码, 0, 长度低字节, 长度高字节, ...数据..., 254]`

本项目监听命令码 `27`（文本消息），当收到包含 "TRIGGER"、"START"、"开始"、"抽奖" 等关键词的消息时会触发抽奖。

## 自定义消息

你可以修改 ESP32 代码发送不同的消息：

- `"TRIGGER"` - 触发抽奖
- `"START"` - 开始抽奖
- `"STOP"` - 停止抽奖（如果正在抽奖）

## 注意事项

1. **浏览器要求**：必须使用 Chrome 或 Edge 浏览器
2. **HTTPS 要求**：Web Bluetooth API 在 HTTPS 或 localhost 下才能工作
3. **距离限制**：蓝牙有效距离通常为 5-10 米
4. **电池供电**：ESP32 可以使用电池供电，但需要注意功耗
5. **多设备**：同一时间只能连接一个设备

## 技术支持

如有问题，请检查：
1. 浏览器控制台（F12）的错误信息
2. ESP32 Serial Monitor 的输出
3. 蓝牙连接状态指示
