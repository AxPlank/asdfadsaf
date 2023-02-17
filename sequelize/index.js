const models = require('./models');

/**
 * CRUD
 */

/**
 * Insert
 */

// 1st. build - save
// (async () => {
//     const instance = models.sequelize_test.build({
//         first_attri: "Day",
//         second_attri: "is",
//         third_attri: 17
//     });

//     await instance.save();
// })();

// 2nd. create
// models.sequelize_test.create({
//     first_attri: "Month",
//     second_attri: "is",
//     third_attri: 2
// });

/**
 * Select
 */

// findAll
// (async () => {
//     const instance = await models.sequelize_test.findAll({
//         where: {
//             third_attri: 2023
//         }
//     });

//     const promise = new Promise((resolve, reject) => {
//         resolve(instance);
//     })

//     return promise;
// })().then((values) => {
//     console.log(values);
// });

// findByPk
// (async () => {
//     const instance = await models.sequelize_test.findByPk(1);

//     const promise = new Promise((resolve, reject) => {
//         resolve(instance);
//     })

//     return promise;
// })().then((values) => {
//     console.log(values.dataValues);
// });

// findOne
// (async () => {
//     const instance = await models.sequelize_test.findOne({
//         where: {
//             third_attri: 2
//         }
//     });

//     const promise = new Promise((resolve, reject) => {
//         resolve(instance);
//     })

//     return promise;
// })().then((values) => {
//     console.log(values.dataValues);
// });

/**
 * Update
 */
(async () => {
    await models.sequelize_test.update({
        third_attri: 2022
    }, {
        where: {
            first_attri: "Year"
        }
    });
})();

/**
 * Delete
 */
// (async () => {
//     await models.sequelize_test.destroy({
//         where: {
//             first_attri: "Day"
//         }
//     });
// })();