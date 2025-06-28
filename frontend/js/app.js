// Данные для демонстрации
// const demoFoods = [
//     {
//         name: "Гречка с курицей",
//         portion: "~280г",
//         calories: 420,
//         protein: 35,
//         fats: 12,
//         carbs: 45,
//         advice: "Отличный выбор! Высокое содержание белка и сложных углеводов. Добавьте овощей для большего количества витаминов."
//     },
//     {
//         name: "Паста Карбонара",
//         portion: "~350г",
//         calories: 650,
//         protein: 28,
//         fats: 35,
//         carbs: 58,
//         advice: "Калорийное блюдо с высоким содержанием жиров. Рекомендую сбалансировать следующий прием пищи овощами и белком."
//     },
//     {
//         name: "Овощной салат",
//         portion: "~200г",
//         calories: 150,
//         protein: 5,
//         fats: 8,
//         carbs: 18,
//         advice: "Легкий и полезный выбор! Много витаминов и клетчатки. Можно добавить белок для более полного приема пищи."
//     },
//     {
//         name: "Суши сет",
//         portion: "~12 штук",
//         calories: 520,
//         protein: 22,
//         fats: 15,
//         carbs: 65,
//         advice: "Хороший баланс макронутриентов. Рис дает энергию, рыба - качественный белок. Следите за содержанием натрия."
//     }
// ];

let nextMealId = 6;
// Автоматическое определение API URL для production/development
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Профиль пользователя
let userProfile = {
    name: "Пользователь",
    age: 25,
    height: 170,
    weight: 70,
    gender: "male",
    goal: "maintain",
    targetCalories: 2200,
    targetProtein: 110,
    targetFats: 75,
    targetCarbs: 275,
    notifications: true,
    darkTheme: false,
    units: "metric"
};

// История приёмов пищи
let mealHistory = JSON.parse(localStorage.getItem('kbju_mealHistory')) || [];
// Статистика
let currentStats = JSON.parse(localStorage.getItem('kbju_stats')) || {
    calories: 0,
    protein: 0,
    fats: 0,
    carbs: 0
};

// Миграция старых блюд без поля date
const today = new Date().toDateString();
mealHistory.forEach(meal => {
    if (!meal.date) {
        meal.date = today;
    }
});
localStorage.setItem('kbju_mealHistory', JSON.stringify(mealHistory));

// Автоматическое определение времени приема пищи
function getAutoMealType() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    return 'dinner';
}

// Инициализация - установка активного времени приема пищи
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadProfile();
    updateStats();
    updateRecentMeals();
    if (typeof updateHistoryPage === 'function') updateHistoryPage();
    renderHistory('main-history-section');
    renderHistory('history-page-section');
});

function initializeApp() {
    const autoMeal = getAutoMealType();
    document.querySelectorAll('.meal-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.meal === autoMeal) {
            btn.classList.add('active');
        }
    });
    initializeEventListeners();
    console.log('Приложение инициализировано');
}

function initializeEventListeners() {
    // Кнопки приема пищи
    document.querySelectorAll('.meal-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.meal-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    // Навигация
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.textContent.trim().toLowerCase();
            if (page === 'главная') showPage('home');
            else if (page === 'история') showPage('history');
            else if (page === 'статистика') showPage('analytics');
            else if (page === 'профиль') showPage('profile');
        });
    });
    // Кнопки фильтрации истории
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    // Кнопки периода аналитики
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    // Кнопки целей
    document.querySelectorAll('.goal-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            userProfile.goal = this.dataset.goal;
            updateGoalInputs();
        });
    });
    // Очистка демо-результата
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const demoResult = document.getElementById('demo-result');
            if (demoResult) {
                demoResult.classList.remove('show');
            }
        });
    }
}

// --- НАВИГАЦИЯ ---
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    const targetPage = document.getElementById(pageName + '-page');
    if (targetPage) {
        targetPage.style.display = 'block';
    }
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const navItems = document.querySelectorAll('.nav-item');
    const pageIndex = ['home', 'history', 'analytics', 'profile'].indexOf(pageName);
    if (navItems[pageIndex]) {
        navItems[pageIndex].classList.add('active');
    }
    if (pageName === 'history') {
        updateHistoryPage();
    } else if (pageName === 'analytics') {
        updateAnalyticsPage();
    } else if (pageName === 'profile') {
        updateProfilePage();
    }
    console.log('Показана страница:', pageName);
}

