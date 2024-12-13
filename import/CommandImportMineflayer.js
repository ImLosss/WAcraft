require('module-alias/register');

const utils = require('utils');
const mineflayerService = require('service/MineflayerService');
const inventory = require('function/inventory');

module.exports = {
    ...utils,
    ...mineflayerService,
    ...inventory,
};