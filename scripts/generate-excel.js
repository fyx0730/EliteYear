import * as XLSX from 'xlsx'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { writeFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 中文姓氏
const surnames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧', '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕', '苏', '卢', '蒋', '蔡', '贾', '丁', '魏', '薛', '叶', '阎']

// 中文名字（常用字）
const givenNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '建华', '文', '华', '红', '玉', '辉', '鹏', '飞', '雪', '梅', '兰', '竹', '菊', '松', '柏', '山', '水', '云', '月', '星', '阳', '光', '明', '亮', '清', '新', '春', '夏', '秋', '冬']

// 部门列表
const departments = ['技术部', '产品部', '设计部', '运营部', '市场部', '销售部', '人事部', '财务部', '行政部', '研发部', '测试部', '客服部', '商务部', '法务部', '采购部']

// 生成随机中文姓名
function generateChineseName() {
    const surname = surnames[Math.floor(Math.random() * surnames.length)]
    const givenNameLength = Math.random() > 0.7 ? 2 : 1 // 70%概率单字名，30%概率双字名
    let givenName = ''
    for (let i = 0; i < givenNameLength; i++) {
        givenName += givenNames[Math.floor(Math.random() * givenNames.length)]
    }
    return surname + givenName
}

// 生成随机部门
function generateDepartment() {
    return departments[Math.floor(Math.random() * departments.length)]
}

// 生成170人的数据
// 注意：表头必须与模板文件一致：uid, name, avatar, department, identity
function generatePersonData() {
    const data = []
    for (let i = 1; i <= 170; i++) {
        data.push({
            'uid': i.toString(), // 使用序号作为编号（虽然导入时会忽略，但表头必须匹配）
            'name': generateChineseName(),
            'avatar': '', // 头像留空，可以后续添加
            'department': generateDepartment(),
            'identity': '' // 身份字段留空（导入时会自动移除）
        })
    }
    return data
}

// 生成Excel文件
function generateExcel() {
    const data = generatePersonData()
    
    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(data)
    
    // 设置列宽
    worksheet['!cols'] = [
        { wch: 10 }, // 编号
        { wch: 15 }, // 姓名
        { wch: 15 }, // 部门
        { wch: 50 }  // 头像
    ]
    
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    
    // 保存文件
    const outputPath = join(__dirname, '..', 'public', '人口登记表-170人.xlsx')
    XLSX.writeFile(workbook, outputPath)
    
    console.log(`✅ Excel文件已生成: ${outputPath}`)
    console.log(`📊 共生成 ${data.length} 条数据`)
    console.log(`\n字段说明:`)
    console.log(`- 编号: 1-170 (序号)`)
    console.log(`- 姓名: 随机生成的中文姓名`)
    console.log(`- 部门: 随机从 ${departments.length} 个部门中选择`)
    console.log(`- 头像: 留空`)
}

// 执行生成
generateExcel()
