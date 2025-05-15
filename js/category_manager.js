// category_manager.js - 类别管理页面的功能实现

// 全局变量
let categories = [];          // 所有可用类别
let selectedCategories = [];  // 当前选中的类别
let excludedCategories = [];  // 当前排除的类别
let allWords = {};            // 按类别存储的所有词语
let mode = 'include';         // 选择模式：'include'（包含）或'exclude'（排除）

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化
    initModalElements(); // 确保模态框元素被正确引用
    
    // 加载词库和类别
    loadCategories();
    
    // 绑定按钮事件
    document.getElementById('select-all').addEventListener('click', selectAll);
    document.getElementById('deselect-all').addEventListener('click', deselectAll);
    document.getElementById('invert-selection').addEventListener('click', invertSelection);
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    
    // 绑定模式选择事件
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            mode = e.target.value;
            updateCategoriesDisplay();
            updatePreview();
        });
    });
});

// 加载词库和类别
function loadCategories() {
    fetch('assets/words.json')
        .then(response => response.ok ? response.json() : Promise.reject('词库加载失败'))
        .then(data => {
            // 处理JSON数据
            const categoriesContainer = document.getElementById('categories-container');
            categories = data.categories.map(cat => cat.name);
            
            // 存储每个类别的词语
            data.categories.forEach(cat => {
                allWords[cat.name] = cat.words;
            });
            
            // 从localStorage加载已保存的配置
            loadSavedSettings();
            
            // 创建类别选项
            categoriesContainer.innerHTML = ''; // 清空容器
            categories.forEach(category => {
                const isSelected = selectedCategories.includes(category);
                const isExcluded = excludedCategories.includes(category);
                
                const categoryItem = document.createElement('div');
                categoryItem.className = `category-item ${isSelected ? 'selected' : ''} ${isExcluded ? 'excluded' : ''}`;
                categoryItem.dataset.category = category;
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = isSelected || isExcluded;
                checkbox.id = `category-${category.replace(/\s+/g, '-')}`;
                
                const label = document.createElement('label');
                label.htmlFor = checkbox.id;
                label.textContent = category;
                
                categoryItem.appendChild(checkbox);
                categoryItem.appendChild(label);
                
                // 绑定点击事件
                categoryItem.addEventListener('click', (e) => {
                    // 如果点击的是checkbox本身，让其默认行为继续
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }
                    
                    toggleCategory(category, checkbox.checked);
                });
                
                categoriesContainer.appendChild(categoryItem);
            });
            
            // 更新预览
            updatePreview();
        })
        .catch(err => {
            console.error(err);
            showAlert('词库加载失败');
        });
}

// 加载已保存的设置
function loadSavedSettings() {
    // 从localStorage加载数据
    const savedMode = localStorage.getItem('categoryMode');
    if (savedMode) {
        mode = savedMode;
        document.querySelector(`input[name="mode"][value="${mode}"]`).checked = true;
    }
    
    const savedSelected = localStorage.getItem('selectedCategories');
    if (savedSelected) {
        selectedCategories = JSON.parse(savedSelected);
    } else {
        // 默认全选
        selectedCategories = [...categories];
    }
    
    const savedExcluded = localStorage.getItem('excludedCategories');
    if (savedExcluded) {
        excludedCategories = JSON.parse(savedExcluded);
    } else {
        excludedCategories = [];
    }
}

// 切换类别选择状态
function toggleCategory(category, isChecked) {
    // 根据当前模式确定是添加到selectedCategories还是excludedCategories
    if (mode === 'include') {
        // 包含模式
        if (isChecked) {
            if (!selectedCategories.includes(category)) {
                selectedCategories.push(category);
            }
            // 如果之前在排除列表中，则移除
            excludedCategories = excludedCategories.filter(cat => cat !== category);
        } else {
            selectedCategories = selectedCategories.filter(cat => cat !== category);
        }
    } else {
        // 排除模式
        if (isChecked) {
            if (!excludedCategories.includes(category)) {
                excludedCategories.push(category);
            }
            // 如果之前在选择列表中，则移除
            selectedCategories = selectedCategories.filter(cat => cat !== category);
        } else {
            excludedCategories = excludedCategories.filter(cat => cat !== category);
        }
    }
    
    // 更新UI
    updateCategoriesDisplay();
    updatePreview();
}

