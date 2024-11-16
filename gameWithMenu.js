var canvas;
var canvasContext;

var hue = 0;
var currentColor = "lightblue";
var dvdColor = "blue";

var balls = [];
var BALL_COUNT = 1;
var BALL_SPEEDX = 5;
var BALL_SPEEDY = 2;
var BALL_SIZE = 10;
var canSpawn = true;

var dvd = {
    x: 400,
    y: 300,
    SpeedX: 3,
    SpeedY: 1,
    img: new Image(),
    scale: .1,
    height: 102,
    width: 200,
    isScored:false,
    isColliding: false
}

var player1Score = 0;
var player2Score = 0;
var WINNING_SCORE = 7;

var showingWinScreen = false;

var computerMoveSpeed = 3;
var computerErr = 35;
var computerMomentum = 0;
var computerDirection = 0;

var isRGB = false;

var paddle1Y = 250;
var paddle2Y = 250;

var paddleHeight = 100;
var paddleWidth = 10;


/*------------------- Handle User Input -----------------------------*/

function calculateMousePos(evt){
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
    return {
        x:mouseX,
        y:mouseY
    }
}

function handleMouseClick(evt){
    if(showingWinScreen){
        player1Score = 0;
        player2Score = 0;
        currentColor = "white";
        isRGB = false;
        computerMoveSpeed = 3;
        computerMomentum = 0;
        showingWinScreen = false;
        document.getElementById('result').style.display = "none";
        player1Scoreboard.innerHTML = "Player 1 Score: 0"
        player2Scoreboard.innerHTML = "Player 2 Score: 0"
    }
}

/*-------------- Main Function for running the Game ----------------*/

function play(){
    console.log("hello world!"); 
    dvd.img.src = "dvd-logo.png";
    
    /* Aquire & handle user input variables */
    BALL_COUNT = parseInt(document.getElementById("ballCount").value);
    if(Number.isNaN(BALL_COUNT)){
        BALL_COUNT = 1;
    }
    else if(BALL_COUNT <= 0){
        alert("Ball count must be positive");
        return;
    }
    else if(BALL_COUNT > 10000){
        alert("Ball count cannot be greater than 10,000");
        return;
    }
    
    WINNING_SCORE = parseInt(document.getElementById("scoreToWin").value);
    if(Number.isNaN(WINNING_SCORE)){
        WINNING_SCORE = 7;
    }
    else if(WINNING_SCORE <= 0){
        alert("Winning score must be positive");
        return;
    }
    
    if(document.getElementById('easy').checked){
        computerMoveSpeed = 2;
        BALL_SPEEDX = 5;
        BALL_SPEEDY = 2;
        
    }
    else if(document.getElementById('medium').checked){
        computerMoveSpeed = 3;
        BALL_SPEEDX = 7;
        BALL_SPEEDY = 2;
    }
    else if(document.getElementById('hard').checked){
        computerMoveSpeed = 5;
        BALL_SPEEDX = 9;
        BALL_SPEEDY = 3;
    }
    
    if(document.getElementById('small').checked){
        BALL_SIZE = 5;
        
    }
    else if(document.getElementById('regular').checked){
        BALL_SIZE = 10;
    }
    else if(document.getElementById('large').checked){
        BALL_SIZE = 30;
    }
    
    
    
    player1Scoreboard = document.getElementById('score1');
    player2Scoreboard = document.getElementById('score2');
    
    /* Hide menu & display game/scoreboard */
    document.getElementById('subtitle').style.display = "none";
    document.getElementById('content').style.display = "none";
    document.getElementById('gameCanvas').style.display = "block"
    document.getElementById('score1').style.display = "block"
    document.getElementById('score2').style.display = "block"
    document.getElementById('quit').style.display = "block";
    document.getElementById('body').style.backgroundImage = "none";
    document.getElementById('footer').style.display = "none";
    
    canvas = document.getElementById('gameCanvas');
    canvas.width = "1000"
    canvas.height = "600"
    canvasContext = canvas.getContext('2d');
    
    ballBuilder(BALL_COUNT);

    var framesPerSecond = 60;
    setInterval(function(){
        moveEverything();
        drawEverything();
    }, 1000/framesPerSecond);

    canvas.addEventListener('mousedown', handleMouseClick);

    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = calculateMousePos(evt);
        paddle1Y = mousePos.y - (paddleHeight/2);
    });
}

