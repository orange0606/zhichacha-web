<template>
  <div class="stat-cards">
    <div class="stat-card stat-shop">
      <div class="stat-icon"><i class="el-icon-s-shop"></i></div>
      <div class="stat-info">
        <div class="stat-value">{{ data.totalShops }}</div>
        <div class="stat-label">我的店铺</div>
      </div>
    </div>
    <div class="stat-card stat-order">
      <div class="stat-icon"><i class="el-icon-document"></i></div>
      <div class="stat-info">
        <div class="stat-value">{{ data.totalOrders }}</div>
        <div class="stat-label">累计订单</div>
      </div>
    </div>
    <div class="stat-card stat-amount">
      <div class="stat-icon"><i class="el-icon-money"></i></div>
      <div class="stat-info">
        <div class="stat-value">¥{{ formatMoney(data.totalAmount) }}</div>
        <div class="stat-label">累计交易额</div>
      </div>
    </div>
    <div class="stat-card stat-risk">
      <div class="stat-icon"><i class="el-icon-warning-outline"></i></div>
      <div class="stat-info">
        <div class="stat-value">{{ data.riskOrders }}</div>
        <div class="stat-label">风险订单</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatCards',
  props: {
    data: {
      type: Object,
      default: () => ({ totalShops: 0, totalOrders: 0, totalAmount: 0, riskOrders: 0 })
    }
  },
  methods: {
    formatMoney(num) {
      return Number(num || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  color: #fff;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-4px);
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 120px;
    height: 120px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    backdrop-filter: blur(10px);
  }

  .stat-info {
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.2;
    }
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 4px;
    }
  }

  &.stat-shop {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  &.stat-order {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  &.stat-amount {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  &.stat-risk {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }
}
</style>
