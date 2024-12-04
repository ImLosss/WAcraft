require('module-alias/register');

module.exports = (function() {
    return function(client) {
        require('listeners/setupClient')(client);
        require('listeners/commandHandler')(client);
    };
})();