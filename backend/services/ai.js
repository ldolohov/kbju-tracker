const OpenAI = require('openai');
const config = require('../config');

const openai = new OpenAI({
    apiKey: config.ai.openai.apiKey
});

async function analyzeFood(imageBase64) {
    try {
        const response = await openai.chat.completions.create({
            model: "o4-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Проанализируй это блюдо и определи КБЖУ на порцию. Ответь в JSON формате: {\"name\": \"название блюда\", \"portion\": \"примерный вес в граммах (например, 180г, 450г)\", \"calories\": число, \"protein\": число, \"fats\": число, \"carbs\": число, \"advice\": \"совет по питанию\"}. Пожалуйста, строго соблюдай имена полей на английском. Если можешь, оценивай вес максимально реалистично по виду блюда на фото, не используй усреднённые значения."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${imageBase64}`
                            }
                        }
                    ]
                }
            ],
            max_completion_tokens: 300
        });

        let content = response.choices[0].message.content.trim();
        // Удаляем обёртку ```json ... ```
        if (content.startsWith('```')) {
            content = content.replace(/^```json|^```/i, '').replace(/```$/, '').trim();
        }
        console.log('Ответ OpenAI:', content); // Можно посмотреть, что реально пришло
        const aiResult = JSON.parse(content);
        console.log('Распарсенный результат:', aiResult);
        return aiResult;
    } catch (error) {
        console.error('Ошибка AI анализа:', error);
        throw error;
    }
}

function normalizeAIResult(result) {
    // Если calories нет, но есть kcal или energy, используем их
    if (result.calories === undefined) {
        if (result.kcal !== undefined) result.calories = result.kcal;
        else if (result.energy !== undefined) result.calories = result.energy;
        else if (result['калории'] !== undefined) result.calories = result['калории'];
        else result.calories = 0; // или null
    }
    result.calories = Number(result.calories) || 0;
    result.protein = Number(result.protein) || 0;
    result.fats = Number(result.fats) || 0;
    result.carbs = Number(result.carbs) || 0;
    return result;
}

module.exports = { analyzeFood };
