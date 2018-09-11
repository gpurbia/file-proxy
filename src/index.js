var express = require('express');
var router = express.Router();

var uploadAPI = require('./upload/index');
var multerUtility = require('./upload/multer.utility');
let multer = new multerUtility();

var jsforce = require('jsforce');
var config = require('../config/default');

function getMetadataConfiguration(req, res, next) {
  var conn = new jsforce.Connection({
    loginUrl : config.org_url,
  });
  conn.login(config.oauth.username, config.oauth.password + 'ogjKwdb8lk8vCOv6fIgPcFA1k', (err) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    conn.query("select id,FileLInk__API_Key__c,FileLInk__Private_Key__c,FileLInk__Config_JSON__c,FileLInk__Service__c,FileLInk__URL__c  from FileLInk__File_Upload_Setting__mdt where FileLInk__Is_Default__c = true limit 1", (err, result) => {
      if(err) {
        res.status(500).send(err);
        return;
      }
      console.log('<=========== Metadata Result =========> ', result);
      req.serviceConfig = result.records[0];
      global.serviceConfig = result.records[0];
      req.token = conn.accessToken;
      // conn.logout();
      next();
    });
  });
}

router.post('/', getMetadataConfiguration, (req, res, next) => multer.getActiveMulterService(req, res, next)(req, res, next), uploadAPI.upload);

module.exports = router;
