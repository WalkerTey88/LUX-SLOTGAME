// --- Pixi.js 遊戲代碼 ---

// 設置遊戲畫布尺寸
const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

// 創建 Pixi.js 應用
const app = new PIXI.Application({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x000000,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
});

// 確保 DOM 準備好後添加畫布
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('game-container');
    if (container) {
        container.appendChild(app.view);
    } else {
        console.error('Game container not found!');
    }
});

// 資源加載器
const loader = PIXI.Loader;

// --- 1. 定義所有遊戲資源 ---
const ASSETS = {
    // 背景
    background: 'assets/6114.jpg',
    // 符號
    sym_lian: 'assets/4720.png',    // 頂級符號 "聯"
    sym_wild: 'assets/6128.jpg',    // WILD (金龍)
    sym_scatter: 'assets/6121.jpg', // Scatter (中國結)
    sym_bonus: 'assets/6122.jpg',   // Bonus ("福")
    sym_7: 'assets/6125.jpg',       // 7
    sym_dollar: 'assets/6127.jpg',  // $ 金幣
    sym_fish: 'assets/6123.jpg',    // 錦鯉
    sym_coin: 'assets/6124.jpg',    // 錢幣
    sym_bell: 'assets/6126.jpg',    // 鈴鐺
    sym_ingot: 'assets/6120.jpg',   // 元寶 (備用)
    // UI & 特效
    ui_jackpot: 'assets/4771.jpg',
    ui_freespins: 'assets/6130.jpg',
};

// 遊戲狀態
let spinButton;
let reelContainer;
let reels = []; // 存放 5 個轉軸
let isSpinning = false;

// --- 2. 啟動遊戲 ---
async function main() {
    console.log("開始加載「聯英社」資源...");
    try {
        // 批量加載所有資源
        const textures = await new Promise((resolve, reject) => {
            loader.add(Object.values(ASSETS))
                  .load((loader, resources) => resolve(resources))
                  .on('error', (error) => reject(error));
        });
        console.log("資源加載完畢！");

        // 創建遊戲場景
        createScene(textures);
    } catch (error) {
        console.error("資源加載失敗:", error);
        alert("資源加載失敗，請檢查網絡或文件路徑！");
    }
}

// --- 3. 創建遊戲場景 ---
function createScene(resources) {
    // A. 創建背景
    const background = new PIXI.Sprite(resources[ASSETS.background].texture);
    background.width = GAME_WIDTH;
    background.height = GAME_HEIGHT;
    app.stage.addChild(background);

    // B. 創建 5x3 轉軸容器
    reelContainer = new PIXI.Container();
    app.stage.addChild(reelContainer);
    reelContainer.x = 400; // 調整為適當位置
    reelContainer.y = 300; // 調整為適當位置

    // C. 初始化 5 個轉軸
    for (let i = 0; i < 5; i++) {
        reels[i] = [];
        const reel = new PIXI.Container();
        reelContainer.addChild(reel);
        reel.x = i * 300; // 每個轉軸間隔 300px
        for (let j = 0; j < 3; j++) {
            const symbol = new PIXI.Sprite(resources[Object.values(ASSETS)[Math.floor(Math.random() * 10) + 1]].texture); // 隨機符號
            symbol.y = j * 150; // 每個符號間隔 150px
            symbol.anchor.set(0.5);
            symbol.x = 150;
            symbol.scale.set(0.5); // 調整大小
            reel.addChild(symbol);
            reels[i][j] = symbol;
        }
    }

    // D. 創建 SPIN 按鈕
    spinButton = new PIXI.Graphics();
    spinButton.beginFill(0xDEB887);
    spinButton.drawCircle(0, 0, 80);
    spinButton.endFill();
    spinButton.x = GAME_WIDTH / 2;
    spinButton.y = GAME_HEIGHT - 120;
    spinButton.eventMode = 'static';
    spinButton.cursor = 'pointer';
    app.stage.addChild(spinButton);

    const spinText = new PIXI.Text('SPIN', { fill: 0x000000, fontSize: 30, fontWeight: 'bold' });
    spinText.anchor.set(0.5);
    spinButton.addChild(spinText);

    // E. 綁定點擊事件
    spinButton.on('pointerdown', handleSpin);

    // F. 啟動虛擬 Jackpot 廣播
    startFakeJackpotTimer();
}

