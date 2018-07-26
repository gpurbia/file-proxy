var config = require('../../config/default');
var azureAPI = require('./azure');
var cloudinaryAPI = require('./cloudinary');
var salesforceAPI = require('./salesforce');

exports.upload = (req, res) => {
  if(req.file) {
    res.status(200).send(req.file);
  } else if(config.service == 'azure' && req.body.fileData) {
    azureAPI.upload(req, res);
  } else if(config.service == 'cloudinary' && req.body.fileData) {
    cloudinaryAPI.upload(req, res);
  } else if(config.service == 'salesforce') {
    console.log('======== calling ==========');
    salesforceAPI.upload(req, res);
  }
}