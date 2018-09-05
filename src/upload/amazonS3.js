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
  if(req.body.fileData) {
    uploadFile(req, res);
  } else if(req.body.fileUrl) {
    uploadFileViaURL(req, res);
  } else if(req.file && !req.body.service_request_id) {
    const returnObj = {
      public_url: req.file.url,
      format: req.file.mimetype,
      filename:req.file.originalname
    }
    res.status(200).send(returnObj);
  } else if(req.file && req.body.service_request_id && req.body.create_efr) {
      const resultJson = {
        public_url: req.file.url,
        mime_type: req.file.mimetype,
        filename:req.file.originalname,
        srid: req.body.service_request_id,
        community_user_token: '',
        tags: req.body.tags ? req.body.tags : 'Create'
      };
      await SalesforceUtility.createExternalFileAndLink(resultJson);
      const returnObj = {
        public_url: req.file.url,
        format: req.file.mimetype,
        filename:req.file.originalname
      }
      res.status(200).send(returnObj);
  } else {
    const returnObj = {
      public_url: req.file.url,
      format: req.file.mimetype,
      filename:req.file.originalname
    }
    res.status(200).send(returnObj);
  }
}


// Upload file to amazons3 via Base64 string.
const uploadFile = (req, res) => {
  const base64Data = new Buffer(req.body.fileData.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  // Getting the file type, ie: jpeg, png or gif
  const type = req.body.fileData.split(';')[0].split('/')[1];
  const params = {
    Bucket: 'dallas-dev-test',
    Key: Date.now().toString() + '-' + req.body.fileName,
    Body: base64Data,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: `image/${type}`
  }
  s3.putObject(params, (err, data) => {
    if (err) {
      res.status(500).send(err);
    }
    res.status(200).send(data);
  });
};


// Upload file to amazons3 via image url.
const uploadFileViaURL = (req, res) => {
  var option = {
    uri: req.body.fileUrl,
    encoding: null
  };
  request(option, (error, response, body) => {
    if(error || response.statusCode !== 200) {
      res.status(500).send(error);
    } else {
      s3.putObject({
        Bucket: 'dallas-dev-test',
        key: Date.now().toString(),
        Body: body
      }, (err, data) => {
        if (err) {
          res.status(500).send(err);
        }
        res.status(200).send(data);
      });
    }
  });
}