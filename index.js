/* 最终版index.js实现 */

// 初始化变量
let words = [];
let displayedWords = [];
let order = [];

// 加载词库
function loadWords() {
    fetch('words.csv')
        .then(response => response.ok ? response.text() : Promise.reject('词库加载失败'))
        .then(data => words = data.split(','))
        .catch(err => {
            console.error(err);
            showAlert('词库加载失败');
        });
}

// 核心功能
function refreshWords() {
    if (!words.length) return showAlert('请先加载词库');
    showModal('确定刷新选词？', () => {
        displayedWords = Array(4).fill().map(() => 
            words[Math.floor(Math.random() * words.length)]);
        updateDisplay();
        saveState();
    });
}

function refreshOrder() {
    showModal('确定刷新顺序？', () => {
        // 从1-4中随机选取3个不重复数字
        const numbers = [1,2,3,4];
        order = [];
        while(order.length < 3) {
            const randomIndex = Math.floor(Math.random() * numbers.length);
            const num = numbers[randomIndex];
            if(!order.includes(num)) {
                order.push(num);
            }
        }
        showAlert(`新顺序: ${order.join(',')}`);
        saveState();
    });
}

function toggleDisplay() {
    const el = document.getElementById('word-display');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
    saveState();
}

function showOrder() {
    if (order && order.length > 0) {
        showAlert('当前次序为：' + order.join(', '));
    } else {
        showAlert('请先刷新次序！');
    }
}

// 辅助功能
function updateDisplay() {
    const el = document.getElementById('word-display');
    el.innerHTML = displayedWords.join(' | ');
    el.style.display = 'block';
}

function saveState() {
    localStorage.setItem('words', JSON.stringify(displayedWords));
    localStorage.setItem('order', JSON.stringify(order));
    localStorage.setItem('displayState', 
        document.getElementById('word-display').style.display);
}

// 初始化
window.onload = () => {
    loadWords();
    if (localStorage.getItem('words')) {
        displayedWords = JSON.parse(localStorage.getItem('words'));
        order = JSON.parse(localStorage.getItem('order')) || [];
        updateDisplay();
        
        const displayState = localStorage.getItem('displayState');
        if (displayState === 'none') {
            document.getElementById('word-display').style.display = 'none';
        }
    }
};