// --- ОСНОВНЫЕ ФУНКЦИИ (оставить старые, если используются) ---
// ... (оставьте ваши старые функции, если они нужны для текущего интерфейса)
// --- ВСТАВИТЬ СЮДА ВСЕ ФУНКЦИИ ИЗ ВАШЕГО РАСШИРЕННОГО КОДА ---
// (см. ваш предыдущий код)
// ---
// В конце каждой функции, где меняется mealHistory или currentStats, сохраняйте их в localStorage:
// localStorage.setItem('kbju_mealHistory', JSON.stringify(mealHistory));
// localStorage.setItem('kbju_stats', JSON.stringify(currentStats));

function takePhoto() {
    document.getElementById('file-input').click();
}

// Замените функцию handleFileSelect
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        showLoading();
        
        const formData = new FormData();
        formData.append('image', file);
        formData.append('mealType', getSelectedMealType());
        
        try {
            const response = await fetch(`${API_BASE_URL}/analyze-food`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            hideLoading();
            displayAIResult(result);
        } catch (error) {
            hideLoading();
            alert('Ошибка при анализе изображения');
        }
    }
}

function getSelectedMealType() {
    return document.querySelector('.meal-btn.active').dataset.meal;
}

function displayAIResult(result) {
    // Показываем результат
    document.getElementById('detected-food').textContent = result.name;
    document.getElementById('detected-portion').textContent = result.portion;
    document.getElementById('demo-result').classList.add('show');
    
    // Обновляем статистику
    currentStats.calories += Number(result.calories) || 0;
    currentStats.protein += Number(result.protein) || 0;
    currentStats.fats += Number(result.fats) || 0;
    currentStats.carbs += Number(result.carbs) || 0;
    
    updateStats();
    updateAIAdvice(result.advice);
    addToHistory(result);
    localStorage.setItem('kbju_stats', JSON.stringify(currentStats));
}

function showLoading() {
    document.getElementById('loading').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('show');
}

function updateStats() {
    document.getElementById('calories').textContent = currentStats.calories;
    document.getElementById('protein').textContent = currentStats.protein + 'г';
    document.getElementById('fats').textContent = currentStats.fats + 'г';
    document.getElementById('carbs').textContent = currentStats.carbs + 'г';
    
    // Анимация обновления
    document.querySelectorAll('.stat-card').forEach(card => {
        card.style.transform = 'scale(1.05)';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 200);
    });
}

function updateAIAdvice(advice) {
    const adviceElement = document.getElementById('ai-advice');
    if (!adviceElement) return;
    adviceElement.style.opacity = '0.5';
    setTimeout(() => {
        adviceElement.textContent = advice || '';
        adviceElement.style.opacity = '1';
    }, 300);
}

function addToHistory(food) {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const currentDate = now.toDateString();
    mealHistory.unshift({
        name: food.name,
        calories: Number(food.calories) || 0,
        protein: Number(food.protein) || 0,
        fats: Number(food.fats) || 0,
        carbs: Number(food.carbs) || 0,
        time: currentTime,
        date: currentDate,
        type: getSelectedMealType(),
        id: Date.now()
    });
    if (mealHistory.length > 50) mealHistory = mealHistory.slice(0, 50);
    localStorage.setItem('kbju_mealHistory', JSON.stringify(mealHistory));
    renderHistory('main-history-section');
    renderHistory('history-page-section');
    updateRecentMeals();
    if (typeof updateHistoryPage === 'function') updateHistoryPage();
}

// Функция для отрисовки всей истории
function renderHistory(targetId = 'main-history-section') {
    const historySection = document.getElementById(targetId);
    if (!historySection) return;
    historySection.querySelectorAll('.history-item').forEach(item => item.remove());
    mealHistory.forEach(food => {
        const newItem = document.createElement('div');
        newItem.className = 'history-item';
        newItem.style.opacity = '1';
        newItem.style.transform = 'translateY(0)';
        newItem.innerHTML = `
            <div>
                <div style="font-weight: 600;">${food.name}</div>
                <div class="history-time">${food.time}</div>
            </div>
            <div class="history-calories">${food.calories} ккал</div>
        `;
        historySection.appendChild(newItem);
    });
}

// Навигация (заглушки для демо)
function showHistory() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('history-page').style.display = 'block';
    renderHistory('history-page-section');
}

