const nodeFetch = require('node-fetch');

// Set up globals
global.Response = nodeFetch.Response;
global.fetch = nodeFetch;

module.exports = {
    Response: nodeFetch.Response,
    fetch: nodeFetch,
    setupFetch: () => {
        global.Response = nodeFetch.Response;
        global.fetch = nodeFetch;
    }
};