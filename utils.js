/**
 * Flatten the given `arr`.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

exports.flatten = function(arr, ret){
  var ret = ret || []
    , len = arr.length;
  for (var i = 0; i < len; ++i) {
    if (Array.isArray(arr[i])) {
      exports.flatten(arr[i], ret);
    } else {
      ret.push(arr[i]);
    }
  }
  return ret;
};

/**
 * Detects if Object is Array or not
 *
 * @param {Object} v
 */
exports.isArray = function(v) {
  return v.isArray ||
         v instanceof Array ||
         Object.prototype.toString.call(v) == '[object Array]';
};