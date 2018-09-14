var config = require('../../config/default');
var azureAPI = require('./azure');
var cloudinaryAPI = require('./cloudinary');
var amazonS3Api = require('./amazonS3');
var salesforceAPI = require('./salesforce');
var SalesforceUtility = require('./salesforceUtilities/salesforce.utility');

exports.upload = (req, res) => {
  console.log('<========== req.files ============>: ', req.files);
  console.log('<========== req.body ============>: ', req.body);
  if (!req.body.api_key) {
    res.status(404).send('API Key not provided: Unable to create a file attachment');
    return;
  }
  else if (!req.body.service_request_id) {
    res.status(404).send('Service Request Id not provided: Unable to create a file attachment');
    return;
  }
  else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() !== config.services.SALESFORCE && req.files.length <=0 && !req.body.fileData && !req.body.fileUrl) {
    res.status(400).send('No file detected!');
    return;
  }
  else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.SALESFORCE && req.files.length <=0 && !req.body.content_version && !req.body.fileUrl) {
    res.status(400).send('No file detected. Please attach a file and re-submit.');
    return;
  }
  SalesforceUtility.canUpload(req, res).then(() => {
    /* 
      If req.file comes in request, it will handle by multer configuration.
      Ignored in case of salesforce as we do not need to upload via multer in case of salesforce.
    */

    /* If service is set to azure, and fileData(base64) or fileURL(Image URL) is present in request
      it will be handle by multer azure.
    */
    if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.AZURE && (req.files || req.body.fileData || req.body.fileUrl)) {
      azureAPI.upload(req, res);
    }
    else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.CLOUDINARY && (req.files || req.body.fileData || req.body.fileUrl)) {
      cloudinaryAPI.upload(req, res);
    }
    else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.AMAZONS3 && (req.files || req.body.fileData || req.body.fileUrl)) {
      amazonS3Api.upload(req, res);
    }
    else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.SALESFORCE) {
      salesforceAPI.upload(req, res);
    }
  }, (err) => {
    console.error(err);
    res.status(400).send('API Key provided cannot upload');
  });
}