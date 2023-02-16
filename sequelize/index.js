const models = require('./models');

models.sequelize_test.findAll().then((value) => {
    console.log(value)
})
