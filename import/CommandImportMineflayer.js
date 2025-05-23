require('module-alias/register');

const utils = require('utils');
const mineflayerService = require('service/MineflayerService');
const inventory = require('function/inventory');
const fishing = require('function/fishing');
const autoclick = require('function/autoclick');
const afkarcher = require('function/afkarcher');
const automsg = require('function/automsg');
const findBlock = require('function/finder');

module.exports = {
    ...utils,
    ...mineflayerService,
    ...inventory,
    ...fishing,
    ...autoclick,
    ...automsg,
    ...findBlock,
    ...afkarcher
};