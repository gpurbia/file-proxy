var config = require('../../config/default');
var cloudinary = require('cloudinary');
var cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret
});

exports.upload = (req, res) => {
  cloudinary.v2.uploader.upload(req.body.fileData, {folder: config.storageFolder}, (err, result) => {
    res.status(200).send(result);
  });
}