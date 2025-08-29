require('dotenv').config();
const { getModelInfo } = require('./services/ai');

async function testModels() {
    console.log('🔍 Тестирование доступности моделей OpenAI...\n');
    
    try {
        const modelInfo = await getModelInfo();
        
        if (modelInfo.error) {
            console.error('❌ Ошибка:', modelInfo.error);
            return;
        }
        
        console.log('📋 Доступные модели:');
        modelInfo.available.forEach(model => {
            const visionIcon = model.supports_vision ? '👁️' : '❌';
            console.log(`  ${visionIcon} ${model.id} (создана: ${new Date(model.created * 1000).toLocaleDateString()})`);
        });
        
        console.log('\n⚙️  Настроенные модели:');
        Object.entries(modelInfo.configured).forEach(([type, model]) => {
            console.log(`  • ${type}: ${model}`);
        });
        
        console.log('\n👁️  Vision модели OpenAI:');
        modelInfo.vision_models.forEach(model => {
            console.log(`  • ${model}`);
        });
        
        console.log('\n🎯 Текущие активные модели:');
        Object.entries(modelInfo.current).forEach(([type, model]) => {
            const isVision = modelInfo.vision_models.some(vm => model.includes(vm));
            const icon = isVision ? '👁️' : '❌';
            console.log(`  ${icon} ${type}: ${model}`);
        });
        
        console.log('\n💡 Рекомендации:');
        console.log('  • Для анализа изображений используйте модели с 👁️');
        console.log('  • GPT-5 поддерживает vision, но может быть в beta');
        console.log('  • gpt-4o-mini - стабильная модель для продакшена');
        
        console.log('\n✅ Тестирование завершено!');
        
    } catch (error) {
        console.error('❌ Ошибка тестирования:', error.message);
    }
}

// Запускаем тест
testModels();
