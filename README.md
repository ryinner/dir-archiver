```javascript
const { generateZip } = require('@ryinner/dir-archiver');

generateZip({
    inputDir: './', // required
    outDir: `mySuperZip/zip.zip`, // required
    archiverOptions: { // required
        zlib: { level: 9 }
    },
    extension: '.zip', // default zip
    excludes: [ // default undefined
        /node_modules/gi // only regexp
    ]
});
```