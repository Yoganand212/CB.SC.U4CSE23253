var logger = require('../logging_middleware/index.js');
var fs = require('fs');
var http = require('http');

var token = "";
try {
  var envFile = fs.readFileSync('../.env', 'utf8');
  var lines = envFile.split('\n');
  for(var i=0; i<lines.length; i++) {
    if(lines[i].startsWith('TOKEN=')) token = lines[i].split('=')[1].trim();
  }
} catch(e) {}



var server = http.createServer(function(req, res) {
  if (req.url === '/notifications') {
    fetch("http://20.207.122.201/evaluation-service/notifications", {
      headers: { "Authorization": "Bearer " + token }
    })
.then(function(res) {
  return res.json();
})
.then(function(apiData) {
  var notifications = apiData;
  
  logger.Log("backend", "info", "service", "start sorting priorities");
  
  for(var i=0; i<notifications.notifications.length; i++) {
    var n = notifications.notifications[i]
    if (n.Type == "Placement") {
      n.weight = 3
    } else if (n.Type == "Result") {
      n.weight = 2
    } else {
      n.weight = 1
    }
  }

  for(var i=0; i<notifications.notifications.length; i++) {
    for(var j=0; j<notifications.notifications.length - 1; j++) {
      var a = notifications.notifications[j]
      var b = notifications.notifications[j+1]
      
      if (a.weight < b.weight) {
        var tmp = notifications.notifications[j]
        notifications.notifications[j] = notifications.notifications[j+1]
        notifications.notifications[j+1] = tmp
      } else if (a.weight == b.weight) {
        if (a.Timestamp < b.Timestamp) {
          var tmp2 = notifications.notifications[j]
          notifications.notifications[j] = notifications.notifications[j+1]
          notifications.notifications[j+1] = tmp2
        }
      }
    }
  }

  var top10 = []
  for(var i=0; i<10; i++){
    if(notifications.notifications[i]){
      top10.push(notifications.notifications[i])
    }
  }
  logger.Log("backend", "info", "service", "done finding top 10");

  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify({ "top_notifications": top10 }));
})
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3001, function() {
  console.log("Notification App API is running on http://localhost:3001");
  console.log("Use Postman to GET http://localhost:3001/notifications");
});