function ballBuilder(count){
    for(var i = 0; i < count; i++){
        balls.push({
            x: Math.random() * (canvas.width * .50) + 50,
            y: Math.random() * (canvas.height * .50) + 50,
            SpeedX: BALL_SPEEDX,
            SpeedY: BALL_SPEEDY,
            radius: BALL_SIZE,
            isScored: false});
    }
    for(var i = 0; i < count; i++){
        console.log(balls[i]);
    }
}

/*------------------------- Opponent AI ---------------------------*/

function compareBall(a,b){
    var ax = a.x;
    var bx = b.x;
    var comparison = 0;
    if(ax < bx){
        comparison = 1;
    } else if (ax > bx){
        comparison = -1;
    }
    return comparison;
}



function computerMovement(){

    balls.sort(compareBall);
    
    for(var i = 0; i < balls.length; i++){
        if(balls[i].SpeedX > 0){
            closestBall = balls[i];
            //target(balls[i]);
            break;
        }
    }
    
    if(dvd.SpeedX > 0 && dvd.x > closestBall.x){
        target(dvd);
    }else{
        target(closestBall);
    }
    

}

function target(ball){
    var paddle2YCenter = paddle2Y + (paddleHeight/2);
    if(paddle2YCenter < ball.y-computerErr+Math.random()*21){//Default 35
        if(computerDirection > 0){
            computerMomentum = 0;
        }
        computerDirection = -1;
        paddle2Y += computerMoveSpeed + computerMomentum;
        computerMomentum += .3;
    } else if(paddle2YCenter > ball.y+computerErr+Math.random()*21){
        if(computerDirection < 0){
            computerMomentum = 0;
        } 
        computerDirection = 1;
        paddle2Y -= computerMoveSpeed + computerMomentum;
        computerMomentum += .3;
    }
}

function increaseDifficulty(){
    //computerMoveSpeed++
    isRGB = true;
}

/*------------------------- Physics -------------------------------*/

function ballCollision(ball1, ball2){
    if(Math.abs(ball1.x - ball2.x) < ball1.radius && Math.abs(ball1.y - ball2.y) < ball1.radius){
        ball1.SpeedX = -ball1.SpeedX;
        ball2.SpeedX = -ball2.SpeedX;
        ball1.SpeedY = -ball1.SpeedY;
        ball2.SpeedY = -ball1.SpeedY;
    }
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    // Check x and y for overlap
    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2){
        return false;
    }
    return true;
}

function dvdBallCollision(ball,beforeY){
    if(rectIntersect(ball.x,ball.y,ball.radius*2,ball.radius*2,dvd.x,dvd.y,dvd.width,dvd.height)){
        dvd.isColliding = false;
        pickDvdColor();
        if(beforeY){
            if((ball.SpeedX > 0 && dvd.SpeedX > 0) || (ball.SpeedX < 0 && dvd.SpeedX < 0)){
            ball.SpeedX = -ball.SpeedX;
            ball.x += ball.SpeedX;
            dvd.x += dvd.SpeedX;
        }else{
            ball.SpeedX = -ball.SpeedX;
            dvd.SpeedX = -dvd.SpeedX;
            ball.x += ball.SpeedX;
            dvd.x += dvd.SpeedX;
        }
        }else{
            if((ball.SpeedY > 0 && dvd.SpeedY > 0) || (ball.SpeedY < 0 && dvd.SpeedY < 0)){
                ball.SpeedY = -ball.SpeedY;
                ball.y += ball.SpeedY;
                dvd.y += dvd.SpeedY;
            }else{
                ball.SpeedY = -ball.SpeedY;
                dvd.SpeedY = -dvd.SpeedY;
                ball.y += ball.SpeedY;
                dvd.y += dvd.SpeedY;
            }
        } 
    }
    
   while(rectIntersect(ball.x,ball.y,ball.radius*2,ball.radius*2,dvd.x,dvd.y,dvd.width,dvd.height)){
       if(beforeY){
           //dvd.x += dvd.SpeedX;
           ball.x += ball.SpeedX;
       }
       else{
           //dvd.y += dvd.SpeedY;
           ball.y += ball.SpeedY;
       }
   }
    
}

