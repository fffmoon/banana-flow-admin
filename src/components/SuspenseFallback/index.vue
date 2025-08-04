<template>
  <div class="loading-container">
    <div class="loading-icon">
      <i class="i-svg-spinners-blocks-wave" />
    </div>

    <div class="loading-text">
      <h2>加载中</h2>

      <span>请稍等...</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .loading-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    color: #333;

    .dark & {
      background-color: #1a1a1a;
      color: #fff;
    }

    .loading-icon {
      font-size: 7rem;
      opacity: 0.7;
    }

    .loading-text {
      margin-top: 1rem;
      text-align: center;

      h2 {
        font-size: 4rem;
      }

      span {
        display: block;
      }
    }
  }
</style>
