/* 最终版index.js实现 - 模块化重构 */

/**
 * 词语管理器 - 管理词语数据和相关操作
 */
const WordManager = {
    // 词语数据
    wordsByCategory: {},
    allWords: [],
    displayedWords: [],
    order: [],
    
    // 类别设置
    currentCategory: 'all',
    selectedCategories: [],
    excludedCategories: [],
    categoryMode: 'include',
    
    /**
     * 初始化词语管理器
     */
    init() {
        // 延迟加载词库，优先显示界面
        setTimeout(this.loadWords.bind(this), 10);
        
        // 恢复保存的状态
        this.restoreState();
    },
    
    /**
     * 加载词库
     */
    loadWords() {
        // 不显示加载指示器，直接加载
        
        fetch('assets/words.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('词库加载失败');
                }
                return response.json();
            })
            .then(data => {
                // 处理返回的JSON数据
                data.categories.forEach(category => {
                    this.wordsByCategory[category.name] = category.words;
                });
                
                // 加载类别设置
                this.loadCategorySettings();
                
                // 根据类别设置生成可用词语列表
                this.generateAvailableWords();
            })
            .catch(err => {
                console.error('词库加载错误:', err);
                UIManager.showAlert('词库加载失败: ' + err.message);
            });
    },
    
    /**
     * 加载类别设置
     */
    loadCategorySettings() {
        // 从localStorage加载类别设置
        const savedMode = localStorage.getItem('categoryMode');
        if (savedMode) {
            this.categoryMode = savedMode;
        }
        
        const savedSelected = localStorage.getItem('selectedCategories');
        if (savedSelected) {
            this.selectedCategories = JSON.parse(savedSelected);
        } else {
            // 默认全选
            this.selectedCategories = Object.keys(this.wordsByCategory);
        }
        
        const savedExcluded = localStorage.getItem('excludedCategories');
        if (savedExcluded) {
            this.excludedCategories = JSON.parse(savedExcluded);
        }
    },
    
    /**
     * 根据类别设置生成可用词语列表
     */
    generateAvailableWords() {
        this.allWords = []; // 清空词语列表
        
        const requiredCategories = new Set(); // 需要加载的类别
        
        // 确定需要加载的类别
        if (this.categoryMode === 'include') {
            // 包含模式：只使用选中的类别
            this.selectedCategories.forEach(category => {
                requiredCategories.add(category);
            });
        } else {
            // 排除模式：使用未被排除的类别
            Object.keys(this.wordsByCategory).forEach(category => {
                if (!this.excludedCategories.includes(category)) {
                    requiredCategories.add(category);
                }
            });
        }
        
        // 合并必要的词语
        requiredCategories.forEach(category => {
            if (this.wordsByCategory[category]) {
                this.allWords = this.allWords.concat(this.wordsByCategory[category]);
            }
        });
        
        console.log(`已加载 ${requiredCategories.size} 个类别，共 ${this.allWords.length} 个词语`);
    },
    
    /**
     * 恢复保存的状态
     */
    restoreState() {
        if (localStorage.getItem('words')) {
            this.displayedWords = JSON.parse(localStorage.getItem('words'));
            this.order = JSON.parse(localStorage.getItem('order')) || [];
            this.currentCategory = localStorage.getItem('currentCategory') || 'all';
            UIManager.updateDisplay(this.displayedWords);
            
            const displayState = localStorage.getItem('displayState');
            if (displayState === 'none') {
                document.getElementById('word-display').style.display = 'none';
            }
        }
    },
    
    /**
     * 刷新选词
     */
    refreshWords() {
        // 检查词库是否已加载
        if (this.allWords.length === 0 && Object.keys(this.wordsByCategory).length === 0) {
            return UIManager.showAlert('请先加载词库');
        }
        
        UIManager.showModal('确定刷新选词？', () => {
            // 根据当前所选类别决定从哪个词库选词
            const sourceWords = this.currentCategory === 'all' ? 
                this.allWords : this.wordsByCategory[this.currentCategory] || this.allWords;
            
            // 随机选择4个词语
            this.displayedWords = Array(4).fill().map(() => {
                const randomIndex = Math.floor(Math.random() * sourceWords.length);
                return sourceWords[randomIndex];
            });
            
            UIManager.updateDisplay(this.displayedWords);
            this.saveState();
        });
    },
    
    /**
     * 刷新次序
     */
    refreshOrder() {
        UIManager.showModal('确定刷新顺序？', () => {
            // 从1-4中随机选取3个不重复数字
            const numbers = [1,2,3,4];
            this.order = [];
            while(this.order.length < 3) {
                const randomIndex = Math.floor(Math.random() * numbers.length);
                const num = numbers[randomIndex];
                if(!this.order.includes(num)) {
                    this.order.push(num);
                }
            }
            UIManager.showAlert(`新顺序: ${this.order.join(',')}`);
            this.saveState();
        });
    },
    
    /**
     * 显示次序
     */
    showOrder() {
        if (this.order && this.order.length > 0) {
            UIManager.showAlert('当前次序为：' + this.order.join(', '));
        } else {
            UIManager.showAlert('请先刷新次序！');
        }
    },
    
    /**
     * 切换词语显示/隐藏
     */
    toggleDisplay() {
        const el = document.getElementById('word-display');
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
        this.saveState();
    },
    
    /**
     * 保存状态
     */
    saveState() {
        localStorage.setItem('words', JSON.stringify(this.displayedWords));
        localStorage.setItem('order', JSON.stringify(this.order));
        localStorage.setItem('displayState', 
            document.getElementById('word-display').style.display);
        localStorage.setItem('currentCategory', this.currentCategory);
    }
};

