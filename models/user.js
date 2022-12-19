/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');

const usernameValidators = [{
  validator: (username) => {
    const rightLength = /^\S{6,20}$/;
    return rightLength.test(username);
  },
  message: 'Username must be between 6 and 20 characters long, and cannot have spaces',
}];

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    validate: usernameValidators,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: String,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
});

// When converting to JSON, ._id should be .id
// and passwordHash should never be visible
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
