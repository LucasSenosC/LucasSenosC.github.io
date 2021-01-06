xmax = 1080;
ymax = 500;
dot_list = [];
rmin = 2;
var current = false;

function startnstop(){
    if(current){
        document.getElementById("start").textContent = "Begin";
        current = false;
    }else{
        document.getElementById("start").textContent = "Stop";
        current = true;
    }
}

function reset(){
    current = false;
    dot_list = []
    document.getElementById("quant").textContent = 0;   
    document.getElementById("start").textContent = "Start";
    document.getElementById("background").innerHTML = "";
}

function random_color(){
    var r = Math.floor(Math.random()*255);
    var g = Math.floor(Math.random()*255);
    var b = Math.floor(Math.random()*255);
    var rgb = "rgb(" + r + "," + g + "," + b + ")";
    return rgb;
}

function ponto_aleatorio(xmax, ymax){
    var x = Math.floor(Math.random()*xmax);
    var y = Math.floor(Math.random()*ymax);
    return [x,y];
}

function raio_aleatorio(cord, xmax, ymax, rmin, rmax){
    var x = cord[0];
    var y = cord[1];
    var r = Math.floor(Math.random()*(rmax - rmin) + rmin);
    return [x,y,r];
}

function dist_list(p, dot_list){
    var x = p[0];
    var y = p[1];
    var dist_list = [x, y, xmax - x, ymax - y];

    for(var i=0; i<dot_list.length;i++){
        var p2 = dot_list[i]
        var dist = Math.pow(Math.pow((x - p2[0]), 2) + Math.pow((y - p2[1]), 2), 0.5);
        var dist = dist - p2[2];
        dist_list.push(dist);
    }

    return Math.min.apply(Math,dist_list);
}

function draw(){
    if(!current){
        return 0;
    }

    var cord = ponto_aleatorio(xmax,ymax);
    var d = dist_list(cord, dot_list);
    if(d >= rmin){
        var ponto = raio_aleatorio(cord, xmax, ymax, rmin, d);
        dot_list.push(ponto);

        var rgb = random_color()

        var circle = document.createElement("div");
        circle.classList.add("shape");

        circle.onclick = function(){
            r = this.style.width;
            r = parseInt(r.substring(0, r.length-2))/2
            x = this.style.left;
            x = parseInt(x.substring(0, x.length-2))
            x = x + r
            y = this.style.top;
            y = parseInt(y.substring(0, y.length-2))
            y = y + r
            color = this.style.backgroundColor;
            var stats = "x = " + x + ", y = " + y + ", r = " + r + ", color = " + color;
            console.log(stats)
        };
        
        circle.style.cssText = 'width:' + ponto[2]*2 + 'px; height:' + ponto[2]*2 + 'px; top:' + (ponto[1] - ponto[2]) + 'px; left:' + (ponto[0] - ponto[2]) + 'px; background-color:' + rgb;

        document.getElementById("background").appendChild(circle)

        document.getElementById("quant").textContent = dot_list.length
    }
}

setInterval(draw,1000/30);


