var config = require('../../config/default');
const AWS = require('aws-sdk');
AWS.config.update({
  secretAccessKey: config.amazonS3.secretAccessKey,
  accessKeyId: config.amazonS3.accessKeyId,
  region: config.amazonS3.region
});
var s3 = new AWS.S3();
exports.upload = (req, res) => {
  const base64Data = new Buffer(req.body.fileData.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  // Getting the file type, ie: jpeg, png or gif
  const type = req.body.fileData.split(';')[0].split('/')[1];
  const userId = 1;
  const params = {
    Bucket: 'dallas-dev-test',
    Key: `${userId}.${type}`, // type is not required
    Body: base64Data,
    ACL: 'public-read',
    ContentEncoding: 'base64', // required
    ContentType: `image/${type}` // required. Notice the back ticks
  }
  s3.upload(params, (err, data) => {
    if (err) {
      return console.log(err);
    }
    res.status(200).send(data);
  });
}