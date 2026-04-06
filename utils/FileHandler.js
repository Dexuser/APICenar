import fs from "fs";

// Function to get all data from a file
// If the file does not exist or is empty, it returns an empty array
export function GetAllDataFromFile(dataPath, callback) {
  fs.readFile(dataPath, function (err, data) {
    if (err) {
      callback([]);
    } else {
      callback(JSON.parse(data));
    }
  });
};

// Function to save data to a file
// It overwrites the existing file with the new data
export function SaveDataInFile (dataPath, data){
  fs.writeFile(dataPath, JSON.stringify(data), function (err, data) {
    if (err) {
      console.error("Error saving data:", err);
    }
  });
};
