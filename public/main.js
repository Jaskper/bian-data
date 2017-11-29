var socket = io.connect();

window.addEventListener("load", function(){
    document.getElementById("refresh").addEventListener("click", function(){
       socket.emit('refresh_request'); 
    });
    
    socket.on('refresh_fulfill', function(data){
        
       document.getElementById("output_div").innerHTML = "COUNT: " + data.count + "<br/>SIZE: " + data.bytes/1000/1000 + "mb"; 
    });
});
