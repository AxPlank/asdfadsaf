const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

// listen
const port = 3000;
app.listen(port, () => {
    console.log('Connected!');
});

// set
app.set('views', './views');
app.set('view engine', 'pug');

// use
app.use(bodyParser.urlencoded({
    extended: false
}));

/*
REST API
*/

// get
app.get('/', (req, res) => {
    res.send("<h1>Hello Express!!!</h1>");
});

app.get('/add', (req, res) => {
    res.render('add');
});

// post
app.post('/', (req, res) => {
    let league = req.body.league.replace(/ /g, '_');
    let initData = req.body;
    let data_key = Object.keys(initData);
    let data = String();

    data_key.pop(data_key.at(-1));
    data_key.splice(0, 1);

    for (key in data_key) {
        if (initData[key] == '') {
            break;
        }

        data += initData[key] + ',';
        console.log(initData[key]);

        if (key == data_key.at[-1]) {
            data -= ',';
        }
    }
    console.log(data);
    console.log(league);

    // fs.writeFile('./data/'+league, data, (err) => {
    //     if (err) {
    //         throw err;
    //     }
        
    //     res.send('Saved!');
    // });
});