// 更新类别显示样式
function updateCategoriesDisplay() {
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        const category = item.dataset.category;
        const checkbox = item.querySelector('input[type="checkbox"]');
        
        // 重置样式
        item.classList.remove('selected', 'excluded');
        
        if (mode === 'include') {
            // 包含模式
            checkbox.checked = selectedCategories.includes(category);
            if (checkbox.checked) {
                item.classList.add('selected');
            }
        } else {
            // 排除模式
            checkbox.checked = excludedCategories.includes(category);
            if (checkbox.checked) {
                item.classList.add('excluded');
            }
        }
    });
}

// 全选
function selectAll() {
    const allCategoryItems = document.querySelectorAll('.category-item');
    
    if (mode === 'include') {
        selectedCategories = [...categories];
        excludedCategories = [];
    } else {
        excludedCategories = [...categories];
        selectedCategories = [];
    }
    
    allCategoryItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.checked = true;
    });
    
    updateCategoriesDisplay();
    updatePreview();
}

// 取消全选
function deselectAll() {
    const allCategoryItems = document.querySelectorAll('.category-item');
    
    if (mode === 'include') {
        selectedCategories = [];
    } else {
        excludedCategories = [];
    }
    
    allCategoryItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.checked = false;
    });
    
    updateCategoriesDisplay();
    updatePreview();
}

// 反选
function invertSelection() {
    const allCategoryItems = document.querySelectorAll('.category-item');
    
    if (mode === 'include') {
        const newSelected = categories.filter(cat => !selectedCategories.includes(cat));
        selectedCategories = newSelected;
    } else {
        const newExcluded = categories.filter(cat => !excludedCategories.includes(cat));
        excludedCategories = newExcluded;
    }
    
    allCategoryItems.forEach(item => {
        const category = item.dataset.category;
        const checkbox = item.querySelector('input[type="checkbox"]');
        
        if (mode === 'include') {
            checkbox.checked = selectedCategories.includes(category);
        } else {
            checkbox.checked = excludedCategories.includes(category);
        }
    });
    
    updateCategoriesDisplay();
    updatePreview();
}

// 更新预览
function updatePreview() {
    // 获取有效词语
    let validWords = [];
    let totalCount = 0;
    
    if (mode === 'include') {
        // 包含模式：只显示选中类别的词语
        selectedCategories.forEach(category => {
            if (allWords[category]) {
                validWords = validWords.concat(allWords[category]);
                totalCount += allWords[category].length;
            }
        });
    } else {
        // 排除模式：显示未被排除的类别的词语
        categories.forEach(category => {
            if (!excludedCategories.includes(category) && allWords[category]) {
                validWords = validWords.concat(allWords[category]);
                totalCount += allWords[category].length;
            }
        });
    }
    
    // 更新词语计数
    document.getElementById('word-count').textContent = totalCount;
    
    // 更新示例词语(随机选择最多15个)
    const sampleContainer = document.getElementById('sample-words');
    sampleContainer.innerHTML = '';
    
    if (validWords.length === 0) {
        sampleContainer.innerHTML = '<p class="no-words">没有符合条件的词语</p>';
        return;
    }
    
    // 随机选择最多15个不重复的词语
    const sampleCount = Math.min(15, validWords.length);
    const selectedIndices = new Set();
    
    while (selectedIndices.size < sampleCount) {
        const randomIndex = Math.floor(Math.random() * validWords.length);
        selectedIndices.add(randomIndex);
    }
    
    selectedIndices.forEach(index => {
        const wordChip = document.createElement('span');
        wordChip.className = 'word-chip';
        wordChip.textContent = validWords[index];
        sampleContainer.appendChild(wordChip);
    });
}

// 保存设置
function saveSettings() {
    showModal('确定要保存当前设置吗？', () => {
        // 保存到localStorage
        localStorage.setItem('categoryMode', mode);
        localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
        localStorage.setItem('excludedCategories', JSON.stringify(excludedCategories));
        
        // 提示保存成功
        showAlert('设置已保存');
    });
}
