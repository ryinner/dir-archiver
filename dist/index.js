"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateZip = void 0;
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
function generateZip({ excludes, outDir, inputDir, extension, archiverOptions }) {
    if (typeof inputDir !== 'string') {
        throw new Error('Input dir is required argument');
    }
    if (typeof outDir !== 'string') {
        throw new Error('Out dir is required argument');
    }
    if ((0, fs_1.existsSync)(outDir)) {
        (0, fs_1.unlinkSync)(outDir);
    }
    const output = (0, fs_1.createWriteStream)(outDir);
    const archive = (0, archiver_1.default)(extension !== null && extension !== void 0 ? extension : 'zip', archiverOptions);
    archive.on('warning', (error) => {
        if (error.code === 'ENOENT') {
            console.log(error);
        }
        else {
            throw error;
        }
    });
    archive.on('error', (error) => {
        throw error;
    });
    archive.on('close', () => {
        console.log(`${archive.pointer()} total bytes`);
        console.log('Archiver has been finalized');
    });
    archive.on('end', () => {
        console.log('Data has been drained');
    });
    archive.pipe(output);
    addFileOrDirInArchive({
        inputDir,
        archive,
        excludes
    });
    archive.finalize();
}
exports.generateZip = generateZip;
function addFileOrDirInArchive({ inputDir, excludes, archive }) {
    const files = (0, fs_1.readdirSync)(inputDir);
    const inputPath = path_1.default.resolve(inputDir);
    files.forEach(file => {
        const currentPath = path_1.default.join(inputPath, file);
        const currentPathStat = (0, fs_1.statSync)(currentPath);
        let included = true;
        if (Array.isArray(excludes)) {
            excludes.forEach(exclude => {
                if (exclude instanceof RegExp) {
                    included = !exclude.test(inputDir);
                }
                else {
                    included = exclude !== inputDir;
                }
            });
        }
        if (included) {
            if (currentPathStat.isFile()) {
                archive.file(currentPath, {
                    name: path_1.default.relative(inputDir, currentPath)
                });
            }
            else if (currentPathStat.isDirectory()) {
                addFileOrDirInArchive({
                    inputDir: currentPath,
                    excludes,
                    archive
                });
            }
        }
    });
}