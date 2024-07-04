// const fs = require("fs");

// // Map 객체를 파일에 저장하는 함수
// const saveMapToFile = (mapData, filePath) => {
//   const json = JSON.stringify(Object.fromEntries(mapData));
//   fs.writeFileSync(filePath, json, "utf8");
// };

// // 파일에서 Map 객체를 불러오는 함수
// const loadMapFromFile = (filePath) => {
//   if (fs.existsSync(filePath)) {
//     const data = fs.readFileSync(filePath, "utf8");
//     if (data.trim() === "") {
//       return new Map();
//     }
//     const json = JSON.parse(data);
//     return new Map(Object.entries(json));
//   } else {
//     return new Map();
//   }
// };

// const saveData = () => {
//   saveMapToFile(userMap, userFilePath);
//   saveMapToFile(scoreMap, scoreFilePath);
// };

// // 서버 종료 시 데이터 저장
// const saveDataWhenShutDown = (saveDatafn) => {
//   process.on("exit", saveDatafn);
//   process.on("SIGINT", () => {
//     saveDatafn();
//     process.exit();
//   });
//   process.on("SIGTERM", () => {
//     saveDatafn();
//     process.exit();
//   });
// };

// module.exports = {
//   loadMapFromFile,
//   saveDataWhenShutDown,
//   saveMapToFile,
//   saveData,
// };
