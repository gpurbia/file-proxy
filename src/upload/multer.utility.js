/*
  Multer Utility
  Configuration of Multer for different services.
*/

const multer = require('multer');
const multerAzure = require('multer-azure');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multerS3 = require('multer-s3');
var AWS = require('aws-sdk');
const config = require('../../config/default');

AWS.config.update({
  secretAccessKey: config.amazonS3.secretAccessKey,
  accessKeyId: config.amazonS3.accessKeyId,
  region: config.amazonS3.region
});
var s3 = new AWS.S3();

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret
});

class MulterUtility {
  constructor() {
  }

  getActiveMulterService() {
    console.log('<========= Active Service Name========>: ' + global.serviceConfig.FileLInk__Service__c);
    var multerConfiguration;
    if(global.serviceConfig.FileLInk__Service__c === config.services.AZURE) {
      multerConfiguration = multer({
        storage: multerAzure({
          connectionString: config.azure.connectionString,
          account: config.azure.account,
          key: config.azure.key,
          container: config.azure.container
        })
      }).single('cFile');
    } else if(global.serviceConfig.FileLInk__Service__c === config.services.CLOUDINARY) {
      multerConfiguration = multer({
        storage: cloudinaryStorage({
          cloudinary: cloudinary,
          folder: config.storageFolder
          // allowedFormats: ['jpg', 'png', 'jpeg']
        })
      }).single('cFile');
    } else if(global.serviceConfig.FileLInk__Service__c === config.services.AMAZONS3) {
      multerConfiguration = multer({
        storage: multerS3({
          s3: s3,
          bucket: 'dallas-dev-test',
          acl: 'public-read',
          contentType: multerS3.AUTO_CONTENT_TYPE,
          metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
          },
          key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname)
          }
        })
      }).single('cFile');
    } else if(global.serviceConfig.FileLInk__Service__c === config.services.SALESFORCE) {
      multerConfiguration = multer({
        storage: multer.memoryStorage()
      }).single('cFile');
    } else {
      multerConfiguration = multer({
        storage: multer.memoryStorage()
      }).single('cFile');
    }
    return multerConfiguration;
  }
}

module.exports = MulterUtility;