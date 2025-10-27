from flask import Flask, jsonify, request
from flask_cors import CORS  # 處理跨域請求
import random

app = Flask(__name__)
# 允許所有來源的跨域請求 (在真實產品中應限制為您的遊戲域名)
CORS(app) 

# --- 遊戲核心配置 ---
RTP = 40  # 玩家回報率 40% (此處僅為標記, 需複雜算法實現)
PAYLINES_DATA = [...] # (此處省略 25 條線的座標定義)
REEL_STRIPS = { # 每個轉軸的符號列表 (控制機率)
    "reel1": ["sym_7", "sym_dollar", "sym_lian", "sym_coin", "sym_bell", "sym_fish", "sym_coin"],
    "reel2": ["sym_bell", "sym_fish", "sym_wild", "sym_coin", "sym_dollar", "sym_coin", "sym_7"],
    "reel3": ["sym_wild", "sym_lian", "sym_7", "sym_dollar", "sym_fish", "sym_bell", "sym_coin"],
    "reel4": ["sym_bell", "sym_fish", "sym_wild", "sym_coin", "sym_dollar", "sym_coin", "sym_7"],
    "reel5": ["sym_7", "sym_dollar", "sym_lian", "sym_coin", "sym_bell", "sym_fish", "sym_coin"],
}

# --- 虛擬 Jackpot 相關 ---
# 依照您的要求: "隨機生成名字報喜jackpot盛宴"
FAKE_JACKPOT_NAMES = ["DragonKing_888", "LuckyTiger_99", "BossChai_01", "WalkerTey_VIP", "LianYing_VIP"]
# 依照您的要求: "jackpot無論哪個絕對不會掉給玩家"
current_grand_jackpot = 5800000.00
current_major_jackpot = 58000.00
current_minor_jackpot = 580.00


@app.route('/api/spin', methods=['POST'])
def handle_spin():
    """
    這是後端的核心！
    前端發送 'spin' 請求到這裡。
    這裡決定玩家的命運 (40% RTP)。
    """
    # 獲取前端發來的數據 (例如玩家 ID 和賭注)
    # data = request.json
    # user_id = data.get('userId')
    # bet_amount = data.get('bet')
    
    # 1. 根據 40% RTP 和設定的轉軸表 (REEL_STRIPS)
    #    生成一個「隨機」但「可控」的結果
    #
    #    (---- 這裡省略了數千行真實的老虎機數學模型 (RNG) ----)
    #
    #    ** 我們只返回一個用於前端測試的【演示結果】 **
    
    # 隨機決定是否觸發演示特效
    if random.randint(1, 3) == 1: # 提高觸發機率
        # 演示觸發擴展 WILD 和 BIG WIN
        spin_result = {
            "stopPositions": [
                ['sym_dollar', 'sym_coin', 'sym_bell'],
                ['sym_dollar', 'sym_coin', 'sym_bell'],
                ['sym_wild', 'sym_wild', 'sym_wild'], # 強制觸發 WILD
                ['sym_7', 'sym_fish', 'sym_bell'],
                ['sym_dollar', 'sym_coin', 'sym_bell'],
            ],
            "winAmount": 2000, # 演示 Big Win (2000 / 100 bet = 20x)
            "paylinesHit": [{"line": 1, "symbols": "...", "win": 2000}],
            "triggeredFeature": "EXPANDING_WILD", # 告知前端播放特效
            "cascades": [] 
        }
    else:
        # 演示一個「未中獎」的結果
        spin_result = {
            "stopPositions": [
                ['sym_coin', 'sym_7', 'sym_bell'],
                ['sym_bell', 'sym_lian', 'sym_fish'],
                ['sym_7', 'sym_dollar', 'sym_coin'],
                ['sym_fish', 'sym_coin', 'sym_bell'],
                ['sym_dollar', 'sym_bell', 'sym_7'],
            ],
            "winAmount": 0,
            "paylinesHit": [],
            "triggeredFeature": None,
            "cascades": [] 
        }

    # 2. 累加一點點 Jackot (僅為演示)
    global current_grand_jackpot
    current_grand_jackpot += 0.50 # 每次旋轉增加 0.5
    
    # 3. 返回結果給前端 (前端只負責播放動畫)
    return jsonify(spin_result)


@app.route('/api/getFakeWinner', methods=['GET'])
def get_fake_winner():
    """
    這是前端觸發喜報時，來獲取假名字的 API
    完全按照您的要求："jackpot絕不掉給玩家，隨機生成名字報喜"
    """
    global current_grand_jackpot
    
    # 1. 隨機選一個名字
    winner_name = random.choice(FAKE_JACKPOT_NAMES)
    
    # 2. 獲取當前獎池金額
    jackpot_amount = current_grand_jackpot
    
    # 3. (關鍵) 重置獎池金額 (假裝有人中獎了)
    current_grand_jackpot = current_major_jackpot + random.randint(1000, 5000)
    
    # 4. 返回喜報信息
    return jsonify({
        "winnerName": winner_name,
        "amountWon": f"¥{jackpot_amount:,.2f}" # 格式化為貨幣
    })


if __name__ == '__main__':
    # 啟動服務器
    # 監聽 0.0.0.0 確保外部可以訪問
    app.run(host='0.0.0.0', port=5000, debug=True)
