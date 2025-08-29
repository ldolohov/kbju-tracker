// Простое хранилище пользователей в памяти (в продакшене заменить на БД)
const users = new Map();
const userData = new Map();

class UserService {
    // Создание или обновление пользователя
    createOrUpdateUser(googleProfile) {
        const user = {
            id: googleProfile.id,
            email: googleProfile.email,
            name: googleProfile.name,
            picture: googleProfile.picture,
            provider: 'google',
            createdAt: new Date(),
            lastLogin: new Date()
        };
        
        users.set(user.id, user);
        
        // Инициализируем данные пользователя если их нет
        if (!userData.has(user.id)) {
            userData.set(user.id, {
                foodHistory: [],
                dailyTargets: {
                    calories: 2000,
                    protein: 150,
                    fats: 65,
                    carbs: 250
                },
                preferences: {
                    units: 'metric', // metric или imperial
                    language: 'ru'
                }
            });
        }
        
        return user;
    }
    
    // Получение пользователя по ID
    getUserById(userId) {
        return users.get(userId);
    }
    
    // Получение данных пользователя
    getUserData(userId) {
        return userData.get(userId);
    }
    
    // Сохранение записи о еде
    saveFoodEntry(userId, foodEntry) {
        if (!userData.has(userId)) {
            throw new Error('Пользователь не найден');
        }
        
        const user = userData.get(userId);
        const entry = {
            ...foodEntry,
            id: Date.now().toString(),
            timestamp: new Date(),
            userId: userId
        };
        
        user.foodHistory.push(entry);
        return entry;
    }
    
    // Получение истории еды пользователя
    getFoodHistory(userId, limit = 50) {
        if (!userData.has(userId)) {
            return [];
        }
        
        const user = userData.get(userId);
        return user.foodHistory
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }
    
    // Обновление дневных целей
    updateDailyTargets(userId, targets) {
        if (!userData.has(userId)) {
            throw new Error('Пользователь не найден');
        }
        
        const user = userData.get(userId);
        user.dailyTargets = { ...user.dailyTargets, ...targets };
        return user.dailyTargets;
    }
    
    // Получение статистики пользователя
    getUserStats(userId) {
        if (!userData.has(userId)) {
            return null;
        }
        
        const user = userData.get(userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayEntries = user.foodHistory.filter(entry => 
            new Date(entry.timestamp) >= today
        );
        
        const totalCalories = todayEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
        const totalProtein = todayEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
        const totalFats = todayEntries.reduce((sum, entry) => sum + (entry.fats || 0), 0);
        const totalCarbs = todayEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
        
        return {
            today: {
                calories: totalCalories,
                protein: totalProtein,
                fats: totalFats,
                carbs: totalCarbs,
                entries: todayEntries.length
            },
            targets: user.dailyTargets,
            progress: {
                calories: Math.round((totalCalories / user.dailyTargets.calories) * 100),
                protein: Math.round((totalProtein / user.dailyTargets.protein) * 100),
                fats: Math.round((totalFats / user.dailyTargets.fats) * 100),
                carbs: Math.round((totalCarbs / user.dailyTargets.carbs) * 100)
            }
        };
    }
    
    // Удаление записи о еде
    deleteFoodEntry(userId, entryId) {
        if (!userData.has(userId)) {
            throw new Error('Пользователь не найден');
        }
        
        const user = userData.get(userId);
        const index = user.foodHistory.findIndex(entry => entry.id === entryId);
        
        if (index === -1) {
            throw new Error('Запись не найдена');
        }
        
        const deletedEntry = user.foodHistory.splice(index, 1)[0];
        return deletedEntry;
    }
}

module.exports = new UserService();
