// --- Pixi.js 游戏代码 ---

// 設置遊戲畫布 (例如 1920x1080)
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
// 确保 DOM 加载后再添加
document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.appendChild(app.view);
    }
});

// 資源加載器
const loader = PIXI.Assets;

// --- 1. 定義所有遊戲資源 ---
// (注意: 文件夹已全部修正为小写 'assets')
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
        const textures = await loader.load(Object.values(ASSETS));
        console.log("資源加載完畢！");

        // 創建遊戲場景
        createScene(textures);
    } catch (error) {
        console.error("資源加載失敗! 檢查 'assets' 文件夾路徑和文件名是否正確。", error);
        // (可以在此處向玩家显示一个更友好的错误提示)
        const errorText = new PIXI.Text('資源加載失敗，請刷新重試', { fill: 0xFF0000, fontSize: 40 });
        errorText.anchor.set(0.5);
        errorText.x = GAME_WIDTH / 2;
        errorText.y = GAME_HEIGHT / 2;
        app.stage.addChild(errorText);
    }
}

// --- 3. 創建遊戲場景 ---
function createScene(textures) {
    // A. 創建背景
    const background = new PIXI.Sprite(textures[ASSETS.background]);
    background.width = GAME_WIDTH;
    background.height = GAME_HEIGHT;
    app.stage.addChild(background);

    // B. 創建 5x3 轉軸容器
    reelContainer = new PIXI.Container();
    app.stage.addChild(reelContainer);
    reelContainer.x = 400; // 示例 X 座標
    reelContainer.y = 300; // 示例 Y 座標

    // C. 創建 SPIN 按鈕 (示例)
    spinButton = new PIXI.Graphics();
    spinButton.beginFill(0xDEB887);
    spinButton.drawCircle(0, 0, 80);
    spinButton.endFill();
    spinButton.x = GAME_WIDTH / 2;
    spinButton.y = GAME_HEIGHT - 120;
    spinButton.eventMode = 'static'; // 啟用互動
    spinButton.cursor = 'pointer';
    app.stage.addChild(spinButton);
    
    const spinText = new PIXI.Text('SPIN', { fill: 0x000, fontSize: 30, fontWeight: 'bold' });
    spinText.anchor.set(0.5);
    spinButton.addChild(spinText);

    // D. 綁定點擊事件
    spinButton.on('pointerdown', handleSpin);

    // E. 啟動虛擬 Jackpot 廣播
    startFakeJackpotTimer();
}

// --- 4. 處理旋轉 (核心邏輯) ---
async function handleSpin() {
    if (isSpinning) return; // 防止重複點擊
    isSpinning = true;
    spinButton.alpha = 0.5; // 禁用按鈕

    console.log("前端：開始旋轉...");
    
    // (前端) 播放轉軸模糊滾動動畫... (省略)
    
    // (前端) 向您的後端服務器發送請求
    try {
        const response = await fetch('http://127.0.0.1:5000/api/spin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'player_123', bet: 100 }) 
        });
        
        if (!response.ok) {
            throw new Error('後端服務器錯誤！');
        }
        
        const spinResult = await response.json();
        console.log("前端：收到後端結果", spinResult);

        // (前端) 停止滾動動畫，顯示 spinResult.stopPositions 的符號 (省略)
        
        console.log("前端：旋轉停止！顯示結果。");

        // (前端) 根據結果觸發「視覺盛宴」
        if (spinResult.triggeredFeature === 'EXPANDING_WILD') {
            await playExpandingWildAnimation(2); // 觸發第 3 根轉軸 (索引為 2)
        }

        // (前端) 點亮中獎線
        if (spinResult.winAmount > 0) {
            await showPaylines(spinResult.paylinesHit);
            console.log(`前端：贏得: ${spinResult.winAmount}`);

            // --- ↓↓↓ 新增 BIG WIN 邏輯 ↓↓↓ ---
            const currentBet = 100; // 假設賭注 (应从 UI 获取)
            const winMultiplier = spinResult.winAmount / currentBet;

            if (winMultiplier >= 75) {
                await playBigWinAnimation('EPIC', spinResult.winAmount);
            } else if (winMultiplier >= 40) {
                await playBigWinAnimation('MEGA', spinResult.winAmount);
            } else if (winMultiplier >= 15) {
                await playBigWinAnimation('BIG', spinResult.winAmount);
            }
            // --- ↑↑↑ BIG WIN 邏輯結束 ↑↑↑ ---
        }

        // (前端) 觸發瀑布式轉軸 (Cascading)
        // if (spinResult.cascades.length > 0) { ... }

    } catch (error) {
        console.error("旋轉請求失敗:", error);
        // (前端) 在此處向玩家顯示錯誤提示
    }

    isSpinning = false;
    spinButton.alpha = 1.0; // 恢復按鈕
}

