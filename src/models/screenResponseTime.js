export const screenResponseTimeModel = (sequelize, Sequelize) => {
    const ScreenResponseTimes = sequelize.define("ScreenResponseTimes", {
        Id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        TrialDatetime: {
            type: Sequelize.DATE,
            allowNull: false
        },
        TrialNumber: {
            type: Sequelize.INTEGER,
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
        LoadingTimeSeconds: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        HttpStatusCode: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        HttpStatusName: {
            type: Sequelize.STRING,
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
        }

    },
        {
            freezeTableName: false,
            timestamps: false,
        }
    );

    return ScreenResponseTimes;

};