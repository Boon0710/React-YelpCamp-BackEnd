const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

// Virtual for generating a large version of the image (400px width)
ImageSchema.virtual('large').get(function () {
  return this.url ? this.url.replace('/upload', '/upload/w_400') : 'https://res.cloudinary.com/dzqxn0oxf/image/upload/v1724667813/defaultProfilePicture_obhclq.jpg'; 
});

// Virtual for generating a thumbnail version of the image (200px width)
ImageSchema.virtual('thumbnail').get(function () {
  return this.url ? this.url.replace('/upload', '/upload/w_200') : 'https://res.cloudinary.com/dzqxn0oxf/image/upload/v1724667813/defaultProfilePicture_obhclq.jpg'; 
});

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  bio: String,
  location: String,
  fullName: String,
  profilePicture: {
    type: ImageSchema,
    default: { url: 'https://res.cloudinary.com/dzqxn0oxf/image/upload/v1724667813/defaultProfilePicture_obhclq.jpg', filename: 'defaultProfilePicture_obhclq.jpg' }
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  phoneNumber: {
    type: String,
  }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
