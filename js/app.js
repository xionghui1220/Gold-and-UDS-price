// API配置 - 请替换为您的API密钥
const GOLD_API_KEY = 'goldapi-2b9bb507251ab46b460eaa36df9594e0-io';
const EXCHANGE_API_KEY = '';

// API端点
const GOLD_API_URL = 'https://www.goldapi.io/api/XAU/CNY';
const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/USD';

// 演示数据（价格接近真实值：约1027 CNY/克）
const DEMO_DATA = {
    gold: {
        price: 1027.00,
        change: -5.50,
        changePercent: -0.53,
        open: 1032.50,
        high: 1035.00,
        low: 1024.00,
        close: 1032.50,
        history7: [1035, 1033, 1030, 1028, 1032, 1029, 1027],
        history30: Array.from({length: 30}, (_, i) => 1020 + Math.random() * 20),
        history365: Array.from({length: 52}, (_, i) => 1000 + Math.random() * 50)
    },
    usd: {
        rate: 7.2485,
        change: 0.0125,
        changePercent: 0.17,
        history7: [7.23, 7.24, 7.235, 7.25, 7.245, 7.248, 7.2485],
        history30: Array.from({length: 30}, (_, i) => 7.20 + Math.random() * 0.10),
        history365: Array.from({length: 52}, (_, i) => 7.15 + Math.random() * 0.15)
    }
};

// 历史数据缓存
let historicalData = {
    gold: { history7: [], history30: [], history365: [] },
    usd: { history7: [], history30: [], history365: [] }
};

// 状态管理
let currentRange = 7;
let priceChart = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadData();
});

// 事件监听
function initializeEventListeners() {
    // 刷新按钮
    document.getElementById('refreshBtn').addEventListener('click', loadData);

    // 时间范围切换
    document.querySelectorAll('.time-range-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.time-range-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentRange = parseInt(e.target.dataset.range);
            updateChart();
        });
    });
}

// 加载数据
async function loadData() {
    showStatus('loading', '正在加载数据...');

    try {
        // 检查API密钥是否配置
        if (GOLD_API_KEY === 'YOUR_GOLD_API_KEY_HERE' || EXCHANGE_API_KEY === 'YOUR_EXCHANGE_API_KEY_HERE') {
            console.warn('使用演示数据：请配置API密钥以获取实时数据');
            useDemoData();
            return;
        }

        // 并行获取黄金价格和汇率数据
        const [goldData, usdData] = await Promise.all([
            fetchGoldData(),
            fetchUsdData()
        ]);

        if (goldData && usdData) {
            updateUI(goldData, usdData);
            showStatus('success', '数据已更新');
        } else {
            throw new Error('数据获取失败');
        }
    } catch (error) {
        console.error('加载数据失败:', error);
        showStatus('error', '数据加载失败，显示演示数据');
        useDemoData();
    }
}

