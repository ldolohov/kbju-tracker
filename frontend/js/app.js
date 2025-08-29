// Автоматическое определение API URL для production/development
const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const url = isLocalhost ? 'http://localhost:3000/api' : '/api';
    
    console.log('Hostname:', hostname);
    console.log('Is localhost:', isLocalhost);
    console.log('API_BASE_URL:', url);
    
    return url;
})();

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

// Sidebar elements
let sidebar, sidebarToggle, sidebarOverlay;

// Page elements
let mainPage, historyPage, profilePage;

// Текущая страница
let currentPage = 'main';

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

// Modal elements
const foodModal = document.getElementById('food-modal');
const modalClose = document.getElementById('modal-close');

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    
    // Инициализируем переменные
    sidebar = document.getElementById('side-menu');
    sidebarToggle = document.getElementById('menu-btn');
    sidebarOverlay = document.getElementById('menu-overlay');
    mainPage = document.getElementById('main-page');
    historyPage = document.getElementById('history-page');
    profilePage = document.getElementById('profile-page');
    
    console.log('Элементы sidebar:', {
        sidebar: sidebar,
        sidebarToggle: sidebarToggle,
        sidebarOverlay: sidebarOverlay
    });
    console.log('Элементы страниц:', {
        mainPage: mainPage,
        historyPage: historyPage,
        profilePage: profilePage
    });
    
    initializeApp();
    initializeModal();
    initializeSidebar();
    initializeNavigation();
    loadProfile();
    
    // Небольшая задержка для гарантии загрузки всех элементов
    setTimeout(() => {
        updateDailyStats();
        updateFoodList();
        updateTodayDate();
    }, 100);
});

function initializeApp() {
    console.log('Инициализация приложения...');
    
    // Проверяем существование элементов
    if (!uploadCard) {
        console.error('uploadCard не найден');
        return;
    }
    if (!fileInput) {
        console.error('fileInput не найден');
        return;
    }
    if (!retakeBtn) {
        console.error('retakeBtn не найден');
        return;
    }
    if (!saveBtn) {
        console.error('saveBtn не найден');
        return;
    }
    
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
        const selectedMeal = document.querySelector('.meal-pill.active');
        if (!selectedMeal) {
            console.error('Не выбран тип приема пищи');
            return;
        }
        
        const foodName = document.getElementById('food-name');
        const portion = document.getElementById('food-portion');
        const calories = document.getElementById('calories');
        const protein = document.getElementById('protein');
        const fat = document.getElementById('fat');
        const carbs = document.getElementById('carbs');
        
        if (!foodName || !calories || !protein || !fat || !carbs) {
            console.error('Не найдены элементы с данными о еде');
            return;
        }
        
        const foodData = {
            name: foodName.textContent,
            portion: portion ? portion.textContent : '',
            calories: parseInt(calories.textContent),
            protein: parseFloat(protein.textContent),
            fats: parseFloat(fat.textContent),
            carbs: parseFloat(carbs.textContent),
            type: selectedMeal.dataset.meal,
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

function initializeModal() {
    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (foodModal) {
        foodModal.addEventListener('click', (e) => {
            if (e.target === foodModal) closeModal();
        });
    }
    
    // Modal action buttons
    const deleteBtn = document.querySelector('.modal-action-btn.delete');
    const editBtn = document.querySelector('.modal-action-btn.edit');
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const currentFoodId = foodModal.dataset.foodId;
            if (currentFoodId) {
                deleteMeal(parseInt(currentFoodId));
                closeModal();
            }
        });
    }

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            alert('Редактирование порции - функция в разработке');
            closeModal();
        });
    }
}

function initializeSidebar() {
    console.log('Инициализация sidebar...');
    console.log('sidebarToggle:', sidebarToggle);
    console.log('sidebar:', sidebar);
    console.log('sidebarOverlay:', sidebarOverlay);
    
    if (!sidebarToggle || !sidebar || !sidebarOverlay) {
        console.log('Sidebar elements not found:', { sidebarToggle, sidebar, sidebarOverlay });
        return;
    }
    
    console.log('Все элементы sidebar найдены, добавляем обработчики...');
    
    // Toggle sidebar
    sidebarToggle.addEventListener('click', () => {
        console.log('Menu button clicked');
        console.log('Sidebar before toggle:', sidebar.className);
        console.log('Overlay before toggle:', sidebarOverlay.className);
        
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
        
        console.log('Sidebar after toggle:', sidebar.className);
        console.log('Overlay after toggle:', sidebarOverlay.className);
        console.log('Sidebar computed style:', window.getComputedStyle(sidebar).right);
    });

    // Close sidebar on overlay click
    sidebarOverlay.addEventListener('click', () => {
        console.log('Overlay clicked, closing sidebar');
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });

    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        }
    });

    // Close sidebar on menu close button
    const menuClose = document.getElementById('menu-close');
    if (menuClose) {
        menuClose.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    console.log('Sidebar инициализирован');
}

