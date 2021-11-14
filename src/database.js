const mongoose = require('mongoose')
require('dotenv').config();

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.s9tls.mongodb.net/Levelsx?retryWrites=true&w=majority`, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
    .then(db => console.log("DB is connected"))
    .catch(err => console.log(err))