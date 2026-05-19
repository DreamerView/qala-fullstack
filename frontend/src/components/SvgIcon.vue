<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    class="svg-icon"
    :style="iconStyle"
    aria-hidden="true"
  />
</template>

<script setup>
import { computed } from 'vue'

import InstagramIcon from '@/assets/icons/instagram.svg'

import HomeIcon from '@/assets/icons/home.svg'
import HomeFillIcon from '@/assets/icons/home-fill.svg'

import ReelsIcon from '@/assets/icons/reels.svg'
import ReelsFillIcon from '@/assets/icons/reels-fill.svg'

import SendIcon from '@/assets/icons/send.svg'
import SendFillIcon from '@/assets/icons/send-fill.svg'

import SearchIcon from '@/assets/icons/search.svg'
import SearchFillIcon from '@/assets/icons/search-fill.svg'

import CompassIcon from '@/assets/icons/compass.svg'
import CompassFillIcon from '@/assets/icons/compass-fill.svg'

import HeartIcon from '@/assets/icons/heart.svg'
import HeartFillIcon from '@/assets/icons/heart-fill.svg'

import PlusIcon from '@/assets/icons/plus.svg'
import PlusFillIcon from '@/assets/icons/plus-fill.svg'

import ChartIcon from '@/assets/icons/chart.svg'
import ChartFillIcon from '@/assets/icons/chart-fill.svg'

import UserCircleIcon from '@/assets/icons/user-circle.svg'
import UserCircleFillIcon from '@/assets/icons/user-circle-fill.svg'

import MenuIcon from '@/assets/icons/menu.svg'
import GridIcon from '@/assets/icons/grid.svg'
import MoreIcon from '@/assets/icons/more.svg'

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg"

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 24,
  },
})

const icons = {
  instagram: InstagramIcon,

  home: HomeIcon,
  'home-fill': HomeFillIcon,

  reels: ReelsIcon,
  'reels-fill': ReelsFillIcon,

  send: SendIcon,
  'send-fill': SendFillIcon,

  search: SearchIcon,
  'search-fill':SearchFillIcon,

  compass: CompassIcon,
  'compass-fill': CompassFillIcon,

  heart: HeartIcon,
  'heart-fill': HeartFillIcon,

  plus: PlusIcon,
  'plus-fill': PlusFillIcon,

  chart: ChartIcon,
  'chart-fill': ChartFillIcon,

  'user-circle': UserCircleIcon,
  'user-circle-fill': UserCircleFillIcon,
  'arrow-left':ArrowLeftIcon,

  menu: MenuIcon,
  grid: GridIcon,
  more: MoreIcon,
}

const iconComponent = computed(() => icons[props.name] || null)

const iconStyle = computed(() => {
  const value = typeof props.size === 'number' ? `${props.size}px` : props.size

  return {
    width: value,
    height: value,
  }
})
</script>

<style scoped>
.svg-icon {
  display: block;
  flex-shrink: 0;
  color: currentColor;
}

.svg-icon :deep(*) {
  vector-effect: non-scaling-stroke;
}
</style>