// 全局状态
let balance = 1000.00;
let bet = 1.00;
let win = 0.00;
let modified = 0.00;
let freeSpins = 0;
let jackpot = 0;

// 符号图片列表
const symbols = [
    'dragon', 'phoenix', 'yuanbao', 'chinese-knot', 'fu',
    'koi', 'coin', 'seven', 'bell', 'gold-dollar',
    'wild', 'scatter', 'bonus'
];

// DOM 元素
const dom = {
    balanceDisplay: document.getElementById('balance-display'),
    betDisplay: document.getElementById('bet-display'),
    winDisplay: document.getElementById('win-display'),
    modifiedDisplay: document.getElementById('modified-display'),
    btnBetUp: document.getElementById('btn-bet-up'),
    btnBetDown: document.getElementById('btn-bet-down'),
    btnMaxBet: document.getElementById('btn-max-bet'),
    btnSpin: document.getElementById('btn-spin'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    reels: document.querySelectorAll('.reel'),
    freeSpinsOverlay: document.getElementById('free-spins-overlay'),
    freeSpinsRemaining: document.getElementById('free-spins-remaining'),
    freeSpinsCounter: document.getElementById('free-spins-counter'),
    jackpotAmount: document.getElementById('jackpot-amount'),
    announcementContent: document.getElementById('announcement-content'),
    winLinesCanvas: document.getElementById('win-lines-canvas'),
};

// 初始化卷轴
function initReels() {
    dom.reels.forEach(reel => {
        for (let i = 0; i < 3; i++) { // 每根卷轴显示 3 个符号
            const symbol = document.createElement('div');
            symbol.classList.add('symbol', getRandomSymbol());
            reel.appendChild(symbol);
        }
    });
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

// 更新显示
function updateDisplay() {
    dom.balanceDisplay.textContent = balance.toFixed(2);
    dom.betDisplay.textContent = bet.toFixed(2);
    dom.winDisplay.textContent = win.toFixed(2);
    dom.modifiedDisplay.textContent = modified.toFixed(2);
    dom.jackpotAmount.textContent = (jackpot + Math.random() * 1000).toFixed(2); // 模拟 Jackpot 增长
}

// 投注控制
dom.btnBetUp.addEventListener('click', () => {
    if (balance >= bet + 1) {
        bet += 1;
        updateDisplay();
    }
});

dom.btnBetDown.addEventListener('click', () => {
    if (bet > 1) {
        bet -= 1;
        updateDisplay();
    }
});

dom.btnMaxBet.addEventListener('click', () => {
    bet = Math.min(balance, 1000);
    updateDisplay();
});

// 旋转动画
function spinReels() {
    if (balance < bet) return alert('余额不足！');
    balance -= bet;
    win = 0;
    
    dom.reels.forEach(reel => {
        reel.classList.add('spinning');
        const symbols = reel.querySelectorAll('.symbol');
        symbols.forEach((symbol, index) => {
            setTimeout(() => {
                symbol.className = 'symbol ' + getRandomSymbol();
                if (index === symbols.length - 1) reel.classList.remove('spinning');
            }, index * 100); // 逐个符号滚动
        });
    });
    
    // 模拟中奖
    setTimeout(() => {
        win = Math.random() * 50 * (freeSpins > 0 ? 3 : 1); // 免费旋转 x3
        balance += win;
        modified += win;
        if (win > 0) {
            highlightWinningLine();
            if (win > 100) showBigWin();
            if (Math.random() < 0.05) showJackpotWin(); // 5% 概率触发 Jackpot
        }
        if (Math.random() < 0.1 && freeSpins === 0) { // 10% 概率触发免费旋转
            freeSpins = 10;
            dom.freeSpinsRemaining.textContent = freeSpins;
            dom.freeSpinsCounter.classList.remove('hidden');
            dom.freeSpinsOverlay.classList.remove('hidden');
        }
        updateDisplay();
        addAnnouncement(`第 ${Math.floor(Math.random() * 100)} 局：${win > 0 ? '中奖' : '未中奖'} ${win.toFixed(2)}`);
    }, 500); // 动画结束后计算结果
}

dom.btnSpin.addEventListener('click', async () => {
    await enterFullscreenLandscape();
    spinReels();
});

// 免费旋转
document.getElementById('free-spins-start-button').addEventListener('click', () => {
    dom.freeSpinsOverlay.classList.add('hidden');
    if (freeSpins > 0) {
        spinReels();
        freeSpins--;
        dom.freeSpinsRemaining.textContent = freeSpins;
        if (freeSpins > 0) dom.freeSpinsOverlay.classList.remove('hidden');
        else dom.freeSpinsCounter.classList.add('hidden');
    }
});

// 公告
function addAnnouncement(message) {
    const div = document.createElement('div');
    div.textContent = message;
    dom.announcementContent.appendChild(div);
    if (dom.announcementContent.children.length > 3) {
        dom.announcementContent.removeChild(dom.announcementContent.firstChild);
    }
}

// 全屏与横屏
async function enterFullscreenLandscape() {
    const elem = document.documentElement;
    try {
        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
        if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape-primary');
        console.log('进入全屏并锁定横屏');
    } catch (err) {
        console.warn('全屏或横屏锁定失败:', err);
        alert('请手动旋转设备并全屏（某些浏览器限制）');
    }
}

dom.btnFullscreen.addEventListener('click', enterFullscreenLandscape);

// 退出全屏
function exitFullscreen() {
    if (document.exitFullscreen) document.exitFullscreen();
    if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) exitFullscreen();
});

// 高亮中奖线
function highlightWinningLine() {
    const ctx = dom.winLinesCanvas.getContext('2d');
    ctx.clearRect(0, 0, dom.winLinesCanvas.width, dom.winLinesCanvas.height);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, dom.winLinesCanvas.height / 2);
    ctx.lineTo(dom.winLinesCanvas.width, dom.winLinesCanvas.height / 2);
    ctx.stroke();
    setTimeout(() => ctx.clearRect(0, 0, dom.winLinesCanvas.width, dom.winLinesCanvas.height), 1000);
}

// 大奖动画
function showBigWin() {
    const overlay = document.createElement('div');
    overlay.className = 'big-win-overlay';
    const img = document.createElement('img');
    img.className = 'big-win-image';
    img.src = 'images/2225.jpg';
    img.alt = 'Big Win';
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    setTimeout(() => document.body.removeChild(overlay), 3000);
}

// Jackpot 动画
function showJackpotWin() {
    jackpot += win * 10; // 增加 Jackpot
    const overlay = document.getElementById('jackpot-win-overlay');
    overlay.classList.remove('hidden');
    document.getElementById('jackpot-win-close').addEventListener('click', () => overlay.classList.add('hidden'));
}

// 初始化
initReels();
updateDisplay();