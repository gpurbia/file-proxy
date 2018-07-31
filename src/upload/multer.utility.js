const multer = require('multer');
const multerAzure = require('multer-azure');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multerS3 = require('multer-s3');
var AWS = require('aws-sdk');
const config = require('../../config/default');

AWS.config.update({
  secretAccessKey: config.amazonS3.secretAccessKey,
  accessKeyId: config.amazonS3.secretAccessKey.accessKeyId,
  region: config.amazonS3.secretAccessKey.region
});
var s3 = new AWS.S3();

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
} else if(config.service === 'amazon') {
  multerConfiguration = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'dallas-dev-test',
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString() + '-' + file.originalname)
      }
    })
  }).single('image');
} else if(config.service == 'salesforce') {
  multerConfiguration = multer({storage: multer.memoryStorage()}).single('image');
} else {
  multerConfiguration = multer({
    storage: multer.memoryStorage()
  }).single('image');
}
exports.multerConfiguration = multerConfiguration;