function initializeNavigation() {
    // Navigation menu items - используем существующие элементы меню
    const historyLink = document.getElementById('history-link');
    const menuItems = document.querySelectorAll('.menu-item');
    
    if (historyLink) {
        historyLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage('history');
            
            // Close sidebar after navigation
            if (sidebar) {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
        });
    }

    // Добавляем обработчики для других пунктов меню
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Определяем страницу по содержимому или ID
            const text = item.textContent.toLowerCase();
            let page = 'main';
            
            if (text.includes('история') || item.id === 'history-link') {
                page = 'history';
            } else if (text.includes('профиль') || text.includes('👤')) {
                page = 'profile';
            } else if (text.includes('цели') || text.includes('🎯')) {
                page = 'goals';
            } else if (text.includes('настройки') || text.includes('⚙️')) {
                page = 'settings';
            }
            
            if (page !== 'main') {
                navigateToPage(page);
                
                // Close sidebar after navigation
                if (sidebar) {
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                }
            }
        });
    });

    // Back buttons
    const historyBack = document.getElementById('history-back');
    const profileBack = document.getElementById('profile-back');
    
    if (historyBack) {
        historyBack.addEventListener('click', () => {
            navigateToPage('main');
        });
    }
    
    if (profileBack) {
        profileBack.addEventListener('click', () => {
            navigateToPage('main');
        });
    }
}

