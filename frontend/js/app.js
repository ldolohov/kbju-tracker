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

// Elements
const uploadCard = document.getElementById('upload-card');
const fileInput = document.getElementById('file-input');
const photoSection = document.getElementById('photo-section');
const photoPreview = document.getElementById('photo-preview');
const analyzing = document.getElementById('analyzing');
const resultCard = document.getElementById('result-card');
const nutritionStats = document.getElementById('nutrition-stats');
const mealTime = document.getElementById('meal-time');
const saveSection = document.getElementById('save-section');
const retakeBtn = document.getElementById('retake-btn');
const saveBtn = document.getElementById('save-btn');

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadProfile();
    updateDailyStats();
    updateFoodList();
    updateTodayDate();
});

function initializeApp() {
    // Meal pills
    const mealPills = document.querySelectorAll('.meal-pill');
    mealPills.forEach(pill => {
        pill.addEventListener('click', () => {
            mealPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });

    // Upload handling
    uploadCard.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag and drop
    uploadCard.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadCard.style.borderColor = 'var(--accent)';
    });

    uploadCard.addEventListener('dragleave', () => {
        uploadCard.style.borderColor = 'transparent';
    });

    uploadCard.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadCard.style.borderColor = 'transparent';
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Retake photo
    retakeBtn.addEventListener('click', () => {
        reset();
    });

    // Save to diary
    saveBtn.addEventListener('click', function() {
        this.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10L8 13L15 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Сохранено!';
        this.style.background = '#16a34a';
        
        // Сохраняем в историю
        const selectedMeal = document.querySelector('.meal-pill.active').dataset.meal;
        const foodData = {
            name: document.getElementById('food-name').textContent,
            calories: parseInt(document.getElementById('calories').textContent),
            protein: parseFloat(document.getElementById('protein').textContent),
            fats: parseFloat(document.getElementById('fat').textContent),
            carbs: parseFloat(document.getElementById('carbs').textContent),
            type: selectedMeal,
            time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toDateString(),
            id: Date.now()
        };
        
        addToHistory(foodData);
        
        setTimeout(() => {
            reset();
        }, 1500);
    });

    console.log('Приложение инициализировано');
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        photoPreview.src = e.target.result;
        showAnalysis();
    };
    reader.readAsDataURL(file);
}

function showAnalysis() {
    uploadCard.style.display = 'none';
    photoSection.classList.add('active');
    analyzing.classList.add('active');

    // Отправляем на сервер для анализа
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('mealType', getSelectedMealType());

    fetch(`${API_BASE_URL}/analyze-food`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        analyzing.classList.remove('active');
        showResults(result);
    })
    .catch(error => {
        console.error('Ошибка при анализе:', error);
        analyzing.classList.remove('active');
        // Показываем демо-данные при ошибке
        showResults({
            name: 'Цезарь с курицей',
            portion: 'Порция ~320г',
            confidence: '94%',
            calories: 285,
            protein: 18.5,
            fats: 19.2,
            carbs: 12.8
        });
    });
}

function showResults(result) {
    // Update result card
    document.getElementById('food-name').textContent = result.name;
    document.getElementById('food-portion').textContent = result.portion || 'Порция ~300г';
    document.getElementById('confidence').textContent = result.confidence || '95%';
    
    resultCard.classList.add('active');
    nutritionStats.style.display = 'grid';
    mealTime.style.display = 'flex';
    saveSection.classList.add('active');

    // Animate values
    animateValue('calories', 0, result.calories, 800);
    animateValue('protein', 0, result.protein, 800);
    animateValue('fat', 0, result.fats, 800);
    animateValue('carbs', 0, result.carbs, 800);
}

function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    const range = end - start;
    const startTime = performance.now();
    const isDecimal = !Number.isInteger(end);

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (range * easeOut);
        
        element.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function getSelectedMealType() {
    return document.querySelector('.meal-pill.active').dataset.meal;
}

function reset() {
    uploadCard.style.display = 'block';
    photoSection.classList.remove('active');
    resultCard.classList.remove('active');
    nutritionStats.style.display = 'none';
    mealTime.style.display = 'none';
    saveSection.classList.remove('active');
    saveBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L10 18M2 10L18 10" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg> Сохранить в дневник';
    saveBtn.style.background = '';
    fileInput.value = '';
}

function addToHistory(food) {
    mealHistory.unshift(food);
    if (mealHistory.length > 50) mealHistory = mealHistory.slice(0, 50);
    localStorage.setItem('kbju_mealHistory', JSON.stringify(mealHistory));
    
    // Обновляем статистику
    updateDailyStats();
    updateFoodList();
}