/**
 * UI管理器 - 管理界面交互和显示
 */
const UIManager = {
    /**
     * 初始化UI管理器
     */
    init() {
        // 设置事件委托
        this.setupEventDelegation();
        
        // 设置点击外部关闭设置菜单
        this.setupSettingsClickOutside();
    },
    
    /**
     * 显示加载指示器
     */
    showLoadingIndicator() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
    },
    
    /**
     * 隐藏加载指示器
     */
    hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.opacity = '0';
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
                loadingIndicator.style.opacity = '1';
            }, 300);
        }
    },
    
    /**
     * 使用事件委托处理按钮点击
     */
    setupEventDelegation() {
        const buttonArea = document.getElementById('button-area');
        if (!buttonArea) return;
        
        buttonArea.addEventListener('click', (event) => {
            // 检查点击的是否为按钮
            const button = event.target.closest('button');
            if (!button) return;
            
            // 获取按钮的操作类型
            const action = button.dataset.action;
            if (!action) return;
            
            // 根据操作类型执行相应函数
            switch (action) {
                case 'refresh-words':
                    WordManager.refreshWords();
                    break;
                case 'toggle-display':
                    WordManager.toggleDisplay();
                    break;
                case 'refresh-order':
                    WordManager.refreshOrder();
                    break;
                case 'show-order':
                    WordManager.showOrder();
                    break;
                default:
                    console.warn(`未知操作: ${action}`);
            }
        });
    },
    
    /**
     * 设置点击外部关闭设置菜单
     */
    setupSettingsClickOutside() {
        document.addEventListener('click', (event) => {
            const settingsMenu = document.getElementById('settings-menu');
            const settingsButton = document.getElementById('settings-button');
            
            // 如果点击的不是设置菜单或设置按钮，且设置菜单是打开的，则关闭菜单
            if (!settingsMenu.contains(event.target) && 
                !settingsButton.contains(event.target) &&
                settingsMenu.classList.contains('open')) {
                settingsMenu.classList.remove('open');
            }
        });
    },
    
    /**
     * 显示提示弹窗
     * @param {string} message 提示消息
     */
    showAlert(message) {
        if (window.showAlert) {
            window.showAlert(message);
        } else {
            alert(message);
        }
    },
    
    /**
     * 显示确认弹窗
     * @param {string} message 确认消息
     * @param {Function} callback 确认回调
     */
    showModal(message, callback) {
        if (window.showModal) {
            window.showModal(message, callback);
        } else if (confirm(message)) {
            callback();
        }
    },
    
    /**
     * 更新词语显示
     * @param {Array} words 要显示的词语
     */
    updateDisplay(words) {
        const el = document.getElementById('word-display');
        if (el) {
            el.innerHTML = words.join(' | ');
            el.style.display = 'block';
        }
    },
    
    /**
     * 切换设置菜单
     */
    toggleSettings() {
        const settingsMenu = document.getElementById('settings-menu');
        settingsMenu.classList.toggle('open');
    }
};

/**
 * 打开类别管理器
 */
function openCategoryManager() {
    window.location.href = 'category_manager.html';
}

/**
 * 清除浏览器缓存
 */
function clearBrowserCache() {
    try {
        UIManager.showModal('确定要清除所有本地存储的数据吗？这将重置所有设置和选项。', () => {
            // 清除所有localStorage数据
            localStorage.clear();
            
            // 显示成功消息
            UIManager.showAlert('缓存已成功清除，页面将在3秒后刷新。');
            
            // 延迟刷新页面
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        });
    } catch (error) {
        console.error('清除缓存时出错:', error);
        UIManager.showAlert('清除缓存失败: ' + error.message);
    }
}

/**
 * 切换设置菜单
 */
function toggleSettings() {
    UIManager.toggleSettings();
}

/**
 * 浏览器兼容性检查
 */
const BrowserCompatibility = {
    /**
     * 检查浏览器兼容性
     */
    check() {
        // 检查必要的API
        const requiredFeatures = [
            {feature: window.localStorage, name: 'localStorage'},
            {feature: window.fetch, name: 'Fetch API'},
            {feature: window.JSON, name: 'JSON'}
        ];
        
        const missingFeatures = requiredFeatures.filter(item => !item.feature);
        
        if (missingFeatures.length > 0) {
            const missingList = missingFeatures.map(item => item.name).join(', ');
            throw new Error(`您的浏览器不支持以下必要功能: ${missingList}。请升级到最新版本的浏览器。`);
        }
    }
};

// 初始化应用
window.onload = () => {
    try {
        // 浏览器兼容性检查
        BrowserCompatibility.check();
        
        // 初始化UI管理器
        UIManager.init();
        
        // 初始化词语管理器
        WordManager.init();
    } catch (error) {
        console.error('应用初始化失败:', error);
        alert('应用初始化失败: ' + error.message);
    }
};