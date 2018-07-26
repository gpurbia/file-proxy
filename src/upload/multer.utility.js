const multer = require('multer');
const multerAzure = require('multer-azure');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const config = require('../../config/default');

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret
});

var multerConfiguration;
if(config.service == 'azure') {
  multerConfiguration = multer({
    storage: multerAzure({
      connectionString: config.azure.connectionString,
      account: config.azure.account,
      key: config.azure.key,
      container: config.azure.container
    })
  }).single('image');
} else if(config.service == 'cloudinary') {
  multerConfiguration = multer({
    storage: cloudinaryStorage({
      cloudinary: cloudinary,
      folder: config.storageFolder,
      allowedFormats: ['jpg', 'png', 'jpeg']
    })
  }).single('image');
} else if(config.service == 'salesforce') {
  console.log('calling============');
  multerConfiguration = multer({
    dest: __dirname + '../temp/',
  }).single('image');
} else {
  multerConfiguration = multer({
    storage: multer.memoryStorage()
  }).single('image');
}
exports.multerConfiguration = multerConfiguration;