function showMain() {
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('history-page').style.display = 'none';
    renderHistory('main-history-section');
}

function showAnalytics() {
    alert('📈 Раздел "Статистика" - здесь будут графики и аналитика по питанию');
}

function showProfile() {
    alert('👤 Раздел "Профиль" - настройки пользователя, цели по КБЖУ, персональные рекомендации');
}

// Обработка навигации
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// Очистка демо-результата при повторном выборе файла
document.getElementById('file-input').addEventListener('change', function() {
    document.getElementById('demo-result').classList.remove('show');
});

function loadProfile() {
    const savedProfile = localStorage.getItem('kbju_userProfile');
    if (savedProfile) {
        userProfile = { ...userProfile, ...JSON.parse(savedProfile) };
    }
    
    // Заполняем поля формы
    document.getElementById('user-name').value = userProfile.name;
    document.getElementById('user-age').value = userProfile.age;
    document.getElementById('user-height').value = userProfile.height;
    document.getElementById('user-weight').value = userProfile.weight;
    document.getElementById('user-gender').value = userProfile.gender;
    document.getElementById('notifications').checked = userProfile.notifications;
    document.getElementById('dark-theme').checked = userProfile.darkTheme;
    document.getElementById('units').value = userProfile.units;
    
    // Устанавливаем активную цель
    document.querySelectorAll('.goal-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.goal === userProfile.goal) {
            btn.classList.add('active');
        }
    });
    
    // Заполняем цели
    document.getElementById('goal-calories').value = userProfile.targetCalories;
    document.getElementById('goal-protein').value = userProfile.targetProtein;
    document.getElementById('goal-fats').value = userProfile.targetFats;
    document.getElementById('goal-carbs').value = userProfile.targetCarbs;
}

function updateProfilePage() {
    loadProfile();
    updateProfileDisplay();
}

function updateProfileDisplay() {
    document.getElementById('profile-name').textContent = userProfile.name;
    
    const goalTexts = {
        maintain: 'Поддержание веса',
        lose: 'Похудение',
        gain: 'Набор массы'
    };
    document.getElementById('profile-goal').textContent = goalTexts[userProfile.goal] || 'Не указано';
}

function updateGoalInputs() {
    const goal = userProfile.goal;
    let calories, protein, fats, carbs;
    
    // Базовые значения в зависимости от цели
    switch (goal) {
        case 'lose':
            calories = 1800;
            protein = 120;
            fats = 60;
            carbs = 180;
            break;
        case 'gain':
            calories = 2800;
            protein = 140;
            fats = 90;
            carbs = 350;
            break;
        default: // maintain
            calories = 2200;
            protein = 110;
            fats = 75;
            carbs = 275;
    }
    
    // Корректируем под пол и вес
    if (userProfile.gender === 'female') {
        calories = Math.round(calories * 0.85);
        protein = Math.round(protein * 0.9);
        fats = Math.round(fats * 0.9);
        carbs = Math.round(carbs * 0.85);
    }
    
    // Корректируем под вес
    const weightFactor = userProfile.weight / 70;
    calories = Math.round(calories * weightFactor);
    protein = Math.round(protein * weightFactor);
    fats = Math.round(fats * weightFactor);
    carbs = Math.round(carbs * weightFactor);
    
    userProfile.targetCalories = calories;
    userProfile.targetProtein = protein;
    userProfile.targetFats = fats;
    userProfile.targetCarbs = carbs;
    
    document.getElementById('goal-calories').value = calories;
    document.getElementById('goal-protein').value = protein;
    document.getElementById('goal-fats').value = fats;
    document.getElementById('goal-carbs').value = carbs;
}

function saveProfile() {
    // Собираем данные из формы
    userProfile.name = document.getElementById('user-name').value || 'Пользователь';
    userProfile.age = parseInt(document.getElementById('user-age').value) || 25;
    userProfile.height = parseInt(document.getElementById('user-height').value) || 170;
    userProfile.weight = parseInt(document.getElementById('user-weight').value) || 70;
    userProfile.gender = document.getElementById('user-gender').value;
    userProfile.notifications = document.getElementById('notifications').checked;
    userProfile.darkTheme = document.getElementById('dark-theme').checked;
    userProfile.units = document.getElementById('units').value;
    
    // Цели
    userProfile.targetCalories = parseInt(document.getElementById('goal-calories').value) || 2200;
    userProfile.targetProtein = parseInt(document.getElementById('goal-protein').value) || 110;
    userProfile.targetFats = parseInt(document.getElementById('goal-fats').value) || 75;
    userProfile.targetCarbs = parseInt(document.getElementById('goal-carbs').value) || 275;
    
    // Сохраняем в localStorage
    localStorage.setItem('kbju_userProfile', JSON.stringify(userProfile));
    
    // Обновляем отображение
    updateProfileDisplay();
    
    // Показываем уведомление
    showNotification('Профиль сохранен!', 'success');
}

