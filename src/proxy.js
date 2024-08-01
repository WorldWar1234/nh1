const request = require('request');
const pick = require('lodash').pick;
const shouldCompress = require('./shouldCompress');
const compress = require('./compress');
const bypass = require('./bypass');
const copyHeaders = require('./copyHeaders');

function fetchAndServe(req, res) {
  request.get(
    req.params.url,
    {
      headers: {
        ...pick(req.headers, ['cookie', 'dnt', 'referer']),
        'user-agent': 'Bandwidth-Hero Compressor',
        'x-forwarded-for': req.headers['x-forwarded-for'] || req.ip,
        via: '1.1 bandwidth-hero'
      },
      timeout: 10000,
      maxRedirects: 5,
      encoding: null,
      strictSSL: false,
      gzip: true,
      jar: true
    },
    (err, origin, buffer) => {
      if (err || origin.statusCode >= 400) {
        return redirect(req, res); // Redirect to the original URL
      }

      copyHeaders(origin, res);
      res.setHeader('content-encoding', 'identity');
      req.params.originType = origin.headers['content-type'] || '';
      req.params.originSize = buffer.length;

      try {
        if (shouldCompress(req)) {
          compress(req, res, buffer);
        } else {
          bypass(req, res, buffer);
        }
      } catch (e) {
        // Fallback to serving the original image
        res.setHeader('content-type', origin.headers['content-type']);
        res.setHeader('content-length', buffer.length);
        res.status(200).send(buffer);
      }
    }
  );
}

module.exports = fetchAndServe;
