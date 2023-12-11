import db from "../config/database_config.js"

const ScreenResponseCheckTargets = db.ScreenResponseCheckTargets;
const ScreenResponseTimes = db.ScreenResponseTimes;


export const getAllScreenResponseCheckTarget = async function (context) {

    try {
        return await ScreenResponseCheckTargets.findAll();
    } catch (error) {
        context.error(`Error occurred in getAllScreenResponseCheckTarget():-${error}`);
    }
}

export const createScreenResponseTime = async function (records, context) {
    try {
        await ScreenResponseTimes.bulkCreate(records);
    } catch (error) {
        context.error(`Error occurred in createScreenResponseTime():-${error}`);
    }
}