function navigateToPage(page) {
    console.log('Navigating to page:', page);
    console.log('Elements:', { mainPage, historyPage, profilePage });
    
    if (!mainPage || !historyPage || !profilePage) {
        console.log('Some page elements not found');
        return;
    }
    
    // Hide all pages
    mainPage.style.display = 'none';
    historyPage.style.display = 'none';
    profilePage.style.display = 'none';

    // Show selected page
    switch(page) {
        case 'main':
            mainPage.style.display = 'block';
            currentPage = 'main';
            updateDailyStats();
            updateFoodList();
            break;
        case 'history':
            historyPage.style.display = 'block';
            historyPage.classList.add('active');
            currentPage = 'history';
            initializeHistoryPage();
            break;
        case 'profile':
            profilePage.style.display = 'block';
            profilePage.classList.add('active');
            currentPage = 'profile';
            initializeProfilePage();
            break;
    }

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeNavItem = document.querySelector(`[data-page="${page}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
}

function initializeHistoryPage() {
    const calendarContainer = document.getElementById('calendar-container');
    const selectedDateDisplay = document.getElementById('selected-date');
    const dayStats = document.getElementById('day-stats');
    const dayMeals = document.getElementById('day-meals');

    if (!calendarContainer) return;

    // Initialize calendar
    renderCalendar(calendarContainer);
    
    // Set today as default selected date
    const today = new Date();
    selectDate(today, selectedDateDisplay, dayStats, dayMeals);
}

function renderCalendar(container) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    // Month names
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    // Create calendar HTML
    let calendarHTML = `
        <div class="calendar-header">
            <h3>${monthNames[currentMonth]} ${currentYear}</h3>
        </div>
        <div class="calendar-grid">
            <div class="calendar-day-header">Пн</div>
            <div class="calendar-day-header">Вт</div>
            <div class="calendar-day-header">Ср</div>
            <div class="calendar-day-header">Чт</div>
            <div class="calendar-day-header">Пт</div>
            <div class="calendar-day-header">Сб</div>
            <div class="calendar-day-header">Вс</div>
    `;

    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateString = date.toDateString();
        const hasMeals = mealHistory.some(meal => meal.date === dateString);
        const isToday = date.toDateString() === today.toDateString();
        
        calendarHTML += `
            <div class="calendar-day ${hasMeals ? 'has-meals' : ''} ${isToday ? 'today' : ''}" 
                 data-date="${dateString}">
                ${day}
            </div>
        `;
    }

    calendarHTML += '</div>';

    container.innerHTML = calendarHTML;

    // Add click handlers
    const calendarDays = container.querySelectorAll('.calendar-day:not(.empty)');
    calendarDays.forEach(day => {
        day.addEventListener('click', () => {
            const dateString = day.dataset.date;
            const date = new Date(dateString);
            selectDate(date, document.getElementById('selected-date'), 
                      document.getElementById('day-stats'), 
                      document.getElementById('day-meals'));
            
            // Update active day
            calendarDays.forEach(d => d.classList.remove('selected'));
            day.classList.add('selected');
        });
    });
}

function selectDate(date, dateDisplay, statsContainer, mealsContainer) {
    if (!dateDisplay || !statsContainer || !mealsContainer) return;
    
    const dateString = date.toDateString();
    const dayMeals = mealHistory.filter(meal => meal.date === dateString);
    
    // Update date display
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = date.toLocaleDateString('ru-RU', options);
    
    // Calculate day stats
    const dayStats = {
        calories: dayMeals.reduce((sum, meal) => sum + meal.calories, 0),
        protein: dayMeals.reduce((sum, meal) => sum + meal.protein, 0),
        fats: dayMeals.reduce((sum, meal) => sum + meal.fats, 0),
        carbs: dayMeals.reduce((sum, meal) => sum + meal.carbs, 0)
    };
    
    // Update stats display
    statsContainer.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${dayStats.calories}</div>
            <div class="stat-label">Ккал</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${dayStats.protein.toFixed(1)}</div>
            <div class="stat-label">Белки</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${dayStats.fats.toFixed(1)}</div>
            <div class="stat-label">Жиры</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${dayStats.carbs.toFixed(1)}</div>
            <div class="stat-label">Углеводы</div>
        </div>
    `;
    
    // Update meals display
    if (dayMeals.length === 0) {
        mealsContainer.innerHTML = '<div class="no-meals">Нет записей за этот день</div>';
    } else {
        // Group meals by type
        const mealsByType = {
            breakfast: dayMeals.filter(meal => meal.type === 'breakfast'),
            lunch: dayMeals.filter(meal => meal.type === 'lunch'),
            dinner: dayMeals.filter(meal => meal.type === 'dinner'),
            snack: dayMeals.filter(meal => meal.type === 'snack')
        };
        
        let mealsHTML = '';
        
        Object.entries(mealsByType).forEach(([type, meals]) => {
            if (meals.length > 0) {
                const typeNames = {
                    breakfast: 'Завтрак',
                    lunch: 'Обед',
                    dinner: 'Ужин',
                    snack: 'Перекус'
                };
                
                mealsHTML += `<div class="meal-section">
                    <h4>${typeNames[type]}</h4>
                    <div class="meal-items">`;
                
                meals.forEach(meal => {
                    mealsHTML += `
                        <div class="meal-item" onclick="showFoodModal(${JSON.stringify(meal).replace(/"/g, '&quot;')})">
                            <div class="meal-item-info">
                                <div class="meal-name">${meal.name}</div>
                                <div class="meal-time">${meal.time}</div>
                            </div>
                            <div class="meal-calories">${meal.calories} ккал</div>
                        </div>
                    `;
                });
                
                mealsHTML += `</div></div>`;
            }
        });
        
        mealsContainer.innerHTML = mealsHTML;
    }
}

function initializeProfilePage() {
    console.log('Initializing profile page...');
    
    // Load current profile data
    loadProfileData();
    
    // Add event listeners
    const saveBtn = document.getElementById('profile-save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveProfileData);
    }
    
    // Add auto-calculate button listener
    const autoCalculateBtn = document.getElementById('auto-calculate-btn');
    if (autoCalculateBtn) {
        autoCalculateBtn.addEventListener('click', () => {
            updateNutritionGoals();
            
            // Show success message
            const originalText = autoCalculateBtn.innerHTML;
            autoCalculateBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Рассчитано!
            `;
            autoCalculateBtn.style.background = '#16a34a';
            autoCalculateBtn.style.color = 'white';
            autoCalculateBtn.style.borderColor = '#16a34a';
            
            setTimeout(() => {
                autoCalculateBtn.innerHTML = originalText;
                autoCalculateBtn.style.background = '';
                autoCalculateBtn.style.color = '';
                autoCalculateBtn.style.borderColor = '';
            }, 2000);
        });
    }
    
    // Add input change listeners for real-time updates and auto-save
    const inputs = document.querySelectorAll('.profile-input');
    inputs.forEach(input => {
        input.addEventListener('input', updateProfilePreview);
        // Автоматическое сохранение при изменении
        input.addEventListener('change', autoSaveProfile);
    });
    
    // Add activity level change listener
    const activityInputs = document.querySelectorAll('input[name="activity"]');
    activityInputs.forEach(input => {
        input.addEventListener('change', autoSaveProfile);
    });
    
    // Add gender change listener
    const genderInputs = document.querySelectorAll('input[name="gender"]');
    genderInputs.forEach(input => {
        input.addEventListener('change', autoSaveProfile);
    });
    
    console.log('Profile page initialized');
}

function autoSaveProfile() {
    // Небольшая задержка, чтобы не сохранять при каждом нажатии клавиши
    clearTimeout(autoSaveProfile.timeout);
    autoSaveProfile.timeout = setTimeout(() => {
        saveProfileData(true); // true = silent save (без уведомления)
    }, 1000);
}

function loadProfileData() {
    // Load saved profile data from localStorage
    const savedProfile = localStorage.getItem('kbju_profile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        updateProfileFormFields(profile);
    }
}

function updateProfilePreview() {
    const nameInput = document.getElementById('profile-name-input');
    const profileNameDisplay = document.getElementById('profile-name');
    
    if (nameInput && profileNameDisplay) {
        profileNameDisplay.textContent = nameInput.value || 'Пользователь';
    }
}

function saveProfileData(silent = false) {
    // Collect form data
    const profileData = {
        name: document.getElementById('profile-name-input')?.value || 'Пользователь',
        gender: document.querySelector('input[name="gender"]:checked')?.value || 'male',
        age: parseInt(document.getElementById('profile-age-input')?.value) || 25,
        height: parseInt(document.getElementById('profile-height-input')?.value) || 170,
        weight: parseInt(document.getElementById('profile-weight-input')?.value) || 70,
        targetCalories: parseInt(document.getElementById('profile-calories-input')?.value) || 2200,
        targetProtein: parseInt(document.getElementById('profile-protein-input')?.value) || 110,
        targetFats: parseInt(document.getElementById('profile-fats-input')?.value) || 75,
        targetCarbs: parseInt(document.getElementById('profile-carbs-input')?.value) || 275,
        activityLevel: document.querySelector('input[name="activity"]:checked')?.value || 'sedentary'
    };
    
    // Save to localStorage
    localStorage.setItem('kbju_profile', JSON.stringify(profileData));
    
    // Update global userProfile
    userProfile = { ...userProfile, ...profileData };
    
    // Show success message only if not silent
    if (!silent) {
        const saveBtn = document.getElementById('profile-save-btn');
        if (saveBtn) {
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Сохранено!
            `;
            saveBtn.style.background = '#16a34a';
            
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.style.background = '';
            }, 2000);
        }
    }
    
    // Update main page stats if we're on main page
    if (currentPage === 'main') {
        updateDailyStats();
    }
    
    console.log('Profile data saved:', profileData);
}

