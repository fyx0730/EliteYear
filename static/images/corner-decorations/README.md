# 角落装饰元素说明

## ⚠️ 重要提示

**请将PNG图片文件放入 `public/images/corner-decorations/` 目录，而不是此目录！**

此目录仅作为说明文档存放位置。

## 目录结构

图片文件应存放在：`public/images/corner-decorations/`

## 文件命名规范

请将您的PNG图片文件按照以下命名规范放置到 `public/images/corner-decorations/` 目录：

- `top-left.png` - 左上角装饰元素
- `top-right.png` - 右上角装饰元素
- `bottom-left.png` - 左下角装饰元素
- `bottom-right.png` - 右下角装饰元素

## 使用说明

1. 将4个PNG格式的图片文件放入 `public/images/corner-decorations/` 目录
2. 按照上述命名规范命名文件
3. 刷新页面即可看到装饰元素显示在对应角落

## 图片建议

- **尺寸**：建议每个图片尺寸不超过 200x200px，组件会自动限制最大尺寸
- **格式**：PNG格式（支持透明背景）
- **大小**：建议单个文件不超过 500KB，以保证加载速度

## 自定义配置

如果需要自定义图片路径，可以在 `src/views/Home/index.vue` 中修改 `CornerDecorations` 组件的 `images` 属性：

```vue
<CornerDecorations 
  :images="{
    topLeft: '/custom/path/top-left.png',
    topRight: '/custom/path/top-right.png',
    bottomLeft: '/custom/path/bottom-left.png',
    bottomRight: '/custom/path/bottom-right.png'
  }"
/>
```
