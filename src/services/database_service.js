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

export const bulkCreateScreenResponseTime = async function (records, context) {
    try {
        await ScreenResponseTimes.bulkCreate(records);
        context.log(`Inserted ${records.length} records.`);
    } catch (error) {
        context.error(`Error occurred bulkCreateScreenResponseTime():-${error}`);
    }
}