// 获取黄金数据
async function fetchGoldData() {
    try {
        const response = await fetch(GOLD_API_URL, {
            headers: {
                'x-access-token': GOLD_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`黄金API错误: ${response.status}`);
        }

        const data = await response.json();
        const currentData = parseGoldData(data);

        // 获取历史数据（使用模拟数据，因为GoldAPI免费版不支持历史数据）
        await fetchHistoricalData(currentData.price);

        return currentData;
    } catch (error) {
        console.error('获取黄金数据失败:', error);
        return null;
    }
}

// 获取历史数据
async function fetchHistoricalData(currentPrice) {
    // 如果已有缓存的历史数据，不重新生成（保持一致性）
    if (historicalData.gold.history7.length > 0) {
        // 只更新最后一个值为当前价格
        historicalData.gold.history7[historicalData.gold.history7.length - 1] = parseFloat(currentPrice.toFixed(2));
        historicalData.gold.history30[historicalData.gold.history30.length - 1] = parseFloat(currentPrice.toFixed(2));
        historicalData.gold.history365[historicalData.gold.history365.length - 1] = parseFloat(currentPrice.toFixed(2));
        return;
    }

    // 首次加载时生成历史数据
    // 7天数据：以当前价格为中心，上下浮动2%
    historicalData.gold.history7 = generateRealisticHistory(currentPrice, 7, 0.02);
    // 30天数据：以当前价格为中心，上下浮动5%
    historicalData.gold.history30 = generateRealisticHistory(currentPrice, 30, 0.05);
    // 365天数据：以当前价格为中心，上下浮动10%（按月显示，52个数据点）
    historicalData.gold.history365 = generateRealisticHistory(currentPrice, 52, 0.10);

    // 汇率历史数据（模拟）
    historicalData.usd.history7 = generateRealisticHistory(7.25, 7, 0.005);
    historicalData.usd.history30 = generateRealisticHistory(7.25, 30, 0.01);
    historicalData.usd.history365 = generateRealisticHistory(7.25, 52, 0.03);
}

// 生成真实的历史数据（基于当前价格）
function generateRealisticHistory(baseValue, days, volatility) {
    const data = [];
    let currentValue = baseValue * (1 - volatility); // 从较低值开始

    for (let i = 0; i < days; i++) {
        // 随机游走，但趋向于基准价格
        const change = (Math.random() - 0.48) * volatility * baseValue;
        currentValue += change;

        // 确保价格在合理范围内
        const minPrice = baseValue * (1 - volatility * 1.5);
        const maxPrice = baseValue * (1 + volatility * 1.5);
        currentValue = Math.max(minPrice, Math.min(maxPrice, currentValue));

        data.push(parseFloat(currentValue.toFixed(2)));
    }

    // 最后一个值接近当前价格
    data[data.length - 1] = parseFloat(baseValue.toFixed(2));

    return data;
}

// 解析黄金数据
function parseGoldData(data) {
    // GoldAPI返回的是每金衡盎司价格，需要转换为每克价格
    // 1金衡盎司 = 31.1035克
    const ounceToGram = 31.1035;

    // 优先使用 price_gram_24k（每克价格），如果不存在则手动转换
    const pricePerGram = data.price_gram_24k && data.price_gram_24k > 0
        ? data.price_gram_24k
        : data.price / ounceToGram;

    const openPerGram = data.open_price ? data.open_price / ounceToGram : pricePerGram;
    const prevClosePerGram = data.prev_close_price ? data.prev_close_price / ounceToGram : pricePerGram;
    const change = pricePerGram - prevClosePerGram;
    const changePercent = prevClosePerGram > 0 ? (change / prevClosePerGram * 100) : 0;

    return {
        price: pricePerGram,
        change: change,
        changePercent: changePercent,
        open: openPerGram,
        high: data.high_price ? data.high_price / ounceToGram : pricePerGram,
        low: data.low_price ? data.low_price / ounceToGram : pricePerGram,
        close: prevClosePerGram
    };
}

// 获取美元汇率数据
async function fetchUsdData() {
    try {
        const response = await fetch(EXCHANGE_API_URL);

        if (!response.ok) {
            throw new Error(`汇率API错误: ${response.status}`);
        }

        const data = await response.json();
        return parseUsdData(data);
    } catch (error) {
        console.error('获取汇率数据失败:', error);
        return null;
    }
}

// 解析汇率数据
function parseUsdData(data) {
    // open.er-api.com 返回格式
    const cnyRate = data.rates?.CNY;

    if (!cnyRate) {
        throw new Error('无法获取CNY汇率');
    }

    return {
        rate: cnyRate,
        change: 0, // 需要计算历史对比
        changePercent: 0
    };
}

// 使用演示数据
function useDemoData() {
    updateUI(DEMO_DATA.gold, DEMO_DATA.usd);
    document.querySelector('.demo-notice').style.display = 'block';
}

// 更新UI
function updateUI(gold, usd) {
    // 更新时间
    document.getElementById('lastUpdate').textContent = new Date().toLocaleString('zh-CN');

    // 更新黄金数据
    document.getElementById('goldPrice').textContent = gold.price.toFixed(2);
    document.getElementById('goldChange').textContent = formatChange(gold.change, gold.changePercent);
    document.getElementById('goldTrend').textContent = gold.change >= 0 ? '↑' : '↓';
    document.getElementById('goldTrend').className = `trend-badge ${gold.change >= 0 ? 'up' : 'down'}`;
    document.getElementById('goldChange').className = `change-display ${gold.change >= 0 ? 'up' : 'down'}`;

    // 更新详细数据
    document.getElementById('goldOpen').textContent = gold.open?.toFixed(2) || '--.--';
    document.getElementById('goldHigh').textContent = gold.high?.toFixed(2) || '--.--';
    document.getElementById('goldLow').textContent = gold.low?.toFixed(2) || '--.--';
    document.getElementById('goldClose').textContent = gold.close?.toFixed(2) || '--.--';

    // 更新汇率数据
    document.getElementById('usdRate').textContent = usd.rate.toFixed(4);
    document.getElementById('usdChange').textContent = formatChange(usd.change, usd.changePercent, 4);
    document.getElementById('usdTrend').textContent = usd.change >= 0 ? '↑' : '↓';
    document.getElementById('usdTrend').className = `trend-badge ${usd.change >= 0 ? 'up' : 'down'}`;
    document.getElementById('usdChange').className = `change-display ${usd.change >= 0 ? 'up' : 'down'}`;

    // 更新图表
    updateChartData(gold, usd);
}

// 格式化涨跌幅
function formatChange(change, percent, decimals = 2) {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(decimals)} (${sign}${percent.toFixed(2)}%)`;
}

// 更新图表数据
function updateChartData(gold, usd) {
    if (priceChart) {
        priceChart.destroy();
    }

    const labels = generateDateLabels(currentRange);

    // 优先使用缓存的历史数据，否则使用演示数据
    let goldData, usdData;
    if (currentRange === 7) {
        goldData = historicalData.gold.history7.length > 0 ? historicalData.gold.history7 : gold.history7;
        usdData = historicalData.usd.history7.length > 0 ? historicalData.usd.history7 : usd.history7;
    } else if (currentRange === 30) {
        goldData = historicalData.gold.history30.length > 0 ? historicalData.gold.history30 : gold.history30;
        usdData = historicalData.usd.history30.length > 0 ? historicalData.usd.history30 : usd.history30;
    } else {
        goldData = historicalData.gold.history365.length > 0 ? historicalData.gold.history365 : gold.history365;
        usdData = historicalData.usd.history365.length > 0 ? historicalData.usd.history365 : usd.history365;
    }

    const ctx = document.getElementById('priceChart').getContext('2d');
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '黄金价格 (CNY/克)',
                    data: goldData,
                    borderColor: '#faad14',
                    backgroundColor: 'rgba(250, 173, 20, 0.1)',
                    tension: 0.3,
                    fill: false,
                    yAxisID: 'y'
                },
                {
                    label: '美元汇率 (USD/CNY)',
                    data: usdData,
                    borderColor: '#1890ff',
                    backgroundColor: 'rgba(24, 144, 255, 0.1)',
                    tension: 0.3,
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: '黄金价格 (CNY/克)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: '美元汇率 (USD/CNY)'
                    }
                }
            }
        }
    });
}

// 更新图表（切换时间范围时）
function updateChart() {
    // 使用缓存的历史数据和当前数据
    const gold = {
        ...DEMO_DATA.gold,
        history7: historicalData.gold.history7.length > 0 ? historicalData.gold.history7 : DEMO_DATA.gold.history7,
        history30: historicalData.gold.history30.length > 0 ? historicalData.gold.history30 : DEMO_DATA.gold.history30,
        history365: historicalData.gold.history365.length > 0 ? historicalData.gold.history365 : DEMO_DATA.gold.history365
    };
    const usd = {
        ...DEMO_DATA.usd,
        history7: historicalData.usd.history7.length > 0 ? historicalData.usd.history7 : DEMO_DATA.usd.history7,
        history30: historicalData.usd.history30.length > 0 ? historicalData.usd.history30 : DEMO_DATA.usd.history30,
        history365: historicalData.usd.history365.length > 0 ? historicalData.usd.history365 : DEMO_DATA.usd.history365
    };
    updateChartData(gold, usd);
}

// 生成日期标签
function generateDateLabels(days) {
    const labels = [];
    const today = new Date();

    if (days === 365) {
        // 年视图：按月显示
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - i);
            labels.push(`${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`);
        }
    } else {
        // 7天或30天视图
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        }
    }

    return labels;
}

// 显示状态
function showStatus(type, message) {
    const statusBar = document.getElementById('statusBar');
    const statusText = document.getElementById('statusText');

    statusBar.className = `status-bar ${type}`;
    statusText.textContent = message;

    // 3秒后清除成功状态
    if (type === 'success') {
        setTimeout(() => {
            statusBar.className = 'status-bar';
            statusText.textContent = '';
        }, 3000);
    }
}
