// GAME STATE VARIABLES
let playerSecret = 0;
let botSecret = 0;
let currentTurn = 1;
const maxTurns = 10;
let activeModalType = '';
let gameOver = false;

// BOT AI STATE VARIABLES
let botMin = 1;
let botMax = 100;
let botDifficulty = 'medium';

// KHỞI ĐỘNG GAME
function startGame() {
    const input = document.getElementById('player-number');
    const val = parseInt(input.value);

    if (isNaN(val) || val < 1 || val > 100) {
        alert('Vui lòng nhập số bí mật từ 1 đến 100!');
        return;
    }

    playerSecret = val;
    botSecret = Math.floor(Math.random() * 100) + 1;
    botDifficulty = document.getElementById('bot-difficulty').value;
    currentTurn = 1;
    botMin = 1;
    botMax = 100;
    gameOver = false;

    document.getElementById('disp-user-secret').innerText = playerSecret;
    document.getElementById('current-turn').innerText = currentTurn;
    document.getElementById('max-turn').innerText = maxTurns;
    document.getElementById('battle-log').innerHTML = '';

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    addLog('Hệ thống: Trận đấu bắt đầu! Chúc bạn may mắn.', 'system');
}

// THÊM NHẬT KÝ VÀO LOG
function addLog(message, type) {
    const logList = document.getElementById('battle-log');
    const li = document.createElement('li');
    li.className = `log-item log-${type}`;
    li.innerHTML = message;
    logList.insertBefore(li, logList.firstChild);
}

/* KỸ NĂNG VÀ HÀNH ĐỘNG CỦA NGƯỜI CHƠI */
function openSkillModal(type) {
    if (gameOver) return;
    activeModalType = type;
    const modal = document.getElementById('action-modal');
    const icon = document.getElementById('modal-skill-icon');
    const title = document.getElementById('modal-skill-title');
    const desc = document.getElementById('modal-skill-desc');
    const input = document.getElementById('modal-input-val');

    input.value = '';

    if (type === 'A') {
        icon.innerText = '🔍';
        title.innerText = 'KỸ NĂNG A: ĐỊNH VỊ MỐC';
        desc.innerText = 'Nhập mốc X (1-100) để hỏi xem số Bot lớn hơn hay nhỏ hơn X.';
        input.placeholder = 'Ví dụ: 50';
    } else if (type === 'D') {
        icon.innerText = '🎯';
        title.innerText = 'KỸ NĂNG D: ĐOÁN SỐ';
        desc.innerText = 'Nhập chính xác con số bạn cho là số bí mật của Bot!';
        input.placeholder = 'Ví dụ: 62';
    }

    modal.classList.remove('hidden');
    input.focus();
}

function closeModal() {
    document.getElementById('action-modal').classList.add('hidden');
}

function submitModalSkill() {
    const val = parseInt(document.getElementById('modal-input-val').value);
    if (isNaN(val) || val < 1 || val > 100) {
        alert('Vui lòng nhập số hợp lệ từ 1 đến 100!');
        return;
    }

    closeModal();

    if (activeModalType === 'A') {
        useSkillA(val);
    } else if (activeModalType === 'D') {
        useSkillD(val);
    }
}

function useSkillA(moc) {
    if (botSecret > moc) {
        addLog(`<b>Bạn (Kỹ năng A):</b> Hỏi mốc ${moc} ➔ Manh mối: Số Bot <b>LỚN HƠN ${moc}</b>.`, 'user');
    } else if (botSecret < moc) {
        addLog(`<b>Bạn (Kỹ năng A):</b> Hỏi mốc ${moc} ➔ Manh mối: Số Bot <b>NHỎ HƠN ${moc}</b>.`, 'user');
    } else {
        addLog(`<b>Bạn (Kỹ năng A):</b> Hỏi mốc ${moc} ➔ Trúng luôn! Số Bot chính là <b>${moc}</b>!`, 'user');
        triggerWin(true, `Bạn đã dùng kỹ năng A và may mắn trúng ngay số ${moc}!`);
        return;
    }
    endPlayerTurn();
}

function useSkillB() {
    if (gameOver) return;
    const isEven = (botSecret % 2 === 0);
    const res = isEven ? 'SỐ CHẴN' : 'SỐ LẺ';
    addLog(`<b>Bạn (Kỹ năng B):</b> Kiểm tra Chẵn/Lẻ ➔ Manh mối: Số Bot là <b>${res}</b>.`, 'user');
    endPlayerTurn();
}

