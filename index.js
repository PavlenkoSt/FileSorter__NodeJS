const fs = require('fs');
const path = require('path');

const SRC_DIR = 'filesSrc';
const DIST_DIR = 'filesDist';

const pathToSrcFiles = path.join(__dirname, SRC_DIR);
const pathToDistFiles = path.join(__dirname, DIST_DIR);

const distList = {
  // "A" : [...files]
  // file -> { name, path }
};

const getFileListToSort = (files, pathParam) => {
  files.forEach(item => {
    const filePath = path.join(pathParam, item);

    if (fs.statSync(filePath).isDirectory()) {
      const filesToCheck = fs.readdirSync(filePath);

      getFileListToSort(filesToCheck, path.join(pathParam, item));

      return;
    }

    const dirName = item[0].toUpperCase();

    const fileInfo = {
      name: item,
      path: path.join(pathParam, item),
    };

    if (!distList[dirName]) {
      distList[dirName] = [fileInfo];
      return;
    }

    distList[dirName].push(fileInfo);
  });

  return distList;
};

const writeFiles = fileList => {
  const folderExist = fs.existsSync(pathToDistFiles);

  if (folderExist) {
    fs.rmSync(pathToDistFiles, { recursive: true, force: true });
  }

  fs.mkdirSync(pathToDistFiles);

  for (const key in fileList) {
    const letterDir = path.join(pathToDistFiles, key);

    fs.mkdirSync(letterDir);

    fileList[key].forEach(fileInfo => {
      const srcFilePath = fileInfo.path;
      const distFilePath = path.join(letterDir, fileInfo.name);

      fs.copyFileSync(srcFilePath, distFilePath);
    });
  }
};

const execute = () => {
  const filesSrc = fs.readdirSync(pathToSrcFiles);

  const fileList = getFileListToSort(filesSrc, pathToSrcFiles);

  writeFiles(fileList);
};

execute();
