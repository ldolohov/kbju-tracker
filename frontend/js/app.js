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
            const response = await fetch('http://localhost:3000/api/analyze-food', {
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
    // Заглушка: функция загрузки профиля. Реализуйте по необходимости.
    return;
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
    // Заглушка: обновление страницы истории. Реализуйте по необходимости.
    return;
}

function updateAnalyticsPage() {
    // Заглушка: обновление страницы аналитики. Реализуйте по необходимости.
    return;
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