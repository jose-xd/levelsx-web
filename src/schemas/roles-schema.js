const mongoose = require('mongoose');

const rolesSchema = mongoose.Schema({

    guildId: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    roleId: {
        type: String,
        required: true
    },
    roleName: {
        type: String,
        required: true
    }

});
mongoose.set('useFindAndModify', false);

module.exports = mongoose.model('roles-db', rolesSchema);