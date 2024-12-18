require('module-alias/register');

const utils = require('utils');
const mineflayerService = require('service/MineflayerService');
const inventory = require('function/inventory');
const fishing = require('function/fishing');
const autoclick = require('function/autoclick');

module.exports = {
    ...utils,
    ...mineflayerService,
    ...inventory,
    ...fishing,
    ...autoclick
};