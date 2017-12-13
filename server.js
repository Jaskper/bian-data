var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    predictIt = require('predict-it'),
    Q = require('q'),
    jsonSize = require('json-size'),
    mongoose = require('mongoose');
   
var options = {
   user: "admin",
   pass: "password"
};

mongoose.connect('mongodb://localhost:27017/predictit/ps?authSource=admin',options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var contractSchema = mongoose.Schema({
	nameOfContract: String,
	contractTicker: String,
	marketTicker: String,
	lastTrade: Number,
	buyYes: Number,
	buyNo: Number,
	sellYes: Number,
	sellNo: Number,
	timeStamp: String,
	endDate: String
})
var Contract = mongoose.model("Contract", contractSchema);


app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

setInterval(function(){
    predictIt.all().then(function(data){
       for(var i = 0; i<data.length; i++){
           
           var marketTicker = data[i].TickerSymbol;
           var timeStamp = data[i].TimeStamp;
           
           var contracts = [];
           for(var j=0; j<data[i].Contracts.length; j++){
               var nameOfContract = data[i].Contracts[j].LongName;
               var lastTrade = data[i].Contracts[j].LastTradePrice;
               var buyYes = data[i].Contracts[j].BestBuyYesCost;
               var buyNo = data[i].Contracts[j]. BestBuyNoCost;
               var sellYes = data[i].Contracts[j].BestSellYesCost;
               var sellNo = data[i].Contracts[j].BestSellNoCost;
               var lastClose = data[i].Contracts[j].LastClosePrice;
               var contractTicker = data[i].Contracts[j].TickerSymbol;
               var endDate = data[i].Contracts[j].DateEnd;
	   
	       var contractObject = {nameOfContract: nameOfContract, contractTicker: contractTicker, marketTicker: marketTicker, lastTrade: lastTrade, buyYes: buyYes, buyNo: buyNo, sellYes: sellYes, sellNo: sellNo, timeStamp: timeStamp, endDate: endDate}
	       var contract = new Contract(contractObject);
		   contract.save();
	   }

       }
    });
	console.log('updated: ' + Date.now());
}, 10*60*1000);



io.on('connection', function(socket){
    console.log('connection');
    socket.on('refresh_request', function(){

        Contract.collection.stats(function(err, results){
            socket.emit('refresh_fulfill', {count: results.count, bytes: results.storageSize});
        })

    });
    
    
});


app.use(express.static(__dirname + '/public'));

http.listen(3000, function(){
	console.log('listening on *:3000');
});
