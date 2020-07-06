const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  telegramId: String,
  userName: String,
  firstName: String,
  lastName: String,
  interests: Array
});

const user = module.exports = mongoose.model('user', UserSchema)