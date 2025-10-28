/* * ====================================
 * 编码助手: game.js (第 6.1.0 版 - 性能与逻辑优化)
 * ====================================
 */

// --- 1. 定义游戏常量与变量 ---
const SYMBOLS_DATA = {
    'DRAGON':  { id: 'DRAGON',  path: './images/3397.jpg', type: 'NORMAL' },
    'PHOENIX': { id: 'PHOENIX', path: './images/3398.jpg', type: 'NORMAL' },
    'FU':      { id: 'FU',      path: './images/3401.jpg', type: 'NORMAL' },
    'SEVEN':   { id: 'SEVEN',   path: './images/3404.jpg', type: 'NORMAL' },
    'BELL':    { id: 'BELL',    path: './images/3405.jpg', type: 'NORMAL' },
    'DOLLAR':  { id: 'DOLLAR',  path: './images/3406.jpg', type: 'NORMAL' },
    'INGOT':   { id: 'INGOT',   path: './images/3399.jpg', type: 'NORMAL' },
    'KNOT':    { id: 'KNOT',    path: './images/3400.jpg', type: 'NORMAL' },
    'KOI':     { id: 'KOI',     path: './images/3402.jpg', type: 'NORMAL' },
    'COIN':    { id: 'COIN',    path: './images/3403.jpg', type: 'NORMAL' },
    'WILD':    { id: 'WILD',    path: './images/3407.jpg', type: 'WILD' },
    'SCATTER': { id: 'SCATTER', path: './images/3414.jpg', type: 'SCATTER' },
    'BONUS':   { id: 'BONUS',   path: './images/3415.jpg', type: 'BONUS' },
};
const NORMAL_SYMBOLS_LIST = [
    'DRAGON', 'PHOENIX', 'FU', 'SEVEN', 'BELL', 'DOLLAR',
    'INGOT', 'KNOT', 'KOI', 'COIN', 'WILD'
];
const PAYTABLE = {
    'DRAGON':  { 5: 100, 4: 50, 3: 10 },
    'PHOENIX': { 5: 80,  4: 40, 3: 8  },
    'FU':      { 5: 60,  4: 30, 3: 7  },
    'SEVEN':   { 5: 50,  4: 25, 3: 6  },
    'BELL':    { 5: 40,  4: 20, 3: 5  },
    'DOLLAR':  { 5: 30,  4: 15, 3: 4  },
    'INGOT':   { 5: 20,  4: 10, 3: 3  },
    'KNOT':    { 5: 20,  4: 10, 3: 3  },
    'KOI':     { 5: 10,  4: 5,  3: 2  },
    'COIN':    { 5: 10,  4: 5,  3: 2  },
    'WILD':    { 5: 200, 4: 100,3: 20 },
    'SCATTER': { 5: 50,  4: 20, 3: 5  }
};
const PAYLINES = [
    [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2], [0, 1, 2, 1, 0], [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2], [2, 2, 1, 0, 0], [1, 0, 0, 0, 1], [1, 2, 2, 2, 1], [0, 1, 1, 1, 0],
    [2, 1, 1, 1, 2], [1, 0, 1, 2, 1], [1, 2, 1, 0, 1], [0, 1, 0, 1, 0], [2, 1, 2, 1, 2],
    [1, 1, 0, 1, 1], [1, 1, 2, 1, 1], [0, 0, 2, 0, 0], [2, 2, 0, 2, 2], [0, 2, 0, 2, 0],
    [2, 0, 2, 0, 2], [1, 0, 2, 0, 1], [1, 2, 0, 2, 1], [0, 2, 2, 2, 0], [2, 0, 0, 0, 2]
];

// 游戏配置
const REEL_ROWS = 3;
const REEL_COLS = 5;
const LINES_COUNT = 25;
const FREE_SPINS_AWARDED = 10;
const FREE_SPINS_MULTIPLIER = 3;

