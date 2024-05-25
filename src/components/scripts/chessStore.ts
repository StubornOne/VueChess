import { defineStore } from "pinia"
import { ref } from "vue"

export const useChessStore = defineStore('chessStore', () => {
  const whiteTurn = ref(true)
  const lastMove = ref('')

  function nextTurn() {
    whiteTurn.value = !whiteTurn.value
  }

  function setLastMove(move: string) {
    lastMove.value = move
  }

  return {whiteTurn, lastMove}
})