function handleFile(file) {
    console.log('handleFile: Начинаю обработку файла:', file.name);
    
    if (!file.type.startsWith('image/')) {
        console.log('handleFile: Файл не является изображением');
        return;
    }

    // Проверяем аутентификацию перед анализом
    console.log('handleFile: Проверяю аутентификацию...');
    if (!authService.isUserAuthenticated()) {
        console.log('handleFile: Пользователь не аутентифицирован, показываю модальное окно');
        // Показываем модальное окно аутентификации
        authService.showAuthModal();
        return;
    }

    console.log('handleFile: Пользователь аутентифицирован, продолжаю обработку');
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
    document.getElementById('food-portion').textContent = result.portion ? result.portion : 'Порция: не определено';
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
    console.log('updateDailyStats вызвана');
    console.log('userProfile:', userProfile);
    
    // Проверяем, что userProfile содержит необходимые значения
    if (!userProfile.targetCalories || !userProfile.targetProtein || !userProfile.targetFats || !userProfile.targetCarbs) {
        console.log('userProfile не содержит целевые значения, используем значения по умолчанию');
        userProfile.targetCalories = userProfile.targetCalories || 2200;
        userProfile.targetProtein = userProfile.targetProtein || 110;
        userProfile.targetFats = userProfile.targetFats || 75;
        userProfile.targetCarbs = userProfile.targetCarbs || 275;
    }
    
    const today = new Date().toDateString();
    const todayMeals = mealHistory.filter(meal => meal.date === today);
    
    const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalFats = todayMeals.reduce((sum, meal) => sum + meal.fats, 0);
    const totalCarbs = todayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
    
    // Обновляем текущие значения
    const dailyCaloriesEl = document.getElementById('daily-calories');
    const dailyProteinEl = document.getElementById('daily-protein');
    const dailyFatEl = document.getElementById('daily-fat');
    const dailyCarbsEl = document.getElementById('daily-carbs');
    
    console.log('Элементы найдены:', {
        dailyCaloriesEl: !!dailyCaloriesEl,
        dailyProteinEl: !!dailyProteinEl,
        dailyFatEl: !!dailyFatEl,
        dailyCarbsEl: !!dailyCarbsEl
    });
    
    if (dailyCaloriesEl) dailyCaloriesEl.textContent = totalCalories;
    if (dailyProteinEl) dailyProteinEl.textContent = totalProtein + 'г';
    if (dailyFatEl) dailyFatEl.textContent = totalFats + 'г';
    if (dailyCarbsEl) dailyCarbsEl.textContent = totalCarbs + 'г';
    
    // Обновляем целевые значения (серые цифры после "/")
    const statTarget = document.querySelector('.stat-target');
    console.log('statTarget найден:', !!statTarget);
    if (statTarget) {
        statTarget.textContent = '/' + userProfile.targetCalories;
        console.log('Обновлен statTarget:', statTarget.textContent);
    }
    
    // Обновляем целевые значения для белков, жиров и углеводов
    if (dailyProteinEl) {
        const proteinSubtitle = dailyProteinEl.parentElement?.querySelector('.stat-subtitle');
        console.log('proteinSubtitle найден:', !!proteinSubtitle);
        if (proteinSubtitle) {
            proteinSubtitle.textContent = '/' + userProfile.targetProtein + 'г';
            console.log('Обновлен proteinSubtitle:', proteinSubtitle.textContent);
        }
    }
    
    if (dailyFatEl) {
        const fatSubtitle = dailyFatEl.parentElement?.querySelector('.stat-subtitle');
        console.log('fatSubtitle найден:', !!fatSubtitle);
        if (fatSubtitle) {
            fatSubtitle.textContent = '/' + userProfile.targetFats + 'г';
            console.log('Обновлен fatSubtitle:', fatSubtitle.textContent);
        }
    }
    
    if (dailyCarbsEl) {
        const carbsSubtitle = dailyCarbsEl.parentElement?.querySelector('.stat-subtitle');
        console.log('carbsSubtitle найден:', !!carbsSubtitle);
        if (carbsSubtitle) {
            carbsSubtitle.textContent = '/' + userProfile.targetCarbs + 'г';
            console.log('Обновлен carbsSubtitle:', carbsSubtitle.textContent);
        }
    }
    
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
                        <p>${meal.portion ? meal.portion : 'Порция: не определено'} • ${meal.calories} ккал</p>
                    </div>
                    <button class="food-menu" onclick="showFoodMenu(${meal.id})">⋮</button>
                `;
                
                // Добавляем обработчик клика для открытия модального окна
                foodItem.addEventListener('click', (e) => {
                    // Предотвращаем открытие модального окна при клике на кнопку меню
                    if (e.target.closest('.food-menu')) return;
                    
                    showFoodModal(meal);
                });
                
                mealGroup.appendChild(foodItem);
            });
            
            container.appendChild(mealGroup);
        }
    });
}

function showFoodModal(meal) {
    // Обновляем содержимое модального окна
    document.getElementById('modal-food-name').textContent = meal.name;
    document.getElementById('modal-food-portion').textContent = meal.portion ? meal.portion : 'Порция: не определено';
    document.getElementById('modal-calories').textContent = meal.calories;
    document.getElementById('modal-protein').textContent = meal.protein;
    document.getElementById('modal-fat').textContent = meal.fats;
    document.getElementById('modal-carbs').textContent = meal.carbs;
    
    // Сохраняем ID блюда для удаления
    foodModal.dataset.foodId = meal.id;
    
    // Показываем модальное окно
    foodModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    foodModal.classList.remove('active');
    document.body.style.overflow = '';
    delete foodModal.dataset.foodId;
}

function showFoodMenu(mealId) {
    // Показываем контекстное меню или сразу открываем модальное окно
    const meal = mealHistory.find(m => m.id === mealId);
    if (meal) {
        showFoodModal(meal);
    }
}

function getRandomColor() {
    const colors = ['#fef3c7', '#dbeafe', '#fce7f3', '#dcfce7', '#fee2e2', '#f3e8ff', '#ede9fe'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function getFoodIcon(foodName) {
    const name = foodName.toLowerCase();
    
    if (name.includes('салат') || name.includes('овощ')) return '🥗';
    if (name.includes('куриц') || name.includes('мясо')) return '🍗';
    if (name.includes('рыб') || name.includes('лосось')) return '🐟';
    if (name.includes('суп')) return '🍲';
    if (name.includes('паста') || name.includes('макарон')) return '🍝';
    if (name.includes('пицц')) return '🍕';
    if (name.includes('бургер')) return '🍔';
    if (name.includes('суши') || name.includes('ролл')) return '🍣';
    if (name.includes('каша') || name.includes('овсянк')) return '🥣';
    if (name.includes('яйц') || name.includes('омлет')) return '🍳';
    if (name.includes('хлеб') || name.includes('тост')) return '🍞';
    if (name.includes('фрукт') || name.includes('яблоко')) return '🍎';
    if (name.includes('мороженое') || name.includes('десерт')) return '🍨';
    if (name.includes('кофе') || name.includes('чай')) return '☕';
    if (name.includes('сок') || name.includes('напиток')) return '🥤';
    
    return '🍽️';
}

function deleteMeal(id) {
    mealHistory = mealHistory.filter(meal => meal.id !== id);
    localStorage.setItem('kbju_mealHistory', JSON.stringify(mealHistory));
    updateDailyStats();
    updateFoodList();
    
    // Если мы на странице истории, обновляем её
    if (currentPage === 'history') {
        const selectedDate = document.querySelector('.calendar-day.selected');
        if (selectedDate) {
            const dateString = selectedDate.dataset.date;
            const date = new Date(dateString);
            selectDate(date, document.getElementById('selected-date'), 
                      document.getElementById('day-stats'), 
                      document.getElementById('day-meals'));
        }
    }
}

function updateTodayDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElement = document.getElementById('today-date');
    if (dateElement) {
        dateElement.textContent = today.toLocaleDateString('ru-RU', options);
    }
}

function loadProfile() {
    console.log('loadProfile вызвана');
    const savedProfile = localStorage.getItem('kbju_profile');
    console.log('Сохраненный профиль из localStorage:', savedProfile);
    
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        console.log('Распарсенный профиль:', profile);
        userProfile = { ...userProfile, ...profile };
        console.log('Обновленный userProfile:', userProfile);
        
        // Также обновляем поля формы профиля, если они существуют
        updateProfileFormFields(profile);
        
        // Обновляем отображение на главной странице
        updateDailyStats();
    } else {
        console.log('Сохраненный профиль не найден, используем значения по умолчанию');
    }
}

function updateProfileFormFields(profile) {
    // Обновляем поля формы профиля
    const nameInput = document.getElementById('profile-name-input');
    const ageInput = document.getElementById('profile-age-input');
    const heightInput = document.getElementById('profile-height-input');
    const weightInput = document.getElementById('profile-weight-input');
    const caloriesInput = document.getElementById('profile-calories-input');
    const proteinInput = document.getElementById('profile-protein-input');
    const fatsInput = document.getElementById('profile-fats-input');
    const carbsInput = document.getElementById('profile-carbs-input');
    
    if (nameInput) nameInput.value = profile.name || 'Пользователь';
    if (ageInput) ageInput.value = profile.age || 25;
    if (heightInput) heightInput.value = profile.height || 170;
    if (weightInput) weightInput.value = profile.weight || 70;
    if (caloriesInput) caloriesInput.value = profile.targetCalories || 2200;
    if (proteinInput) proteinInput.value = profile.targetProtein || 110;
    if (fatsInput) fatsInput.value = profile.targetFats || 75;
    if (carbsInput) carbsInput.value = profile.targetCarbs || 275;
    
    // Обновляем отображение имени в профиле
    const profileNameDisplay = document.getElementById('profile-name');
    if (profileNameDisplay) {
        profileNameDisplay.textContent = profile.name || 'Пользователь';
    }
    
    // Устанавливаем пол
    const gender = profile.gender || 'male';
    const genderInput = document.querySelector(`input[name="gender"][value="${gender}"]`);
    if (genderInput) {
        genderInput.checked = true;
    }
    
    // Устанавливаем уровень активности
    const activityLevel = profile.activityLevel || 'sedentary';
    const activityInput = document.querySelector(`input[name="activity"][value="${activityLevel}"]`);
    if (activityInput) {
        activityInput.checked = true;
    }
}

// Функция для расчёта базового метаболизма (BMR) по формуле Харриса-Бенедикта
function calculateBMR(weight, height, age, gender) {
    // Формула Харриса-Бенедикта
    if (gender === 'male') {
        return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
}

// Функция для расчёта общего расхода энергии (TDEE) с учётом активности
function calculateTDEE(bmr, activityLevel) {
    const activityMultipliers = {
        sedentary: 1.2,      // Сидячий образ жизни
        light: 1.375,        // Легкая активность (1-3 тренировки в неделю)
        moderate: 1.55,      // Умеренная активность (3-5 тренировок в неделю)
        high: 1.725,         // Высокая активность (6-7 тренировок в неделю)
        very_high: 1.9       // Очень высокая активность (физическая работа + тренировки)
    };
    
    return bmr * (activityMultipliers[activityLevel] || 1.2);
}

// Функция для расчёта макронутриентов на основе калорий
function calculateMacros(calories) {
    // Стандартное распределение макронутриентов:
    // Белки: 20-25% (1.6-2.2г на кг веса)
    // Жиры: 25-35%
    // Углеводы: 45-55%
    
    const proteinRatio = 0.25; // 25% от калорий
    const fatRatio = 0.30;     // 30% от калорий
    const carbsRatio = 0.45;   // 45% от калорий
    
    return {
        calories: Math.round(calories),
        protein: Math.round((calories * proteinRatio) / 4), // 4 ккал на 1г белка
        fats: Math.round((calories * fatRatio) / 9),        // 9 ккал на 1г жира
        carbs: Math.round((calories * carbsRatio) / 4)      // 4 ккал на 1г углеводов
    };
}

// Функция для автоматического расчёта КБЖУ на основе данных профиля
function calculateRecommendedMacros() {
    const profile = userProfile;
    
    // Проверяем, есть ли все необходимые данные
    if (!profile.weight || !profile.height || !profile.age || !profile.activityLevel) {
        console.log('Недостаточно данных для расчёта КБЖУ');
        return null;
    }
    
    // Расчёт базового метаболизма
    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender || 'male');
    
    // Расчёт общего расхода энергии
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    
    // Расчёт макронутриентов
    const macros = calculateMacros(tdee);
    
    console.log('Расчёт КБЖУ:', {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        macros: macros
    });
    
    return macros;
}

// Функция для обновления целей питания на основе расчёта
function updateNutritionGoals() {
    const recommendedMacros = calculateRecommendedMacros();
    
    if (recommendedMacros) {
        // Обновляем поля в форме профиля
        const caloriesInput = document.getElementById('profile-calories-input');
        const proteinInput = document.getElementById('profile-protein-input');
        const fatsInput = document.getElementById('profile-fats-input');
        const carbsInput = document.getElementById('profile-carbs-input');
        
        if (caloriesInput) caloriesInput.value = recommendedMacros.calories;
        if (proteinInput) proteinInput.value = recommendedMacros.protein;
        if (fatsInput) fatsInput.value = recommendedMacros.fats;
        if (carbsInput) carbsInput.value = recommendedMacros.carbs;
        
        // Обновляем глобальный профиль
        userProfile.targetCalories = recommendedMacros.calories;
        userProfile.targetProtein = recommendedMacros.protein;
        userProfile.targetFats = recommendedMacros.fats;
        userProfile.targetCarbs = recommendedMacros.carbs;
        
        // Автоматически сохраняем изменения
        autoSaveProfile();
        
        // Обновляем отображение на главной странице
        if (currentPage === 'main') {
            updateDailyStats();
        }
        
        console.log('Цели питания обновлены:', recommendedMacros);
    }
} 