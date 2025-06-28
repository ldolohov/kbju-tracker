const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('FoodEntry', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true // пока без авторизации
        },
        foodName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        portion: DataTypes.STRING,
        calories: DataTypes.INTEGER,
        protein: DataTypes.FLOAT,
        fats: DataTypes.FLOAT,
        carbs: DataTypes.FLOAT,
        mealType: {
            type: DataTypes.ENUM('breakfast', 'lunch', 'dinner'),
            allowNull: false
        },
        advice: DataTypes.TEXT,
        imagePath: DataTypes.STRING,
        createdAt: DataTypes.DATE
    });
};