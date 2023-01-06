const fs = require('node:fs');

fs.access('./ac', (err) => {
    if (err) {
        fs.mkdir('./testfolder/accesstest', (err) => {
            console.log('hello');
        });
    }
});

// "type": "module" : import 사용 시 추가할 것