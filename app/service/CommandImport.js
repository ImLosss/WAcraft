require('module-alias/register');

const utils = require('utils');
const sendMessageController = require('controller/SendMessageController');
const backupController = require('controller/BackupController');
const fungsi = require('function/function');

module.exports = {
    ...utils,
    ...sendMessageController,
    ...backupController,
    ...fungsi
};