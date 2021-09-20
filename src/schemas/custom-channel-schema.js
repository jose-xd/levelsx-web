const mongoose = require('mongoose');

const customChannelSchema = mongoose.Schema ({
    
    guildId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    customMessage: {
        type: String,
        required: true
    }
    
});
mongoose.set('useFindAndModify', false);

module.exports = mongoose.model('custom-channel-db', customChannelSchema);