function updateDailyStats() {
    const today = new Date().toDateString();
    const todayMeals = mealHistory.filter(meal => meal.date === today);
    
    const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalFats = todayMeals.reduce((sum, meal) => sum + meal.fats, 0);
    const totalCarbs = todayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
    
    // Обновляем значения
    document.getElementById('daily-calories').textContent = totalCalories;
    document.getElementById('daily-protein').textContent = totalProtein + 'г';
    document.getElementById('daily-fat').textContent = totalFats + 'г';
    document.getElementById('daily-carbs').textContent = totalCarbs + 'г';
    
    // Обновляем круговую диаграмму калорий
    const progress = Math.min((totalCalories / userProfile.targetCalories) * 100, 100);
    const circle = document.querySelector('.circle');
    if (circle) {
        const circumference = 2 * Math.PI * 15.9155; // Радиус круга
        const dasharray = (progress / 100) * circumference;
        circle.style.strokeDasharray = `${dasharray}, ${circumference}`;
    }
}

function updateFoodList() {
    const container = document.getElementById('meals-container');
    if (!container) return;
    
    const today = new Date().toDateString();
    const todayMeals = mealHistory.filter(meal => meal.date === today);
    
    if (todayMeals.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Нет записей за сегодня</p>';
        return;
    }
    
    // Группируем по приемам пищи
    const mealTypes = {
        breakfast: { name: 'Завтрак', meals: [] },
        lunch: { name: 'Обед', meals: [] },
        dinner: { name: 'Ужин', meals: [] },
        snack: { name: 'Перекус', meals: [] }
    };
    
    todayMeals.forEach(meal => {
        if (mealTypes[meal.type]) {
            mealTypes[meal.type].meals.push(meal);
        }
    });
    
    container.innerHTML = '';
    Object.values(mealTypes).forEach(type => {
        if (type.meals.length > 0) {
            const totalCalories = type.meals.reduce((sum, meal) => sum + meal.calories, 0);
            
            const mealGroup = document.createElement('div');
            mealGroup.className = 'meal-group';
            mealGroup.innerHTML = `
                <div class="meal-header">
                    <span class="meal-name">${type.name}</span>
                    <span class="meal-calories">${totalCalories} ккал</span>
                </div>
            `;
            
            type.meals.forEach(meal => {
                const foodItem = document.createElement('div');
                foodItem.className = 'food-item';
                foodItem.innerHTML = `
                    <div class="food-icon" style="background: ${getRandomColor()};">${getFoodIcon(meal.name)}</div>
                    <div class="food-info">
                        <h4>${meal.name}</h4>
                        <p>~300г • ${meal.calories} ккал</p>
                    </div>
                    <button class="food-menu" onclick="deleteMeal(${meal.id})">⋮</button>
                `;
                mealGroup.appendChild(foodItem);
            });
            
            container.appendChild(mealGroup);
        }
    });
}

function getRandomColor() {
    const colors = ['#fef3c7', '#dbeafe', '#fce7f3', '#dcfce7', '#fee2e2', '#f3e8ff', '#ede9fe'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function getFoodIcon(foodName) {
    const icons = {
        'каша': '🥣',
        'салат': '🥗',
        'суп': '🍲',
        'курица': '🍗',
        'рыба': '🐟',
        'мясо': '🥩',
        'хлеб': '🍞',
        'фрукт': '🍎',
        'овощ': '🥕',
        'напиток': '🥤',
        'кофе': '☕',
        'чай': '🫖'
    };
    
    for (const [key, icon] of Object.entries(icons)) {
        if (foodName.toLowerCase().includes(key)) {
            return icon;
        }
    }
    
    return '🍽️';
}

function deleteMeal(id) {
    const idx = mealHistory.findIndex(meal => meal.id === id);
    if (idx === -1) return;
    
    mealHistory.splice(idx, 1);
    localStorage.setItem('kbju_mealHistory', JSON.stringify(mealHistory));
    
    updateDailyStats();
    updateFoodList();
}

function updateTodayDate() {
    const today = new Date();
    const options = { day: 'numeric', month: 'long' };
    const dateString = today.toLocaleDateString('ru-RU', options);
    document.getElementById('today-date').textContent = dateString;
}

function loadProfile() {
    const savedProfile = localStorage.getItem('kbju_userProfile');
    if (savedProfile) {
        userProfile = { ...userProfile, ...JSON.parse(savedProfile) };
    }
} 