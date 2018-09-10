var config = require('../../config/default');
var azureStorage = require('azure-storage');
var blobService = azureStorage.createBlobService('DefaultEndpointsProtocol=https;AccountName=stoprodtxmgt;AccountKey=O901ckzpHVUiah7NiHmc5/YGR1cXy4vKRGJOXyOdflF9BeqRaJEwemM8zt+Au3o+KIQQnFYPNZswQFDmtwQo3A==;EndpointSuffix=core.usgovcloudapi.net');
var SalesforceUtility = require('./salesforceUtilities/salesforce.utility');
var mime  = require('mime');

exports.upload = async (req,res) => {
  if(req.body.fileData) {
    uploadFileToAzure(req, res);
  } else if(req.body.fileUrl) {
    uploadFileToAzureWithURL(req, res);
  } else if(req.files && req.body.service_request_id && req.body.create_efr) {
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
      await SalesforceUtility.createExternalFileAndLink(resultJson);
      const returnObj = {
        filename: req.file.originalname,
        public_url: req.file.url,
        mime_type: req.file.mimetype
      }
      resArr.push(returnObj);
    }
    res.status(200).send(resArr);
  } else {
    var resArr = [];
    for(var i = 0; i < req.files.length; i++) {
      req.file = req.files[i];
      const returnObj = {
        filename: req.file.originalname,
        public_url: req.file.url,
        mime_type: req.file.mimetype
      }
      resArr.push(returnObj);
    }
    res.status(200).send(resArr);
  }
};

// Upload File to Azure with base64 ddata.
const uploadFileToAzure = (req, res) => {
  var matches = req.body.fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  var type = matches[1];
  var buffer = new Buffer(matches[2], 'base64');
  var fileName = Date.now() + '-' + req.body.fileName;
  blobService.createBlockBlobFromText(config.azure.container,fileName, buffer, {contentType:type}, (error, result, response) => {
    if (error) {
      res.status(500).send(error);
    } else {
      result.url = _generateURl(result.name);
      res.status(200).send(result);
    }
  });
};

// Upload File to azure with Image URL 
const uploadFileToAzureWithURL = (req, res) => {
  var re = /(?:\.([^.]+))?$/;
  var ext = re.exec(req.body.fileUrl)[1];
  var fileName = req.body.fileUrl.substr(req.body.fileUrl.lastIndexOf('/') + 1);
  if(req.body.fileUrl.indexOf(config.azure.container)  >= 0) {
    const returnObj = {
      public_url: req.body.fileUrl,
      format: mime.lookup(ext),
      filename: fileName
    }
    res.status(200).send(returnObj);
  } else {
    blobService.startCopyBlob(req.body.fileUrl, config.azure.container, fileName, {}, (err, result, response) => {
      if (err) {
        res.status(500).send(err);
      }
      const returnObj = {
        public_url: _generateURl(fileName),
        format: mime.lookup(ext),
        filename: fileName
      }
      res.status(200).send(returnObj);
    });
  }
};

const _generateURl = (image) => {
  return 'https://stoprodtxmgt.blob.core.usgovcloudapi.net/' + config.azure.container + '/' + image;
};
