var URL = require('url');
var assign = require('lodash/assign');

var extensions = Object.create(URL);
extensions.URL = URL;
extensions.qs = require('qs');

function parseQuery(url) {
    if (typeof url === 'string')
        url = URL.parse(url);

    return extensions.qs.parse((url.search || '').replace(/^\?/, ''));
}

function rebuildQuery(query) {
    return extensions.qs.stringify(query);
}

function applyQuery(url, query) {
    if (typeof query !== 'string')
        query = rebuildQuery(query);

    if (typeof url === 'string')
        url = URL.parse(url);

    url = assign({}, url, {
        search: query ? '?' + query : ''
    });

    return URL.format(url);
}

function addQuery(url, additions, options) {
    options = options || {};

    var query = parseQuery(url);

    if (options.preferNew || typeof options.preferNew === 'undefined') {
        query = assign(query, additions);
    } else {
        query = assign({}, additions, query);
    }

    return applyQuery(url, query);
}

function removeQuery(url, deletions) {
    var i = deletions.length;
    var query = parseQuery(url);

    while (i-- > 0)
        delete query[deletions[i]];

    return applyQuery(url, query);
}

var CONCAT_RE_START = /^\/+/;
var CONCAT_RE_END = /\/+$/;
var CONCAT_RE_BOTH = /^\/+|\/+$/g;
function concatPaths() {
    var parts = new Array(arguments.length);
    for (var i = parts.length - 1; i >= 0; --i) {
        parts[i] = arguments[i];

        if (i === 0)
            parts[i] = parts[i].replace(CONCAT_RE_END, '');
        else if (i === parts.length - 1)
            parts[i] = parts[i].replace(CONCAT_RE_START, '');
        else
            parts[i] = parts[i].replace(CONCAT_RE_BOTH, '');

        if (i !== 0 && !parts[i])
            parts.splice(i, 1);
    }

    return parts.join('/') || '/';
}

extensions.query = {
    parse: parseQuery,
    rebuild: rebuildQuery,
    build: rebuildQuery,

    add: addQuery,
    remove: removeQuery,
    omit: removeQuery,
    set: applyQuery
};

extensions.path ={
    concat: concatPaths
};

module.exports = extensions;
