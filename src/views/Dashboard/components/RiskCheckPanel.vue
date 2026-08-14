<template>
  <div class="panel panel-risk">
    <div class="panel-header">
      <h3>⚠️ 风险订单检测</h3>
      <el-radio-group v-model="innerRange" size="mini" @change="handleRangeChange">
        <el-radio-button label="today">今日</el-radio-button>
        <el-radio-button label="yesterday">昨日</el-radio-button>
        <el-radio-button label="7d">近7天</el-radio-button>
        <el-radio-button label="15d">近15天</el-radio-button>
        <el-radio-button label="30d">近30天</el-radio-button>
      </el-radio-group>
    </div>
    <div class="panel-body risk-body">
      <!-- 左侧统计 -->
      <div class="risk-stats">
        <div class="risk-stat-item risk-all">
          <div class="risk-stat-num">{{ data.summary.total }}</div>
          <div class="risk-stat-label">风险订单总数</div>
        </div>
        <div class="risk-stat-item risk-high">
          <div class="risk-stat-num">{{ data.summary.high }}</div>
          <div class="risk-stat-label">高风险/打假</div>
        </div>
        <div class="risk-stat-item risk-medium">
          <div class="risk-stat-num">{{ data.summary.medium }}</div>
          <div class="risk-stat-label">中风险</div>
        </div>
        <div class="risk-stat-item risk-low">
          <div class="risk-stat-num">{{ data.summary.low }}</div>
          <div class="risk-stat-label">低风险</div>
        </div>
      </div>
      <!-- 右侧列表 -->
      <div class="risk-table-wrap">
        <el-table
          :data="data.list"
          size="mini"
          border
          stripe
          height="380"
          empty-text="暂无风险订单，一切正常 🎉"
        >
          <el-table-column prop="orderNo" label="订单号" width="155">
            <template slot-scope="scope">
              <span class="order-no link-text" @click="goJdOrder">{{ scope.row.orderNo }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="shopName" label="店铺" width="120" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.shopName | maskShopName }}
            </template>
          </el-table-column>
          <el-table-column prop="buyerAccount" label="买家账号" width="135">
            <template slot-scope="scope">
              <span class="link-text" @click="goSearch(scope.row.buyerAccount)">{{ scope.row.buyerAccount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="收货信息" min-width="200">
            <template slot-scope="scope">
              <div>{{ scope.row.buyerName }} {{ scope.row.buyerPhone }}</div>
              <div class="risk-addr link-text" @click="goSearch(scope.row.buyerAddress)">{{ scope.row.buyerAddress }}</div>
            </template>
          </el-table-column>
          <el-table-column label="下单时间" width="145">
            <template slot-scope="scope">
              {{ formatFullTime(scope.row.orderTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="goodsName" label="商品名称" min-width="180" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.goodsName | maskGoodsName }}
            </template>
          </el-table-column>
          <el-table-column label="金额" width="85" align="right">
            <template slot-scope="scope">
              <span class="risk-amount">¥{{ scope.row.payAmount.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="风险等级" width="85" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" :type="getRiskTagType(scope.row.riskLevel)">
                {{ getRiskLevelText(scope.row.riskLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="风险标记" min-width="230">
            <template slot-scope="scope">
              <div class="risk-tags">
                <el-tag
                  v-for="(tag, idx) in scope.row.tags"
                  :key="idx"
                  size="mini"
                  :type="getRiskTagType(scope.row.riskLevel)"
                  effect="plain"
                  style="margin: 2px; cursor: pointer;"
                  @click="goRiskSearch"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import APP_CONFIG from '@/config'
export default {
  name: 'RiskCheckPanel',
  props: {
    range: { type: String, default: 'today' },
    data: {
      type: Object,
      default: () => ({ summary: { total: 0, high: 0, medium: 0, low: 0, fake: 0 }, list: [] })
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
    getRiskTagType(level) {
      const map = { high: 'danger', medium: 'warning', low: 'info' }
      return map[level] || 'info'
    },
    getRiskLevelText(level) {
      const map = { high: '高风险', medium: '中风险', low: '低风险' }
      return map[level] || '未知'
    },
    formatFullTime(time) {
      if (!time) return ''
      const d = new Date(time)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },
    goSearch(keyword) {
      if (!keyword) return
      this.$router.push({
        path: '/reportManage',
        query: { keyword: keyword, tab: 'all' }
      })
    },
    goJdOrder() {
      window.open(APP_CONFIG.JD_ORDER_LIST_URL, '_blank')
    },
    goRiskSearch() {
      this.$router.push('/riskSearch')
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

.risk-body {
  display: flex;
  gap: 20px;
  padding: 0;
}

.risk-stats {
  width: 160px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.risk-stat-item {
  text-align: center;
  padding: 12px 8px;
  border-radius: 8px;
  color: #fff;

  .risk-stat-num {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
  }
  .risk-stat-label {
    font-size: 12px;
    opacity: 0.9;
    margin-top: 4px;
  }

  &.risk-all {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  &.risk-high {
    background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  }
  &.risk-medium {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }
  &.risk-low {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
}

.risk-table-wrap {
  flex: 1;
  min-width: 0;

  .risk-addr {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }
  .link-text {
    cursor: pointer;
    color: #409EFF;
    &:hover {
      text-decoration: underline;
    }
  }
  .order-no {
    font-family: monospace;
    font-size: 13px;
  }
  .risk-amount {
    color: #f56c6c;
    font-weight: 600;
  }
  .risk-tags {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
