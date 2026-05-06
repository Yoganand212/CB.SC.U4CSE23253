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
  if (req.url === '/schedule') {
    fetch("http://20.207.122.201/evaluation-service/depots", {
      headers: { "Authorization": "Bearer " + token }
    })
.then(function(res) {
  return res.json();
})
.then(function(depotsData) {
  var depots = depotsData;
  
  fetch("http://20.207.122.201/evaluation-service/vehicles", {
    headers: { "Authorization": "Bearer " + token }
  })
  .then(function(res2) {
    return res2.json();
  })
  .then(function(vehiclesData) {
    var vehicles = vehiclesData;
    
    logger.Log("backend", "info", "service", "starting calculations");
    var sum_depot = 0
    for(var i=0; i<depots.depots.length; i++){
      sum_depot = sum_depot + depots.depots[i].MechanicHours
    }
    console.log("total hours is " + sum_depot)

    var list = vehicles.vehicles
    for(var j=0; j<list.length; j++){
      for(var k=0; k<list.length-1; k++){
        if(list[k].Impact < list[k+1].Impact){
          var temp = list[k]
          list[k] = list[k+1]
          list[k+1] = temp
        }
      }
    }

    var final_list = []
    var used = 0
    var score = 0

    for(var i=0; i<list.length; i++){
      var item = list[i]
      if(used + item.Duration <= sum_depot){
        final_list.push(item)
        used = used + item.Duration
        score = score + item.Impact
      }
    }

    logger.Log("backend", "info", "service", "finished picking vehicles");

    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({ "selected_vehicles": final_list, "total_score": score }));
  })
})
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3000);