/*----------------------------- Movement --------------------------*/

function ballMovement(ball){
    if(ball.isScored){
        ballReset(ball);
        return;
    }
    ball.x += ball.SpeedX; 
    dvdBallCollision(ball,true);

    ball.y += ball.SpeedY;
    dvdBallCollision(ball,false);
    //Ball reaching Player2
    if(ball.x + ball.radius*2 > canvas.width){
        if(rectIntersect(ball.x,ball.y,ball.radius*2,ball.radius*2,canvas.width-paddleWidth,paddle2Y,paddleWidth,paddleHeight)){
            ball.SpeedX = -ball.SpeedX;
            var deltaY = ball.y - (paddle2Y+paddleHeight/2);
            ball.SpeedY = deltaY * 0.25;
        }
        else if(ball.x > canvas.width){
            ball.isScored=true;
            player1Score++;//Must be before ballReset()
            player1Scoreboard.innerHTML = "Player 1 Score: " + player1Score.toString();
            increaseDifficulty();
            ballReset(ball);
        }
    }
    //Ball reaching Player1
    if(ball.x < 0){
        if(rectIntersect(ball.x,ball.y,ball.radius*2,ball.radius*2,0,paddle1Y,paddleWidth,paddleHeight)){
            ball.SpeedX = -ball.SpeedX;
            var deltaY = ball.y - (paddle1Y+paddleHeight/2);
            ball.SpeedY = deltaY * 0.25;
        }
        else{
            ball.isScored=true;
            player2Score++;//Must be before ballReset()
            player2Scoreboard.innerHTML = "Player 2 Score: " + player2Score.toString();
            ballReset(ball);
        }
    }
    //Ball Hitting floor or ceiling
    if(ball.y > canvas.height){
        ball.SpeedY = -ball.SpeedY;
    }
    if(ball.y < 0){
        ball.SpeedY = -ball.SpeedY;
    }
    
    //ballCollision(ball1,ball2);
    //dvdCollision(dvd,ball);
}

function dvdMovement(){
    if(dvd.isScored){
        dvdReset();
        return;
    }
    
    dvd.x += dvd.SpeedX;
    //dvdBallCollision(ball1,true);
    //dvdBallCollision(ball2,true);
    dvd.y += dvd.SpeedY;
    //dvdBallCollision(ball1,false);
    //dvdBallCollision(ball2,false);
    
    dvdCenterY = dvd.y+(dvd.height)/2
    if(dvd.x+dvd.width > canvas.width){
        if(rectIntersect(dvd.x,dvd.y,dvd.width,dvd.height,canvas.width-paddleWidth,paddle2Y,paddleWidth,paddleHeight)){
            if(!dvd.isColliding){
                dvd.SpeedX = -dvd.SpeedX;
                var deltaY = dvdCenterY - (paddle2Y+paddleHeight/2);
                dvd.SpeedY = deltaY * 0.1;
                dvd.isColliding = true;
                pickDvdColor();
            }
        }
        else if(dvd.x+dvd.width/2 > canvas.width){
            dvd.isScored = true;
            dvd.isColliding = false;
            player1Score++;//Must be before ballReset()
            player1Scoreboard.innerHTML = "Player 1 Score: " + player1Score.toString();
            increaseDifficulty();
            dvdReset();
            pickDvdColor();
        }
        else{
            dvd.isColliding = false;
        }
    }
    else if(dvd.x < 0){
        if(rectIntersect(dvd.x,dvd.y,dvd.width,dvd.height,0,paddle1Y,paddleWidth,paddleHeight)){
            if(!dvd.isColliding){
                dvd.SpeedX = -dvd.SpeedX;
                var deltaY = dvdCenterY - (paddle1Y+paddleHeight/2);
                dvd.SpeedY = deltaY * 0.1;
                dvd.isColliding = true;
                pickDvdColor();
            }
            
        }
        else if(dvd.x + dvd.width/2 < 0){
            dvd.isScored = true;
            dvd.isColliding = false;
            player2Score++;//Must be before ballReset()
            player2Scoreboard.innerHTML = "Player 2 Score: " + player2Score.toString();
            dvdReset();
            pickDvdColor();
        }
        else{
            dvd.isColliding = false;
        }
    } else{
        dvd.isColliding = false;
    }
    if(dvd.y+dvd.height > canvas.height){
        dvd.SpeedY = -dvd.SpeedY;
        pickDvdColor();
    }
    if(dvd.y < 0){
        dvd.SpeedY = -dvd.SpeedY;
        pickDvdColor();
    }
    
    //dvdCollision(dvd,ball1);
    //dvdCollision(dvd,ball2);
}

