<template>
  <div class="panel panel-shop">
    <div class="panel-header">
      <h3>🏪 店铺订单统计</h3>
      <el-radio-group v-model="innerRange" size="mini" @change="handleRangeChange">
        <el-radio-button label="today">今日</el-radio-button>
        <el-radio-button label="yesterday">昨日</el-radio-button>
        <el-radio-button label="7d">近7天</el-radio-button>
        <el-radio-button label="15d">近15天</el-radio-button>
        <el-radio-button label="30d">近30天</el-radio-button>
      </el-radio-group>
    </div>
    <div class="panel-body">
      <div class="shop-total-bar">
        <span>合计：<b>{{ data.totalCount }}</b> 单</span>
        <span>金额：<b>¥{{ formatMoney(data.totalAmount) }}</b></span>
      </div>
      <div class="shop-list">
        <div v-for="shop in data.list" :key="shop.shopId" class="shop-item">
          <div class="shop-name">{{ shop.shopName | maskShopName }}</div>
          <div class="shop-bar-wrap">
            <div
              class="shop-bar"
              :style="{ width: getBarWidth(shop.orderCount) + '%' }"
            ></div>
          </div>
          <div class="shop-meta">
            <span class="shop-count">{{ shop.orderCount }} 单</span>
            <span class="shop-amount">¥{{ formatMoney(shop.orderAmount) }}</span>
          </div>
        </div>
        <el-empty v-if="data.list.length === 0" description="暂无数据" :image-size="60" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShopStats',
  props: {
    range: { type: String, default: 'today' },
    data: {
      type: Object,
      default: () => ({ list: [], totalCount: 0, totalAmount: 0 })
    }
  },
  data() {
    return {
      innerRange: this.range
    }
  },
  watch: {
    range(val) {
      this.innerRange = val
    }
  },
  methods: {
    handleRangeChange(val) {
      this.innerRange = val
      this.$emit('update:range', val)
      this.$emit('range-change', val)
    },
    getBarWidth(count) {
      const max = Math.max(...this.data.list.map(s => s.orderCount), 1)
      return Math.round((count / max) * 100)
    },
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
.panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #303133;
    }
  }

  .panel-body {
    padding: 16px 20px;
  }
}

.shop-total-bar {
  display: flex;
  gap: 24px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;

  b {
    color: #f56c6c;
    font-size: 16px;
    margin: 0 4px;
  }
}

.shop-list {
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
    &:hover {
      background: #909399;
    }
  }
}

.shop-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .shop-name {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .shop-bar-wrap {
    height: 8px;
    background: #f0f2f5;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 6px;
  }

  .shop-bar {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  .shop-meta {
    display: flex;
    justify-content: space-between;
    font-size: 13px;

    .shop-count {
      color: #606266;
    }
    .shop-amount {
      color: #f56c6c;
      font-weight: 600;
    }
  }
}
</style>
