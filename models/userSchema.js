let mongoose = require('mongoose');
let passportLM = require('passport-local-mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// passport will add a field for password and username on to schema, it will also make sure they are unique
userSchema.plugin(passportLM);

module.exports = mongoose.model('User', userSchema);
