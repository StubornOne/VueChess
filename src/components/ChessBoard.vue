<script setup lang="ts">
import Piece from './Piece.vue';
import { ref, type Ref, toValue } from 'vue'
import { useChessStore } from '@/components/scripts/chessStore'
import PawnPromotion from './PawnPromotion.vue';

const chessStore = useChessStore()
chessStore.whiteTurn = true

const size = 8;
const count = size*size;

const borderTop: number[] = [0, 1, 2, 3, 4, 5, 6, 7]
const borderBottom: number[] = [56, 57, 58, 59, 60, 61, 62, 63]
const borderLeft: number[] = [0, 8, 16, 24, 32, 40, 48, 56]
const borderRight: number[] = [7, 15, 23, 31, 39, 47, 55, 63]

const borderInnerTop: number[] = [8, 9, 10, 11, 12, 13, 14, 15]
const borderInnerBottom: number[] = [48, 49, 50, 51, 52, 53, 54]
const borderInnerLeft: number[] = [1, 9, 17, 25, 33, 41, 49, 57]
const borderInnerRight: number[] = [6, 14, 22, 30, 38, 46, 54, 62]

const isPromotion: boolean = false
const promotionWhite: boolean = false

function isWhite(boardstate: Ref<PieceState[]> | PieceState[], index: number) {
  return (toValue(boardstate)[index].piece === toValue(boardstate)[index].piece.toUpperCase() && toValue(boardstate)[index].piece !== '') ? true : false
}
function isBlack(boardstate: Ref<PieceState[]> | PieceState[], index: number) {
  return (toValue(boardstate)[index].piece === toValue(boardstate)[index].piece.toLowerCase() && toValue(boardstate)[index].piece !== '') ? true : false
}
function isEmpty(boardstate: Ref<PieceState[]> | PieceState[], index: number) {
  return (toValue(boardstate)[index].piece === '') ? true : false
}

function isTurn(boardstate: Ref<PieceState[]> | PieceState[], index: number) {
  if (chessStore.whiteTurn) {
    return toValue(boardstate)[index].piece === toValue(boardstate)[index].piece.toUpperCase() ? true : false
  }
  return toValue(boardstate)[index].piece === toValue(boardstate)[index].piece.toLowerCase() ? true : false
}

const includesAny = (arr: number[], values: number[]) => values.some(v => arr.includes(v));

function promotePawn(boardstate: Ref<PieceState[]> | PieceState[], index: number) {
  const promotionPicker: HTMLDialogElement | null = document.getElementById('promotionPicker') as HTMLDialogElement
  promotionPicker?.showModal()
}

let movesThatTakeWhiteKing: number[] = []
function isWhiteCheck(boardstate: Ref<PieceState[]> | PieceState[]) {
  const whiteKingIndex: number = toValue(boardstate).findIndex(piece => piece.piece === 'K')

  for (let i = 0; i < toValue(boardstate).length; i++) {
    if (isBlack(boardstate, i)) {
      const moveList: number[] = calcLegalMoves(boardstate, i)
      if (moveList.includes(whiteKingIndex)) {
        console.log('check', i)
        movesThatTakeWhiteKing = movesThatTakeWhiteKing.concat(moveList)
        return true
      }
    }
  }

  return false
}

let movesThatTakeBlackKing: number[] = []
function isBlackCheck(boardstate: Ref<PieceState[]> | PieceState[]) {
  const blackKingIndex: number = toValue(boardstate).findIndex(piece => piece.piece === 'k')

  for (let i = 0; i < toValue(boardstate).length; i++) {
    if (isWhite(boardstate, i)) {
      const moveList: number[] = calcLegalMoves(boardstate, i)
      if (moveList.includes(blackKingIndex)) {
        console.log('check', i)
        movesThatTakeBlackKing = movesThatTakeBlackKing.concat(moveList)
      }
    }
  }

  if (movesThatTakeBlackKing.length !== 0) {
    return true
  }

  return false
}

function move(boardstate: Ref<PieceState[]> | PieceState[], indexFrom: number, indexTo: number) {
  Object.assign(toValue(boardstate)[indexTo], toValue(boardstate)[indexFrom])
  toValue(boardstate)[indexTo].selected = false
  toValue(boardstate)[indexFrom].piece = ''
  toValue(boardstate)[indexFrom].moveCount = undefined
  toValue(boardstate)[indexFrom].selected = false
  toValue(boardstate)[indexTo].moveCount! += 1
  console.log(`moved ${toValue(boardstate)[indexTo].piece} from ${indexFrom} to ${indexTo}`)
  moveFrom = -1
  isSelected = false
}


interface PieceState {
  moveCount?: number,
  piece: string,
  selected: boolean,
  showLegalMove: boolean
}

function getIsOdd(index: number) {
  const offset = Math.floor(index / size) + (index % size)
  return offset % 2 === 0
}


function getPosByIndex(index: number) {
  // If you are white then different rendering
  index = count - index - 1

  const row: number = Math.floor(index / size)
  const column: number = index % size

  const alphabet: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

  return alphabet[size - column - 1] + (row + 1).toString()
}

