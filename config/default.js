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
     
    },
    "azure": {
     
    },
    "amazonS3": {
      
    },
    "storageFolder" : 'dallas-dev',
    "cloudinary": {
      
    }
}