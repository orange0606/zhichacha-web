<template>
  <div class="dashboard" v-loading="loading">
    <!-- 顶部标题 -->
    <div class="dashboard-header">
      <h2>📊 智查查数据看板</h2>
      <div class="header-right">
        <span class="update-time">数据更新：{{ updateTime }}</span>
        <el-button size="mini" icon="el-icon-refresh" @click="loadAll">刷新</el-button>
      </div>
    </div>

    <!-- 统计卡片行 -->
    <StatCards :data="overview" />

    <!-- 主体内容 -->
    <div class="dashboard-main">
      <ShopStats
        :range.sync="range"
        :data="shopStats"
        @range-change="onShopRangeChange"
      />
      <RecentReports :list="recentReports" />
    </div>

    <!-- 风险检测 -->
    <RiskCheckPanel
      :range.sync="riskRange"
      :data="riskData"
      @range-change="onRiskRangeChange"
    />
  </div>
</template>

<script>
import StatCards from './components/StatCards.vue'
import ShopStats from './components/ShopStats.vue'
import RecentReports from './components/RecentReports.vue'
import RiskCheckPanel from './components/RiskCheckPanel.vue'

export default {
  name: 'Dashboard',
  components: { StatCards, ShopStats, RecentReports, RiskCheckPanel },
  data() {
    return {
      loading: false,
      updateTime: '',
      range: 'today',
      riskRange: 'today',
      overview: {
        totalShops: 0,
        totalOrders: 0,
        totalAmount: 0,
        riskOrders: 0
      },
      shopStats: {
        list: [],
        totalCount: 0,
        totalAmount: 0
      },
      recentReports: [],
      riskData: {
        summary: { total: 0, high: 0, medium: 0, low: 0, fake: 0 },
        list: []
      }
    }
  },
  created() {
    this.loadAll()
  },
  methods: {
    async loadAll() {
      this.loading = true
      this.updateTime = new Date().toLocaleString('zh-CN')
      try {
        await Promise.all([
          this.loadOverview(),
          this.loadShopStats(),
          this.loadRecentReports(),
          this.loadRiskCheck()
        ])
      } finally {
        this.loading = false
      }
    },
    async loadOverview() {
      try {
        const res = await this.$http.get('/dashboard/overview')
        if (res.code === 0) {
          this.overview = res.data
        }
      } catch (e) {
        console.error(e)
      }
    },
    async loadShopStats() {
      try {
        const res = await this.$http.get('/dashboard/shop-stats', {
          params: { range: this.range }
        })
        if (res.code === 0) {
          this.shopStats = res.data
        }
      } catch (e) {
        console.error(e)
      }
    },
    async loadRecentReports() {
      try {
        const res = await this.$http.get('/dashboard/recent-reports')
        if (res.code === 0) {
          this.recentReports = res.data
        }
      } catch (e) {
        console.error(e)
      }
    },
    async loadRiskCheck() {
      try {
        const res = await this.$http.get('/dashboard/risk-check', {
          params: { range: this.riskRange }
        })
        if (res.code === 0) {
          this.riskData = res.data
        }
      } catch (e) {
        console.error(e)
      }
    },
    onShopRangeChange(val) {
      this.range = val
      this.loadShopStats()
    },
    onRiskRangeChange(val) {
      this.riskRange = val
      this.loadRiskCheck()
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  min-height: calc(100vh - 120px);

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #909399;
      font-size: 13px;
    }
  }

  // 主体布局
  .dashboard-main {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
}
</style>