// --- 1.5 DOM 元素获取 ---
const gameContainer = document.getElementById('game-container');
const reelsContainer = document.getElementById('reels-container');
const spinButton = document.getElementById('btn-spin');
const balanceDisplay = document.getElementById('balance-display');
const betDisplay = document.getElementById('bet-display');
const winDisplay = document.getElementById('win-display');
const winLinesCanvas = document.getElementById('win-lines-canvas');
const canvasCtx = winLinesCanvas.getContext('2d');
const betUpButton = document.getElementById('btn-bet-up');
const betDownButton = document.getElementById('btn-bet-down');
const maxBetButton = document.getElementById('btn-max-bet');
const autoplayButton = document.getElementById('btn-autoplay');
const fullscreenButton = document.getElementById('btn-fullscreen');
const freeSpinsOverlay = document.getElementById('free-spins-overlay');
const freeSpinsModal = document.getElementById('free-spins-modal');
const freeSpinsTitle = document.getElementById('free-spins-title');
const freeSpinsMessage = document.getElementById('free-spins-message');
const freeSpinsStartButton = document.getElementById('free-spins-start-button');
const freeSpinsCounter = document.getElementById('free-spins-counter');
const freeSpinsRemainingDisplay = document.getElementById('free-spins-remaining');
const autoplayOverlay = document.getElementById('autoplay-overlay');
const autoplayModal = document.getElementById('autoplay-modal');
const autoplayOptions = document.querySelectorAll('.autoplay-option-btn');
const autoplayCancel = document.getElementById('autoplay-cancel-btn');
const jackpotWinOverlay = document.getElementById('jackpot-win-overlay');
const jackpotWinClose = document.getElementById('jackpot-win-close');
const infoButton = document.getElementById('btn-info');
const paytableOverlay = document.getElementById('paytable-overlay');
const paytableContent = document.getElementById('paytable-content');
const paytableCloseButton = document.getElementById('paytable-close-btn');
const winLossTableBody = document.getElementById('win-loss-body');
const jackpotDisplay = document.getElementById('jackpot-amount');
const announcementContent = document.getElementById('announcement-content');

// --- 1.6 游戏状态 ---
let balance = 1000.00;
let bet = 1.00;
let isSpinning = false;
let isShowingWins = false;
let isInFreeSpins = false;
let freeSpinsRemaining = 0;
let freeSpinsTotalWin = 0;
let isAutoplaying = false;
let autoplayRemaining = 0;
const BET_LEVELS = [0.25, 0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00];
let currentBetIndex = 2;
const reels = Array.from(document.querySelectorAll('#reels-container .reel'));
let symbolElements = [];
let jackpotAmount = 9123456.78;
const winLossRecords = [];
const announcementMessages = []; // v5.5.6 逻辑: 内存中的公告数组
let gameRound = 0;
let gameLoopTimer = null; // v6.1.0 优化: 单一主循环计时器

// --- 1.7 玩家与公告名字 (v6.1.0 优化 - 替换 nameData) ---
const CURRENT_PLAYER_NAME = "玩家888"; // 这是一个标识, 代表当前用户, 不会出现在公告中
const FAKE_PLAYER_NAMES = [
    "张伟", "Siti", "Arjun", "Budi", "Alex", "Ben", "Chris", "Diana", 
    "Eve", "Frank", "Grace", "Hugo", "Ivy", "Jack", "Kara", "Liam", 
    "Mia", "Noah", "Owen", "Paul", "Quinn", "Rosa", "Sam", "Tina",
    "李娜", "Ahmad", "Priya", "Dewi", "James", "Emma", "William", "Sophie"
];

/**
 * (v6.1.0 优化 - v3.0 逻辑)
 * 生成一个唯一的假玩家名字，用于公告，并确保它不是当前玩家。
 */
function generateUniquePlayerName() {
    let name;
    let attempts = 0;
    do {
        name = FAKE_PLAYER_NAMES[Math.floor(Math.random() * FAKE_PLAYER_NAMES.length)];
        attempts++;
    } while (name === CURRENT_PLAYER_NAME && attempts < 50); // 确保排除当前玩家
    return name;
}

// --- 1.8 音效系统 ---
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffers = {};
let currentBgmNode = null;
async function loadSound(id, path) {
    try {
        if (audioBuffers[id]) return;
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffers[id] = await audioContext.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.warn(`无法加载音效: ${id} (${path})`, e);
    }
}
function playSound(id) {
    if (!audioBuffers[id] || audioContext.state === 'suspended') return;
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers[id];
    source.connect(audioContext.destination);
    source.start(0);
}
function stopBGM() {
    if (currentBgmNode) {
        currentBgmNode.stop(0);
        currentBgmNode = null;
    }
}
function playBGM(id) {
    stopBGM();
    if (!audioBuffers[id] || audioContext.state === 'suspended') return;
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers[id];
    source.loop = true;
    source.connect(audioContext.destination);
    source.start(0);
    currentBgmNode = source;
}

