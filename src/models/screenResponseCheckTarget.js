export const screenResponseCheckTargetModel = (sequelize, Sequelize) => {
    const ScreenResponseCheckTargets = sequelize.define("ScreenResponseCheckTargets", {
        Id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        ScreeenName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        ScreeenURL: {
            type: Sequelize.STRING,
            allowNull: false
        },
        CheckIntervalMinutes: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        NumberOfTrial: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        NumberOfParallelProcessing: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        CreatedOn: {
            type: Sequelize.DATE,
            allowNull: false
        },
        CreatedBy: {
            type: Sequelize.STRING,
            allowNull: false
        },
        ModifiedOn: {
            type: Sequelize.DATE,
            allowNull: true
        },
        ModifiedBy: {
            type: Sequelize.STRING,
            allowNull: true
        },
        ScreenCategory: {
            type: Sequelize.INTEGER,
            allowNull: false
        }

    },
        {
            freezeTableName: false,
            timestamps: false,
        }
    );
    return ScreenResponseCheckTargets;
};