function getIndexByPos(pos: string) {
  const columnPos = pos.slice(0, 1)
  const rowPos = pos.slice(1)
  let column: number = -1
  let row: number = parseInt(rowPos)
  row = size - row

  switch (columnPos) {
    case 'a':
      column = 0
      break
    case 'b':
      column = 1
      break
    case 'c':
      column = 2
      break
    case 'd':
      column = 3
      break
    case 'e':
      column = 4
      break
    case 'f':
      column = 5
      break
    case 'g':
      column = 6
      break
    case 'h':
      column = 7
      break
  }

  const index = (row * size) + column
  return index
}

function parseFromFEN(FEN: string) {
  const boardstate: PieceState[] = []
  for (let i: number = 0; i < FEN.length; i++) {
    if (FEN[i] === '/') {
      continue  
    }

    if (parseInt(FEN[i]) < 9 && parseInt(FEN[i]) > 0) {
      for (let j = 0; j < parseInt(FEN[i]); j++) {
        boardstate.push({piece: '', selected: false, showLegalMove: false})
      }
      continue
    }
    boardstate.push({piece: FEN[i], moveCount: 0, selected: false, showLegalMove: false})
  }
  return boardstate
}

const fen = parseFromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
const mainBoardstate = ref(fen)

let isSelected: boolean = false
let moveFrom: number = -1
let legalMoveList: number[] = []
let shouldPromote = false
function clickMoveHandler(index: number): void {
  if (isEmpty(mainBoardstate, index) && !isSelected) {
    console.log('Select smth :/')
    return
  }

  if (!isTurn(mainBoardstate, index) && !isSelected) {
    console.log('Not your turn, wait for the other player..')
    return
  }

  if (isSelected && moveFrom !== index) {

    let tempBoardstate: PieceState[] = []
    tempBoardstate = JSON.parse(JSON.stringify(toValue(mainBoardstate)))

    for (let i = 0; i < legalMoveList.length; i++) {

      if (index === legalMoveList[i]) {
        if (isWhite(mainBoardstate, moveFrom)) {
          tempBoardstate[index].piece = tempBoardstate[moveFrom].piece
          tempBoardstate[moveFrom].piece = ''

          if (isWhiteCheck(tempBoardstate)) {
            console.log(`Illegal move, white king in check`)
            mainBoardstate.value[moveFrom].selected = false
            isSelected = false
            legalMoveList = calcLegalMoves(mainBoardstate, moveFrom)
            for (let i = 0; i < legalMoveList.length; i++) {
              mainBoardstate.value[legalMoveList[i]].showLegalMove = false
            }
            moveFrom = -1
            return
          }
        }

        legalMoveList = calcLegalMoves(mainBoardstate, moveFrom)
        for (let i = 0; i < legalMoveList.length; i++) {
          mainBoardstate.value[legalMoveList[i]].showLegalMove = false
        }

        move(mainBoardstate, moveFrom, index)

        if (shouldPromote) {
          promotePawn(mainBoardstate, index)
        }

        chessStore.whiteTurn = !chessStore.whiteTurn
        return
      }
    }

    console.log(`Illegal move`)
    return
  }

  if (index === moveFrom) {
      isSelected = false
      mainBoardstate.value[moveFrom].selected = false
      for (let i = 0; i < legalMoveList.length; i++) {
        mainBoardstate.value[legalMoveList[i]].showLegalMove = false
      }
      moveFrom = -1
      return
    }

  moveFrom = index
  isSelected = true
  mainBoardstate.value[moveFrom].selected = true
  console.log('moveFrom set to ', moveFrom)
  legalMoveList = calcLegalMoves(mainBoardstate, index)
  for (let i = 0; i < legalMoveList.length; i++) {
    mainBoardstate.value[legalMoveList[i]].showLegalMove = true
  }
}