// --- 1.9 图片预加载 ---
function preloadImages() {
    Object.values(SYMBOLS_DATA).forEach(data => {
        const img = new Image();
        img.src = data.path;
        img.onerror = () => console.error(`图片加载失败: ${data.path}`);
    });
    const imagesToLoad = [
        './images/600.jpg', 
        './images/2222.jpg', 
        './images/1111.jpg', 
        './images/595.jpg',
        './images/596.jpg',
        './images/597.jpg',
        './images/598.jpg',
        './images/599.jpg',
        './images/2224.jpg',
        './images/coin.png',
        './images/big-win.png' 
    ];
    imagesToLoad.forEach(path => {
        const img = new Image();
        img.src = path;
        img.onerror = () => console.error(`图片加载失败: ${path}`);
    });
}

// --- 2. 初始化 ---
function initializeGame() {
    updateBet(0);
        updateBalance(0);
    updateJackpot(0);
    addAnnouncement('欢迎体验游戏！');

    reels.forEach((reel, colIndex) => {
        reel.innerHTML = '';
        symbolElements[colIndex] = [];
        for (let j = 0; j < REEL_ROWS; j++) {
            const symbolDiv = createSymbolElement();
            reel.appendChild(symbolDiv);
            symbolElements[colIndex][j] = symbolDiv;
        }
    });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const initialGrid = generateSpinResult();
    displayResult(initialGrid);

    spinButton.addEventListener('click', () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                if (!currentBgmNode) playBGM('bgm-main');
                spin();
            });
        } else {
            if (!currentBgmNode && !isInFreeSpins) playBGM('bgm-main');
            spin();
        }
    });
    
    if (fullscreenButton) fullscreenButton.addEventListener('click', toggleFullScreen);
    if (betUpButton) betUpButton.addEventListener('click', () => { playSound('ui-click'); updateBet(1); });
    if (betDownButton) betDownButton.addEventListener('click', () => { playSound('ui-click'); updateBet(-1); });
    if (maxBetButton) maxBetButton.addEventListener('click', () => { playSound('ui-click'); setMaxBet(); });
    if (freeSpinsStartButton) freeSpinsStartButton.addEventListener('click', startFreeSpins);
    if (jackpotWinClose) jackpotWinClose.addEventListener('click', () => {
        jackpotWinOverlay.classList.add('hidden');
    });
    if (autoplayButton) autoplayButton.addEventListener('click', toggleAutoplay);
    
    autoplayOptions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const count = parseInt(e.target.dataset.count, 10);
            startAutoplay(count);
        });
    });
    
    if (autoplayCancel) autoplayCancel.addEventListener('click', () => {
        autoplayOverlay.classList.add('hidden');
    });
    if (infoButton) infoButton.addEventListener('click', showPaytable);
    if (paytableCloseButton) paytableCloseButton.addEventListener('click', hidePaytable);

    loadSound('spinStart', './sounds/spin.wav');
    loadSound('reelStop', './sounds/stop.wav');
    loadSound('winSmall', './sounds/win-small.wav');
    loadSound('winBig', './sounds/win-big.wav');
    loadSound('bgm-main', './sounds/bgm-main.mp3');
    loadSound('jingle-trigger', './sounds/jingle-trigger.wav');
    loadSound('bgm-free-spin', './sounds/bgm-free-spin.mp3');
    loadSound('ui-click', './sounds/ui-click.wav');

    preloadImages();
    startGameLoop(); // v6.1.0 优化: 启动单一主循环
}
// 启动游戏
initializeGame();

// --- 3. 核心功能 ---
function createSymbolElement() {
    const symbolDiv = document.createElement('div');
    symbolDiv.className = 'symbol';
    return symbolDiv;
}

// 注意：这个函数在生产环境中会被 API 返回的结果覆盖，只用于初始化显示
function generateSpinResult() {
    const grid = [];
    for (let c = 0; c < REEL_COLS; c++) {
        grid[c] = [];
        for (let r = 0; r < REEL_ROWS; r++) {
            const randomSymbolId = NORMAL_SYMBOLS_LIST[Math.floor(Math.random() * NORMAL_SYMBOLS_LIST.length)];
            grid[c][r] = randomSymbolId;
        }
    }
    if (!isInFreeSpins && Math.random() > 0.85) { 
        try {
            grid[Math.floor(Math.random() * REEL_COLS)][Math.floor(Math.random() * REEL_ROWS)] = 'SCATTER';
            grid[Math.floor(Math.random() * REEL_COLS)][Math.floor(Math.random() * REEL_ROWS)] = 'SCATTER';
            grid[Math.floor(Math.random() * REEL_COLS)][Math.floor(Math.random() * REEL_ROWS)] = 'SCATTER';
        } catch (e) { console.error("设置 SCATTER 时出错", e); }
    }
    return grid;
}

