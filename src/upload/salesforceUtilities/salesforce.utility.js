'use strict';

/*
  Salesforce Utility Class
  Create file relationship and External file relationship.
*/
var config = require('../../../config/default');
var request = require('request');
class SalesforceUtility {
  constructor() {

  }

  retrieveServiceRequestId(req) {
    return new Promise((resolve, reject) => {
      const options = {
        url: (config.org_url + config.query_url_ext) + '?q=' + ("Select Id From Case Where CaseNumber = '" + req.body.service_request_id.trim() + "'"),
        headers: {
          'Authorization': 'Bearer ' + req.token,
        }
      }
      // Obtain the SR ID using the Case Number
      request.get(options, (err, resp, body) => {
        const queryResultJson = body ? JSON.parse(body) : null;
        const srid = queryResultJson && queryResultJson.totalSize > 0 ? queryResultJson.records[0].Id : null;
  
        if (!err && srid) {
          const combinedResults = {
            token: req.token,
            community_user_token: '',
            srid: srid
          }
          resolve(combinedResults);
        } else {
          reject({ code: 400, message: 'Service Request Id was not provided or is not valid.' });
        } 
      });
    });
  }

  postFileToChatter(req, srid) {
    return new Promise((resolve, reject) => {
      const file = req.file;
      const json = {
        "body": {"messageSegments":[{"type":"Text","text":""}]},
        "capabilities":{
          "content":{
             "title": file.originalname,
             "description": (req.body.description ? req.body.description : '')
          }
        },
        "feedElementType":"FeedItem",
        "subjectId": srid,
        "visibility": "AllUsers"
      };
  
      let data = {
        "feedElementFileUpload": {
          "value": file.buffer,
          "options": {
            "filename": file.originalname,
            "contentType": file.mimetype
          }
        },
        "feedElement": JSON.stringify(json)
      };
  
      const options = {
        url: (config.org_url + config.chatter_url_ext),
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + req.token,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        formData: data
      }
      
      request.post(options, (err,resp,body) => {
        if (!err && body) {
          body = JSON.parse(body);
          console.log('----> File to chatter successful. Proceeding in creating ContentDistribution...'+JSON.stringify(body));
          var contentVersionId = '';
          if("capabilities" in body){
            if("content" in body.capabilities){
              contentVersionId = body.capabilities.content.versionId
            }
          }
          const resultsJson = {
            "token": req.token,
            "srid": srid,
            "filename": req.file.originalname,
            "contentVersionId": contentVersionId,
            "mime_type": req.file.mimetype,
            "format" : body.capabilities.content.fileExtension,
            "resourse_type": body.capabilities.content.fileType
          };
          resolve(resultsJson);
        } else {
          reject({code: 400, message: 'Failed to upload file. Please try again later.'});
        }
      });
    });
  }

  createDocumentLink(resultsJson) {
    return new Promise((resolve, reject) => {
      const options = {
        url: (config.org_url + config.sobjects_url_ext) + '/ContentDocumentLink',
        headers: {
          'Authorization': 'Bearer ' + (resultsJson.community_user_token ? resultsJson.community_user_token : resultsJson.token),
          "Content-Type": "application/json"
        },
        json: {
          "ContentDocumentId" : resultsJson.ContentDocumentId,
          "LinkedEntityId" : resultsJson.srid,
          "ShareType" : 'V'
        }
      }
      request.post(options, (err, resp, body) => {
        if (!err && body) {
          console.log('<========== Body ==========>: ', JSON.stringify(body));
          const options = {
            url: (config.org_url + config.query_url_ext) + '?q=' + ("Select DistributionPublicUrl From ContentDistribution Where Id = '" + body.id + "'"),
            headers: {
              'Authorization': 'Bearer ' + (resultsJson.community_user_token ? resultsJson.community_user_token : resultsJson.token),
            }
          }
      
          console.log('----> Options[Query]: ' + JSON.stringify(options));
          // Get the distribution public url.
          request.get(options, (err, resp, body) => {
            if (!err && body ) {
              body = JSON.parse(body);
              if(body.records && body.records.length >0){
                const link = body.records[0];
                if(resultsJson.ContentDocumentLink){
                  resultsJson.ContentDocumentLink = [];
                }
                resultsJson.ContentDocumentLink.push(link);
                resolve(resultsJson);
              }
            } else {
              reject({ code: 400, message: 'Unable to obtain public facing url for distribution.'})
            }
          });
        } else {
          reject({ code: 400, message: 'Unable to generate public facing url for distribution of file.' });
        } 
      });
    });
  }

