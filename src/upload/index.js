var config = require('../../config/default');
var azureAPI = require('./azure');
var cloudinaryAPI = require('./cloudinary');
var amazonS3Api = require('./amazonS3');
var salesforceAPI = require('./salesforce');

exports.upload = (req, res) => {
  if(!req.file && !req.body.fileData) {
    res.status(500).send('No file detected!');
  } else if(req.file && config.service !== 'salesforce') {
    res.status(200).send(req.file);
  } else if(config.service == 'azure' && req.body.fileData) {
    azureAPI.upload(req, res);
  } else if(config.service == 'cloudinary' && req.body.fileData) {
    cloudinaryAPI.upload(req, res);
  } else if(config.service == 'amazon' && req.body.fileData) {
    amazonS3Api.upload(req, res);
  } else if(config.service == 'salesforce') {
    salesforceAPI.upload(req, res);
  }
}