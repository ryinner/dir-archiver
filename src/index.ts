import archiver, { type Format as ArchiverFormat, type ArchiverOptions } from 'archiver';
import { createWriteStream, existsSync, readdirSync, statSync, unlinkSync } from 'fs';
import path from 'path';

function generateZip ({ excludes, outDir, inputDir, extension, archiverOptions }: GenerateZipSettings): void {
  if (typeof inputDir !== 'string') {
    throw new Error('Input dir is required argument');
  }
  if (typeof outDir !== 'string') {
    throw new Error('Out dir is required argument');
  }
  if (extension === undefined) {
    extension = 'zip';
  }

  if (!outDir.includes(<string> extension)) {
    outDir += '.zip';
  }

  if (existsSync(outDir)) {
    unlinkSync(outDir);
  }

  const output = createWriteStream(outDir);

  const archive = archiver(extension, archiverOptions);

  archive.on('warning', (error) => {
    if (error.code === 'ENOENT') {
      console.log(error);
    } else {
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

function addFileOrDirInArchive ({ inputDir, excludes, archive }: AddFileOrDirInArchiveSettings): void {
  const files = readdirSync(inputDir);
  const inputPath = path.resolve(inputDir);
  for (const file of files) {
    const currentPath = path.join(inputPath, file);
    const currentPathStat = statSync(currentPath);
    let included = true;
    if (Array.isArray(excludes)) {
      for (const exclude of excludes) {
        included = !exclude.test(currentPath);
        if (!included) {
          break;
        }
      }
    }

    if (included) {
      if (currentPathStat.isFile()) {
        console.log(currentPath, path.relative(inputDir, currentPath));
        archive.file(currentPath, {
          name: path.relative(inputDir, currentPath)
        });
      } else if (currentPathStat.isDirectory()) {
        archive.directory(currentPath, path.relative(inputDir, currentPath), (entryData) => {
          if (Array.isArray(excludes)) {
            for (const exclude of excludes) {
              if (exclude.test(<string> entryData.name) || exclude.test(<string> entryData.prefix)) {
                return false;
              }
            }
          }
          return entryData;
        });
      }
    }
  };
}

interface GenerateZipSettings {
  inputDir: string;
  outDir: string;
  extension?: ArchiverFormat;
  archiverOptions: ArchiverOptions;
  excludes?: RegExp[];
}

interface AddFileOrDirInArchiveSettings {
  inputDir: string;
  excludes?: RegExp[];
  archive: ReturnType<typeof archiver>;
}

export { generateZip, type GenerateZipSettings };
