import { type Format as ArchiverFormat, type ArchiverOptions } from 'archiver';
declare function generateZip({ excludes, outDir, inputDir, extension, archiverOptions }: GenerateZipSettings): void;
interface GenerateZipSettings {
    inputDir: string;
    outDir: string;
    extension?: ArchiverFormat;
    archiverOptions: ArchiverOptions;
    excludes?: RegExp[];
}
export { generateZip, type GenerateZipSettings };
