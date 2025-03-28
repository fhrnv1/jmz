/* 完整的共用功能实现 */

// DOM元素引用
let alertModal, alertMessage, confirmModal, confirmMessage;

// 初始化DOM引用
function initModalElements() {
    alertModal = document.getElementById('alertModal');
    alertMessage = document.getElementById('alertMessage');
    confirmModal = document.getElementById('confirmModal');
    confirmMessage = document.getElementById('confirmMessage');
    
    if (!alertModal || !alertMessage || !confirmModal || !confirmMessage) {
        console.error('弹窗组件初始化失败：缺少必需元素');
        return false;
    }
    return true;
}

// 显示提示弹窗
function showAlert(message) {
    if (!alertModal || !alertMessage) {
        console.error('提示弹窗未初始化');
        return;
    }
    
    try {
        alertMessage.textContent = message;
        alertModal.style.display = 'flex';
    } catch (error) {
        console.error('显示提示弹窗失败:', error);
    }
}

// 关闭提示弹窗
function closeAlert() {
    if (!alertModal) {
        console.error('提示弹窗未初始化');
        return;
    }
    
    try {
        alertModal.style.display = 'none';
    } catch (error) {
        console.error('关闭提示弹窗失败:', error);
    }
}

// 显示确认弹窗
function showModal(message, callback) {
    if (!confirmModal || !confirmMessage) {
        console.error('确认弹窗未初始化');
        return;
    }
    
    try {
        confirmMessage.textContent = message;
        confirmModal._callback = callback;
        confirmModal.style.display = 'flex';
    } catch (error) {
        console.error('显示确认弹窗失败:', error);
    }
}

// 处理确认操作
function handleConfirm(confirmed) {
    if (!confirmModal) {
        console.error('确认弹窗未初始化');
        return;
    }
    
    try {
        if (confirmed && confirmModal._callback) {
            confirmModal._callback();
        }
        confirmModal.style.display = 'none';
    } catch (error) {
        console.error('处理确认操作失败:', error);
    }
}

// 侧边栏功能
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('sidebar-toggle');
    
    if (!sidebar || !toggleButton) {
        console.error('侧边栏元素未找到');
        return;
    }
    
    try {
        const isOpen = sidebar.classList.toggle('open');
        toggleButton.style.display = isOpen ? 'none' : 'block';
    } catch (error) {
        console.error('切换侧边栏失败:', error);
    }
}

// 全局点击监听
document.addEventListener('DOMContentLoaded', () => {
    if (!initModalElements()) {
        console.error('页面初始化失败：弹窗组件不可用');
    }
    
    document.addEventListener('click', function(event) {
        const sidebar = document.getElementById('sidebar');
        const toggleButton = document.getElementById('sidebar-toggle');
        
        if (!sidebar || !toggleButton) return;
        
        try {
            const isClickInside = sidebar.contains(event.target) || 
                                toggleButton.contains(event.target);
            
            if (!isClickInside && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                toggleButton.style.display = 'block';
            }
        } catch (error) {
            console.error('处理全局点击事件失败:', error);
        }
    });
});