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

访问 [GitHub Pages链接](https://xionghui1220.github.io/Gold-and-UDS-price) 查看在线效果

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

**汇率API（选择其一）：**

1. **open.er-api.com**（推荐，完全免费）
   - 无需API密钥，直接使用
   - API文档：https://open.er-api.com/

#### 步骤2：配置API密钥

打开 `js/app.js` 文件，找到第2-3行，替换为你的API密钥。

#### 步骤3：部署到GitHub Pages

已在Settings → Pages中启用，Branch: main

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

## 技术栈

- HTML5
- CSS3 (Flexbox/Grid)
- Vanilla JavaScript (ES6+)
- Chart.js (图表)
- Fetch API (数据请求)

## 许可证

MIT License
