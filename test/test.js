let intervalIds = [];
require('module-alias/register');
const { readJSONFileSync, writeJSONFileSync } = require('utils');

function startInterval() {
    const id = setInterval(() => {
        console.log(`Interval running with ID: ${id}`);
    }, 1000);

    intervalIds.push(id);

    try {
        // Konversi ID interval ke nomor jika diperlukan
        const intervalId = Number(id);

        // Simpan ID interval ke file JSON
        writeJSONFileSync('./test/dataUser.json', { intervalId });
        return intervalId;
    } catch (error) {
        console.error('Error writing file:', error);
    }
}

function stopIntervals(id) {
    intervalIds.forEach((interval) => {
        if(id == interval) clearInterval(interval);
    });
    console.log('All intervals stopped!');
    removeFromArray(intervalIds, id);

    console.log(intervalIds);
}

function removeFromArray(arr, value) {
    try {
        if (value == 'reset') {
            arr.splice(0, arr.length); // Hapus semua elemen dari array
            return 'Berhasil reset data';
        } else {
            const index = arr.indexOf(value);
            if (index !== -1) {
                arr.splice(index, 1);
                return `Berhasil menghapus *${value}*`;
            } else {
                return 'Data tidak ditemukan';
            }
        }
    } catch (err) {
        console.error(err);
        return 'Terjadi Kesalahan';
    }
}

module.exports = {
    startInterval,
    stopIntervals
};
