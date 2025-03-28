/* aux_program.html特有JavaScript代码 */

// 从localStorage恢复内容
function loadContent() {
    for (let i = 1; i <= 4; i++) {
        const content = localStorage.getItem(`content${i}`);
        if (content) {
            document.getElementById(`content${i}`).innerHTML = content;
        }
    }
}

// 保存内容到localStorage
function saveContent() {
    for (let i = 1; i <= 4; i++) {
        const content = document.getElementById(`content${i}`).innerHTML;
        localStorage.setItem(`content${i}`, content);
    }
}

// 确认输入内容并添加到相应可编辑区域
function confirmInputs() {
    showModal('确认要添加这些内容吗？', function() {
        const inputs = document.querySelectorAll('.input-group');
        inputs.forEach(group => {
            const textInput = group.querySelector('.text-input');
            const indexInput = group.querySelector('.index-input');
            
            if (textInput.value && indexInput.value) {
                const target = document.getElementById(`content${indexInput.value}`);
                if (target) {
                    // 自动生成序号
                    const childCount = target.children.length;
                    const content = `${childCount + 1}. ${textInput.value}`;
                    target.innerHTML += `<div>${content}</div>`;
                    textInput.value = '';
                    indexInput.value = '';
                }
            }
        });
        saveContent();
    });
}

// 清空所有可编辑区域的内容
function clearAll() {
    showModal('确定要清空所有内容吗？', function() {
        document.querySelectorAll('.editable-content').forEach(area => {
            area.innerHTML = '';
        });
        document.querySelectorAll('.text-input, .index-input').forEach(input => {
            input.value = '';
        });
        saveContent();
    });
}

// 初始化
window.onload = function() {
    loadContent();
};