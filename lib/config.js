const config = {
    main: require('./config/main'),
    files: require('./config/files'),
    follow: require('./config/follow'),
    notifications: require('./config/notifications')
};
const args = require('minimist')(process.argv.slice(2));

const scope = {
    // Deep extend object
    extend: function() {
        for (var o = {}, i = 0; i < arguments.length; i++) {
            if (arguments[i].constructor !== Object) continue;
            for (var k in arguments[i]) {
                if (arguments[i].hasOwnProperty(k)) {
                    o[k] = arguments[i][k] != null && arguments[i][k].constructor === Object ? scope.extend(o[k] || {}, arguments[i][k]) : arguments[i][k];
                }
            }
        }
        return o;
    },
    // Join array
    join: (ref, val, unique) => {
        if ([ref,val].indexOf(null) >= 0 || ref.constructor != Array) return ref;
        if (typeof unique == 'undefined') unique = true;
        if (val.constructor != Array) val = [val];
        ref = ref.concat(val);
        return unique ? [...new Set(ref)] : ref;
    },
    // Apply arguments
    apply: () => {
        for (var i in args) {
            switch(true) {
                case i == 'seed':
                    config.main.seed = scope.join(config.main.seed, args[i]);
                    break;
                case i == 'sitemap':
                    config.main.sitemap = scope.join(config.main.sitemap, args[i]);
                    break;
                case i == 'files-valid':
                    config.files.valid = scope.join(config.files.valid, args[i]);
                    break;
                case i == 'files-invalid':
                    config.files.invalid = scope.join(config.files.invalid, args[i]);
                    break;
                case typeof config.main[i] != 'undefined':
                    config.main[i] = args[i];
                    break;
            }
        }
    }
};
scope.apply();

module.exports = config;
