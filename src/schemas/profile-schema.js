const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
};

const profileSchema = mongoose.Schema ({
    
    guildId: reqString,
    userId: reqString,
    username: reqString,
    avatar: reqString,
    xp: {
        type: Number,
        required: true,
        default: 0
    },
    level: {
        type: Number,
        required: true,
        default: 1
    }
    
});
mongoose.set('useFindAndModify', false);

module.exports = mongoose.model('levels-db', profileSchema);