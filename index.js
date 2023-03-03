const { readdir, stat, rm, mkdir, copyFile, access } = require('fs/promises');
const path = require('path');

const SRC_DIR = 'filesSrc';
const DIST_DIR = 'filesDist';

const pathToSrcFiles = path.join(__dirname, SRC_DIR);
const pathToDistFiles = path.join(__dirname, DIST_DIR);

const getFileListToSort = async (files, pathParam, processedFiles = {}) => {
  let distList = processedFiles;

  for await (item of files) {
    const filePath = path.join(pathParam, item);

    const isDirectory = (await stat(filePath)).isDirectory();

    if (isDirectory) {
      const filesToCheck = await readdir(filePath);

      const filesFromDirs = await getFileListToSort(filesToCheck, path.join(pathParam, item));

      distList = { ...distList, ...filesFromDirs };

      continue;
    }

    const dirName = item[0].toUpperCase();

    const fileInfo = {
      name: item,
      path: path.join(pathParam, item),
    };

    if (!distList[dirName]) {
      distList[dirName] = [fileInfo];

      continue;
    }

    distList[dirName].push(fileInfo);
  }

  return distList;
};

const isFileExist = async path => {
  try {
    await access(path);
    return true;
  } catch (e) {
    return false;
  }
};

const writeFiles = async fileList => {
  const folderExist = await isFileExist(pathToDistFiles);

  if (folderExist) {
    await rm(pathToDistFiles, { recursive: true, force: true });
  }

  await mkdir(pathToDistFiles);

  for (const key in fileList) {
    const letterDir = path.join(pathToDistFiles, key);

    await mkdir(letterDir);

    fileList[key].forEach(async fileInfo => {
      const srcFilePath = fileInfo.path;
      const distFilePath = path.join(letterDir, fileInfo.name);

      await copyFile(srcFilePath, distFilePath);
    });
  }
};

const run = async () => {
  const files = await readdir(pathToSrcFiles);

  const distList = await getFileListToSort(files, pathToSrcFiles);

  await writeFiles(distList);
};

run();
