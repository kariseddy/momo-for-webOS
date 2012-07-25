var AppFormatter = {
	time: function(time, model) {
		if(model && model.state === RabbitDB.state.sending) {
			return $L(StringMap.chat.sending);
		}
		return AppFormatter.timeSince(parseInt(time) * 1000);
	},
	timeSince: function(time) {
		//using a modified Date function in vendors/date.js
		var d = new Date(time);
		return d.toRelativeTime(1500);
	},
	location: function(n, model) {
		if (n) return n['name'];
		else return '';
	},
	user: function(n, model) {
		return '';
	},
	sender: function(sender, model) {
		if (!sender) return '';
		if (sender['id'] != model['other']['id']) {
			return "is-said";
		} else {
			return "other-said";
		}
	},
	content: function(n, model) {
		for (var now in n) {
			//Mojo.Log.info('content now: ' + now);
			if (now == 'text' || now == 'text_long') {
				return ioNull.emoji.parse(AppFormatter.htmlSafe(n[now]));
			} else {
				var base = $L(StringMap.chat.sent);
				if (now == 'picture') {
					return base + $L(StringMap.chat.convPicture);
				}
				else if (now == 'audio') {
					return base + $L(StringMap.chat.convAudio);
				}
				else if (now == 'location') {
					return base + $L(StringMap.chat.convLocation);
				}
				else if (now == 'file') {
					return base + $L(StringMap.chat.convFile);
				}
			}
		}
		return $L(StringMap.chat.convUnknown);
	},
    type: function(n, model) {
		if (!n) return 'text';
        if(model['content']['audio']){
		    return 'audio';
        }else if(model['content']['file']){
		    return 'audio file';
        }
		return 'text';
	},
	htmlSafe: function(what) {
		// FIXME: try this out: 
		// http://stackoverflow.com/questions/3066574/converting-html-to-its-safe-entities-with-javascript
		var htmling = what;
		htmling = htmling.replace(/>/g, '&gt;');
		htmling = htmling.replace(/</g, '&lt;');
		return htmling;
	},
	contentDetail: function(n, model) {
		for (var now in n) {
			//Mojo.Log.info('content now: ' + now);
			if (now == 'text' || now == 'text_long') {
				var linked = linkify(AppFormatter.htmlSafe(n[now])); 
				return ioNull.emoji.parse(linked);
			} else if (now == 'picture') {
				var icon = n[now]['icon'];
				var pUrl = n[now]['url'];
				if(icon) {
					//TODO show local thumbnail firstly
					//icon = icon.replace(/:/g, '%3A');
					//icon = icon.replace(/\/var\/luna\/data\/extractfs/g, '');
					Mojo.Log.error('showing local icon : ' + icon);
					Mojo.Log.error('showing local picture===_====_===' + icon);
					//var iconDom = '<a href="file://' + pUrl + '"><img src="file://' + icon + '" class="chat-img"/></a>';
					//Mojo.Log.error('showing local picture===_====_===' + iconDom);
					var iconDom = $L(StringMap.chat.photoUploading);
					return iconDom;
				} else {
					//Mojo.Log.error('showing local picture===_====_=== no icon');
				}
				if (!pUrl) {
					return $L(StringMap.chat.photoErrorData);
				}
				var regex = /_\d{2,4}.jpg/g;
				var orig = pUrl.replace(regex, '.jpg');
				return '<a href="' + orig + '"><img src="' + pUrl + '" class="chat-img"/></a>';
			} else if (now == 'location') {
				var location = n[now];
				var latlng = location['latitude'] + ',' + location['longitude'];
				var gmap = "http://maps.googleapis.com/maps/api/staticmap?center=" + latlng + "&markers=color:blue|" + latlng + "&zoom=16&size=" + 200 + "x" + 120 + "&sensor=false";
				return '<img src="' + gmap + '"/>';
			} else if (now == 'audio') {
				var audio = n[now];
                var second = audio['duration']/1000;
                var time = Math.round(second);
                if(time >= 60){
                    var minutes = Math.floor(time/60);
                    var second = Math.round((second) % 60);
                    time = minutes + '′' + second;
                }
				//preload="auto"
				return '<img src="images/chat/chat_bg_audio_normal.png" width="28" height="30" id="audio_data_' + model['id'] + '" data-action="chat-audio" data-id="' + model['id'] + '" audio-src="' + audio['url'] + '"/><span class="audio-time" data-type="audio-time">' + time + '″</span>'; 
				//+ '<audio src="'+ audio['url'] +'" id="audio-' + model['id'] + '"/>';
			} else if (now == 'file') {
				var file = n[now];
				return '<a href="#" data-action="chat-file" data-id="' + model['id'] + '" file-src="' + file.url + '" file-name="' + file.name + '">' + file.name + '</a>';
			} else {
			}
		}
		return $L(StringMap.chat.convUnknown);
	}
};
