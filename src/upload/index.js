var config = require('../../config/default');
var azureAPI = require('./azure');
var cloudinaryAPI = require('./cloudinary');
var amazonS3Api = require('./amazonS3');
var salesforceAPI = require('./salesforce');

exports.upload = (req, res) => {
  console.log('<========== req.file ============>: ', req.file);
  console.log('<========== req.body ============>: ', req.body);

  if(!global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() !== config.services.SALESFORCE && !req.file && !req.body.fileData) {
    res.status(400).send('No file detected!');
  }
  else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.SALESFORCE && !req.file && !req.body.content_version) {
    res.status(400).send('No file detected. Please attach a file and re-submit.');
  }
  /* 
    If req.file comes in request, it will handle by multer configuration.
    Ignored in case of salesforce as we do not need to upload via multer in case of salesforce.
  */
  //  req.serviceConfig.FileLInk__Service__c
  else if(req.file && global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() !== config.services.SALESFORCE) {
    res.status(200).send(req.file);
  }
  /* If service is set to azure, and fileData(base64) or fileURL(Image URL) is present in request
    it will be handle by multer azure.
  */
  else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.AZURE && (req.body.fileData || req.body.fileUrl)) {
    azureAPI.upload(req, res);
  }
  else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.CLOUDINARY && (req.body.fileData || req.body.fileUrl)) {
    cloudinaryAPI.upload(req, res);
  }
  else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.AMAZONS3 && (req.body.fileData || req.body.fileUrl)) {
    amazonS3Api.upload(req, res);
  }
  else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.SALESFORCE) {
    salesforceAPI.upload(req, res);
  }
}