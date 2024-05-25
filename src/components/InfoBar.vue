<script setup lang="ts">
import { useChessStore } from './scripts/chessStore'
const chessStore = useChessStore()
</script>

<template>
  <div class="infobar">
    <div v-if="chessStore.whiteTurn === true" class="turn">
      <span>White's turn</span>
    </div>
    <div v-else class="turn">
      <span>Black's turn</span>
    </div>

    <span>Moves:</span>
    <div class="move-list">

    </div>
  </div>
</template>

<style lang="scss" scoped>
.infobar {
  position: fixed;
  display: block;
  top: calc((100% - var(--infobar-height)) / 2);
  right: 3%;
  height: var(--infobar-height);
  width: var(--infobar-width);
  background-color: var(--color-infobar-bkg);
  border-radius: 15px;
}

.turn, .turn span {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-weight: 700;
  font-size: 2vw;
}

.move-list {

}
</style>