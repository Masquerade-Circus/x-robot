

<script>
export default {
  props: ['direction', 'justify', 'align', 'wrap'],
}
</script>

<template>
  <div class="flex {{ direction }} {{ justify }} {{ align }} {{ wrap }}">
    <slot></slot>
  </div>
</template>

<style>
.flex {
  display: flex;
}

.column {
  flex-direction: column;
}

.row {
  flex-direction: row;
}

.wrap {
  flex-wrap: wrap;
}

.nowrap {
  flex-wrap: nowrap;
}

.justify-start {
  justify-content: flex-start;
}

.justify-end {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-around {
  justify-content: space-around;
}

.align-start {
  align-items: flex-start;
}

.align-end {
  align-items: flex-end;
}

.align-center {
  align-items: center;
}

.align-baseline {
  align-items: baseline;
}

.align-stretch {
  align-items: stretch;
}


</style>