function displayResult(grid) {
    for (let c = 0; c < REEL_COLS; c++) {
        for (let r = 0; r < REEL_ROWS; r++) {
            const symbolId = grid[c][r];
            const symbolData = SYMBOLS_DATA[symbolId];
            const element = symbolElements[c][r];
            if (symbolData) {
                element.style.backgroundImage = `url(${symbolData.path})`;
                element.style.backgroundSize = 'cover';
                element.style.backgroundPosition = 'center';
            } else {
                console.error(`未找到符号数据: ${symbolId}`);
                element.style.backgroundImage = 'none';
            }
        }
    }
}

async function spin() {
    if (isSpinning || isShowingWins) return;
    if (!isInFreeSpins && !isAutoplaying && balance < bet) {
        alert("余额不足，请降低投注额！");
        return;
    }
    if (isAutoplaying && balance < bet) {
        stopAutoplay();
        alert("余额不足，自动旋转已停止。");
        return;
    }
    isSpinning = true;
    if(spinButton) spinButton.disabled = true;
    if(betUpButton) betUpButton.disabled = true;
    if(betDownButton) betDownButton.disabled = true;
    if(maxBetButton) maxBetButton.disabled = true;
    if(autoplayButton) autoplayButton.disabled = true;
    
    clearWinningLines();
    playSound('spinStart');
    
    // --- 步骤 1: 扣除或更新免费旋转次数 ---
    if (isInFreeSpins) {
        freeSpinsRemaining--;
        freeSpinsRemainingDisplay.textContent = freeSpinsRemaining;
    } else {
        // 注释掉前端扣费，等待 API 响应结果 (这里保留扣费逻辑用于前端动画演示)
        // updateBalance(-bet); 
        if (isAutoplaying) {
            autoplayRemaining--;
            if (autoplayButton) autoplayButton.textContent = `停止 (${autoplayRemaining})`;
        }
    }
    winDisplay.textContent = "0.00";
    
    // --- 步骤 2: 播放卷轴动画 ---
    const spinPromises = reels.map((reel, colIndex) => {
        return playReelAnimation(reel, colIndex);
    });
    await Promise.all(spinPromises); // 等待所有动画完成
    
    // --- 步骤 3: 从 API 获取结果 (需要修改 fetch URL 和 body) ---
    const API_URL = 'http://127.0.0.1:8080'; // ⚠️ 新的 FastAPI 地址
    let apiResult;
    try {
        const response = await fetch(`${API_URL}/spin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                player_id: CURRENT_PLAYER_NAME,
                lines: LINES_COUNT,
                bet: bet,
                is_free_spin: isInFreeSpins,
                balance: balance // 将当前余额发送给 API
            })
        });
        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.statusText}`);
        }
        apiResult = await response.json();
    } catch (error) {
        console.error("Spin API 错误:", error);
        alert("无法连接到游戏服务器。请检查后端是否在 http://127.0.0.1:8080 运行。");
        isSpinning = false;
        if(spinButton) spinButton.disabled = false;
        if(autoplayButton) autoplayButton.disabled = false;
        return;
    }

    const resultGrid = apiResult.grid;
    const winAmount = apiResult.total_win;
    const winResults = {
        totalWin: winAmount,
        winningLines: apiResult.winning_lines,
        triggeredFreeSpins: apiResult.scatter_count >= 3 && !isInFreeSpins, // 根据 API 结果判断是否触发 FS
        scatterCount: apiResult.scatter_count
    };
    const didTriggerFreeSpins = winResults.triggeredFreeSpins;
    
    // 更新余额和显示结果
    balance = apiResult.balance; // 从 API 获取最终余额
    updateBalance(0); // 只是更新显示
    displayResult(resultGrid);
    
    let winDisplayPromise = Promise.resolve();
    
    if (winAmount > 0) {
        if (winAmount > bet * 10) {
            playSound('winBig');
            triggerCoinFountain(); 
            showBigWinOverlay(); 
        } else {
            playSound('winSmall');
        }

        winDisplay.textContent = winAmount.toFixed(2);
        if (isInFreeSpins) freeSpinsTotalWin += winAmount;
        
        // 显示中奖线
        winDisplayPromise = showWinningLinesSequentially(winResults.winningLines, resultGrid);
    }
    
    // --- 步骤 4: 更新记录和循环 ---
    gameRound++;
    const netWin = winAmount - (bet * LINES_COUNT); // 假设 LinesCount=25
    const result = winAmount > 0 ? '赢' : '输';
    const amount = winAmount > 0 ? `+${winAmount.toFixed(2)}` : `-${(bet * LINES_COUNT).toFixed(2)}`;
    winLossRecords.push({ round: gameRound, result, amount });
    if (winLossRecords.length > 10) winLossRecords.shift();
    updateWinLossTable();
    
    if (!isInFreeSpins) updateJackpot(bet * 0.01); 
    
    await winDisplayPromise;
    
    if (didTriggerFreeSpins && !isInFreeSpins) {
        if (isAutoplaying) stopAutoplay(true);
        stopBGM();
        playSound('jingle-trigger');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        clearWinningLines();
        triggerFreeSpins(winResults.scatterCount); 
        isSpinning = false;
        if(autoplayButton) autoplayButton.disabled = false;
        return;
    }
    
    if (isInFreeSpins && freeSpinsRemaining === 0) {
        stopBGM();
        endFreeSpins();
        isSpinning = false;
        if(autoplayButton) autoplayButton.disabled = false;
        return;
    }
    
    isSpinning = false;
    if(autoplayButton) autoplayButton.disabled = false;
    
    if (isInFreeSpins) {
        await new Promise(resolve => setTimeout(resolve, 200));
        spin();
    } else if (isAutoplaying) {
        if (autoplayRemaining > 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
            spin();
        } else {
            stopAutoplay();
            if(spinButton) spinButton.disabled = false;
        }
    } else {
        if(spinButton) spinButton.disabled = false;
        if(betUpButton) betUpButton.disabled = false;
        if(betDownButton) betDownButton.disabled = false;
        if(maxBetButton) maxBetButton.disabled = false;
    }
}


