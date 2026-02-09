// src/types/window.d.ts
interface FontData {
    family: string
    fullName: string
    postscriptName: string
    style: string
    blob: () => Promise<Blob>
}

interface Window {
    queryLocalFonts?: (options?) => Promise<FontData[]>
}

// Web Bluetooth API 类型定义
interface BluetoothRemoteGATTCharacteristic extends EventTarget {
    service: BluetoothRemoteGATTService
    uuid: string
    properties: BluetoothCharacteristicProperties
    readValue(): Promise<DataView>
    writeValue(value: BufferSource): Promise<void>
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
    addEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void
    removeEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void
}

interface BluetoothCharacteristicProperties {
    broadcast: boolean
    read: boolean
    writeWithoutResponse: boolean
    write: boolean
    notify: boolean
    indicate: boolean
    authenticatedSignedWrites: boolean
    reliableWrite: boolean
    writableAuxiliaries: boolean
}

interface BluetoothRemoteGATTService extends EventTarget {
    device: BluetoothDevice
    uuid: string
    getCharacteristic(characteristic: string | number): Promise<BluetoothRemoteGATTCharacteristic>
    getCharacteristics(characteristic?: string | number): Promise<BluetoothRemoteGATTCharacteristic[]>
}

interface BluetoothDevice extends EventTarget {
    id: string
    name?: string
    gatt?: BluetoothRemoteGATTServer
    addEventListener(type: 'gattserverdisconnected', listener: (event: Event) => void): void
    removeEventListener(type: 'gattserverdisconnected', listener: (event: Event) => void): void
}

interface BluetoothRemoteGATTServer {
    device: BluetoothDevice
    connected: boolean
    connect(): Promise<BluetoothRemoteGATTServer>
    disconnect(): void
    getPrimaryService(service: string | number): Promise<BluetoothRemoteGATTService>
    getPrimaryServices(service?: string | number): Promise<BluetoothRemoteGATTService[]>
}

interface BluetoothRequestDeviceOptions {
    filters?: BluetoothLEScanFilter[]
    optionalServices?: (string | number)[]
    acceptAllDevices?: boolean
}

interface BluetoothLEScanFilter {
    services?: (string | number)[]
    name?: string
    namePrefix?: string
    manufacturerData?: BluetoothManufacturerDataFilter[]
    serviceData?: BluetoothServiceDataFilter[]
}

interface BluetoothManufacturerDataFilter {
    companyIdentifier: number
    dataPrefix?: BufferSource
    mask?: BufferSource
}

interface BluetoothServiceDataFilter {
    service: string | number
    dataPrefix?: BufferSource
    mask?: BufferSource
}

interface Bluetooth extends EventTarget {
    requestDevice(options?: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>
    getAvailability(): Promise<boolean>
    addEventListener(type: 'availabilitychanged', listener: (event: Event) => void): void
    removeEventListener(type: 'availabilitychanged', listener: (event: Event) => void): void
}

interface Navigator {
    bluetooth?: Bluetooth
}
