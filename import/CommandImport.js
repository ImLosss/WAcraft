require('module-alias/register');

const utils = require('utils');
const sendMessageController = require('controller/SendMessageController');
const backupController = require('controller/BackupController');
const mineflayer = require('controller/MineflayerController');
const fungsi = require('function/function');
const mineflayerService = require('service/MineflayerService');
const tellme = require('function/tellme');

module.exports = {
    ...utils,
    ...sendMessageController,
    ...backupController,
    ...fungsi,
    ...mineflayer,
    ...mineflayerService,
    ...tellme
};