function playReelAnimation(reelElement, colIndex) {
    reelElement.classList.add('spinning');
    const baseDuration = isInFreeSpins ? 500 : 1000;
    const duration = baseDuration + colIndex * 200;
    return new Promise(resolve => {
        const flickerInterval = setInterval(() => {
            for (let r = 0; r < REEL_ROWS; r++) {
                const element = symbolElements[colIndex][r];
                // 仅用于动画，不影响最终结果
                const randomSymbolId = NORMAL_SYMBOLS_LIST[Math.floor(Math.random() * NORMAL_SYMBOLS_LIST.length)];
                const randomSymbolData = SYMBOLS_DATA[randomSymbolId];
                element.style.backgroundImage = `url(${randomSymbolData.path})`;
            }
        }, 75);
        setTimeout(() => {
            clearInterval(flickerInterval);
            reelElement.classList.remove('spinning');
            playSound('reelStop');
            resolve();
        }, duration);
    });
}

// ⚠️ 注意: checkWin 函数已被后端取代，但在前端代码中仍有定义，为保持代码完整性保留
function checkWin(grid) { 
    // 此处无需执行任何操作，因为赢取逻辑已全部迁移到 FastAPI 后端
    return { totalWin: 0, winningLines: [], triggeredFreeSpins: false, scatterCount: 0 };
} 


// --- 4. 自动旋转功能 ---
function toggleAutoplay() {
    playSound('ui-click');
    if (isSpinning) return;
    if (isAutoplaying) {
        stopAutoplay();
    } else {
        if (isInFreeSpins) return;
        autoplayOverlay.classList.remove('hidden');
    }
}

function startAutoplay(count) {
    if (count <= 0 || balance < bet) {
        autoplayOverlay.classList.add('hidden');
        if (balance < bet) alert("余额不足！");
        return;
    }
    isAutoplaying = true;
    autoplayRemaining = count;
    if(autoplayButton) autoplayButton.textContent = `停止 (${autoplayRemaining})`;
    autoplayOverlay.classList.add('hidden');
    spin();
}

function stopAutoplay(keepButtonsLocked = false) {
    isAutoplaying = false;
    autoplayRemaining = 0;
    if(autoplayButton) autoplayButton.textContent = "自动";
    if (!isInFreeSpins && !keepButtonsLocked) {
        if(betUpButton) betUpButton.disabled = false;
        if(betDownButton) betDownButton.disabled = false;
        if(maxBetButton) maxBetButton.disabled = false;
    }
}

