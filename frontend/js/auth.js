console.log('AuthService: Скрипт загружен');

class AuthService {
    constructor() {
        console.log('AuthService: Конструктор вызван');
        this.currentUser = null;
        this.isAuthenticated = false;
        this._showModalAgain = true; // Флаг для повторного показа модального окна
        this.init();
    }

    async init() {
        console.log('AuthService: Инициализация...');
        // Проверяем статус аутентификации при загрузке
        await this.checkAuthStatus();
        this.setupEventListeners();
        console.log('AuthService: Инициализация завершена');
    }

    setupEventListeners() {
        console.log('AuthService: Настраиваю обработчики событий...');
        
        // Кнопка входа через Google в модальном окне
        const googleLoginBtn = document.getElementById('google-login-btn');
        console.log('AuthService: Google кнопка найдена:', googleLoginBtn);
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => {
                console.log('AuthService: Google кнопка нажата');
                this.login();
            });
        }

        // Кнопка закрытия модального окна аутентификации
        const authCloseBtn = document.getElementById('auth-close-btn');
        console.log('AuthService: Кнопка закрытия найдена:', authCloseBtn);
        if (authCloseBtn) {
            authCloseBtn.addEventListener('click', () => {
                console.log('AuthService: Кнопка закрытия нажата');
                this.hideAuthModal();
            });
        }
        
        // Кнопка выхода из системы в профиле
        const profileLogoutBtn = document.getElementById('profile-logout-btn');
        console.log('AuthService: Кнопка выхода в профиле найдена:', profileLogoutBtn);
        if (profileLogoutBtn) {
            profileLogoutBtn.addEventListener('click', () => {
                console.log('AuthService: Кнопка выхода в профиле нажата');
                this.logout();
            });
        }
        
        // Обработчик для перехода на страницу профиля
        const profileLink = document.getElementById('profile-link');
        console.log('AuthService: Ссылка на профиль найдена:', profileLink);
        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('AuthService: Переход на страницу профиля');
                this.showProfilePage();
            });
        }
        
        console.log('AuthService: Обработчики событий настроены');
    }

    // Показать модальное окно аутентификации
    showAuthModal() {
        console.log('AuthService: Показываю модальное окно аутентификации');
        
        // Создаем простое модальное окно программно
        this.createSimpleAuthModal();
        
        // Проверяем, что модальное окно действительно создалось
        const modals = document.querySelectorAll('.simple-auth-modal');
        console.log('AuthService: Модальных окон создано:', modals.length);
        if (modals.length > 0) {
            const lastModal = modals[modals.length - 1];
            console.log('AuthService: Последнее модальное окно:');
            console.log('- ID:', lastModal.id);
            console.log('- display:', lastModal.style.display);
            console.log('- visibility:', lastModal.style.visibility);
            console.log('- opacity:', lastModal.style.opacity);
            console.log('- z-index:', lastModal.style.zIndex);
            
            // Проверяем, видимо ли модальное окно в DOM
            const rect = lastModal.getBoundingClientRect();
            console.log('AuthService: Размеры модального окна:', {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left
            });
        }
    }
    
    // Создать простое модальное окно
    createSimpleAuthModal() {
        console.log('AuthService: Создаю модальное окно аутентификации...');
        
        // Принудительно удаляем ВСЕ существующие модальные окна
        const existingModals = document.querySelectorAll('.simple-auth-modal');
        console.log('AuthService: Найдено существующих модальных окон:', existingModals.length);
        
        existingModals.forEach(modal => {
            console.log('AuthService: Удаляю существующее модальное окно:', modal);
            modal.remove();
        });
        
        // Проверяем, что все удалились
        const checkAfterRemoval = document.querySelectorAll('.simple-auth-modal');
        console.log('AuthService: После удаления осталось модальных окон:', checkAfterRemoval.length);
        
        // Создаем новое модальное окно с уникальным ID
        const uniqueId = 'simple-auth-modal-' + Date.now();
        const modal = document.createElement('div');
        modal.id = uniqueId;
        modal.className = 'simple-auth-modal';
        // Устанавливаем стили по отдельности для лучшего контроля
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '10000';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 20px;
                padding: 32px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                box-shadow: 0 25px 50px rgba(0,0,0,0.3);
            ">
                <h2 style="margin-bottom: 16px; color: #333;">🔐 Войдите в систему</h2>
                <p style="margin-bottom: 24px; color: #666;">Для анализа изображений еды необходимо войти в аккаунт</p>
                
                <button id="simple-google-btn" style="
                    width: 100%;
                    padding: 16px;
                    background: #4285f4;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                ">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
                    </svg>
                    Войти через Google
                </button>
                
                <button id="simple-close-btn" style="
                    width: 100%;
                    padding: 12px;
                    background: none;
                    border: none;
                    color: #666;
                    font-size: 14px;
                    cursor: pointer;
                ">
                    Продолжить без входа
                </button>
            </div>
        `;
        
        // Добавляем обработчики
        const googleBtn = modal.querySelector('#simple-google-btn');
        const closeBtn = modal.querySelector('#simple-close-btn');
        
        googleBtn.addEventListener('click', () => {
            console.log('AuthService: Google кнопка нажата (простое модальное окно)');
            this.login();
        });
        
        closeBtn.addEventListener('click', () => {
            console.log('AuthService: Кнопка закрытия нажата (простое модальное окно)');
            modal.remove();
            console.log('AuthService: Модальное окно удалено из DOM');
            
            // Проверяем, что модальное окно действительно удалилось
            const checkModal = document.getElementById('simple-auth-modal');
            console.log('AuthService: Проверка удаления модального окна:', checkModal);
            
            // Сбрасываем состояние, чтобы модальное окно могло появиться снова
            this.resetAuthState();
        });
        
        // Добавляем в DOM
        document.body.appendChild(modal);
        console.log('AuthService: Простое модальное окно создано и показано');
        
        // Сразу проверяем видимость
        console.log('AuthService: Проверка сразу после создания:');
        console.log('- display:', modal.style.display);
        console.log('- visibility:', modal.style.visibility);
        console.log('- opacity:', modal.style.opacity);
        console.log('- z-index:', modal.style.zIndex);
        console.log('- background:', modal.style.backgroundColor);
        
        // Принудительно устанавливаем стили еще раз
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '10000';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        console.log('AuthService: Стили установлены повторно');
        
        // Принудительно проверяем видимость
        setTimeout(() => {
            const checkModal = document.getElementById(uniqueId);
            if (checkModal) {
                console.log('AuthService: Проверка видимости модального окна:');
                console.log('- display:', checkModal.style.display);
                console.log('- visibility:', checkModal.style.visibility);
                console.log('- opacity:', checkModal.style.opacity);
                console.log('- z-index:', checkModal.style.zIndex);
                console.log('- position:', checkModal.style.position);
                
                // Принудительно устанавливаем стили
                checkModal.style.display = 'flex';
                checkModal.style.visibility = 'visible';
                checkModal.style.opacity = '1';
                checkModal.style.zIndex = '10000';
                console.log('AuthService: Принудительно установлены стили');
                
                // Проверяем содержимое модального окна
                const content = checkModal.querySelector('div');
                if (content) {
                    console.log('AuthService: Содержимое модального окна найдено:', content);
                    console.log('- background:', content.style.background);
                    console.log('- color:', content.style.color);
                    console.log('- размеры:', content.getBoundingClientRect());
                    
                    // Принудительно устанавливаем стили для содержимого
                    content.style.background = 'white';
                    content.style.color = 'black';
                    content.style.display = 'block';
                    console.log('AuthService: Стили для содержимого установлены');
                } else {
                    console.log('AuthService: Содержимое модального окна не найдено!');
                }
                
                // Проверяем кнопки
                const googleBtn = checkModal.querySelector('#simple-google-btn');
                const closeBtn = checkModal.querySelector('#simple-close-btn');
                console.log('AuthService: Кнопки найдены:', { googleBtn: !!googleBtn, closeBtn: !!closeBtn });
            }
        }, 100);
    }

    // Скрыть модальное окно аутентификации
    hideAuthModal() {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.style.display = 'none';
        }
    }

    // Проверить аутентификацию перед действием
    requireAuth(action) {
        if (this.isAuthenticated) {
            // Если пользователь аутентифицирован, выполняем действие
            return action();
        } else {
            // Если не аутентифицирован, показываем модальное окно
            this.showAuthModal();
            return false;
        }
    }

    async login() {
        try {
            // Перенаправляем на Google OAuth
            window.location.href = '/auth/google';
        } catch (error) {
            console.error('Ошибка входа:', error);
            this.showError('Ошибка входа в систему');
        }
    }

    async logout() {
        try {
            const response = await fetch('/auth/logout', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                this.currentUser = null;
                this.isAuthenticated = false;
                this.showSuccess('Вы успешно вышли из системы');
                
                // Обновляем UI после выхода
                this.updateSidebarUI();
                this.updateProfilePageUI();
            } else {
                throw new Error('Ошибка выхода');
            }
        } catch (error) {
            console.error('Ошибка выхода:', error);
            this.showError('Ошибка при выходе из системы');
        }
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/auth/status', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.authenticated) {
                    this.currentUser = data.user;
                    this.isAuthenticated = true;
                    this._showModalAgain = false; // Сбрасываем флаг после успешной аутентификации
                } else {
                    this.currentUser = null;
                    this.isAuthenticated = false;
                }
            } else {
                this.currentUser = null;
                this.isAuthenticated = false;
            }
        } catch (error) {
            console.error('Ошибка проверки статуса:', error);
            this.currentUser = null;
            this.isAuthenticated = false;
        }
        
        // Обновляем UI после проверки статуса
        this.updateSidebarUI();
        this.updateProfilePageUI();
    }

    async showProfile() {
        if (!this.isAuthenticated) return;

        try {
            const response = await fetch('/api/profile', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const profile = await response.json();
                this.showProfileModal(profile);
            } else {
                throw new Error('Ошибка получения профиля');
            }
        } catch (error) {
            console.error('Ошибка получения профиля:', error);
            this.showError('Ошибка получения профиля');
        }
    }

    showProfileModal(profile) {
        // Создаем модальное окно профиля
        const modal = document.createElement('div');
        modal.className = 'profile-modal';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div class="profile-header">
                    <img src="${profile.user.picture}" alt="${profile.user.name}" class="profile-avatar">
                    <div class="profile-info">
                        <h3>${profile.user.name}</h3>
                        <p>${profile.user.email}</p>
                    </div>
                    <button class="close-btn" onclick="this.closest('.profile-modal').remove()">×</button>
                </div>
                <div class="profile-body">
                    <div class="profile-section">
                        <h4>Настройки</h4>
                        <div class="setting-item">
                            <label>Единицы измерения:</label>
                            <select id="units-select">
                                <option value="metric" ${profile.preferences.units === 'metric' ? 'selected' : ''}>Метрические</option>
                                <option value="imperial" ${profile.preferences.units === 'imperial' ? 'selected' : ''}>Имперские</option>
                            </select>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button class="logout-btn" onclick="authService.logout()">Выйти</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    showSuccess(message) {
        // Показываем уведомление об успехе
        this.showNotification(message, 'success');
    }

    showError(message) {
        // Показываем уведомление об ошибке
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Автоматически скрываем через 3 секунды
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Получение текущего пользователя
    getCurrentUser() {
        return this.currentUser;
    }

    // Проверка аутентификации
    isUserAuthenticated() {
        return this.isAuthenticated;
    }
    
    // Сброс состояния аутентификации для повторного показа модального окна
    resetAuthState() {
        console.log('AuthService: Сбрасываю состояние аутентификации');
        // Временно помечаем как неаутентифицированного, чтобы модальное окно могло появиться снова
        this._showModalAgain = true;
    }
    
    // Переопределяем проверку аутентификации
    isUserAuthenticated() {
        console.log('AuthService: Проверка аутентификации:', {
            isAuthenticated: this.isAuthenticated
        });
        
        // Простая логика: если не аутентифицирован, показываем модальное окно
        if (!this.isAuthenticated) {
            console.log('AuthService: Пользователь не аутентифицирован - возвращаю false');
            return false;
        }
        
        console.log('AuthService: Пользователь аутентифицирован - возвращаю true');
        return true;
    }
    
    // Обновить UI в sidebar
    updateSidebarUI() {
        const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
        const profileDefaultIcon = document.getElementById('profile-default-icon');
        
        if (this.isAuthenticated && this.currentUser && sidebarUserAvatar && profileDefaultIcon) {
            // Показываем Google аватар
            sidebarUserAvatar.src = this.currentUser.picture;
            sidebarUserAvatar.alt = this.currentUser.name;
            sidebarUserAvatar.style.display = 'block';
            profileDefaultIcon.style.display = 'none';
            console.log('AuthService: Обновлен sidebar - показан Google аватар');
        } else if (sidebarUserAvatar && profileDefaultIcon) {
            // Показываем стандартную иконку
            sidebarUserAvatar.style.display = 'none';
            profileDefaultIcon.style.display = 'block';
            console.log('AuthService: Обновлен sidebar - показана стандартная иконка');
        }
    }
    
    // Обновить UI на странице профиля
    updateProfilePageUI() {
        const profileUserAvatar = document.getElementById('profile-user-avatar');
        const profileAvatarIcon = document.getElementById('profile-avatar-icon');
        const profileName = document.getElementById('profile-name');
        const profileSubtitle = document.getElementById('profile-subtitle');
        const logoutSection = document.getElementById('logout-section');
        
        if (this.isAuthenticated && this.currentUser) {
            // Показываем Google аватар и информацию
            if (profileUserAvatar && profileAvatarIcon) {
                profileUserAvatar.src = this.currentUser.picture;
                profileUserAvatar.alt = this.currentUser.name;
                profileUserAvatar.style.display = 'block';
                profileAvatarIcon.style.display = 'none';
            }
            
            if (profileName) {
                profileName.textContent = this.currentUser.name;
            }
            
            if (profileSubtitle) {
                profileSubtitle.textContent = `Google аккаунт: ${this.currentUser.email}`;
            }
            
            if (logoutSection) {
                logoutSection.style.display = 'block';
            }
            console.log('AuthService: Обновлена страница профиля - показан Google профиль');
        } else {
            // Показываем стандартную информацию
            if (profileUserAvatar && profileAvatarIcon) {
                profileUserAvatar.style.display = 'none';
                profileAvatarIcon.style.display = 'block';
            }
            
            if (profileName) {
                profileName.textContent = 'Пользователь';
            }
            
            if (profileSubtitle) {
                profileSubtitle.textContent = 'Управление профиль и целями';
            }
            
            if (logoutSection) {
                logoutSection.style.display = 'none';
            }
            console.log('AuthService: Обновлена страница профиля - показан стандартный профиль');
        }
    }
    
    // Показать страницу профиля
    showProfilePage() {
        // Скрываем все страницы
        const pages = ['main-page', 'history-page', 'profile-page'];
        pages.forEach(pageId => {
            const page = document.getElementById(pageId);
            if (page) {
                page.style.display = 'none';
            }
        });
        
        // Показываем страницу профиля
        const profilePage = document.getElementById('profile-page');
        if (profilePage) {
            profilePage.style.display = 'block';
        }
        
        // Скрываем sidebar
        const sideMenu = document.getElementById('side-menu');
        if (sideMenu) {
            sideMenu.classList.remove('active');
        }
        
        // Обновляем UI профиля
        this.updateProfilePageUI();
    }
}

// Создаем глобальный экземпляр
const authService = new AuthService();
