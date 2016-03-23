'use strict';

var Transform = require('readable-stream/transform');
var rs = require('replacestream');
var istextorbinary = require('istextorbinary');
var PluginError = require('gulp-util').PluginError;
var fs = require('fs');

module.exports = function(search, output_file_path, separator, options) {

  return new Transform({
    objectMode: true,
    transform: function(file, enc, callback) {
      if (file.isNull()) {
        return callback(null, file);
      }

      var self = this;

      function doMatch() {
        if (file.isStream()) {
          file.contents = file.contents.pipe(rs(search, output_file_path, separator));
          return callback(null, file);
        }

        if (file.isBuffer()) {
          if (search instanceof RegExp) {
            var arr = String(file.contents).match(search);

            if(arr){

              for (var i = arr.length - 1; i >= 0; i--) {
                
                fs.appendFile(output_file_path, arr[i] + separator, function (err) {
                  if(err) console.log('Error writing', err);
                });
              }

            } else {
              console.log('Nothing found');
            }


          }
          else {
            self.emit('error', new PluginError('gulp-extract', 'You must use RegExp'));
          }
          return callback(null, file);
        }

        callback(null, file);
      }

      if (options && options.skipBinary) {
        istextorbinary.isText(file.path, file.contents, function(err, result) {
          if (err) {
            return callback(err, file);
          }

          if (!result) {
            callback(null, file);
          } else {
            doMatch();
          }
        });

        return;
      }

      doMatch();
    }
  });
};
