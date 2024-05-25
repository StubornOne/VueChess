<script lang="ts" setup>
import { type Component } from 'vue'

import BishopBlack from '@/assets/svgs/figures/BishopBlack.svg?component'
import BishopWhite from '@/assets/svgs/figures/BishopWhite.svg?component'
import PawnBlack from '@/assets/svgs/figures/PawnBlack.svg?component'
import PawnWhite from '@/assets/svgs/figures/PawnWhite.svg?component'
import RookBlack from '@/assets/svgs/figures/RookBlack.svg?component'
import RookWhite from '@/assets/svgs/figures/RookWhite.svg?component'
import KnightBlack from '@/assets/svgs/figures/KnightBlack.svg?component'
import KnightWhite from '@/assets/svgs/figures/KnightWhite.svg?component'
import QueenBlack from '@/assets/svgs/figures/QueenBlack.svg?component'
import QueenWhite from '@/assets/svgs/figures/QueenWhite.svg?component'
import KingBlack from '@/assets/svgs/figures/KingBlack.svg?component'
import KingWhite from '@/assets/svgs/figures/KingWhite.svg?component'

defineProps<{
  piece: string
}>()

const images: Record<string, Component> = {
  p: PawnBlack,
  P: PawnWhite,
  b: BishopBlack,
  B: BishopWhite,
  n: KnightBlack,
  N: KnightWhite,
  r: RookBlack,
  R: RookWhite,
  q: QueenBlack,
  Q: QueenWhite,
  k: KingBlack,
  K: KingWhite
}

</script>

<template>
  <div v-if="piece !== ''" class="piece">
    <component class="svg" :is="images[piece]" />
  </div>
</template>

<style lang="scss" scoped>
.piece {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  .svg {
    position: relative;
    width: 80%;
    height: 80%;
    top: 3%;
    z-index: 10;
  }
}
</style>