// --- 5. 視覺盛宴功能 ---

// (特效) 神龍吐息 (擴展 WILD)
async function playExpandingWildAnimation(reelIndex) {
    console.log("視覺盛宴：神龍吐息！激活背景龍柱...");
    // ... (真實的 Pixi.js 動畫代碼) ...
    await new Promise(res => setTimeout(res, 1000)); // 模擬等待動畫 1 秒
}

// (特效) 顯示中獎線
async function showPaylines(lines) {
    console.log(`點亮 ${lines.length} 條中獎線！`);
    // ... (真實的 Pixi.js 線條繪製代碼) ...
    await new Promise(res => setTimeout(res, 500)); // 模擬顯示 0.5 秒
}

// (特效) 虛擬 Jackpot 廣播
function startFakeJackpotTimer() {
    const randomTime = (Math.random() * 4 * 60 + 60) * 1000;
    
    setTimeout(async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/getFakeWinner');
            const jackpotInfo = await response.json();

            console.log("JACKPOT 喜報觸發！");

            // ** 這裡應該用 Pixi.js 創建一個華麗的 UI 彈窗, 而不是 alert **
            alert(`狂賀！玩家 ${jackpotInfo.winnerName} 喜提 GRAND JACKPOT 巨額獎金 ${jackpotInfo.amountWon}！`);
        
        } catch (error) {
            console.error("獲取 Jackpot 喜報失敗:", error);
        }
        
        // 再次啟動下一次計時
        startFakeJackpotTimer();
        
    }, randomTime);
}

// --- 6. (新函數) 視覺盛宴 - Big Win 動畫 ---
async function playBigWinAnimation(level, amount) {
    console.log(`視覺盛宴觸發：${level} WIN！ 金額: ${amount}`);
    
    // (特效) 1. 暫停遊戲, 停止音樂
    isSpinning = true; // 鎖定遊戲, 防止玩家亂點
    // ... 停止音樂的代碼 ...

    // (特效) 2. 播放 build-up 音效
    // ... 播放音效 ...

    // (特效) 3. 彈出 "BIG WIN" / "MEGA WIN" 標題
    const winText = new PIXI.Text(`${level} WIN!`, {
        fontSize: 150,
        fill: ['#FFD700', '#F7DC6F'], // 金色漸變
        stroke: '#8B4513',
        strokeThickness: 10,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 10,
        dropShadowDistance: 5,
    });
    winText.anchor.set(0.5);
    winText.x = GAME_WIDTH / 2;
    winText.y = GAME_HEIGHT / 2 - 100;
    app.stage.addChild(winText);

    // (特效) 4. 獎金計數器
    const amountText = new PIXI.Text(`0.00`, {
        fontSize: 120,
        fill: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 5,
    });
    amountText.anchor.set(0.5);
    amountText.x = GAME_WIDTH / 2;
    amountText.y = GAME_HEIGHT / 2 + 100;
    app.stage.addChild(amountText);

    // (特效) 5. 金幣噴泉 (使用 6127.jpg)
    console.log("播放金幣噴泉 (使用 6127.jpg)...");

    // (特效) 6. 數字跳動動畫 (簡易版)
    let currentAmount = 0;
    const increment = amount / 100; // 100 幀跳完
    for (let i = 0; i < 100; i++) {
        currentAmount += increment;
        amountText.text = `¥${currentAmount.toFixed(2)}`;
        await new Promise(res => setTimeout(res, 30)); // 模擬跳動
    }
    amountText.text = `¥${amount.toFixed(2)}`; // 確保顯示最終準確數字

    // (特效) 7. 根據 level 播放額外特效
    if (level === 'MEGA') {
        console.log("播放 6128.jpg 金龍飛過...");
    }
    if (level === 'EPIC') {
        console.log("播放 6128.jpg 金龍 + 4720.png '聯' + 6120.jpg 元寶 全屏特效...");
    }

    // (特效) 8. 等待幾秒讓玩家欣賞
    await new Promise(res => setTimeout(res, 3000)); // 停留 3 秒

    // (特效) 9. 清理動畫
    app.stage.removeChild(winText);
    app.stage.removeChild(amountText);
    // ... 停止粒子效果 ...

    console.log("Big Win 動畫結束。");
    isSpinning = false; // 解鎖遊戲
}


// --- 啟動遊戲 ---
main();