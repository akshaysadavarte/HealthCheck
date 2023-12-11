import { Sequelize } from "sequelize"
import { screenResponseTimeModel } from "../models/screenResponseTime.js"
import { screenResponseCheckTargetModel } from "../models/screenResponseCheckTarget.js"


// Override timezone formatting
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  date = this._applyTimezone(date, options);

  // Z here means current timezone, _not_ UTC
  // return date.format('YYYY-MM-DD HH:mm:ss.SSS Z');
  return date.format('YYYY-MM-DD HH:mm:ss');
};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DIALECT,
    dialectOptions: {
      options: { encrypt: true, trustServerCertificate: true },
      useUTC: false //for reading from database
    },
    timezone: process.env.DB_TIMEZONE || '+05:30' //for writing to database
  }
);
// sequelize
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully to the mssql database.');
//   })
//   .catch((err) => {
//     console.error('Unable to connect to the mssql database:', err);
//   });

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.ScreenResponseTimes = screenResponseTimeModel(sequelize, Sequelize);
db.ScreenResponseCheckTargets = screenResponseCheckTargetModel(sequelize, Sequelize);

//sequelize.sync({ alter: false });

export default db;