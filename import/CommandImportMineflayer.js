require('module-alias/register');

const utils = require('utils');
const mineflayerService = require('service/MineflayerService');

module.exports = {
    ...utils,
    ...mineflayerService,
};