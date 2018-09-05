var SalesforceUtility = require('./salesforceUtilities/salesforce.utility');

exports.upload = async (req, res) => {
  try {
    if(req.file && !req.body.service_request_id) {
      let createExternalFileResponse = await SalesforceUtility.createExternalFile(req,res);
      let postFileToChatterResponse = await SalesforceUtility.postFileToChatter(req, createExternalFileResponse);
      let finalResult = await SalesforceUtility.createContentDist(postFileToChatterResponse);
      const returnObj = {
        filename: finalResult.filename,
        public_url: finalResult.public_url,
        format: finalResult.format,
        resourse_type: finalResult.resourse_type,
        content_version_id: finalResult.content_version_id
      }
      res.status(200).send(returnObj);
    } else if(req.file && req.body.service_request_id) {
      let result = await SalesforceUtility.postFileToChatter(req, req.body.service_request_id);
      let ccdResult = await SalesforceUtility.createContentDist(result);
      let finalResult = await SalesforceUtility.createExternalFileAndLink(ccdResult);
      const returnObj = {
        filename: finalResult.filename,
        public_url: finalResult.public_url,
        format: finalResult.format,
        resourse_type: finalResult.resourse_type,
        content_version_id: finalResult.content_version_id
      }
      res.status(200).send(returnObj);
    } else if (req.body.content_version && !req.body.service_request_id) {
      res.status(400).send('No service_request_id detected.');
    } else if(!req.file && req.body.content_version) {
      var resultOut = {results : []};
      var result = await SalesforceUtility.retrieveServiceRequestId(req);
      req.body.content_version.forEach(async (value) => {
        result.contentVersionId = value;
        result.filename = value;
        try {
          var result2 = await SalesforceUtility.createContentDist(result);
          var crResult = await SalesforceUtility.createDocumentLink(result2);
          result2.token = req.token;
          const returnObj = {
            filename: result.filename,
            public_url: result2.public_url,
            content_version_id: value
          }
          resultOut.results.push(returnObj);
        } catch (err) {
          console.log('----> Catch triggered from reject. Returned Error: ' + JSON.stringify(err));
          console.log('----> Catch triggered from reject. Returned Error: ' +err.stack);
          resultOut.results.push(err);
        }
      });
      res.status(200).send(resultOut);
    }
  } catch (err) {
    console.log('Http error', err);
    return res.status(500).send();
  }
};