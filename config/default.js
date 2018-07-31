module.exports = {
    "org_id": process.env.ORG_ID || '00Dr00000008fzJ',
    "org_url": process.env.ORG_URL || 'https://dallas311--dev.cs32.my.salesforce.com',
    "oauth_url_ext": "/services/oauth2/token",
    "chatter_url_ext": "/services/data/v35.0/chatter/feed-elements",
    "community_chatter_url_ext": "/services/data/v35.0/connect/communities/"+process.env.COMMUNITY_ID || '0DBr000000001GF'+"/chatter/feed-elements",
    "query_url_ext": "/services/data/v41.0/query",
    "sobjects_url_ext": "/services/data/v41.0/sobjects",
    "x311_security_url_ext":"/services/apexrest/Incap311API/v3/security/",
    "service":process.env.service || 'amazon',
    "oauth": {
      "client_id": process.env.CLIENT_ID || '3MVG9ic.6IFhNpPqh4zZTisRJc6gmAamqCbuNuzjlgSrElcY9PW84c3TpBkQKAjHWzysXnrXsPgkJHWiPDmGN',
      "client_secret": process.env.CLIENT_SECRET || '3262948358926650311',
      "username": process.env.ORG_USERNAME || 'api@user.com',
      "password": process.env.ORG_PASSWORD || 'Dallas311oyRrDJidOltEymhwn06P2aX9',
      "grant_type": "password"
    },
    "azure": {
      "connectionString": process.env.AZURE_STORAGE_CONNECTION_STRING || 'DefaultEndpointsProtocol=https;AccountName=stoprodtxmgt;AccountKey=O901ckzpHVUiah7NiHmc5/YGR1cXy4vKRGJOXyOdflF9BeqRaJEwemM8zt+Au3o+KIQQnFYPNZswQFDmtwQo3A==;EndpointSuffix=core.usgovcloudapi.net',
      "account": process.env.AZURE_ACCOUNT || 'stoprodtxmgt',
      "key": process.env.AZURE_KEY || 'ZJrTyObUYVfOki5HdE+vXp3kS8t6jSteDhWQGwwfZCyQrAaM0fBmaHoOdAIirwYBQkSqLSyypF1uM6nF0MP1Sg==',
      "container": process.env.AZURE_CONTAINER || 'dallascrm-dev'
    },
    "amazonS3": {
      "secretAccessKey": '2w/Rc1SbKOykdnvJX61D0WpBtZfI6+P2f6sbHqzx',
      "accessKeyId": 'AKIAIGGDPUWZIPUYDOQQ',
      "region": ''
    },
    "storageFolder" : 'dallas-dev',
    "cloudinary": {
      "cloud_name": 'dydtawsge', 
      "api_key": '181178561956867', 
      "api_secret": '-gSPbti8VPw7qr81E-OEtj51HGs' 
    }
}