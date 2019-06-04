
const b = require('./board')
const h = require('./heuristic')

const terminalNode = node => {
  const board = node.board
  let zeroFound = false
  board.forEach(row => {
    row.forEach((element, index) => {
      if(element === 0){
        zeroFound = true
      }
    })
  })

  return !zeroFound
}

const foundNewRootIndex = (root, enemy_board) => {
  return root.childs.findIndex(child => b.compareBoard(child.board, enemy_board))
}

const minimax = (n, depth, player, player_id, enemey_id, alpha, beta, countOfMoves) => {
  const id = player ? player_id : enemey_id



  if(depth === 0 || terminalNode(n)){
    const positionalScore = h.positional(n.board, id)
    const absoluteScore = h.absolute(n.board, id)
    const mobilityScore = h.mobility(n.board, id)
    let nodeScore = 0

    nodeScore = positionalScore + mobilityScore

    if(countOfMoves <= 14){
      nodeScore += absoluteScore
    }

    n.score = nodeScore

    return n.score

  } else {
    if(n.childs.length === 0){

      const possibleMoves = b.validateBoard(n.board, id)

      let childs = []
      Object.keys(possibleMoves).forEach(position => {
        const moves = possibleMoves[position]
        const newBoard = b.applyMoveBoard(n.board, id, moves)

        childs.push({
          'board': newBoard,
          'score': 0,
          'childs': [],
          'position': moves.position
        })
      })

      n.childs = childs
    }


    let isBetaLowerThan = false
    if(player){
      n.childs.forEach(node => {
        if(!isBetaLowerThan){
          alpha = Math.max(alpha, minimax(node, depth - 1, !player, player_id, enemey_id, alpha, beta, countOfMoves))

          isBetaLowerThan = beta <= alpha
        }
      })

      n.score = alpha

      return alpha
    } else {
      n.childs.forEach(node => {
        if(!isBetaLowerThan){
          beta = Math.min(beta, minimax(node, depth - 1, !player, player_id, enemey_id, alpha, beta, countOfMoves))

          isBetaLowerThan = beta <= alpha
        }
      })

      n.score = beta

      return beta
    }
  }
}

module.exports = {
  minimax,
  foundNewRootIndex
}
