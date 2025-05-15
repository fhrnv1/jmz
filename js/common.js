/* 模块化共用功能实现 */

/**
 * 模态框管理模块 - 处理各类弹窗
 */
const ModalManager = {
    // DOM元素引用
    elements: {
        alertModal: null,
        alertMessage: null,
        confirmModal: null,
        confirmMessage: null,
    },
    
    /**
     * 初始化模态框元素
     * @returns {boolean} 初始化是否成功
     */
    init() {
        try {
            this.elements.alertModal = document.getElementById('alertModal');
            this.elements.alertMessage = document.getElementById('alertMessage');
            this.elements.confirmModal = document.getElementById('confirmModal');
            this.elements.confirmMessage = document.getElementById('confirmMessage');
            
            if (!this.elements.alertModal || !this.elements.alertMessage || 
                !this.elements.confirmModal || !this.elements.confirmMessage) {
                console.error('弹窗组件初始化失败：缺少必需元素');
                return false;
            }
            return true;
        } catch (error) {
            console.error('弹窗组件初始化出错:', error);
            return false;
        }
    },
    
    /**
     * 显示提示弹窗
     * @param {string} message 提示消息
     */
    showAlert(message) {
        if (!this.elements.alertModal || !this.elements.alertMessage) {
            console.error('提示弹窗未初始化');
            alert(message); // 降级方案
            return;
        }
        
        try {
            this.elements.alertMessage.textContent = message;
            this.elements.alertModal.style.display = 'flex';
        } catch (error) {
            console.error('显示提示弹窗失败:', error);
            alert(message); // 降级方案
        }
    },
    
    /**
     * 关闭提示弹窗
     */
    closeAlert() {
        if (!this.elements.alertModal) {
            console.error('提示弹窗未初始化');
            return;
        }
        
        try {
            this.elements.alertModal.style.display = 'none';
        } catch (error) {
            console.error('关闭提示弹窗失败:', error);
        }
    },
    
    /**
     * 显示确认弹窗
     * @param {string} message 确认消息
     * @param {Function} callback 确认后的回调函数
     */
    showConfirm(message, callback) {
        if (!this.elements.confirmModal || !this.elements.confirmMessage) {
            console.error('确认弹窗未初始化');
            // 降级方案
            if (confirm(message)) {
                callback && callback();
            }
            return;
        }
        
        try {
            this.elements.confirmMessage.textContent = message;
            this.elements.confirmModal._callback = callback;
            this.elements.confirmModal.style.display = 'flex';
        } catch (error) {
            console.error('显示确认弹窗失败:', error);
            // 降级方案
            if (confirm(message)) {
                callback && callback();
            }
        }
    },
    
    /**
     * 处理确认操作
     * @param {boolean} confirmed 是否确认
     */
    handleConfirm(confirmed) {
        if (!this.elements.confirmModal) {
            console.error('确认弹窗未初始化');
            return;
        }
        
        try {
            if (confirmed && this.elements.confirmModal._callback) {
                this.elements.confirmModal._callback();
            }
            this.elements.confirmModal.style.display = 'none';
        } catch (error) {
            console.error('处理确认操作失败:', error);
        }
    }
};

/**
 * 侧边栏管理模块
 */
const SidebarManager = {
    /**
     * 切换侧边栏显示状态
     */
    toggle() {
        const sidebar = document.getElementById('sidebar');
        const toggleButton = document.getElementById('sidebar-toggle');
        const backdrop = document.getElementById('sidebar-backdrop');
        
        if (!sidebar || !toggleButton) {
            console.error('侧边栏元素未找到');
            return;
        }
        
        try {
            const isOpen = sidebar.classList.toggle('open');
            toggleButton.style.display = isOpen ? 'none' : 'block';
            
            // 控制背景遮罩
            if (backdrop) {
                if (isOpen) {
                    backdrop.classList.add('show');
                    // 当侧边栏打开时禁用页面滚动
                    document.body.style.overflow = 'hidden';
                } else {
                    backdrop.classList.remove('show');
                    // 当侧边栏关闭时恢复页面滚动
                    document.body.style.overflow = '';
                }
            }
        } catch (error) {
            console.error('切换侧边栏失败:', error);
        }
    },
    
    /**
     * 设置侧边栏外部点击自动关闭
     */
    setupOutsideClickHandler() {
        document.addEventListener('click', (event) => {
            const sidebar = document.getElementById('sidebar');
            const toggleButton = document.getElementById('sidebar-toggle');
            const backdrop = document.getElementById('sidebar-backdrop');
            
            if (!sidebar || !toggleButton) return;
            
            // 检查是否点击在侧边栏和切换按钮之外
            // 背景遮罩的点击已通过onclick事件处理，所以这里排除它
            const clickedOutside = !sidebar.contains(event.target) && 
                                   !toggleButton.contains(event.target) &&
                                   (!backdrop || !backdrop.contains(event.target));
            
            if (clickedOutside && sidebar.classList.contains('open')) {
                this.toggle();
            }
        });
    }
};

/**
 * 错误处理模块
 */
const ErrorHandler = {
    /**
     * 处理并记录错误
     * @param {Error} error 错误对象
     * @param {string} context 错误发生的上下文
     * @param {boolean} showToUser 是否向用户显示错误
     */
    handle(error, context, showToUser = false) {
        // 记录错误
        console.error(`${context}:`, error);
        
        // 向用户显示错误（可选）
        if (showToUser) {
            const userMessage = `操作执行出错: ${error.message || '未知错误'}`;
            if (ModalManager.elements.alertModal) {
                ModalManager.showAlert(userMessage);
            } else {
                alert(userMessage);
            }
        }
        
        // 可以在这里添加错误上报逻辑
    }
};

// 向全局暴露必要的功能
window.initModalElements = function() {
    return ModalManager.init();
};

window.showAlert = function(message) {
    ModalManager.showAlert(message);
};

window.closeAlert = function() {
    ModalManager.closeAlert();
};

window.showModal = function(message, callback) {
    ModalManager.showConfirm(message, callback);
};

window.handleConfirm = function(confirmed) {
    ModalManager.handleConfirm(confirmed);
};

window.toggleSidebar = function() {
    SidebarManager.toggle();
};

// DOM 内容加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        // 初始化模态框
        ModalManager.init();
        
        // 设置侧边栏外部点击处理
        SidebarManager.setupOutsideClickHandler();
        
        // 检查模态框初始化结果
        if (!ModalManager.elements.alertModal || !ModalManager.elements.confirmModal) {
            console.error('页面初始化警告：弹窗组件不完全可用');
        }
    } catch (error) {
        ErrorHandler.handle(error, '通用功能初始化', true);
    }
});