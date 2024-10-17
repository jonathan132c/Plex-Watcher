const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Settings extends Model {}

Settings.init(
    {
        sonarrApiUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        sonarrApiKey: {
            type: DataTypes.STRING,
            allowNull: true
        },
        radarrApiUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        radarrApiKey: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize, // Pass the sequelize instance
        modelName: 'Settings', // Name of the model
        tableName: 'settings', // Specify the table name (optional)
        timestamps: true, // Adds `createdAt` and `updatedAt` fields automatically
    }
)
module.exports = Settings;