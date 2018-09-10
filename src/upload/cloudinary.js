var config = require('../../config/default');
var cloudinary = require('cloudinary');
var SalesforceUtility = require('./salesforceUtilities/salesforce.utility');

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret
});

exports.upload = async(req, res) => {
  if(req.body.fileData || req.body.fileUrl) {
    uploadFile(req, res);
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
        public_url: req.file.url,
        format: req.file.mimetype,
        filename:req.file.originalname
      }
      resArr.push(returnObj);
    }
    res.status(200).send(resArr);
  } else {
    var resArr = [];
    for(var i = 0; i < req.files.length; i++) {
      req.file = req.files[i];
      const returnObj = {
        public_url: req.file.url,
        format: req.file.mimetype,
        filename:req.file.originalname
      }
      resArr.push(returnObj);
    }
    res.status(200).send(resArr);
  }
}

const uploadFile = (req, res) => {
  var image;
  if(req.body.fileData) {
    image = req.body.fileData;
  } else if(req.body.fileUrl) {
    image = req.body.fileUrl;
  }
  cloudinary.v2.uploader.upload(image, {folder: config.storageFolder}, (err, result) => {
    res.status(200).send(result);
  });
}