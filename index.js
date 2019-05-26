/**
 * JOSE JAVIER JO ESCOBAR
 * 14343
 * PROYECTO 3 IA -- OTHELLO GAME
 */


/**
 * Definicion de variables
 */
var tournamentID=142857;
var user_name='JavierJ_Chinitoveloxxx';
var gameID ;
var playerTurnID ;
var myID;
var rivalID;
var bandera = false ;
var winnerTurnID ;
var movement =7;
var move ;
var board =[];
var board2d =[];
var lastMove;
var __listaTiros= [];

var socket = require('socket.io-client')('http://192.168.88.252:4000');
socket.on('connect', function(){
  socket.emit('signin', {
    user_name: user_name,
    tournament_id: tournamentID,
    user_role: 'player'
  });
});

socket.on('ok_signin', function(){
  console.log("Ya estamos conectados!");
});


socket.on('ready', function(data){
  var gameID = data.game_id;
  var playerTurnID = data.player_turn_id;
  myID=playerTurnID;
  rivalID=rival(myID);
  var board = data.board;

  board2d=transformBoard(board);
  var v= __valMax(0,board2d,7,-1000,1000);
  move = get1DPos (__listaTiros[0],__listaTiros[1]);

  if (move==lastMove){
    move =Math.floor((Math.random() * 63) + 0);
  }
  lastMove=move ;
  console.log(board2d);
  socket.emit('play', {
    tournament_id: tournamentID,
    player_turn_id: playerTurnID,
    game_id: gameID,
    movement: move
  });
});

socket.on('finish', function(data){
  var gameID = data.game_id;
  var playerTurnID = data.player_turn_id;
  var winnerTurnID = data.winner_turn_id;
  var board = data.board;

  socket.emit('player_ready', {
    tournament_id: tournamentID,
    player_turn_id: playerTurnID,
    game_id: gameID
  });
});

/**
 * Definicion de Minimax
 * @param {*} vueltas 
 * @param {*} __actualizacionTablero1 
 * @param {*} depth 
 * @param {*} alpha 
 * @param {*} beta 
 */
function __valMax(vueltas,__actualizacionTablero1,depth,alpha,beta){
  let __actualizacionTablero= [];
  for (var i=0; i<8;i++){
      __actualizacionTablero.push(__actualizacionTablero1[i]);
  }
  var __cantVueltas = vueltas+1;
  var v = -1000;
  var tirosValidos = getTirosValidos(__actualizacionTablero,myID);

  if (tirosValidos.length==0) {
    v = finalValue(__actualizacionTablero);
  } else {
    for (var i=0;i<tirosValidos.length;i++) {
      let tiroBoard=getBoard(tirosValidos[i],__actualizacionTablero,myID);
      let tiroValue= value(__cantVueltas,-1,tiroBoard,depth,alpha,beta);
      v = Math.max(v,tiroValue);
      if (v==tiroValue){
        __listaTiros=tirosValidos[i];
      }
      if (v>=beta){
        return v;
      }
      alpha = Math.max(alpha,v);
    }
  }
  return v;
}

function __valMin(vueltas,__actualizacionTablero1,depth,alpha,beta) {
  let __actualizacionTablero= [];
  for (var i=0; i<8;i++){
      __actualizacionTablero.push(__actualizacionTablero1[i]);
  }
  var __cantVueltas = vueltas+1;
  var v = 1000;
  var tirosValidos = getTirosValidos(__actualizacionTablero,rivalID);

  if (tirosValidos.length==0){
    v=finalValue(__actualizacionTablero);
  } else {
    for (var i=0;i<tirosValidos.length;i++) {
      let tiroBoard=getBoard(tirosValidos[i],__actualizacionTablero,rivalID);
      v = Math.min(v,value(__cantVueltas,1,tiroBoard,depth,alpha,beta));

      if (v<=alpha) {
        return v;
      }
      beta = Math.min(beta,v);
    }
  }
  return v;
}


function value(vueltas,type,__actualizacionTablero1,depth,alpha,beta){
  let __actualizacionTablero= [];
  for (var i=0; i<8;i++){
    __actualizacionTablero.push(__actualizacionTablero1[i]);
  }

  if (vueltas>depth && type==-1 ) {
    bandera=true ;
    return Utility(__actualizacionTablero);
  } else if (type==1) {
    return __valMax(vueltas,__actualizacionTablero,depth,alpha,beta);
  } else if (type==-1) {
    return __valMin(vueltas,__actualizacionTablero,depth,alpha,beta);
  }

  return "error";
}

function Utility(__actualizacionTablero){
  var flips = flipHeuritic(__actualizacionTablero,myID);
  var movility = -1 *getTirosValidos(__actualizacionTablero,rival);
  var difs = difInBoard(__actualizacionTablero);

  var ww = __pesos(__actualizacionTablero);

  return ww+movility+flips;
}
