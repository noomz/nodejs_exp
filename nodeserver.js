var http = require('http');
var url = require('url'); // use to parse incoming url
var fs = require('fs'); // use to read/write file system.
var io = require('./lib/socket.io');
var sys = require('sys');
var net = require('net');

var send404 = function(res){
	res.writeHead(404);
	res.write('404');
	res.end();
};

var responseHtml = function(res, msg, charset, type) {
  if (typeof(charset) === 'undefined') {
    charset = 'utf8';
  }
  res.writeHead(200, {'Content-Type': 'text/' + type});
  res.write(msg, charset);
  res.end();
};

// With new API, look in test 
var server = http.createServer(function (req, res) {
  // Check req
  var path = url.parse(req.url).pathname;
  var type = (path.substr(-3) === '.js') ? 'javascript' : 'html';
  console.log("request path:" + path);
  // Do req
  switch (path){
    case '/':
      responseHtml(res, '<h1>Hello Inception World</h1>');
      break;
    
    case '/sample.mov':
      res.writeHead(200, {'Content-Type': 'video/quicktime'});
      fs.readFile(__dirname + path, 'binary', function(err, data) {
        if (err) throw err;
        res.write(data, 'binary');
        res.end();
      });
      break;
      
    default:
      try {
        var sample_file = fs.readFileSync(__dirname + path, 'utf8');
        responseHtml(res, sample_file, 'utf8', type);
      } catch (e) {
        send404(res);
      }
      break;
  }
});


// socket.io, I choose you
// simplest chat application evar
var net_counter=0;
var tcp_server = net.createServer(function (stream) {
  stream.setEncoding('utf8');
  stream.addListener('connect', function (client) {
    ++net_counter;
    console.log(myio.clients);
    myio.broadcast('sdfddd');
    sys.puts( 'New connection from: ' + stream.remoteAddress + '\n' );
    stream.write('hello user ' + net_counter + '\r\n');
  });
  stream.addListener('data', function (data) {
    stream.write('you sent 	' + data);
    var msg = { message: ['SHELL>', data] };
		buffer.push(msg);
    myio.broadcast(json(msg));
      
  });
  stream.addListener('end', function () {
    stream.write('goodbye\r\n');
    stream.end();
  });
});



tcp_server.listen(8124, '0.0.0.0');
console.log('tcp on port 8124');

server.listen(8008);

var buffer = [], json = JSON.stringify, user = [];

myio = io.listen(server, {
	
	onClientConnect: function(client){
	  sys.puts('connect!');
		client.send(json({ buffer: buffer }));
		client.broadcast(json({ announcement: client.sessionId + ' connected' }));
	},
	
	onClientDisconnect: function(client){
		sys.puts('disconnect')
		client.broadcast(json({ announcement: client.sessionId + ' disconnected' }));
	},
	
	onClientMessage: function(message, client){
		var username = (user[client.sessionId])?user[client.sessionId]:client.sessionId;
		if (message.substring(0, 5) == '/name') {
		  user[client.sessionId] = message.substring(6);
		  var resp = json({ announcement: '<em>' + username + '</em> changed name to <em>' + user[client.sessionId] + '</em>' });
		  client.send(resp);
		  client.broadcast(resp);
		  username = user[client.sessionId];
		}
		else {
			var msg = { message: [username, message] };
			buffer.push(msg);
			sys.puts('user = ' + message);
		
			if (buffer.length > 15) {
				buffer.shift();
			}
			client.send(json(msg));
			client.broadcast(json(msg));
		}
	}
});

sys.puts('Server running at http://127.0.0.1:8008'); // http://local:8100