function moveEverything(){
    if(showingWinScreen){
        return;
    }
    computerMovement();
    balls.forEach(ball => ballMovement(ball));
    dvdMovement();

}

function ballReset(ball){
    if(player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE){
        showingWinScreen = true;
    }
    if(!rectIntersect(dvd.x,dvd.y,dvd.width,dvd.height,canvas.width/2,canvas.height/2,20,20)){
        ball.SpeedX = -ball.SpeedX;
        ball.SpeedY = ball.SpeedY*.7;
        ball.x = canvas.width/2;
        ball.y = canvas.height/2;
        ball.isScored = false;
    }
    
    
}

function dvdReset(){
    if(player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE){
        showingWinScreen = true;
    }
    balls.forEach(ball => function(){ if(rectIntersect(ball.x,ball.y,ball.radius*2,ball.radius*2,canvas.width/2,canvas.height/2,dvd.width,dvd.height)){ canSpawn = false; return; } else{ canSpawn = true }});
    
    if(canSpawn){
        dvd.SpeedX = -dvd.SpeedX;
        dvd.SpeedY = dvd.SpeedY*.7;
        dvd.x = canvas.width/2;
        dvd.y = canvas.height/2;
        dvd.isScored = false;
    }
}

/* ------------------Drawing Stuff--------------------*/

function drawNet(){
    for(var i=0; i<canvas.height; i+=40){
        colorRect(canvas.width/2-1,i,2,20,currentColor);
    }
}

function drawEverything(){
    console.log("Called drawEverything");
    //create background
    colorRect(0,0,canvas.width,canvas.height,'black');
    //Show Win Screen
    if(showingWinScreen){
        if(player1Score >= WINNING_SCORE){
            document.getElementById('result').innerHTML = "<h1>Victory!</h1><small>Click to Continue.</small>";
            document.getElementById('result').style.display = 'block';
        }else if(player2Score >= WINNING_SCORE){
            document.getElementById('result').innerHTML = "<h1>Defeat</h1><small>Click to Continue.</small>";
            document.getElementById('result').style.display = 'block';
        }
        return;
    }
    if(isRGB){
        hue = hue + Math.random() * 7;
        currentColor = 'hsl(' + hue + ', 100%, 50%)'; 
    }
    document.getElementById('body').style.backgroundColor = currentColor;
    //Draw net
    drawNet();
    //Draw paddle1
    colorRect(0,paddle1Y,paddleWidth,paddleHeight,currentColor);
    //Draw paddle2
    colorRect(canvas.width-paddleWidth,paddle2Y,paddleWidth,paddleHeight,currentColor);
    //Draw balls
    balls.forEach((ball) => { colorCircle(ball.x,ball.y,ball.radius,currentColor);});
    //Draw dvd
    drawDvd();

    //canvasContext.fillStyle = 'white';
    canvasContext.fillText(player1Score, 100, 100);
    canvasContext.fillText(player2Score, canvas.width - 100, 100);
}

function pickDvdColor(){
    r = Math.random() * (254 - 0) + 0;
    g = Math.random() * (254 - 0) + 0;
    b = Math.random() * (254 - 0) + 0;

    dvdColor = 'rgb('+r+','+g+', '+b+')';
}

function drawDvd(){
    canvasContext.fillStyle = dvdColor;
    canvasContext.fillRect(dvd.x,dvd.y,dvd.width,dvd.height);
    canvasContext.drawImage(dvd.img,dvd.x,dvd.y,dvd.width,dvd.height);
    
}

function colorCircle(centerX, centerY, radius, drawColor){


    canvasContext.fillStyle = drawColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI*2, true);
    canvasContext.fill();

}

function colorRect(leftX,topY, width, height, drawColor){
    canvasContext.fillStyle = drawColor;
    canvasContext.fillRect(leftX,topY,width,height);
}