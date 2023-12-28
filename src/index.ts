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

  if (existsSync(outDir)) {
    unlinkSync(outDir);
  }

  const output = createWriteStream(outDir);

  const archive = archiver(extension ?? 'zip', archiverOptions);

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
  files.forEach(file => {
    const currentPath = path.join(inputPath, file);
    const currentPathStat = statSync(currentPath);
    let included = true;
    if (Array.isArray(excludes)) {
      excludes.forEach(exclude => {
        if (exclude instanceof RegExp) {
          included = !exclude.test(inputDir);
        } else {
          included = exclude !== inputDir;
        }
      });
    }
    if (included) {
      if (currentPathStat.isFile()) {
        archive.file(currentPath, {
          name: path.relative(inputDir, currentPath)
        });
      } else if (currentPathStat.isDirectory()) {
        addFileOrDirInArchive({
          inputDir: currentPath,
          excludes,
          archive
        });
      }
    }
  });
}

interface GenerateZipSettings {
  inputDir: string;
  outDir: string;
  extension?: ArchiverFormat;
  archiverOptions: ArchiverOptions;
  excludes?: Exclude[];
}

interface AddFileOrDirInArchiveSettings {
  inputDir: string;
  excludes?: Exclude[];
  archive: ReturnType<typeof archiver>;
}

type Exclude = string | RegExp;

export { generateZip, type GenerateZipSettings };
