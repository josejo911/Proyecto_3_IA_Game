const argv = require('yargs').argv

var usern = 'JavierJo_Dimelopapiiiii'
var puerto = '4000'
var tID = '142857'
var socket = require('socket.io-client')("http://192.168.1.148:" + puerto + "");  // for example: http://127.0.0.1:3000

const b = require('./lib/board')
const m = require('./lib/minimax')

let root = {}, bestChild = {}, countOfMoves = 0

const rand_int = (min, max) => Math.floor(Math.random() * (max - min)) + min

socket.on('connect', function(){
  console.log("Signing in as", usern)

  socket.emit('signin', {
    user_name: usern,
    tournament_id: tID ,
    user_role: 'player',
  })

  socket.on('ok_signin', function(){
    console.log("Successfully signed in!")
  })

  socket.on('ready', function(data){
    const gameID = data.game_id
    const playerTurnID = data.player_turn_id
    const boardArray = data.board
    const boardMatrix = b.transformBoard(boardArray)
    const enemey_id = playerTurnID === 1 ? 2 : 1

    // Si es la primera vez pregeneramos el root
    if(Object.keys(root).length === 0 && root.constructor === Object){
      root = {
        board: boardMatrix,
        score: 0,
        position: -1,
        childs: []
      }
    } else {
      // Encontramos el nuevo rood del mejor hijo
      let newRootIndex = m.foundNewRootIndex(bestChild, boardMatrix)

      root = bestChild.childs[newRootIndex]
      if(root === undefined){
        root = {
          board: boardMatrix,
          score: 0,
          position: -1,
          childs: []
        }
      }
    }

    countOfMoves = b.leftCountOfMoves(boardMatrix)

    let bestScore = 0

    if(countOfMoves <= 14){
      bestScore = m.minimax(
        root,
        countOfMoves,
        true,
        playerTurnID,
        enemey_id,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        countOfMoves
      )
    } else {
      bestScore = m.minimax(
        root,
        6,
        true,
        playerTurnID,
        enemey_id,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        countOfMoves
      )
    }

    bestChild = root.childs[root.childs.findIndex(child => child.score === bestScore)]

    let move = bestChild.position
    console.log('move', move)

    const play = {
      tournament_id: tID,
      player_turn_id: playerTurnID,
      game_id: gameID,
      movement: move,
    }

    socket.emit('play', play)
  })

  socket.on('finish', function(data){
    console.log('finish')
    const gameID = data.game_id
    const playerTurnID = data.player_turn_id
    const winnerTurnID = data.winner_turn_id
    const board = data.board


    const player_ready = {
      tournament_id: tID,
      player_turn_id: playerTurnID,
      game_id: gameID
    }

    socket.emit('player_ready', player_ready)
  })
})
