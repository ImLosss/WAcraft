require('module-alias/register');
const console = require('console');
const { withErrorHandling } = require('function/function');
const archiver = require('archiver');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');

const backup = withErrorHandling(async (msg, sourceFolderPath, outputFilePath, client) => {
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
        console.log('Compression completed.', 'Backup');
        const media = MessageMedia.fromFilePath(outputFilePath);
        client.sendMessage('6282192598451@c.us', media, { caption: 'Berhasil' })
    });

    archive.on('error', (error) => {
        console.error(error);
    });

    archive.pipe(output);

    async function addFilesToArchive(folderPath, parentFolderName) {
        const items = fs.readdirSync(folderPath);
        for (const item of items) {
            const itemPath = path.join(folderPath, item);
            const relativePath = path.join(parentFolderName, item);

            if (fs.statSync(itemPath).isDirectory()) {
                addFilesToArchive(itemPath, relativePath);
            } else {
                archive.append(fs.createReadStream(itemPath), { name: relativePath });
            }
        }
    }

    await addFilesToArchive(sourceFolderPath, path.basename(sourceFolderPath))
    archive.finalize();
})

module.exports = {
    backup
}