  createContentDist(resultsJson) {
    return new Promise((resolve, reject) => {
      const options = {
        url: (config.org_url + config.sobjects_url_ext) + '/ContentDistribution',
        headers: {
          'Authorization': 'Bearer ' + resultsJson.token,
          "Content-Type": "application/json"
        },
        json: {
          "ContentVersionId": resultsJson.contentVersionId, 
          "Name": resultsJson.filename,
          "RelatedRecordId": resultsJson.srid,
          "PreferencesNotifyOnVisit": false
        }
      }
      request.post(options, (err, resp, body) => {
        if (!err && body) {
          const options = {
            url: (config.org_url + config.query_url_ext) + '?q=' + ("Select id,ContentDocumentId, DistributionPublicUrl From ContentDistribution Where Id = '" + body.id + "'"),
            headers: {
              'Authorization': 'Bearer ' + resultsJson.token,
            }
          }
          // Get the distribution public url.
          request.get(options, (err, resp, body) => {
            if (!err && body) {
              body = JSON.parse(body);
              const dist = body.records[0];
              resultsJson.ContentDocumentId = dist.ContentDocumentId;
              const endpeice = dist.DistributionPublicUrl.substring(dist.DistributionPublicUrl.indexOf('/a/'),dist.DistributionPublicUrl.length);
              const frontPeice = dist.DistributionPublicUrl.substring(0,dist.DistributionPublicUrl.indexOf('.com')+4);
              resultsJson.public_url = frontPeice + '/sfc/dist/version/download/?oid=' + config.org_id + '&ids=' + resultsJson.contentVersionId + '&d=' + endpeice;
              resultsJson.content_version_id = resultsJson.contentVersionId;
              //resultsJson.ContentDocumentId = dist.id;
              resultsJson.token = resultsJson.token;
              console.log('resultsJson '+JSON.stringify(resultsJson));
              resolve(resultsJson);
            } else {
              reject({ code: 400, message: 'Unable to obtain public facing url for distribution.'})
            }
          });
        } else {
          reject({ code: 400, message: 'Unable to generate public facing url for distribution of file.' });
        }
      });
    });
  }

  createExternalFile(req) {
    return new Promise((resolve, reject) => {
      console.log('=========== Create External File ============ ', req.file);
      const options = {
        url: (config.org_url + config.sobjects_url_ext) + '/Filelink__External_File__c',
        headers: {
          'Authorization': 'Bearer ' + req.token,
        },
        json: {
           //"FileLInk__External_ID__c": resultsJson.contentVersionId,
          // "FileLInk__Public_URL__c": resultsJson.public_url,
          "FileLInk__Service__c": "Salesforce",
          "FileLink__Tags__c": "Create",
          "FileLink__Mime_Type__c": req.file.mime_type || req.file.mimetype
        }
      }
      request.post(options, (err, resp, body) => {
        const queryResultJson = body;
        if (!err && queryResultJson) {
          resolve(queryResultJson.id);    
        } else {
          reject({ code: 400, message: 'An error occured when syncing the external files. Please try again later.' });
        } 
      });
    });
  }

  createExternalFileAndLink(resultsJson) {
    return new Promise((resolve, reject) => {
      const options = {
        url: (config.org_url + config.sobjects_url_ext) + '/Filelink__External_File__c',
        headers: {
          'Authorization': 'Bearer ' + resultsJson.token,
        },
        json: {
          "FileLInk__External_ID__c": resultsJson.contentVersionId,
          "FileLInk__Public_URL__c": resultsJson.public_url,
          "FileLInk__Service__c": "Salesforce",
          "FileLink__Tags__c": resultsJson.tags,
          "FileLink__Mime_Type__c": resultsJson.mime_type,
          "FileLInk__Filename__c": resultsJson.filename
        }
      }
      // console.log('----> createExternalFileAndLink:Options[Query]: ' + JSON.stringify(options));
      // console.log('----> createExternalFileAndLink:resultsJson: ' + JSON.stringify(resultsJson));
      request.post(options, (err, resp, body) => {
        const queryResultJson = body;
  
        if (!err && queryResultJson) {
          // console.log('----> FileLink External File created. Proceeding to create custom External Files Related Link record...');
          const options = {
            url: (config.org_url + config.sobjects_url_ext) + '/Filelink__External_File_Relationship__c',
            headers: {
              'Authorization': 'Bearer ' + resultsJson.token,
            },
            json: {
              "FileLInk__Object_ID__c": resultsJson.srid,
              "FileLInk__External_File__c": queryResultJson.id,
              "FileLink__Tags__c": resultsJson.tags,
            }
          }  
          
          console.log('----> createExternalFileAndLink:resultsJson: ' + JSON.stringify(options));
          request.post(options, (err, resp, body) => {
            const queryResultJson = body;
            if (!err && queryResultJson) {
              console.log('----> FileLink External File Relation created. Returning final object result to the user.');
              resolve(resultsJson);
            } else {
              reject({ code: 400, message: 'An error occured when syncing the external file relations. Please try again later.' });
            }
          });
        } else {
          reject({ code: 400, message: 'An error occured when syncing the external files. Please try again later.' });
        } 
      });
    });
  };

  canUpload(req, res) {
    return new Promise((resolve, reject) => {
      const options = {
        url: (config.org_url + config.x311_security_url_ext) + req.body.api_key.trim(),
        headers: {
          'Authorization': 'Bearer ' + (req.token),
        }
      }
      console.log('----> Options[Query]: ' + JSON.stringify(options));
      request.get(options, (err, resp, body) => {
        try {
          const queryResultJson = body ? JSON.parse(body) : null;
          console.log("verifyAPIToken response: ", JSON.stringify(queryResultJson));
          if(queryResultJson.can_upload){
            resolve(true);
          } else {
            reject(false);
          }
        } catch(err) {
          res.status(400).send('API Key provided is not valid');
        }
      });
    });
  };

}

module.exports = new SalesforceUtility();