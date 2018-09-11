var config = require('../../config/default');
var cloudinary = require('cloudinary');
var SalesforceUtility = require('./salesforceUtilities/salesforce.utility');

// Cloudinary configuration
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret
});

exports.upload = async(req, res) => {
  try {
    if(req.body.fileData || req.body.fileUrl) {  // Handling base64 or File URl image case.
      var result = await uploadFile(req, res);
      const resultJson = {
        public_url: result.url,
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
        public_url: resultJson.public_url,
        mime_type: resultJson.mime_type
      }
      res.status(200).send(returnObj);
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
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
}

/*
  Upload File To Cloudinary.
  It will accept either base64 data or FileURL.
*/
const uploadFile = (req, res) => {
  return new Promise((resolve, reject) => {
    var image;
    if(req.body.fileData) {
      image = req.body.fileData;
    } else if(req.body.fileUrl) {
      image = req.body.fileUrl;
    }
    cloudinary.v2.uploader.upload(image, {folder: config.storageFolder}, (err, result) => {
      if(err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}