const request = require('request');
var config = require('../../config/default');
const AWS = require('aws-sdk');
var SalesforceUtility = require('./salesforceUtilities/salesforce.utility');

AWS.config.update({
  secretAccessKey: config.amazonS3.secretAccessKey,
  accessKeyId: config.amazonS3.accessKeyId,
  region: config.amazonS3.region
});
var s3 = new AWS.S3();


exports.upload = async (req, res) => {
  try {
    if(req.body.fileData) {
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
    } else if(req.body.fileUrl) {
      uploadFileViaURL(req, res);
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
    }
  } catch(err) {
    console.error(err);
    res.status(400).send(err.message);
  }
}


// Upload file to s3 via Base64 string.
const uploadFile = (req, res) => {
  return new Promise((resolve, reject) => {
    const base64Data = new Buffer(req.body.fileData.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    // Getting the file type, ie: jpeg, png or gif
    const type = req.body.fileData.split(';')[0].split('/')[1];
    const params = {
      Bucket: config.storageFolder,
      Key: Date.now().toString() + '-' + req.body.fileName,
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: `image/${type}`
    }
    s3.putObject(params, (err, data) => {
      if(err) {
        console.error(err);
        reject(err);
      }
      resolve(data);
    });
  });
};


// Upload file to s3 via image url.
const uploadFileViaURL = (req, res) => {
  return new Promise((resolve, reject) => {
    var option = {
      uri: req.body.fileUrl,
      encoding: null
    };
    request(option, (error, response, body) => {
      if(error || response.statusCode !== 200) {
        reject(error);
      } else {
        s3.putObject({
          Bucket: config.storageFolder,
          key: Date.now().toString(),
          Body: body
        }, (err, data) => {
          if (err) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      }
    });
  });
}