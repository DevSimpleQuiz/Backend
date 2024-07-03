// const {
//   loadMapFromFile,
//   saveMapToFile,
//   saveDataWhenShutDown,
// } = require("../utils/dataLoadAndSave.js");
// const { SCORE_DATA_FILE_PATH } = require("../constants/constant");

// const scores = loadMapFromFile(SCORE_DATA_FILE_PATH);

// const saveData = () => {
//   saveMapToFile(scores, SCORE_DATA_FILE_PATH);
// };

// saveDataWhenShutDown(saveData);

const scores = new Map();

module.exports = scores;