function calcLegalMoves(boardstate: Ref<PieceState[]> | PieceState[], index: number) {
  legalMoveList = []
  switch (toValue(boardstate)[index].piece) {
    case 'p': {

      if (isEmpty(boardstate, index + size)) {
        legalMoveList.push(index + size)
      }

      if (toValue(boardstate)[index].moveCount === 0 && isEmpty(boardstate, index + size * 2)) {
        legalMoveList.push(index + size * 2)
      }

      if (!borderRight.includes(index))
      {
        if (isWhite(boardstate, index + size + 1)) {
          legalMoveList.push(index + size + 1)
        }
      }

      if (!borderLeft.includes(index))
      {
        if (isWhite(boardstate, index + size - 1)) {
          legalMoveList.push(index + size - 1)
        }
      }

      if (includesAny(borderBottom, legalMoveList)) {
        shouldPromote = true
      }
      break
    }

    case 'P': {

      if (isEmpty(boardstate, index - size)) { 
        legalMoveList.push(index - size)
      }

      if (toValue(boardstate)[index].moveCount === 0 && isEmpty(boardstate, index - size * 2)) {
        legalMoveList.push(index - size * 2)
      }

      if (!borderRight.includes(index))
      {
        if (isBlack(boardstate, index - size + 1)) {
          legalMoveList.push(index - size + 1)
        }
      }

      if (!borderLeft.includes(index))
      {
        if (isBlack(boardstate, index - size - 1)) {
          legalMoveList.push(index - size - 1)
        }
      }

      if (includesAny(borderTop, legalMoveList)) {
        console.log(borderTop, legalMoveList)
        shouldPromote = true
      }
      break
    }

    case 'b': {
      // Down right
      for (let i = 1; i < 8; i++) {
        if (borderBottom.concat(borderRight).includes(index)) {
          continue
        }

        if (index + size * i + i > 63) {
          break
        }

        if (isWhite(boardstate, index + size * i + i)) {
          legalMoveList.push(index + size * i + i)
          break
        }

        if (isBlack(boardstate, index + size * i + i)) {
          break
        }

        if (!borderBottom.concat(borderRight).includes(index + size * i + i)) {
          legalMoveList.push(index + size * i + i)
          continue
        }

        legalMoveList.push(index + size * i + i)
        break
      }

      // Down left
      for (let i = 1; i < 8; i++) {
        if (borderBottom.concat(borderLeft).includes(index)) {
          continue
        }
        if (index + size * i - i > 63 ) {
          break
        }

        if (isWhite(boardstate, index + size * i - i)) {
          legalMoveList.push(index + size * i - i)
          break
        }

        if (isBlack(boardstate, index + size * i - i)) {
          break
        }

        if (!borderBottom.concat(borderLeft).includes(index + size * i - i)) {
          legalMoveList.push(index + size * i - i)
          continue
        }

        legalMoveList.push(index + size * i - i)
        break
      }

      // Up Left
      for (let i = 1; i < 8; i++) {
        if (borderTop.concat(borderLeft).includes(index)) {
          continue
        }
        if (index - size * i - i < 0) {
          break
        }

        if (isWhite(boardstate, index - size * i - i)) {
          legalMoveList.push(index - size * i - i)
          break
        }

        if (isBlack(boardstate, index - size * i - i)) {
          break
        }

        if (!borderTop.concat(borderLeft).includes(index - size * i - i)) {
          legalMoveList.push(index - size * i - i)
          continue
        }

        legalMoveList.push(index - size * i - i)
        break
      }

      // Up right
      for (let i = 1; i < 8; i++) {
        if (borderTop.concat(borderRight).includes(index)) {
          continue
        }
        if (index - size * i + i < 0) {
          break
        }

        if (isWhite(boardstate, index - size * i + i)) {
          legalMoveList.push(index - size * i + i)
          break
        }

        if (isBlack(boardstate, index - size * i + i)) {
          continue
        }

        if (!borderTop.concat(borderRight).includes(index - size * i + i)) {
          legalMoveList.push(index - size * i + i)
          continue
        }
        legalMoveList.push(index - size * i + i)
      }
      break
    }

    case 'B': {
      // Down right
      for (let i = 1; i < 8; i++) {
        if (borderBottom.concat(borderRight).includes(index)) {
          continue
        }

        if (index + size * i + i > 63) {
          break
        }

        if (isBlack(boardstate, index + size * i + i)) {
          legalMoveList.push(index + size * i + i)
          break
        }

        if (isWhite(boardstate, index + size * i + i)) {
          break
        }

        if (!borderBottom.concat(borderRight).includes(index + size * i + i)) {
          legalMoveList.push(index + size * i + i)
          continue
        }

        legalMoveList.push(index + size * i + i)
        break
      }

      // Down left
      for (let i = 1; i < 8; i++) {
        if (borderBottom.concat(borderLeft).includes(index)) {
          continue
        }
        if (index + size * i - i > 63) {
          break
        }

        if (isBlack(boardstate, index + size * i - i)) {
          legalMoveList.push(index + size * i - i)
          break
        }

        if (isWhite(boardstate, index + size * i - i)) {
          break
        }

        if (!borderBottom.concat(borderLeft).includes(index + size * i - i)) {
          legalMoveList.push(index + size * i - i)
          continue
        }

        legalMoveList.push(index + size * i - i)
        break
      }

      // Up Left
      for (let i = 1; i < 8; i++) {
        if (borderTop.concat(borderLeft).includes(index)) {
          break
        }
        if (index - size * i - i < 0) {
          break
        }

        if (isBlack(boardstate, index - size * i - i)) {
          legalMoveList.push(index - size * i - i)
          break
        }

        if (isWhite(boardstate, index - size * i - i)) {
          break
        }

        if (!borderTop.concat(borderLeft).includes(index - size * i - i)) {
          legalMoveList.push(index - size * i - i)
          continue
        }
        
        legalMoveList.push(index - size * i - i)
        break
      }

      // Up right
      for (let i = 1; i < 8; i++) {
        if (borderTop.concat(borderRight).includes(index)) {
          break
        }
        if (index - size * i + i < 0) {
          break
        }

        if (isBlack(boardstate, index - size * i + i)) {
          legalMoveList.push(index - size * i + i)
          break
        }

        if (isWhite(boardstate, index - size * i + i)) {
          break
        }

        if (!borderTop.concat(borderRight).includes(index - size * i + i)) {
          legalMoveList.push(index - size * i + i)
          continue
        }
        legalMoveList.push(index - size * i + i)
        break
      }
      break
    }

    case 'r': {
      // DOWN
      for (let i = 1; i < 8; i++) {
        if (borderBottom.includes(index)) {
          break
        }
        if (index + size * i > 63) {
          break
        }

        if (isWhite(boardstate, index + size * i)) {
          legalMoveList.push(index + size * i)
          break
        }

        if (isBlack(boardstate, index + size * i)) {
          break
        }

        if (!borderBottom.includes(index + size * i)) {
          legalMoveList.push(index + size * i)
          continue
        }
        legalMoveList.push(index + size * i)
        break
      }

      // UP
      for (let i = 1; i < 8; i++) {
        if (borderTop.includes(index)) {
          break
        }
        if (index - size * i < 0) {
          break
        }

        if (isWhite(boardstate, index - size * i)) {
          legalMoveList.push(index - size * i)
          break
        }

        if (isBlack(boardstate, index - size * i)) {
          break
        }

        if (!borderTop.includes(index - size * i)) {
          legalMoveList.push(index - size * i)
          continue
        }
        legalMoveList.push(index - size * i)
        break
      }

      // LEFT
      for (let i = 1; i < 8; i++) {
        if (borderLeft.includes(index)) {
          break
        }
        if (index - i < 0) {
          break
        }

        if (isWhite(boardstate, index - i)) {
          legalMoveList.push(index - i)
          break
        }

        if (isBlack(boardstate, index - i)) {
          break
        }

        if (!borderTop.includes(index - i)) {
          legalMoveList.push(index - i)
          continue
        }
        legalMoveList.push(index - i)
        break
      }

      // RIGHT
      for (let i = 1; i < 8; i++) {
        if (borderRight.includes(index)) {
          break
        }
        if (index + i > 63) {
          break
        }

        if (isWhite(boardstate, index + i)) {
          legalMoveList.push(index + i)
          break
        }

        if (isBlack(boardstate, index + i)) {
          break
        }

        if (!borderTop.includes(index + i)) {
          legalMoveList.push(index + i)
          continue
        }
        legalMoveList.push(index + i)
        break
      }
      break
    }

    case 'R': {
      // DOWN
      for (let i = 1; i < 8; i++) {
        if (borderBottom.includes(index)) {
          break
        }
        if (index + size * i > 63) {
          break
        }

        if (isBlack(boardstate, index + size * i)) {
          legalMoveList.push(index + size * i)
          break
        }

        if (isWhite(boardstate, index + size * i)) {
          break
        }

        if (!borderBottom.includes(index + size * i)) {
          legalMoveList.push(index + size * i)
          continue
        }
        legalMoveList.push(index + size * i)
        break
      }

      // UP
      for (let i = 1; i < 8; i++) {
        if (borderTop.includes(index)) {
          break
        }
        if (index - size * i < 0) {
          break
        }

        if (isBlack(boardstate, index - size * i)) {
          legalMoveList.push(index - size * i)
          break
        }

        if (isWhite(boardstate, index - size * i)) {
          break
        }

        if (!borderTop.includes(index - size * i)) {
          legalMoveList.push(index - size * i)
          continue
        }
        legalMoveList.push(index - size * i)
        break
      }

      // LEFT
      for (let i = 1; i < 8; i++) {
        if (borderLeft.includes(index)) {
          break
        }
        if (index - i < 0) {
          break
        }

        if (isBlack(boardstate, index - i)) {
          legalMoveList.push(index - i)
          break
        }

        if (isWhite(boardstate, index - i)) {
          break
        }

        if (!borderTop.includes(index - i)) {
          legalMoveList.push(index - i)
          continue
        }
        legalMoveList.push(index - i)
        break
      }

      // RIGHT
      for (let i = 1; i < 8; i++) {
        if (borderRight.includes(index)) {
          break
        }
        if (index + i > 63) {
          break
        }

        if (isBlack(boardstate, index + i)) {
          legalMoveList.push(index + i)
          break
        }

        if (isWhite(boardstate, index + i)) {
          break
        }

        if (!borderTop.includes(index + i)) {
          legalMoveList.push(index + i)
          continue
        }
        legalMoveList.push(index + i)
        break
      }
      break
    }

    case 'n': {
      // DOWN RIGHT
      (() => {
        if (borderBottom.concat(borderInnerBottom, borderRight).includes(index)) {
        return
        }

      if (isWhite(boardstate, index + size * 2 + 1)) {
        return legalMoveList.push(index + size * 2 + 1)
      }

      if (isBlack(boardstate, index + size * 2 + 1)) {
        return
      }

      legalMoveList.push(index + size * 2 + 1)
      })();

      // DOWN LEFT
      (() => {
        if (borderBottom.concat(borderInnerBottom, borderLeft).includes(index)) {
          return
        }
        if (index + size * 2 - 1 > 63) {
          return
        }

        if (isWhite(boardstate, index + size * 2 - 1)) {
          legalMoveList.push(index + size * 2 - 1)
          return
        }

        if (isBlack(boardstate, index + size * 2 - 1)) {
          return
        }

        legalMoveList.push(index + size * 2 - 1)
      })();

      // UP RIGHT
      (() => {
        if (borderTop.concat(borderInnerTop, borderRight).includes(index)) {
          return
        }
        if (index - size * 2 + 1 < 0) {
          return
        }

        if (isWhite(boardstate, index - size * 2 + 1)) {
          legalMoveList.push(index - size * 2 + 1)
          return
        }

        if (isBlack(boardstate, index - size * 2 + 1)) {
          return
        }

        legalMoveList.push(index - size * 2 + 1)
      })();

      // UP LEFT
      (() => {
        if (borderTop.concat(borderInnerTop, borderLeft).includes(index)) {
          return
        }
        if (index - size * 2 - 1 < 0) {
          return
        }

        if (isWhite(boardstate, index - size * 2 - 1)) {
          legalMoveList.push(index - size * 2 - 1)
          return
        }

        if (isBlack(boardstate, index - size * 2 - 1)) {
          return
        }

        legalMoveList.push(index - size * 2 - 1)
      })();

      // LEFT UP
      (() => {
        if (borderTop.concat(borderInnerLeft, borderLeft).includes(index)) {
          return
        }
        if (index - size - 2 < 0) {
          return
        }

        if (isWhite(boardstate, index - size - 2)) {
          legalMoveList.push(index - size - 2)
          return
        }

        if (isBlack(boardstate, index - size - 2)) {
          return
        }

        legalMoveList.push(index - size - 2)
      })();

      // LEFT DOWN
      (() => {
        if (borderBottom.concat(borderInnerLeft, borderLeft).includes(index)) {
          return
        }
        if (index + size - 2 > 63) {
          return
        }

        if (isWhite(boardstate, index + size - 2)) {
          legalMoveList.push(index + size - 2)
          return
        }

        if (isBlack(boardstate, index + size - 2)) {
          return
        }

        legalMoveList.push(index + size - 2)
      })();

      // RIGHT DOWN
      (() => {
        if (borderBottom.concat(borderInnerRight, borderRight).includes(index)) {
          return
        }
        if (index + size + 2 > 63) {
          return
        }

        if (isWhite(boardstate, index + size + 2)) {
          legalMoveList.push(index + size + 2)
          return
        }

        if (isBlack(boardstate, index + size + 2)) {
          return
        }

        legalMoveList.push(index + size + 2)
      })();

      // RIGHT UP
      (() => {
        if (borderTop.concat(borderInnerRight, borderRight).includes(index)) {
          return
        }
        if (index - size + 2 < 0) {
          return
        }

        if (isWhite(boardstate, index - size + 2)) {
          legalMoveList.push(index - size + 2)
          return
        }

        if (isBlack(boardstate, index - size + 2)) {
          return
        }

        legalMoveList.push(index - size + 2)
      })();
      break
    }

    case 'N': {
      // DOWN RIGHT
      (() => {
        if (borderBottom.concat(borderInnerBottom, borderRight).includes(index)) {
        return
      }

      if (isBlack(boardstate, index + size * 2 + 1)) {
        return legalMoveList.push(index + size * 2 + 1)
      }

      if (isWhite(boardstate, index + size * 2 + 1)) {
        return
      }

      legalMoveList.push(index + size * 2 + 1)
      })();

      // DOWN LEFT
      (() => {
        if (borderBottom.concat(borderInnerBottom, borderLeft).includes(index)) {
          return
        }
        if (index + size * 2 - 1 > 63) {
          return
        }

        if (isBlack(boardstate, index + size * 2 - 1)) {
          legalMoveList.push(index + size * 2 - 1)
          return
        }

        if (isWhite(boardstate, index + size * 2 - 1)) {
          return
        }

        legalMoveList.push(index + size * 2 - 1)
      })();

      // UP RIGHT
      (() => {
        if (borderTop.concat(borderInnerTop, borderRight).includes(index)) {
          return
        }
        if (index - size * 2 + 1 < 0) {
          return
        }

        if (isBlack(boardstate, index - size * 2 + 1)) {
          legalMoveList.push(index - size * 2 + 1)
          return
        }

        if (isWhite(boardstate, index - size * 2 + 1)) {
          return
        }

        legalMoveList.push(index - size * 2 + 1)
      })();

      // UP LEFT
      (() => {
        if (borderTop.concat(borderInnerTop, borderLeft).includes(index)) {
          return
        }
        if (index - size * 2 - 1 < 0) {
          return
        }

        if (isBlack(boardstate, index - size * 2 - 1)) {
          legalMoveList.push(index - size * 2 - 1)
          return
        }

        if (isWhite(boardstate, index - size * 2 - 1)) {
          return
        }

        legalMoveList.push(index - size * 2 - 1)
      })();

      // LEFT UP
      (() => {
        if (borderTop.concat(borderInnerLeft, borderLeft).includes(index)) {
          return
        }
        if (index - size - 2 < 0) {
          return
        }

        if (isBlack(boardstate, index - size - 2)) {
          legalMoveList.push(index - size - 2)
          return
        }

        if (isWhite(boardstate, index - size - 2)) {
          return
        }

        legalMoveList.push(index - size - 2)
      })();

      // LEFT DOWN
      (() => {
        if (borderBottom.concat(borderInnerLeft, borderLeft).includes(index)) {
          return
        }

        if (index + size - 2 > 63) {
          return
        }

        if (isBlack(boardstate, index + size - 2)) {
          legalMoveList.push(index + size - 2)
          return
        }

        if (isWhite(boardstate, index + size - 2)) {
          return
        }

        legalMoveList.push(index + size - 2)
      })();

      // RIGHT DOWN
      (() => {
        if (borderBottom.concat(borderInnerRight, borderRight).includes(index)) {
          return
        }
        if (index + size + 2 > 63) {
          return
        }

        if (isBlack(boardstate, index + size + 2)) {
          legalMoveList.push(index + size + 2)
          return
        }

        if (isWhite(boardstate, index + size + 2)) {
          return
        }

        legalMoveList.push(index + size + 2)
      })();

      // RIGHT UP
      (() => {
        if (borderTop.concat(borderInnerRight, borderRight).includes(index)) {
          return
        }
        if (index - size + 2 < 0) {
          return
        }

        if (isBlack(boardstate, index - size + 2)) {
          legalMoveList.push(index - size + 2)
          return
        }

        if (isWhite(boardstate, index - size + 2)) {
          return
        }

        legalMoveList.push(index - size + 2)
      })();

      break
    }

    case 'k': {
      // DOWN RIGHT
      (() => {
        if (borderBottom.concat(borderRight).includes(index)) {
        return
      }

      if (isWhite(boardstate, index + size + 1)) {
        return legalMoveList.push(index + size + 1)
      }

      if (isBlack(boardstate, index + size + 1)) {
        return
      }

      legalMoveList.push(index + size + 1)
      })();

      // DOWN LEFT
      (() => {
        if (borderBottom.concat(borderInnerBottom, borderLeft).includes(index)) {
          return
        }

        if (isWhite(boardstate, index + size - 1)) {
          legalMoveList.push(index + size - 1)
          return
        }

        if (isBlack(boardstate, index + size - 1)) {
          return
        }

        legalMoveList.push(index + size - 1)
      })();

      // UP RIGHT
      (() => {
        if (borderTop.concat(borderInnerTop, borderRight).includes(index)) {
          return
        }

        if (isWhite(boardstate, index - size + 1)) {
          legalMoveList.push(index - size + 1)
          return
        }

        if (isBlack(boardstate, index - size + 1)) {
          return
        }

        legalMoveList.push(index - size + 1)
      })();

      // UP LEFT
      (() => {
        if (borderTop.concat(borderInnerTop, borderLeft).includes(index)) {
          return
        }

        if (isWhite(boardstate, index - size - 1)) {
          legalMoveList.push(index - size - 1)
          return
        }

        if (isBlack(boardstate, index - size - 1)) {
          return
        }

        legalMoveList.push(index - size - 1)
      })();

      // UP
      (() => {
        if (borderTop.includes(index)) {
          return
        }

        if (isWhite(boardstate, index - size)) {
          legalMoveList.push(index - size)
          return
        }

        if (isBlack(boardstate, index - size)) {
          return
        }

        legalMoveList.push(index - size)
      })();

      // DOWN
      (() => {
        if (borderBottom.includes(index)) {
          return
        }

        if (isWhite(boardstate, index + size)) {
          legalMoveList.push(index + size)
          return
        }

        if (isBlack(boardstate, index + size)) {
          return
        }

        legalMoveList.push(index + size)
      })();

      // RIGHT
      (() => {
        if (borderBottom.concat(borderInnerRight, borderRight).includes(index)) {
          return
        }

        if (isWhite(boardstate, index + 1)) {
          legalMoveList.push(index + 1)
          return
        }

        if (isBlack(boardstate, index + 1)) {
          return
        }

        legalMoveList.push(index + 1)
      })();

      // LEFT
      (() => {
        if (borderLeft.includes(index)) {
          return
        }

        if (isWhite(boardstate, index - 1)) {
          legalMoveList.push(index - 1)
          return
        }

        if (isBlack(boardstate, index - 1)) {
          return
        }

        legalMoveList.push(index - 1)
      })();

      break
    }

    case 'K': {
      // DOWN RIGHT
      (() => {
        if (borderBottom.concat(borderRight).includes(index)) {
        return
      }

      if (isBlack(boardstate, index + size + 1)) {
        return legalMoveList.push(index + size + 1)
      }

      if (isWhite(boardstate, index + size + 1)) {
        return
      }

      legalMoveList.push(index + size + 1)
      })();

      // DOWN LEFT
      (() => {
        if (borderBottom.concat(borderInnerBottom, borderLeft).includes(index)) {
          return
        }

        if (isBlack(boardstate, index + size - 1)) {
          legalMoveList.push(index + size - 1)
          return
        }

        if (isWhite(boardstate, index + size - 1)) {
          return
        }

        legalMoveList.push(index + size - 1)
      })();

      // UP RIGHT
      (() => {
        if (borderTop.concat(borderInnerTop, borderRight).includes(index)) {
          return
        }

        if (isBlack(boardstate, index - size + 1)) {
          legalMoveList.push(index - size + 1)
          return
        }

        if (isWhite(boardstate, index - size + 1)) {
          return
        }

        legalMoveList.push(index - size + 1)
      })();

      // UP LEFT
      (() => {
        if (borderTop.concat(borderInnerTop, borderLeft).includes(index)) {
          return
        }

        if (isBlack(boardstate, index - size - 1)) {
          legalMoveList.push(index - size - 1)
          return
        }

        if (isWhite(boardstate, index - size - 1)) {
          return
        }

        legalMoveList.push(index - size - 1)
      })();

      // UP
      (() => {
        if (borderTop.includes(index)) {
          return
        }

        if (isBlack(boardstate, index - size)) {
          legalMoveList.push(index - size)
          return
        }

        if (isWhite(boardstate, index - size)) {
          return
        }

        legalMoveList.push(index - size)
      })();

      // DOWN
      (() => {
        if (borderBottom.includes(index)) {
          return
        }

        if (isBlack(boardstate, index + size)) {
          legalMoveList.push(index + size)
          return
        }

        if (isWhite(boardstate, index + size)) {
          return
        }

        legalMoveList.push(index + size)
      })();

      // RIGHT
      (() => {
        if (borderBottom.concat(borderInnerRight, borderRight).includes(index)) {
          return
        }

        if (isBlack(boardstate, index + 1)) {
          legalMoveList.push(index + 1)
          return
        }

        if (isWhite(boardstate, index + 1)) {
          return
        }

        legalMoveList.push(index + 1)
      })();

      // LEFT
      (() => {
        if (borderLeft.includes(index)) {
          return
        }

        if (isBlack(boardstate, index - 1)) {
          legalMoveList.push(index - 1)
          return
        }

        if (isWhite(boardstate, index - 1)) {
          return
        }

        legalMoveList.push(index - 1)
      })();

      break
    }

    case 'q': {
      // Down right
      for (let i = 1; i < 8; i++) {
        if (borderBottom.concat(borderRight).includes(index)) {
          continue
        }

        if (index + size * i + i > 63) {
          break
        }

        if (isWhite(boardstate, index + size * i + i)) {
          legalMoveList.push(index + size * i + i)
          break
        }

        if (isBlack(boardstate, index + size * i + i)) {
          break
        }

        if (!borderBottom.concat(borderRight).includes(index + size * i + i)) {
          legalMoveList.push(index + size * i + i)
          continue
        }

        legalMoveList.push(index + size * i + i)
        break
      }

      // Down left
      for (let i = 1; i < 8; i++) {
        if (borderBottom.concat(borderLeft).includes(index)) {
          continue
        }
        if (index + size * i - i > 63) {
          break
        }

        if (isWhite(boardstate, index + size * i - i)) {
          legalMoveList.push(index + size * i - i)
          break
        }

        if (isBlack(boardstate, index + size * i - i)) {
          break
        }

        if (!borderBottom.concat(borderLeft).includes(index + size * i - i)) {
          legalMoveList.push(index + size * i - i)
          continue
        }

        legalMoveList.push(index + size * i - i)
        break
      }

      // Up Left
      for (let i = 1; i < 8; i++) {
        if (borderTop.concat(borderLeft).includes(index)) {
          continue
        }
        if (index - size * i - i < 0) {
          break
        }

        if (isWhite(boardstate, index - size * i - i)) {
          legalMoveList.push(index - size * i - i)
          break
        }

        if (isBlack(boardstate, index - size * i - i)) {
          break
        }

        if (!borderTop.concat(borderLeft).includes(index - size * i - i)) {
          legalMoveList.push(index - size * i - i)
          continue
        }

        legalMoveList.push(index - size * i - i)
        break
      }

      // Up right
      for (let i = 1; i < 8; i++) {
        if (borderTop.concat(borderRight).includes(index)) {
          continue
        }
        if (index - size * i + i < 0){
          break
        }

        if (isWhite(boardstate, index - size * i + i)) {
          legalMoveList.push(index - size * i + i)
          break
        }

        if (isBlack(boardstate, index - size * i + i)) {
          break
        }

        if (!borderTop.concat(borderRight).includes(index - size * i + i)) {
          legalMoveList.push(index - size * i + i)
          continue
        }
        legalMoveList.push(index - size * i + i)
      }

      // DOWN
      for (let i = 1; i < 8; i++) {
        if (borderBottom.includes(index)) {
          break
        }
        if (index + size * i > 63) {
          break
        }

        if (isWhite(boardstate, index + size * i)) {
          legalMoveList.push(index + size * i)
          break
        }

        if (isBlack(boardstate, index + size * i)) {
          break
        }

        if (!borderBottom.includes(index + size * i)) {
          legalMoveList.push(index + size * i)
          continue
        }
        legalMoveList.push(index + size * i)
        break
      }

      // UP
      for (let i = 1; i < 8; i++) {
        if (borderTop.includes(index)) {
          break
        }
        if (index - size * i < 0) {
          break
        }

        if (isWhite(boardstate, index - size * i)) {
          legalMoveList.push(index - size * i)
          break
        }

        if (isBlack(boardstate, index - size * i)) {
          break
        }

        if (!borderTop.includes(index - size * i)) {
          legalMoveList.push(index - size * i)
          continue
        }
        legalMoveList.push(index - size * i)
        break
      }

      // LEFT
      for (let i = 1; i < 8; i++) {
        if (borderLeft.includes(index)) {
          break
        }
        if (index - i < 0) {
          break
        }

        if (isWhite(boardstate, index - i)) {
          legalMoveList.push(index - i)
          break
        }

        if (isBlack(boardstate, index - i)) {
          break
        }

        if (!borderTop.includes(index - i)) {
          legalMoveList.push(index - i)
          continue
        }
        legalMoveList.push(index - i)
        break
      }

      // RIGHT
      for (let i = 1; i < 8; i++) {
        if (borderRight.includes(index)) {
          break
        }
        if (index + i > 63) {
          break
        }

        if (isWhite(boardstate, index + i)) {
          legalMoveList.push(index + i)
          break
        }

        if (isBlack(boardstate, index + i)) {
          break
        }

        if (!borderTop.includes(index + i)) {
          legalMoveList.push(index + i)
          continue
        }
        legalMoveList.push(index + i)
        break
      }
      break
    }

    case 'Q': {
      // Down right
      for (let i = 1; i < 8; i++) {
        if (borderBottom.concat(borderRight).includes(index)) {
          continue
        }
        if (index + size * i + i < 0 || index + size * i + i > 63) {
          break
        }

        if (isBlack(boardstate, index + size * i + i)) {
          legalMoveList.push(index + size * i + i)
          break
        }

        if (isWhite(boardstate, index + size * i + i)) {
          break
        }

        if (!borderBottom.concat(borderRight).includes(index + size * i + i)) {
          legalMoveList.push(index + size * i + i)
          continue
        }

        legalMoveList.push(index + size * i + i)
        break
      }

      // Down left
      for (let i = 1; i < 8; i++) {
        if (borderBottom.concat(borderLeft).includes(index)) {
          continue
        }
        if (index + size * i - i < 0 || index + size * i - i > 63) {
          break
        }

        if (isBlack(boardstate, index + size * i - i)) {
          legalMoveList.push(index + size * i + i)
          break
        }

        if (isWhite(boardstate, index + size * i - i)) {
          break
        }

        if (!borderBottom.concat(borderLeft).includes(index + size * i - i)) {
          legalMoveList.push(index + size * i - i)
          continue
        }

        legalMoveList.push(index + size * i - i)
        break
      }

      // Up Left
      for (let i = 1; i < 8; i++) {
        if (borderTop.concat(borderLeft).includes(index)) {
          break
        }
        if (index - size * i - i < 0) {
          break
        }

        if (isBlack(boardstate, index - size * i - i)) {
          legalMoveList.push(index - size * i - i)
          break
        }

        if (isWhite(boardstate, index - size * i - i)) {
          break
        }

        if (!borderTop.concat(borderLeft).includes(index - size * i - i)) {
          legalMoveList.push(index - size * i - i)
          continue
        }
        
        legalMoveList.push(index - size * i - i)
        break
      }

      // Up right
      for (let i = 1; i < 8; i++) {
        if (borderTop.concat(borderRight).includes(index)) {
          break
        }
        if (index - size * i + i < 0) {
          break
        }

        if (isBlack(boardstate, index - size * i + i)) {
          legalMoveList.push(index - size * i + i)
          break
        }

        if (isWhite(boardstate, index - size * i + i)) {
          break
        }

        if (!borderTop.concat(borderRight).includes(index - size * i + i)) {
          legalMoveList.push(index - size * i + i)
          continue
        }
        legalMoveList.push(index - size * i + i)
        break
      }

      // DOWN
      for (let i = 1; i < 8; i++) {
        if (borderBottom.includes(index)) {
          break
        }
        if (index + size * i > 63) {
          break
        }

        if (isBlack(boardstate, index + size * i)) {
          legalMoveList.push(index + size * i)
          break
        }

        if (isWhite(boardstate, index + size * i)) {
          break
        }

        if (!borderBottom.includes(index + size * i)) {
          legalMoveList.push(index + size * i)
          continue
        }
        legalMoveList.push(index + size * i)
        break
      }

      // UP
      for (let i = 1; i < 8; i++) {
        if (borderTop.includes(index)) {
          break
        }
        if (index - size * i < 0) {
          break
        }

        if (isBlack(boardstate, index - size * i)) {
          legalMoveList.push(index - size * i)
          break
        }

        if (isWhite(boardstate, index - size * i)) {
          break
        }

        if (!borderTop.includes(index - size * i)) {
          legalMoveList.push(index - size * i)
          continue
        }
        legalMoveList.push(index - size * i)
        break
      }

      // LEFT
      for (let i = 1; i < 8; i++) {
        if (borderLeft.includes(index)) {
          break
        }
        if (index - i < 0) {
          break
        }

        if (isBlack(boardstate, index - i)) {
          legalMoveList.push(index - i)
          break
        }

        if (isWhite(boardstate, index - i)) {
          break
        }

        if (!borderTop.includes(index - i)) {
          legalMoveList.push(index - i)
          continue
        }
        legalMoveList.push(index - i)
        break
      }

      // RIGHT
      for (let i = 1; i < 8; i++) {
        if (borderRight.includes(index)) {
          break
        }

        if (index + i > 63) {
          break
        }

        if (isBlack(boardstate, index + i)) {
          legalMoveList.push(index + i)
          break
        }

        if (isWhite(boardstate, index + i)) {
          break
        }

        if (!borderTop.includes(index + i)) {
          legalMoveList.push(index + i)
          continue
        }
        legalMoveList.push(index + i)
        break
      }
      
      break
    }
  }
  return legalMoveList
}
</script>

<template>
  <PawnPromotion :is-white="chessStore.whiteTurn"/>
  <div class="board">
    <div @click="clickMoveHandler(index)" class="square" v-for="(_, index) in count" :key="index" :class="[{'is--odd': getIsOdd(index), 'selected': mainBoardstate[index].selected}, 'square' + index]">

      <Piece v-if="mainBoardstate[index].piece !== ''" :piece="mainBoardstate[index].piece"/>

      <div v-else-if="mainBoardstate[index].piece === ''" :class="{'show-legal-move-placeholder': mainBoardstate[index].showLegalMove}"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.board {
  width: var(--board-size);
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--board-spacing);
  margin-left: var(--board-spacing);
  margin-bottom: var(--board-spacing);
}

.square {
  width: calc(100% / 8);
  aspect-ratio: 1;
  background-color: #ff709a;  // #edc4b3
  align-items: center;
  justify-content: center;
  display: flex;

  &.is--odd {
    background-color: #ff8db5 // #774936
  }

  &.selected {
    background-color: rgba(red, .5);
  }

  .show-legal-move-placeholder {
    position: relative;
    width: 40%;
    aspect-ratio: 1;
    background-color: #70FFD5;
    opacity: 0.5;
    border-radius: 50%;
  }
}
</style>