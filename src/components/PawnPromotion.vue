<script lang="ts" setup>
import RookBlack from '@/assets/svgs/figures/RookBlack.svg?component'
import RookWhite from '@/assets/svgs/figures/RookWhite.svg?component'
import KnightBlack from '@/assets/svgs/figures/KnightBlack.svg?component'
import KnightWhite from '@/assets/svgs/figures/KnightWhite.svg?component'
import QueenBlack from '@/assets/svgs/figures/QueenBlack.svg?component'
import QueenWhite from '@/assets/svgs/figures/QueenWhite.svg?component'
import BishopBlack from '@/assets/svgs/figures/BishopBlack.svg?component'
import BishopWhite from '@/assets/svgs/figures/BishopWhite.svg?component'
import ImageSelect from '@/components/ImageSelect.vue'
import { ref, type Component } from 'vue'

interface Item {
  value: string,
  image: Component
}

const props = defineProps<{
  isWhite: boolean
}>()

const promoteModel = ref('')

let itemChoices: Item[] = []

if (props.isWhite) {
  itemChoices = [{value: 'Q', image: QueenWhite}, {value: 'R', image: RookWhite}, {value: 'N', image: KnightWhite}]
} else {
  itemChoices = [{value: 'q', image: QueenWhite}, {value: 'r', image: RookWhite}, {value: 'n', image: KnightWhite}]
}

</script>

<template>
  <dialog id="promotionPicker">
    <form>
      <ImageSelect v-if="isWhite" v-model="promoteModel" :items="itemChoices" />
      <ImageSelect v-else v-model="promoteModel" :items="itemChoices" />
    </form>
  </dialog>
</template>

<style lang="scss" scoped>
.pawn-promotion-picker {
  display: flex;
  position: relative;
}
</style>