# 黄金/美元汇率追踪 H5页面

一个简洁专业的黄金价格（人民币计价）和美元汇率追踪页面，支持实时数据获取和数据可视化。

## 功能特性

- 实时显示黄金价格（CNY/克）和美元汇率（USD/CNY）
- 涨跌幅百分比显示
- 详细数据：开盘价、最高价、最低价、昨日收盘价
- 7天/30天价格趋势图表
- 响应式设计，支持移动端和桌面端
- 自动刷新和手动刷新功能
- 演示数据模式（无需API密钥即可预览）

## 在线预览

访问 [GitHub Pages链接](https://username.github.io/gold-usd-tracker) 查看在线效果

## 快速开始

### 方式一：直接使用（演示数据）

1. 克隆或下载本项目
2. 直接在浏览器中打开 `index.html` 文件
3. 页面将显示演示数据

### 方式二：配置API密钥获取实时数据

#### 步骤1：申请免费API密钥

**黄金价格API（选择其一）：**

1. **GoldAPI.io**（推荐）
   - 访问 https://www.goldapi.io/
   - 注册免费账号
   - 在Dashboard获取API密钥
   - 免费额度：100次/月

2. **Metals-API.com**
   - 访问 https://metals-api.com/
   - 注册获取API密钥
   - 免费试用期

**汇率API（选择其一）：**

1. **open.er-api.com**（推荐，完全免费）
   - 无需API密钥，直接使用
   - API文档：https://open.er-api.com/

2. **exchangerate-api.com**
   - 访问 https://www.exchangerate-api.com/
   - 注册获取API密钥
   - 免费额度：1500次/月

#### 步骤2：配置API密钥

打开 `js/app.js` 文件，找到第2-3行：

```javascript
const GOLD_API_KEY = 'YOUR_GOLD_API_KEY_HERE';
const EXCHANGE_API_KEY = 'YOUR_EXCHANGE_API_KEY_HERE';
```

将 `'YOUR_GOLD_API_KEY_HERE'` 替换为你从GoldAPI获取的密钥，例如：

```javascript
const GOLD_API_KEY = 'abc123def456';
const EXCHANGE_API_KEY = 'your_exchange_api_key';
```

**注意：** 如果你使用 open.er-api.com，可以将 `EXCHANGE_API_KEY` 留空或保持原样，因为该API不需要密钥。

#### 步骤3：部署到GitHub Pages

1. 创建新的GitHub仓库
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/gold-usd-tracker.git
   git push -u origin main
   ```

2. 启用GitHub Pages
   - 进入仓库 Settings
   - 点击左侧 Pages 菜单
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main" 和 "/ (root)"
   - 点击 Save

3. 访问你的页面
   - URL格式：`https://YOUR_USERNAME.github.io/gold-usd-tracker`

## 项目结构

```
gold-usd-tracker/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── app.js          # 主要逻辑
└── README.md           # 说明文档
```

## API使用说明

### 黄金价格API

当前配置使用 GoldAPI.io，API返回格式示例：

```json
{
  "price": 485.50,
  "open": 482.25,
  "high": 487.80,
  "low": 481.50,
  "previous_close": 482.25,
  "change": 3.25,
  "change_percent": 0.67
}
```

如果使用其他API，可能需要修改 `parseGoldData()` 函数以适配不同的返回格式。

### 汇率API

当前配置使用 open.er-api.com，API返回格式：

```json
{
  "result": "success",
  "base_code": "USD",
  "rates": {
    "CNY": 7.2485,
    ...
  }
}
```

## 自定义开发

### 修改颜色主题

编辑 `css/style.css` 中的颜色变量：

```css
/* 上涨色 */
color: #52c41a;

/* 下跌色 */
color: #ff4d4f;

/* 主色调 */
background: #1890ff;
```

### 添加更多货币对

在 `js/app.js` 中添加新的数据获取和显示逻辑，复制现有的黄金或美元卡片HTML结构。

### 更换图表库

当前使用 Chart.js，可以替换为 ECharts 或其他图表库，修改 `updateChartData()` 函数即可。

## 常见问题

### Q: 为什么数据显示的是演示数据？

A: 检查以下几点：
1. 确认已在 `js/app.js` 中配置了正确的API密钥
2. 打开浏览器开发者工具（F12），查看Console是否有错误信息
3. 确认API配额未用完

### Q: API请求失败怎么办？

A: 可能的原因：
- API密钥错误：检查密钥是否正确复制
- API配额用完：登录API提供商网站检查剩余额度
- 网络问题：检查网络连接，或使用代理

### Q: 如何更新历史数据？

A: 当前版本的历史数据是模拟生成的。要获取真实历史数据，需要：
1. 选择支持历史数据的API（如GoldAPI付费版）
2. 修改 `fetchGoldData()` 函数获取历史数据
3. 或者使用本地存储（localStorage）缓存每日数据

### Q: GitHub Pages部署后页面无法访问？

A: 检查：
1. 仓库是否为Public（公开）
2. GitHub Pages是否已正确启用
3. 等待几分钟让GitHub完成部署
4. 查看仓库Actions标签页是否有部署错误

## 技术栈

- HTML5
- CSS3 (Flexbox/Grid)
- Vanilla JavaScript (ES6+)
- Chart.js (图表)
- Fetch API (数据请求)

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge
- 移动端浏览器

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

如有问题或建议，请通过GitHub Issues联系。
