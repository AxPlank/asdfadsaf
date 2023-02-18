"use strict";

const express = require('express');
const models = require('./models');

const app = express();
const testModel = models.sequelize_test;

app.listen(3003, () => {
    console.log('http://localhost:3003');
})

app.get('/', async (req, res) => {
    let data = await testModel.findAll();
    data = data.map((el) => {
        const table = `
        <tr>
            <td>${el.dataValues.first_attri}</td>
            <td>${el.dataValues.second_attri}</td>
            <td>${el.dataValues.third_attri}</td>
            <td><a href="/deleteData/${el.dataValues.id}">삭제</a>
            <td><a href="/updateData/${el.dataValues.id}">업데이트</a>
        </tr>
        `;
        return table;
    }).join('');

    const html = `
    <body class="container p-3">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" integrity="sha384-oBqDVmMz9ATKxIep9tiCxS/Z9fNfEXiDAYTujMAeBAsjFuCZSmKbSSUnQlmh/jp3" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js" integrity="sha384-mQ93GR66B00ZXjt0YO5KlohRA5SY2XofN4zfuZxLkoj1gXtW8ANNCe9d5Y3eG5eD" crossorigin="anonymous"></script>
        <h1>Sequelize Test</h1>
        <a href="/addData">데이터 추가</a>
        <table class="table">
            <thead>
                <tr>
                    <td>first_attribute</td>
                    <td>second_attribute</td>
                    <td>third_attribute</td>
                    <td>데이터 삭제</td>
                    <td>데이터 업데이트</td>
                </tr>
            </thead>
            <tbody>
                ${data}
            </tbody>
        </table>
    </body>
    `;

    res.status(200).send(html);
});


app.get('/addData', async (req, res) => {
    await testModel.create({
        first_attri: "Sequelize is",
        second_attri: "javascript ORM",
        third_attri: 224
    });

    res.redirect('/');
});

app.get('/deleteData/:kwarg', async (req, res) => {
    await testModel.destroy({
        where: {
            id: req.params.kwarg
        }
    });

    res.redirect('/');
});

app.get('/updateData/:kwarg', async (req, res) => {
    await testModel.update({
        updatedAt: new Date(),
        third_attri: 111
    }, {
        where: {
            id: req.params.kwarg
        }
    });

    res.redirect('/');
})