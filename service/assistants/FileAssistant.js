var onFileDel = function() {};
onFileDel.prototype = {
	run: function(future) {
		var fs = IMPORTS.require('fs');
		var path = this.controller.args.path;

		fs.unlink(path, function(err) {
			future.result = {
				path: path,
				error: err
			};
		});
	}
};

var onFileInfo = function() {};
onFileInfo.prototype = {
	run: function(future) {
		var fs = IMPORTS.require('fs');
		var path = this.controller.args.path;

		fs.stat(path, function(err, stats) {
			future.result = {
				path: path,
				stats: stats,
				error: err
			};
		});
	}
};

var onFileRename = function() {};
onFileRename.prototype = {
	run: function(future) {
		var fs = IMPORTS.require('fs');
		var path1 = this.controller.args.path1;
		var path2 = this.controller.args.path2;

		fs.rename(path1, path2, function(err) {
			future.result = {
				path1: path1,
				path2: path2,
				error: err
			};
		});
	}
};

var onFileDownload = function() {};
onFileDownload.prototype = {
	run: function(future) {
		var http = IMPORTS.require('http');
		var fs = IMPORTS.require('fs');
		var url = IMPORTS.require('url'); 
		var path = IMPORTS.require('path');

		var filePath = this.controller.args.path;
		var fileUrl = this.controller.args.url;

		fs.mkdir(Setting.CACHE_FOLDER, 0755);
		fs.mkdir(Setting.cache.audio, 0755);
		fs.mkdir(Setting.cache.photo, 0755);

		var host = url.parse(fileUrl).hostname;

		var httpClient = http.createClient(80, host);

		var request = httpClient.request('GET', fileUrl, {
			"host": host
		});
		request.end();

		request.on('response', function(response) {
			var downloadfile = fs.createWriteStream(filePath, {
				'flags': 'a'
			});
			response.on('data', function(chunk) {
				downloadfile.write(chunk, encoding='binary');
			});
			response.on('end', function() {
				downloadfile.end();
				future.result = {
					path: filePath,
					url: fileUrl
				};
			});
		});
	}
};

var onFileUpload = function() {};

onFileUpload.prototype = {
	run: function(future) {
		console.log('on file upload');
		var that = this;
		var localPath = this.controller.args.path;
		that.authInfo = this.controller.args.authInfo;

		var path = '/file/upload.json';
		var url = Setting.protocol + Setting.api + path;
		var method = 'POST';

		var timestamp = OAuth.timestamp();
		var nonce = OAuth.nonce(20);
		var accessor = {
			consumerSecret: "b2734cdb56e00b01ca19d6931c6f9f30",
			tokenSecret: that.authInfo.tokenSecret
		};
		var message = {
			method: method,
			action: url,
			parameters: OAuth.decodeForm('')
		};
		message.parameters.push(['oauth_consumer_key', "15f0fd5931f17526873bf8959cbfef2a04dda2d84"]);
		message.parameters.push(['oauth_nonce', nonce]);
		message.parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
		message.parameters.push(['oauth_timestamp', timestamp]);
		message.parameters.push(['oauth_token', that.authInfo.oauthToken]);
		message.parameters.push(['oauth_version', '1.0']);
		message.parameters.sort()
		OAuth.SignatureMethod.sign(message, accessor);
		var authHeader = OAuth.getAuthorizationHeader("", message.parameters);

		var opts = {
			host: Setting.api,
			port: 80,
			path: path,
			headers: {
				'HOST': Setting.api,
				"Authorization": authHeader
			}
		};

		var httpClient = http.createClient(opts.port, opts.host);
		var request = httpClient.request(method, opts.path, opts.headers);

		var fs = IMPORTS.require('fs');
		fs.readFile(localPath, function(err, data) {
			if(err) {
				console.log('on file upload data errr' + JSON.stringify(err));
			}
			if(data) {
				console.log('on file upload data:' + data.length);
				request.write(data);
				request.end();
			} else {
				console.log('on file upload data: ended');
				request.end();
			}
		});
		//request.write(fs.createReadStream(localPath));
		//fs.createReadStream(localPath).pipe(request);

		request.on('response', function(response) {
			var status = response.statusCode;
			if (status !== 200) {
				var reqResult = '';
				response.on('data', function(chunk) {
					reqResult += chunk;
					console.log('on req chunk: ' + chunk.length + chunk);
				});
				response.on('end', function() {
					future.result = {
						errorCode: status,
						data: reqResult
					}
				});
			} else {
				var reqResult = '';
				response.on('data', function(chunk) {
					reqResult += chunk;
					console.log('on req chunk: ' + chunk.length);
				});
				response.on('end', function() {
					future.result = {
						data: reqResult
					}
				});
			}
		});

		//request.end();
	}
};
