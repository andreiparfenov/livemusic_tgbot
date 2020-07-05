const User = require('../models/user');

module.exports = {
  registerUser: (telegramId, firstName, lastName) => {
    User.findOne({telegramId: telegramId}, (err, existingUser) => {
      if (existingUser) {
        console.log("User already exists!");
        return;
      } else {
        const newUser = new User({
          telegramId: telegramId,
          firstName: firstName,
          lastName: lastName
        });
        newUser.save((err) => {
          if (err) return handleError(err);
        });
      }
    });
  },

  addInterest: (telegramId, message) => {
    User.findOne({telegramId: telegramId}, (err, existingUser) => {
      
    });
  }
}