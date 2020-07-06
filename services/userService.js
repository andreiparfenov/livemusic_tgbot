const User = require('../models/user');

module.exports = {
  registerUser: (telegramId, userName, firstName, lastName) => {
    User.findOne({telegramId: telegramId}, (err, existingUser) => {
      if (existingUser) {
        console.log("User already exists!");
        return;
      } else {
        const newUser = new User({
          telegramId: telegramId,
          userName: userName,
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
      if (existingUser) {
        if (!existingUser.interests.includes(message)) {
          existingUser.interests.push(message);
          existingUser.save((err) => {
            if (err) return handleError(err);
          });
        }
      }
    });
  }
}