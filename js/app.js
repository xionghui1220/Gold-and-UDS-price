// API配置 - 请替换为您的API密钥
const GOLD_API_KEY = 'goldapi-2b9bb507251ab46b460eaa36df9594e0-io';
const EXCHANGE_API_KEY = '';

// API端点
const GOLD_API_URL = 'https://www.goldapi.io/api/XAU/CNY';
const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/USD';

// 演示数据
const DEMO_DATA = {
    gold: {
        price: 485.50,
        change: 3.25,
        changePercent: 0.67,
        open: 482.25,
        high: 487.80,
        low: 481.50,
        close: 482.25,
        history7: [480, 482, 479, 483, 485, 484, 485.50],
        history30: Array.from({length: 30}, (_, i) => 470 + Math.random() * 20)
    },
    usd: {
        rate: 7.2485,
        change: 0.0125,
        changePercent: 0.17,
        history7: [7.23, 7.24, 7.235, 7.25, 7.245, 7.248, 7.2485],
        history30: Array.from({length: 30}, (_, i) => 7.20 + Math.random() * 0.10)
    }
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
        return parseGoldData(data);
    } catch (error) {
        console.error('获取黄金数据失败:', error);
        return null;
    }
}

// 解析黄金数据
function parseGoldData(data) {
    // 根据实际API响应格式调整
    return {
        price: data.price || data.current_price,
        change: data.change || 0,
        changePercent: data.change_percent || 0,
        open: data.open || data.opening_price,
        high: data.high || data.high_price,
        low: data.low || data.low_price,
        close: data.previous_close || data.closing_price
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
    const goldData = currentRange === 7 ? gold.history7 : gold.history30;
    const usdData = currentRange === 7 ? usd.history7 : usd.history30;

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
    // 在实际应用中，这里应该重新获取对应时间范围的数据
    // 目前使用演示数据中的对应数组
    const gold = DEMO_DATA.gold;
    const usd = DEMO_DATA.usd;
    updateChartData(gold, usd);
}

// 生成日期标签
function generateDateLabels(days) {
    const labels = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
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