function useSkillC() {
    if (gameOver) return;
    const rem = botSecret % 3;
    addLog(`<b>Bạn (Kỹ năng C):</b> Chia cho 3 dư mấy? ➔ Manh mối: Số Bot chia 3 <b>dư ${rem}</b>.`, 'user');
    endPlayerTurn();
}

function useSkillD(guess) {
    if (guess === botSecret) {
        addLog(`<b>Bạn (Đoán số):</b> Đoán ${guess} ➔ 🎯 CHÍNH XÁC!`, 'user');
        triggerWin(true, `Bạn đã đoán chính xác số ${botSecret} của Bot!`);
    } else if (guess < botSecret) {
        addLog(`<b>Bạn (Đoán số):</b> Đoán ${guess} ➔ ❌ Sai! Số Bot <b>LỚN HƠN ${guess}</b>.`, 'user');
        endPlayerTurn();
    } else {
        addLog(`<b>Bạn (Đoán số):</b> Đoán ${guess} ➔ ❌ Sai! Số Bot <b>NHỎ HƠN ${guess}</b>.`, 'user');
        endPlayerTurn();
    }
}

/* LƯỢT VÀ TRÍ TUỆ AI CỦA BOT */
function endPlayerTurn() {
    if (gameOver) return;

    // Tự động chuyển sang lượt Bot sau 0.8 giây
    setTimeout(() => {
        botTakeTurn();
    }, 800);
}

function botTakeTurn() {
    let botGuess = 0;

    if (botDifficulty === 'easy') {
        botGuess = Math.floor(Math.random() * (botMax - botMin + 1)) + botMin;
    } else {
        // Thuật toán Tìm kiếm nhị phân (Binary Search)
        botGuess = Math.floor((botMin + botMax) / 2);
    }

    if (botGuess === playerSecret) {
        addLog(`<b>Bot (AI):</b> Đoán số của bạn là <b>${botGuess}</b> ➔ 🎯 BOT ĐÃ ĐOÁN TRÚNG!`, 'bot');
        triggerWin(false, `Bot đã đoán đúng số ${playerSecret} của bạn!`);
        return;
    } else {
        if (botGuess < playerSecret) {
            addLog(`<b>Bot (AI):</b> Đoán số bạn là ${botGuess} ➔ Sai! (Số của bạn lớn hơn)`, 'bot');
            botMin = botGuess + 1;
        } else {
            addLog(`<b>Bot (AI):</b> Đoán số bạn là ${botGuess} ➔ Sai! (Số của bạn nhỏ hơn)`, 'bot');
            botMax = botGuess - 1;
        }
    }

    currentTurn++;
    if (currentTurn > maxTurns) {
        triggerDraw();
    } else {
        document.getElementById('current-turn').innerText = currentTurn;
    }
}

/* XỬ LÝ KẾT THÚC TRẬN ĐẤU */
function triggerWin(isPlayerWinner, text) {
    gameOver = true;
    const modal = document.getElementById('gameover-modal');
    const icon = document.getElementById('go-icon');
    const title = document.getElementById('go-title');
    const desc = document.getElementById('go-desc');

    if (isPlayerWinner) {
        icon.innerText = '🏆';
        title.innerText = 'BẠN ĐÃ THẮNG!';
        title.style.color = 'var(--accent-green)';
        desc.innerText = text + ` (Số của Bot là ${botSecret})`;
    } else {
        icon.innerText = '💀';
        title.innerText = 'BẠN ĐÃ THUA!';
        title.style.color = 'var(--accent-red)';
        desc.innerText = text + ` (Số của Bot là ${botSecret})`;
    }

    modal.classList.remove('hidden');
}

function triggerDraw() {
    gameOver = true;
    const modal = document.getElementById('gameover-modal');
    document.getElementById('go-icon').innerText = '⏳';
    document.getElementById('go-title').innerText = 'HẾT LƯỢT - HÒA!';
    document.getElementById('go-title').style.color = 'var(--accent-yellow)';
    document.getElementById('go-desc').innerText = `Đã hết ${maxTurns} lượt mà chưa ai đoán trúng! Số của Bot là ${botSecret}.`;
    modal.classList.remove('hidden');
}

function restartGame() {
    document.getElementById('gameover-modal').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
    document.getElementById('player-number').value = '';
}
