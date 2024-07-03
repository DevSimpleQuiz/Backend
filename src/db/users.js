// const {
//   loadMapFromFile,
//   saveMapToFile,
//   saveDataWhenShutDown,
// } = require("../utils/dataLoadAndSave.js");
// const { USER_DATA_FILE_PATH } = require("../constants/constant");

// const users = loadMapFromFile(USER_DATA_FILE_PATH);

// const saveData = () => {
//   saveMapToFile(users, USER_DATA_FILE_PATH);
// };

// saveDataWhenShutDown(saveData);

const users = new Map();

module.exports = users;