// --- 5. 免费旋转处理 ---
function triggerFreeSpins(scatterCount) {
    isInFreeSpins = true;
    freeSpinsRemaining = FREE_SPINS_AWARDED;
    freeSpinsTotalWin = 0;
    freeSpinsTitle.textContent = "恭喜！";
    freeSpinsMessage.textContent = `您获得了 ${freeSpinsRemaining} 次免费旋转！`;
    freeSpinsCounter.classList.add('hidden');
    freeSpinsStartButton.classList.remove('hidden');
    freeSpinsOverlay.classList.remove('hidden');
    if(betUpButton) betUpButton.disabled = true;
    if(betDownButton) betDownButton.disabled = true;
    if(maxBetButton) maxBetButton.disabled = true;
}

function startFreeSpins() {
    freeSpinsMessage.classList.add('hidden');
    freeSpinsStartButton.classList.add('hidden');
    freeSpinsCounter.classList.remove('hidden');
    freeSpinsRemainingDisplay.textContent = freeSpinsRemaining;
    freeSpinsOverlay.classList.add('hidden');
    playBGM('bgm-free-spin');
    spin();
}

async function endFreeSpins() {
    isInFreeSpins = false;
    freeSpinsTitle.textContent = "免费旋转结束";
    freeSpinsMessage.textContent = `您总共赢得了: ${freeSpinsTotalWin.toFixed(2)}`;
    freeSpinsMessage.classList.remove('hidden');
    freeSpinsCounter.classList.add('hidden');
    freeSpinsStartButton.textContent = "完成";
    freeSpinsStartButton.classList.remove('hidden');
    freeSpinsOverlay.classList.remove('hidden');
    
    freeSpinsStartButton.onclick = () => {
        freeSpinsOverlay.classList.add('hidden');
        if(spinButton) spinButton.disabled = false;
        if(betUpButton) betUpButton.disabled = false;
        if(betDownButton) betDownButton.disabled = false;
        if(maxBetButton) maxBetButton.disabled = false;
        playBGM('bgm-main');
        freeSpinsStartButton.onclick = startFreeSpins; 
        freeSpinsStartButton.textContent = "开始";
    };
}

// --- 6. 中奖线绘图与特效 ---
function clearWinningLines() {
    canvasCtx.clearRect(0, 0, winLinesCanvas.width, winLinesCanvas.height);
    document.querySelectorAll('.symbol-highlight').forEach(el => {
        el.classList.remove('symbol-highlight');
    });
}

function resizeCanvas() {
    winLinesCanvas.width = reelsContainer.clientWidth;
    winLinesCanvas.height = reelsContainer.clientHeight;
}

function getSymbolCoordinates(col, row) {
    if (!symbolElements[col] || !symbolElements[col][row]) return { x: 0, y: 0 };
    const symbol = symbolElements[col][row];
    const symbolRect = symbol.getBoundingClientRect();
    const containerRect = reelsContainer.getBoundingClientRect();
    const x = symbolRect.left + symbolRect.width / 2 - containerRect.left;
    const y = symbolRect.top + symbolRect.height / 2 - containerRect.top;
    return { x, y };
}

async function showWinningLinesSequentially(winningLines, grid) {
    isShowingWins = true;
    const lineDisplayTime = 800;
    for (const line of winningLines) {
        clearWinningLines();
        if (line.lineIndex !== 'SCATTER') {
            drawSingleWinningLine(line);
        }
        highlightSingleWinningLine(line, grid);
        await new Promise(resolve => setTimeout(resolve, lineDisplayTime));
    }
    clearWinningLines();
    isShowingWins = false;
}

function drawSingleWinningLine(line) {
    resizeCanvas();
    canvasCtx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
    canvasCtx.lineWidth = 5;
    canvasCtx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    canvasCtx.shadowBlur = 10;
    const path = line.path;
    const matchCount = line.matchCount;
    canvasCtx.beginPath();
    const startCoords = getSymbolCoordinates(0, path[0]);
    canvasCtx.moveTo(startCoords.x, startCoords.y);
    for (let c = 1; c < matchCount; c++) {
        const coords = getSymbolCoordinates(c, path[c]);
        canvasCtx.lineTo(coords.x, coords.y);
    }
    canvasCtx.stroke();
}

function highlightSingleWinningLine(line, grid) {
    if (line.lineIndex === 'SCATTER') {
        for (let c = 0; c < REEL_COLS; c++) {
            for (let r = 0; r < REEL_ROWS; r++) {
                if (grid[c][r] === 'SCATTER') {
                    const element = symbolElements[c][r];
                    element.classList.add('symbol-highlight');
                    spawnParticles(element);
                }
            }
        }
    } else {
        const path = line.path;
        const matchCount = line.matchCount;
        const firstSymbolId = line.symbolId;
        for (let c = 0; c < matchCount; c++) {
            const row = path[c];
            const symbolIdOnGrid = grid[c][row];
            if (symbolIdOnGrid === firstSymbolId || symbolIdOnGrid === 'WILD') {
                const element = symbolElements[c][row];
                element.classList.add('symbol-highlight');
                spawnParticles(element);
            }
        }
    }
}

