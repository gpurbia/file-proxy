var config = require('../../config/default');
var azureStorage = require('azure-storage');
var blobService = azureStorage.createBlobService('DefaultEndpointsProtocol=https;AccountName=stoprodtxmgt;AccountKey=O901ckzpHVUiah7NiHmc5/YGR1cXy4vKRGJOXyOdflF9BeqRaJEwemM8zt+Au3o+KIQQnFYPNZswQFDmtwQo3A==;EndpointSuffix=core.usgovcloudapi.net');

exports.upload = (req,res) => {
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
}

const _generateURl = (image) => {
  return 'https://stoprodtxmgt.blob.core.usgovcloudapi.net/' + config.azure.container + '/' + image;
}
