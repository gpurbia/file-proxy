var express = require('express');
var router = express.Router();

var uploadAPI = require('./upload/index');
var multerConfig = require('./upload/multer.utility');

router.post('/', multerConfig.multerConfiguration, uploadAPI.upload);

module.exports = router;