// --- 4. 處理旋轉 (核心邏輯) ---
async function handleSpin() {
    if (isSpinning) return;
    isSpinning = true;
    spinButton.alpha = 0.5;

    console.log("前端：開始旋轉...");
    // 模擬滾動動畫
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
            reels[i][j].y += 150 * (i + 1); // 不同速度滾動
            if (reels[i][j].y > 300) reels[i][j].y -= 450; // 循環
        }
        await new Promise(res => setTimeout(res, 100)); // 逐個轉軸滾動
        app.render();
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/api/spin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'player_123', bet: 100 })
        });
        if (!response.ok) throw new Error('後端服務器錯誤！');
        const spinResult = await response.json();
        console.log("前端：收到後端結果", spinResult);

        // 應用停止位置
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                const symbolName = spinResult.stopPositions[i][j];
                reels[i][j].texture = loader.resources[ASSETS[symbolName]].texture;
                reels[i][j].y = j * 150; // 重置位置
            }
        }

        // 觸發特效
        if (spinResult.triggeredFeature === 'EXPANDING_WILD') {
            await playExpandingWildAnimation(2);
        }

        // 顯示中獎線
        if (spinResult.winAmount > 0) {
            await showPaylines(spinResult.paylinesHit);
            const winText = new PIXI.Text(`贏得: ${spinResult.winAmount}`, { fill: 0xFFD700, fontSize: 40 });
            winText.anchor.set(0.5);
            winText.x = GAME_WIDTH / 2;
            winText.y = GAME_HEIGHT / 2;
            app.stage.addChild(winText);
            setTimeout(() => app.stage.removeChild(winText), 2000);
        }

    } catch (error) {
        console.error("旋轉請求失敗:", error);
        alert('網絡錯誤，請重試！');
    }

    isSpinning = false;
    spinButton.alpha = 1.0;
}

// --- 5. 視覺盛宴功能 ---

// (特效) 神龍吐息 (擴展 WILD)
async function playExpandingWildAnimation(reelIndex) {
    console.log("視覺盛宴：神龍吐息！激活背景龍柱...");
    for (let j = 0; j < 3; j++) {
        reels[reelIndex][j].texture = loader.resources[ASSETS.sym_wild].texture;
        reels[reelIndex][j].scale.set(0.7); // 放大效果
        await new Promise(res => setTimeout(res, 300));
    }
    await new Promise(res => setTimeout(res, 1000)); // 維持 1 秒
    for (let j = 0; j < 3; j++) {
        reels[reelIndex][j].scale.set(0.5); // 恢復
    }
}

// (特效) 顯示中獎線
async function showPaylines(lines) {
    console.log(`點亮 ${lines.length} 條中獎線！`);
    const paylineGraphics = new PIXI.Graphics();
    paylineGraphics.lineStyle(4, 0xFFD700);
    paylineGraphics.moveTo(400, 450); // 起始點（根據 reelContainer 位置調整）
    paylineGraphics.lineTo(1600, 450); // 終點
    app.stage.addChild(paylineGraphics);
    await new Promise(res => setTimeout(res, 500));
    app.stage.removeChild(paylineGraphics);
}

// (特效) 虛擬 Jackpot 廣播
function startFakeJackpotTimer() {
    const randomTime = (Math.random() * 4 * 60 + 60) * 1000;
    setTimeout(async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/getFakeWinner');
            const jackpotInfo = await response.json();
            console.log("JACKPOT 喜報觸發！");
            const jackpotText = new PIXI.Text(
                `狂賀！玩家 ${jackpotInfo.winnerName} 喜提 GRAND JACKPOT ${jackpotInfo.amountWon}!`,
                { fill: 0xFFD700, fontSize: 40 }
            );
            jackpotText.anchor.set(0.5);
            jackpotText.x = GAME_WIDTH / 2;
            jackpotText.y = GAME_HEIGHT / 2;
            app.stage.addChild(jackpotText);
            await new Promise(res => setTimeout(res, 3000));
            app.stage.removeChild(jackpotText);
        } catch (error) {
            console.error("獲取 Jackpot 喜報失敗:", error);
        }
        startFakeJackpotTimer();
    }, randomTime);
}

// --- 啟動遊戲 ---
main();