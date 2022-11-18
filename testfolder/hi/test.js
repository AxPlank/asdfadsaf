const fs = require('fs');

fs.exists('../testfolder/hello', (exists) => {
    console.log(exists);
})