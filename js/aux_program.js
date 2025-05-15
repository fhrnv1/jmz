/* aux_program.html特有JavaScript代码 - 模块化重构 */

/**
 * 内容管理器 - 处理内容数据和操作
 */
const ContentManager = {
    /**
     * 初始化内容管理器
     */
    init() {
        // 加载保存的内容
        this.loadContent();
    },

    /**
     * 从localStorage恢复内容
     */
    loadContent() {
        try {
            for (let i = 1; i <= 4; i++) {
                const content = localStorage.getItem(`content${i}`);
                if (content) {
                    const element = document.getElementById(`content${i}`);
                    if (element) {
                        element.innerHTML = content;
                    }
                }
            }
        } catch (error) {
            console.error('加载内容出错:', error);
            UIManager.showAlert('加载保存的内容失败');
        }
    },

    /**
     * 保存内容到localStorage
     */
    saveContent() {
        try {
            for (let i = 1; i <= 4; i++) {
                const element = document.getElementById(`content${i}`);
                if (element) {
                    const content = element.innerHTML;
                    localStorage.setItem(`content${i}`, content);
                }
            }
        } catch (error) {
            console.error('保存内容出错:', error);
            UIManager.showAlert('保存内容失败');
        }
    },

    /**
     * 添加内容到指定区域
     */
    addContent(text, targetIndex) {
        try {
            if (!text || !targetIndex) return false;
            
            const target = document.getElementById(`content${targetIndex}`);
            if (!target) return false;
            
            // 自动生成序号
            const childCount = target.children.length;
            const content = `${childCount + 1}. ${text}`;
            target.innerHTML += `<div>${content}</div>`;
            this.saveContent();
            return true;
        } catch (error) {
            console.error('添加内容出错:', error);
            return false;
        }
    },

    /**
     * 清空所有内容
     */
    clearAllContent() {
        try {
            document.querySelectorAll('.editable-content').forEach(area => {
                area.innerHTML = '';
            });
            this.saveContent();
            return true;
        } catch (error) {
            console.error('清空内容出错:', error);
            return false;
        }
    }
};

/**
 * UI管理器 - 处理界面交互
 */
const UIManager = {
    /**
     * 初始化UI管理器
     */
    init() {
        // 设置事件委托
        this.setupEventDelegation();
    },
    
    /**
     * 使用事件委托处理按钮点击
     */
    setupEventDelegation() {
        const actionArea = document.querySelector('.action-buttons');
        if (actionArea) {
            actionArea.addEventListener('click', (event) => {
                const button = event.target.closest('button');
                if (!button) return;
                
                const action = button.dataset.action;
                if (!action) return;
                
                switch (action) {
                    case 'confirm-inputs':
                        this.handleConfirmInputs();
                        break;
                    case 'clear-all':
                        this.handleClearAll();
                        break;
                }
            });
        }
    },
    
    /**
     * 处理确认输入
     */
    handleConfirmInputs() {
        this.showModal('确认要添加这些内容吗？', () => {
            const inputs = document.querySelectorAll('.input-group');
            let addedAny = false;
            
            inputs.forEach(group => {
                const textInput = group.querySelector('.text-input');
                const indexInput = group.querySelector('.index-input');
                
                if (textInput && indexInput && textInput.value && indexInput.value) {
                    if (ContentManager.addContent(textInput.value, indexInput.value)) {
                        textInput.value = '';
                        indexInput.value = '';
                        addedAny = true;
                    }
                }
            });
            
            if (!addedAny) {
                this.showAlert('未添加任何内容，请检查输入');
            }
        });
    },
    
    /**
     * 处理清空全部
     */
    handleClearAll() {
        this.showModal('确定要清空所有内容吗？', () => {
            if (ContentManager.clearAllContent()) {
                document.querySelectorAll('.text-input, .index-input').forEach(input => {
                    input.value = '';
                });
                this.showAlert('所有内容已清空');
            } else {
                this.showAlert('清空内容失败');
            }
        });
    },
    
    /**
     * 显示确认对话框
     */
    showModal(message, callback) {
        if (window.showModal) {
            window.showModal(message, callback);
        } else if (confirm(message)) {
            callback();
        }
    },
    
    /**
     * 显示提示信息
     */
    showAlert(message) {
        if (window.showAlert) {
            window.showAlert(message);
        } else {
            alert(message);
        }
    }
};

/**
 * 浏览器兼容性检查
 */
const BrowserCompatibility = {
    check() {
        // 检查必要的API
        const requiredFeatures = [
            {feature: window.localStorage, name: 'localStorage'},
            {feature: window.JSON, name: 'JSON'}
        ];
        
        const missingFeatures = requiredFeatures.filter(item => !item.feature);
        
        if (missingFeatures.length > 0) {
            const missingList = missingFeatures.map(item => item.name).join(', ');
            console.error(`缺少必要的浏览器特性: ${missingList}`);
            alert(`您的浏览器不支持一些必要的功能: ${missingList}，可能导致应用无法正常工作。`);
            return false;
        }
        
        return true;
    }
};

// 应用初始化
window.onload = function() {
    try {
        // 浏览器兼容性检查
        if (!BrowserCompatibility.check()) return;
        
        // 初始化模态框元素
        if (window.initModalElements) {
            window.initModalElements();
        }
        
        // 初始化UI管理器
        UIManager.init();
        
        // 初始化内容管理器
        ContentManager.init();
    } catch (error) {
        console.error('应用初始化失败:', error);
        alert('应用初始化失败: ' + error.message);
    }
};