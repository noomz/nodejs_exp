var socket = '';

function addMessage(msg) {
  var list = document.getElementById('chat-log-list');
  var item = document.createElement('li');
  list.appendChild(item);
  
  if (msg['message'] != undefined) {
    item.innerHTML = '<span class="user">' + msg['message'][0] + '</span><span class="message">' + msg['message'][1] + '</span>';
  }
  else if (msg.announcement != undefined) {
    item.innerHTML = '<span class="announcement">' + msg.announcement + '</span>';
  }
  
  list.scrollTop = 100000000;  
}

function initSocket () {
  socket = new io.Socket('10.0.1.216', { port: 8008 });
  socket.connect();
  
  socket.addEvent('message', function (data) {
    var data = JSON.parse(data);

    if (data.buffer != undefined) {
      for (var i=0; i != data.buffer.length; ++i) {
        addMessage(data.buffer[i]);
      }
    }
    else {
      addMessage(data);h
    }
  });

  document.getElementById('chat-input').onsubmit = function (e) {
   var msg = document.getElementById('input_message');
   if (msg.value.length > 0) {
     socket.send(msg.value);
     msg.value = '';
     msg.focus();
   }
   e.preventDefault();
  };
};