function exportData() {
    const exportData = {
        profile: userProfile,
        mealHistory: mealHistory,
        stats: currentStats,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `kbju-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Данные экспортированы!', 'success');
}

function resetData() {
    if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
        localStorage.removeItem('kbju_mealHistory');
        localStorage.removeItem('kbju_stats');
        localStorage.removeItem('kbju_userProfile');
        
        // Сбрасываем переменные
        mealHistory = [];
        currentStats = { calories: 0, protein: 0, fats: 0, carbs: 0 };
        userProfile = {
            name: "Пользователь",
            age: 25,
            height: 170,
            weight: 70,
            gender: "male",
            goal: "maintain",
            targetCalories: 2200,
            targetProtein: 110,
            targetFats: 75,
            targetCarbs: 275,
            notifications: true,
            darkTheme: false,
            units: "metric"
        };
        
        // Обновляем интерфейс
        updateStats();
        updateRecentMeals();
        updateHistoryPage();
        updateAnalyticsPage();
        loadProfile();
        updateProfileDisplay();
        
        showNotification('Данные сброшены!', 'info');
    }
}

function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function updateRecentMeals() {
    const container = document.getElementById('recent-meals');
    if (!container) return;

    container.innerHTML = '';

    // Определяем сегодняшнюю дату (без времени)
    const today = new Date().toDateString();

    // Фильтруем блюда за сегодняшний день
    const todayMeals = mealHistory.filter(meal => meal.date === today);

    todayMeals.forEach(meal => {
        const mealElement = document.createElement('div');
        mealElement.className = 'history-item';
        mealElement.innerHTML = `
            <div>
                <div style="font-weight: 600;">${meal.name}</div>
                <div class="history-time">${meal.time}</div>
            </div>
            <div class="meal-actions">
                <div class="history-calories">${meal.calories} ккал</div>
                <button class="delete-btn" onclick="deleteMeal(${meal.id})">🗑️</button>
            </div>
        `;
        container.appendChild(mealElement);
    });
}

function updateHistoryPage() {
    const today = new Date().toDateString();
    const todayMeals = mealHistory.filter(meal => meal.date === today);
    
    // Обновляем статистику истории
    const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalMeals = todayMeals.length;
    
    document.getElementById('history-total-calories').textContent = totalCalories;
    document.getElementById('history-meals-count').textContent = totalMeals;
    
    // Отрисовываем детальную историю
    renderDetailedHistory(todayMeals);
}

function renderDetailedHistory(meals) {
    const container = document.getElementById('history-detailed');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (meals.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Нет записей за выбранный период</p>';
        return;
    }
    
    // Группируем по времени приема пищи
    const mealTypes = {
        breakfast: { name: '🌅 Завтрак', meals: [] },
        lunch: { name: '🌞 Обед', meals: [] },
        dinner: { name: '🌙 Ужин', meals: [] }
    };
    
    meals.forEach(meal => {
        if (mealTypes[meal.type]) {
            mealTypes[meal.type].meals.push(meal);
        }
    });
    
    Object.values(mealTypes).forEach(type => {
        if (type.meals.length > 0) {
            const typeSection = document.createElement('div');
            typeSection.className = 'history-day';
            typeSection.innerHTML = `<h3>${type.name}</h3>`;
            
            type.meals.forEach(meal => {
                const mealElement = document.createElement('div');
                mealElement.className = 'meal-info';
                mealElement.innerHTML = `
                    <div class="meal-name">${meal.name}</div>
                    <div class="meal-details">
                        <div class="meal-type">${meal.time}</div>
                        <div class="meal-nutrition">
                            <span class="nutrition-item">${meal.calories} ккал</span>
                            <span class="nutrition-item">Б: ${meal.protein}г</span>
                            <span class="nutrition-item">Ж: ${meal.fats}г</span>
                            <span class="nutrition-item">У: ${meal.carbs}г</span>
                        </div>
                        <button class="delete-btn" onclick="deleteMeal(${meal.id})">🗑️</button>
                    </div>
                `;
                typeSection.appendChild(mealElement);
            });
            
            container.appendChild(typeSection);
        }
    });
}

function filterHistory(period) {
    const today = new Date();
    let filteredMeals = [];
    
    switch (period) {
        case 'today':
            filteredMeals = mealHistory.filter(meal => meal.date === today.toDateString());
            break;
        case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredMeals = mealHistory.filter(meal => {
                const mealDate = new Date(meal.date);
                return mealDate >= weekAgo;
            });
            break;
        case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            filteredMeals = mealHistory.filter(meal => {
                const mealDate = new Date(meal.date);
                return mealDate >= monthAgo;
            });
            break;
    }
    
    // Обновляем статистику
    const totalCalories = filteredMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalMeals = filteredMeals.length;
    
    document.getElementById('history-total-calories').textContent = totalCalories;
    document.getElementById('history-meals-count').textContent = totalMeals;
    
    // Отрисовываем отфильтрованную историю
    renderDetailedHistory(filteredMeals);
}

function updateAnalyticsPage() {
    updateAnalyticsStats();
    renderCaloriesChart();
    updateMacroBreakdown();
    updateHabits();
}

function updateAnalyticsStats() {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Получаем данные за неделю
    const weekMeals = mealHistory.filter(meal => {
        const mealDate = new Date(meal.date);
        return mealDate >= weekAgo;
    });
    
    if (weekMeals.length === 0) {
        document.getElementById('analytics-avg-calories').textContent = '0';
        document.getElementById('analytics-avg-protein').textContent = '0г';
        return;
    }
    
    // Группируем по дням
    const dailyStats = {};
    weekMeals.forEach(meal => {
        if (!dailyStats[meal.date]) {
            dailyStats[meal.date] = { calories: 0, protein: 0, fats: 0, carbs: 0 };
        }
        dailyStats[meal.date].calories += meal.calories;
        dailyStats[meal.date].protein += meal.protein;
        dailyStats[meal.date].fats += meal.fats;
        dailyStats[meal.date].carbs += meal.carbs;
    });
    
    // Вычисляем средние значения
    const daysCount = Object.keys(dailyStats).length;
    const avgCalories = Math.round(Object.values(dailyStats).reduce((sum, day) => sum + day.calories, 0) / daysCount);
    const avgProtein = Math.round(Object.values(dailyStats).reduce((sum, day) => sum + day.protein, 0) / daysCount);
    
    document.getElementById('analytics-avg-calories').textContent = avgCalories;
    document.getElementById('analytics-avg-protein').textContent = avgProtein + 'г';
}

function renderCaloriesChart() {
    const container = document.getElementById('analytics-chart-bars');
    if (!container) return;
    
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Получаем данные за неделю
    const weekMeals = mealHistory.filter(meal => {
        const mealDate = new Date(meal.date);
        return mealDate >= weekAgo;
    });
    
    // Группируем по дням
    const dailyStats = {};
    weekMeals.forEach(meal => {
        if (!dailyStats[meal.date]) {
            dailyStats[meal.date] = { calories: 0 };
        }
        dailyStats[meal.date].calories += meal.calories;
    });
    
    // Создаем массив для последних 7 дней
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateString = date.toDateString();
        const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
        const calories = dailyStats[dateString] ? dailyStats[dateString].calories : 0;
        chartData.push({ day: dayName, calories: calories });
    }
    
    // Находим максимальное значение для масштабирования
    const maxCalories = Math.max(...chartData.map(d => d.calories), 1);
    
    // Отрисовываем график
    container.innerHTML = '';
    chartData.forEach(data => {
        const barHeight = (data.calories / maxCalories) * 100;
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.innerHTML = `
            <div class="bar-value">${data.calories}</div>
            <div class="bar-fill" style="height: ${barHeight}%"></div>
            <div class="bar-label">${data.day}</div>
        `;
        container.appendChild(bar);
    });
}

function updateMacroBreakdown() {
    const today = new Date().toDateString();
    const todayMeals = mealHistory.filter(meal => meal.date === today);
    
    if (todayMeals.length === 0) {
        document.getElementById('macro-protein-value').textContent = '0%';
        document.getElementById('macro-fats-value').textContent = '0%';
        document.getElementById('macro-carbs-value').textContent = '0%';
        return;
    }
    
    const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalFats = todayMeals.reduce((sum, meal) => sum + meal.fats, 0);
    const totalCarbs = todayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
    
    const totalGrams = totalProtein + totalFats + totalCarbs;
    
    if (totalGrams === 0) {
        document.getElementById('macro-protein-value').textContent = '0%';
        document.getElementById('macro-fats-value').textContent = '0%';
        document.getElementById('macro-carbs-value').textContent = '0%';
        return;
    }
    
    const proteinPercent = Math.round((totalProtein / totalGrams) * 100);
    const fatsPercent = Math.round((totalFats / totalGrams) * 100);
    const carbsPercent = Math.round((totalCarbs / totalGrams) * 100);
    
    document.getElementById('macro-protein-value').textContent = proteinPercent + '%';
    document.getElementById('macro-fats-value').textContent = fatsPercent + '%';
    document.getElementById('macro-carbs-value').textContent = carbsPercent + '%';
    
    // Обновляем круговые диаграммы
    document.getElementById('macro-protein').style.background = `conic-gradient(#a8edea 0deg ${proteinPercent * 3.6}deg, #f0f0f0 ${proteinPercent * 3.6}deg 360deg)`;
    document.getElementById('macro-fats').style.background = `conic-gradient(#ffecd2 0deg ${fatsPercent * 3.6}deg, #f0f0f0 ${fatsPercent * 3.6}deg 360deg)`;
    document.getElementById('macro-carbs').style.background = `conic-gradient(#d299c2 0deg ${carbsPercent * 3.6}deg, #f0f0f0 ${carbsPercent * 3.6}deg 360deg)`;
}

function updateHabits() {
    const container = document.getElementById('habits-list');
    if (!container) return;
    
    const today = new Date().toDateString();
    const todayMeals = mealHistory.filter(meal => meal.date === today);
    
    const habits = [
        {
            name: 'Регулярность питания',
            description: '3 приема пищи в день',
            score: todayMeals.length >= 3 ? 'excellent' : todayMeals.length >= 2 ? 'good' : 'average',
            value: `${todayMeals.length}/3`
        },
        {
            name: 'Баланс белков',
            description: 'Достаточное количество белка',
            score: 'good',
            value: 'Хорошо'
        },
        {
            name: 'Разнообразие',
            description: 'Разные типы блюд',
            score: 'average',
            value: 'Можно лучше'
        }
    ];
    
    container.innerHTML = '';
    habits.forEach(habit => {
        const habitElement = document.createElement('div');
        habitElement.className = 'habit-item';
        habitElement.innerHTML = `
            <div class="habit-info">
                <div class="habit-name">${habit.name}</div>
                <div class="habit-description">${habit.description}</div>
            </div>
            <div class="habit-score ${habit.score}">${habit.value}</div>
        `;
        container.appendChild(habitElement);
    });
}

function changePeriod(period) {
    // Обновляем активную кнопку
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Обновляем аналитику для выбранного периода
    updateAnalyticsPage();
}

function deleteMeal(id) {
    // Найти блюдо
    const idx = mealHistory.findIndex(meal => meal.id === id);
    if (idx === -1) return;
    // Вычесть значения из статистики
    const meal = mealHistory[idx];
    currentStats.calories -= meal.calories;
    currentStats.protein -= meal.protein;
    currentStats.fats -= meal.fats;
    currentStats.carbs -= meal.carbs;

    // Не допускать отрицательных и некорректных значений
    currentStats.calories = Math.max(0, Number(currentStats.calories) || 0);
    currentStats.protein = Math.max(0, Number(currentStats.protein) || 0);
    currentStats.fats = Math.max(0, Number(currentStats.fats) || 0);
    currentStats.carbs = Math.max(0, Number(currentStats.carbs) || 0);

    // Удалить из истории
    mealHistory.splice(idx, 1);
    localStorage.setItem('kbju_mealHistory', JSON.stringify(mealHistory));
    localStorage.setItem('kbju_stats', JSON.stringify(currentStats));
    updateStats();
    updateRecentMeals();
    if (typeof updateHistoryPage === 'function') updateHistoryPage();
    renderHistory('main-history-section');
    renderHistory('history-page-section');
}