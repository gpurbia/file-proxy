var config = require('../../config/default');
var azureStorage = require('azure-storage');
var blobService = azureStorage.createBlobService('DefaultEndpointsProtocol=https;AccountName=stoprodtxmgt;AccountKey=O901ckzpHVUiah7NiHmc5/YGR1cXy4vKRGJOXyOdflF9BeqRaJEwemM8zt+Au3o+KIQQnFYPNZswQFDmtwQo3A==;EndpointSuffix=core.usgovcloudapi.net');
var SalesforceUtility = require('./salesforceUtilities/salesforce.utility');
var mime  = require('mime');

exports.upload = async (req,res) => {
  try {
    if(req.body.fileData) { // Handling base64 image case.
      var result = await uploadFileToAzure(req, res);
      const resultJson = {
        public_url: result.public_url,
        mime_type: req.body.mimeType || '',
        filename: req.body.FileName ||  req.body.fileName || '',
        srid: req.body.service_request_id || '',
        tags: req.body.description ? req.body.description : 'Create',
        community_user_token: '',
        token: req.token
      };
      await SalesforceUtility.createExternalFileAndLink(resultJson); // Link uploaded image to particular sObject.
      const returnObj = {
        filename: resultJson.filename,
        public_url: result.public_url,
        mime_type: resultJson.mime_type
      }
      res.status(200).send(returnObj);
    } else if(req.body.fileUrl) { // Handling image url case.
      var result = await uploadFileToAzureWithURL(req, res);
      const resultJson = {
        public_url: result.public_url,
        mime_type: req.body.mimeType || '',
        filename: req.body.FileName ||  req.body.fileName || '',
        srid: req.body.service_request_id || '',
        tags: req.body.description ? req.body.description : 'Create',
        community_user_token: '',
        token: req.token
      };
      await SalesforceUtility.createExternalFileAndLink(resultJson); // Link uploaded image to particular sObject.
      const returnObj = {
        filename: resultJson.filename,
        public_url: result.public_url,
        mime_type: resultJson.mime_type
      }
      res.status(200).send(returnObj);
    } else if(req.files && req.body.service_request_id && req.body.create_efr) { // Handling file object here.
      var resArr = [];
      for(var i = 0; i < req.files.length; i++) {
        req.file = req.files[i];
        const resultJson = {
          public_url: req.file.url,
          mime_type: req.file.mimetype,
          filename:req.file.originalname,
          srid: req.body.service_request_id,
          community_user_token: '',
          tags: req.body.tags ? req.body.tags : 'Create',
          token: req.token
        };
        await SalesforceUtility.createExternalFileAndLink(resultJson); // Link uploaded image to particular sObject.
        const returnObj = {
          filename: req.file.originalname,
          public_url: req.file.url,
          mime_type: req.file.mimetype
        }
        resArr.push(returnObj);
      }
      res.status(200).send(resArr);
    }
  } catch(err) {
    console.error(err);
    res.status(400).send(err.message);
  }
};

/* 
  Upload File to Azure with base64 ddata.
*/
const uploadFileToAzure = (req, res) => {
  return new Promise((resolve, reject) => {
    var matches = req.body.fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    var type = matches[1];
    var buffer = new Buffer(matches[2], 'base64'); // buffer string of base64 image.
    var fileName = Date.now() + '-' + req.body.fileName; // File name with adding datetime string. If file name is same, azure will update the existing file.
    blobService.createBlockBlobFromText(config.azure.container,fileName, buffer, {contentType:type}, (error, result, response) => {
      if (error) {
        reject(error);
      } else {
        result.public_url = _generateURl(result.name);
        resolve(result);
      }
    });
  });
};

/*
  Upload File to azure with Image URL 
*/
const uploadFileToAzureWithURL = (req, res) => {
  return new Promise((resolve, reject) => {
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(req.body.fileUrl)[1];
    var fileName = req.body.fileUrl.substr(req.body.fileUrl.lastIndexOf('/') + 1);
    // Check file url, if file is already uploaded on azure, no need to upload on azure.
    if(req.body.fileUrl.indexOf(config.azure.container)  >= 0) {
      const returnObj = {
        public_url: req.body.fileUrl,
        format: mime.lookup(ext),
        filename: fileName
      }
      resolve(returnObj);
    } else { // If file url is not a azure url. Upload to azure here..
      blobService.startCopyBlob(req.body.fileUrl, config.azure.container, fileName, {}, (err, result, response) => {
        if (err) {
          reject(error);
        }
        const returnObj = {
          filename: fileName,
          public_url: _generateURl(fileName),
          mime_type: mime.lookup(ext)
        }
        resolve(returnObj);
      });
    }
  });
};

// Generating preview URL of image.
const _generateURl = (image) => {
  return 'https://stoprodtxmgt.blob.core.usgovcloudapi.net/' + config.azure.container + '/' + image;
};