function spawnParticles(element) {
    const rect = element.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    const startX = rect.left + rect.width / 2 - containerRect.left;
    const startY = rect.top + rect.height / 2 - containerRect.top;
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = `${startX}px`;
        p.style.top = `${startY}px`;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 40 + 20;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        p.animate([
            { transform: 'scale(1)', opacity: 1 },
            { transform: `translate(${endX}px, ${endY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600 + Math.random() * 200,
            easing: 'ease-out'
        });
        gameContainer.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
}

function triggerCoinFountain() {
    for (let i = 0; i < 30; i++) {
        const coin = document.createElement('div');
        coin.className = 'coin-particle';
        coin.style.left = `${Math.random() * 90 + 5}vw`;
        coin.style.animationDelay = `${Math.random() * 1}s`;
        gameContainer.appendChild(coin);
        setTimeout(() => coin.remove(), 3000);
    }
}

// --- 7. UI 辅助功能 ---
function updateBalance(amount) {
    balance += amount; // 这里的 amount 可能是 0 (如果从 API 获取了最终余额)
    balanceDisplay.textContent = balance.toFixed(2);
}

function updateBet(direction) {
    if (isInFreeSpins || isAutoplaying) return;
    currentBetIndex += direction;
    if (currentBetIndex < 0) currentBetIndex = 0;
    if (currentBetIndex >= BET_LEVELS.length) currentBetIndex = BET_LEVELS.length - 1;
    bet = BET_LEVELS[currentBetIndex];
    betDisplay.textContent = bet.toFixed(2);
}

function setMaxBet() {
    if (isInFreeSpins || isAutoplaying) return;
    currentBetIndex = BET_LEVELS.length - 1;
    updateBet(0);
}

function updateJackpot(amount) {
    jackpotAmount += amount;
    jackpotDisplay.textContent = jackpotAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function updateWinLossTable() {
    winLossTableBody.innerHTML = '';
    winLossRecords.forEach(record => {
        const row = winLossTableBody.insertRow(0);
        row.insertCell(0).textContent = record.round;
        row.insertCell(1).textContent = record.result;
        row.insertCell(2).textContent = record.amount;
    });
}

/**
 * v5.5.6 逻辑 (内存安全)
 * 向内存数组添加一条公告，并限制数组大小
 */
function addAnnouncement(message) {
    announcementMessages.push(message);
    if (announcementMessages.length > 5) announcementMessages.shift(); // 限制内存中数组的大小
    updateAnnouncementUI();
}

/**
 * v5.5.6 逻辑 (内存安全)
 * 从内存数组完全重绘公告 DOM，防止无限堆积
 */
function updateAnnouncementUI() {
    announcementContent.innerHTML = ''; // 关键：清空 DOM
    announcementMessages.forEach(msg => {
        const div = document.createElement('div');
        div.textContent = msg;
        announcementContent.appendChild(div); // 重新添加
    });
    announcementContent.scrollTop = announcementContent.scrollHeight;
}

function showBigWinOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'big-win-overlay';
    const img = document.createElement('img');
    img.className = 'big-win-image';
    img.src = './images/big-win.png'; 
    img.alt = 'Big Win!';
    gameContainer.appendChild(overlay);
    setTimeout(() => overlay.remove(), 3000);
}

function showJackpotWinOverlay() {
    jackpotWinOverlay.classList.remove('hidden');
}

function showPaytable() {
    paytableContent.innerHTML = '<h3>赔付表</h3>';
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    const header = table.createTHead().insertRow();
    header.innerHTML = '<th>符号</th><th>5个</th><th>4个</th><th>3个</th>';
    const tbody = table.createTBody();

    for (const symbolId in PAYTABLE) {
        if (PAYTABLE.hasOwnProperty(symbolId)) {
            const pays = PAYTABLE[symbolId];
            const data = SYMBOLS_DATA[symbolId];
            if (data) {
                const row = tbody.insertRow();
                const cellSymbol = row.insertCell();
                const img = document.createElement('img');
                img.src = data.path;
                img.style.width = '50px';
                img.style.height = '50px';
                cellSymbol.appendChild(img);
                cellSymbol.style.textAlign = 'center';
                row.insertCell().textContent = pays[5] || '-';
                row.insertCell().textContent = pays[4] || '-'; // 修复：原来这里缺少 4个 的数据
                row.insertCell().textContent = pays[3] || '-'; // 修复：原来这里缺少 3个 的数据
            }
        }
    }

    // 额外的逻辑，用于创建特效元素 (v3.0 逻辑)
    function showSmallWinEffect() {
        const overlay = document.createElement('div');
        overlay.className = 'smallwin-effect';
        gameContainer.appendChild(overlay);
        setTimeout(() => overlay.remove(), 1200);
    }
    
    function showBigWinEffect() {
        const overlay = document.createElement('div');
        overlay.className = 'bigwin-effect';
        const title = document.createElement('h1');
        title.textContent = "BIG WIN!";
        overlay.appendChild(title);
        gameContainer.appendChild(overlay);
        setTimeout(() => overlay.remove(), 1500);
    }
    
    function showFreeSpinEffect() {
        const overlay = document.createElement('div');
        overlay.className = 'freespin-effect';
        const title = document.createElement('h2');
        title.textContent = "FREE SPINS!";
        overlay.appendChild(title);
        gameContainer.appendChild(overlay);
        setTimeout(() => overlay.remove(), 2000);
    }
    
    // 缺失的 startGameLoop 函数，仅作为占位符
    function startGameLoop() {
        // 在这里可以放置 Jackpot 更新、公告滚动的定时任务
        console.log("主游戏循环启动...");
        gameLoopTimer = setInterval(() => {
            // 模拟 Jackpot 持续跳动
            updateJackpot(Math.random() * 0.1); 
            // 模拟随机公告
            if (Math.random() < 0.1) { // 10% 几率触发公告
                const winner = generateUniquePlayerName();
                const winAmount = (Math.random() * 50000 + 10000).toFixed(2);
                addAnnouncement(`恭喜玩家 ${winner} 赢得 ${winAmount}！`);
            }
        }, 3000); // 每 3 秒执行一次循环
    }
    
    // 缺失的 toggleFullScreen 函数，仅作为占位符
    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            if (gameContainer.requestFullscreen) {
                gameContainer.requestFullscreen();
            } else if (gameContainer.webkitRequestFullscreen) { /* Safari */
                gameContainer.webkitRequestFullscreen();
            } else if (gameContainer.msRequestFullscreen) { /* IE11 */
                gameContainer.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    }
    
    // 返回赔付表显示
    paytableContent.appendChild(table);
    paytableOverlay.classList.remove('hidden');
}

function hidePaytable() {
    paytableOverlay.classList.add('hidden');
}


// --- 补充缺失的特效函数 (v3.0 合并) ---

// 必须在 spin 函数中调用这些特效函数
function showSmallWinEffect() {
    const overlay = document.createElement('div');
    overlay.className = 'smallwin-effect';
    gameContainer.appendChild(overlay);
    setTimeout(() => overlay.remove(), 1200);
}

function showBigWinEffect() {
    const overlay = document.createElement('div');
    overlay.className = 'bigwin-effect';
    const title = document.createElement('h1');
    title.textContent = "BIG WIN!";
    overlay.appendChild(title);
    gameContainer.appendChild(overlay);
    setTimeout(() => overlay.remove(), 1500);
}

function showFreeSpinEffect() {
    const overlay = document.createElement('div');
    overlay.className = 'freespin-effect';
    const title = document.createElement('h2');
    title.textContent = "FREE SPINS!";
    overlay.appendChild(title);
    gameContainer.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2000);
}

// --- 补充缺失的辅助函数 ---

// 主游戏循环 (在 initializeGame 中调用)
function startGameLoop() {
    console.log("主游戏循环启动...");
    gameLoopTimer = setInterval(() => {
        // 模拟 Jackpot 持续跳动
        updateJackpot(Math.random() * 0.1); 
        // 模拟随机公告
        if (Math.random() < 0.1) { // 10% 几率触发公告
            const winner = generateUniquePlayerName();
            const winAmount = (Math.random() * 50000 + 10000).toFixed(2);
            addAnnouncement(`恭喜玩家 ${winner} 赢得 ${winAmount}！`);
        }
    }, 3000); // 每 3 秒执行一次循环
}

// 全屏切换函数
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        if (gameContainer.requestFullscreen) {
            gameContainer.requestFullscreen();
        } else if (gameContainer.webkitRequestFullscreen) { /* Safari */
            gameContainer.webkitRequestFullscreen();
        } else if (gameContainer.msRequestFullscreen) { /* IE11 */
            gameContainer.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
}
