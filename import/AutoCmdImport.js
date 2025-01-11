require('module-alias/register');

const fishing = require('function/fishing');
const autoclick = require('function/autoclick');
const automsg = require('function/automsg');
const inventory = require('function/inventory');
const MineflayeService = require('service/MineflayerService');

module.exports = {
    ...fishing,
    ...autoclick,
    ...automsg,
    ...inventory,
    ...MineflayeService
};