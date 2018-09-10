var config = require('../../config/default');
var azureAPI = require('./azure');
var cloudinaryAPI = require('./cloudinary');
var amazonS3Api = require('./amazonS3');
var salesforceAPI = require('./salesforce');
var SalesforceUtility = require('./salesforceUtilities/salesforce.utility');

exports.upload = (req, res) => {
  console.log('<========== req.file ============>: ', req.file);
  console.log('<========== req.body ============>: ', req.body);

  if(!global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() !== config.services.SALESFORCE && !req.file && !req.body.fileData &&  !req.body.fileUrl) {
    res.status(400).send('No file detected!');
  }
  else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.SALESFORCE && !req.file && !req.body.content_version) {
    res.status(400).send('No file detected. Please attach a file and re-submit.');
  }
  // else if(!SalesforceUtility.canUpload(req, res)) {
  //   res.status(400).send('API Key provided cannot upload');
  // }
  SalesforceUtility.canUpload(req, res).then((result) => {
    /* 
      If req.file comes in request, it will handle by multer configuration.
      Ignored in case of salesforce as we do not need to upload via multer in case of salesforce.
    */

    /* If service is set to azure, and fileData(base64) or fileURL(Image URL) is present in request
      it will be handle by multer azure.
    */
    if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.AZURE && (req.file || req.body.fileData || req.body.fileUrl)) {
      azureAPI.upload(req, res);
    }
    else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.CLOUDINARY && (req.file || req.body.fileData || req.body.fileUrl)) {
      cloudinaryAPI.upload(req, res);
    }
    else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.AMAZONS3 && (req.file || req.body.fileData || req.body.fileUrl)) {
      amazonS3Api.upload(req, res);
    }
    else if(global.serviceConfig.FileLInk__Service__c.toLowerCase().trim() == config.services.SALESFORCE) {
      salesforceAPI.upload(req, res);
    }
  }, (err) => {
    res.status(400).send('API Key provided cannot upload');
  });
}