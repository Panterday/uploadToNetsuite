const oauth10 = (
  request,
  realm,
  consumer_key,
  consumer_secret,
  token,
  token_secret,
  sha = "256"
) => {
  const oauth1a = require("oauth-1.0a");
  const crypto = require("crypto");

  const oauth = oauth1a({
    realm,
    nonce_length: 11,
    consumer: { key: consumer_key, secret: consumer_secret },
    signature_method: "HMAC-SHA" + sha,
    hash_function(base_string, key) {
      return crypto
        .createHmac("sha" + sha, key)
        .update(base_string)
        .digest("base64");
    },
  });

  const authorization = oauth.authorize(request, {
    key: token,
    secret: token_secret,
  });

  return oauth.toHeader(authorization);
};

module.exports = {
  oauth10,
};
