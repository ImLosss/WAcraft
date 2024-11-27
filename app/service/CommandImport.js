require('module-alias/register');

const utils = require('utils');
const sendMessageController = require('controller/SendMessageController');
const backupController = require('controller/BackupController');

module.exports = {
    ...utils,
    ...sendMessageController,
    ...backupController
};