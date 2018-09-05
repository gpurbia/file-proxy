module.exports = {
    "org_id": process.env.ORG_ID,
    "org_url": process.env.ORG_URL,
    "oauth_url_ext": "/services/oauth2/token",
    "chatter_url_ext": "/services/data/v35.0/chatter/feed-elements",
    "community_chatter_url_ext": "/services/data/v35.0/connect/communities/"+process.env.COMMUNITY_ID+"/chatter/feed-elements",
    "query_url_ext": "/services/data/v41.0/query",
    "sobjects_url_ext": "/services/data/v41.0/sobjects",
    "x311_security_url_ext":"/services/apexrest/Incap311API/v3/security/",
    "oauth": {
      "client_id": process.env.CLIENT_ID,
      "client_secret": process.env.CLIENT_SECRET,
      "username": process.env.ORG_USERNAME,
      "password": process.env.ORG_PASSWORD,
      "grant_type": "password"
    },
    "azure": {
      "connectionString": process.env.AZURE_STORAGE_CONNECTION_STRING,
      "account": process.env.AZURE_ACCOUNT,
      "key": process.env.AZURE_KEY,
      "container": process.env.AZURE_CONTAINER
    },
    "amazonS3": {
      "secretAccessKey": process.env.S3_SECRET_ACCESS_KEY,
      "accessKeyId": process.env.S3_ACCESS_KEY_ID,
      "region": process.env.S3_REGION || ''
    },
    "storageFolder" : 'dallas-dev',
    "cloudinary": {
      "cloud_name": process.env.CLOUDINARY_CLOUD_NAME, 
      "api_key": process.env.CLOUDINARY_API_KEY,
      "api_secret": process.env.CLOUDINARY_API_SECRET 
    }
}