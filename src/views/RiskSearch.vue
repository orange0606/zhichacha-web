<template>
  <div class="risk-detect-page">
    <!-- 搜索筛选区 -->
    <el-card shadow="hover" class="search-card">
      <div class="search-header">
        <div class="title-wrap">
          <i class="el-icon-s-data title-icon"></i>
          <span class="title">跨店铺账号风险检测</span>
        </div>
        <div class="quick-btns">
          <el-button size="mini" :type="quickType === 7 ? 'primary' : ''" @click="setQuickDate(7)">近7天</el-button>
          <el-button size="mini" :type="quickType === 14 ? 'primary' : ''" @click="setQuickDate(14)">近14天</el-button>
          <el-button size="mini" :type="quickType === 30 ? 'primary' : ''" @click="setQuickDate(30)">近30天</el-button>
        </div>
      </div>

      <el-form :inline="true" :model="searchForm" class="search-form" size="mini">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="pickerOptions"
            style="width: 380px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" :loading="loading" @click="handleSearch">开始检测</el-button>
          <el-button icon="el-icon-refresh-left" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="search-tip">
        <i class="el-icon-info"></i>
        系统将基于您名下所有店铺的订单数据，自动匹配全平台相同买家账号的下单记录，识别跨店铺下单、多次下单、被举报账号等风险行为
      </div>
    </el-card>

    <!-- 结果展示区 -->
    <div v-if="hasSearched" class="result-section">
      <!-- 风险概览 -->
      <el-row :gutter="16" class="overview-row">
        <el-col :span="6">
          <div class="stat-card stat-blue">
            <div class="stat-icon-wrap">
              <i class="el-icon-shop-2"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ riskInfo.userShopCount }}</div>
              <div class="stat-label">自有店铺数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-green">
            <div class="stat-icon-wrap">
              <i class="el-icon-user"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ riskInfo.riskAccountCount }}</div>
              <div class="stat-label">风险账号数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-orange">
            <div class="stat-icon-wrap">
              <i class="el-icon-document"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ riskInfo.totalOrder }}</div>
              <div class="stat-label">关联订单数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-purple">
            <div class="stat-icon-wrap">
              <i class="el-icon-share"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ riskInfo.shopCount }}</div>
              <div class="stat-label">涉及店铺数</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 折叠分组表格 -->
      <el-card shadow="hover" class="table-card">
        <div slot="header" class="table-header">
          <span>风险账号明细（点击行展开查看全库匹配订单）</span>
        </div>

        <el-table
          v-loading="loading"
          :data="groups"
          border
          size="mini"
          style="width: 100%"
          empty-text="未检测到风险账号或地址"
          :row-class-name="groupRowClassName"
          :expand-row-keys="expandRowKeys"
          row-key="rowKey"
          @expand-change="handleExpandChange"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <div class="expand-inner">
                <div class="expand-title">
                  <i class="el-icon-tickets"></i>
                  全库匹配订单（共 {{ props.row.orders.length }} 条）
                </div>
                <el-table
                  :data="props.row.orders"
                  size="mini"
                  border
                  stripe
                  class="inner-table"
                >
                  <el-table-column label="下单时间" width="140">
                    <template slot-scope="scope">
                      {{ formatFullTime(scope.row.order_time) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="order_no" label="订单号" width="135">
                    <template slot-scope="scope">
                      <span class="order-no link-text" @click="goJdOrder">{{ scope.row.order_no }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="buyer_account" label="买家账号" width="120">
                    <template slot-scope="scope">
                      <span class="link-text" style="color: #409EFF" @click="goSearch(scope.row.buyer_account)">{{ scope.row.buyer_account }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="shop_name" label="所属店铺" width="130">
                    <template slot-scope="scope">
                      <el-tag size="mini" type="info">{{ scope.row.shop_name ? $options.filters.maskShopName(scope.row.shop_name) : '-' }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="buyer_name" label="收货人" width="70" />
                  <el-table-column prop="buyer_phone" label="电话/尾号" width="90">
                    <template slot-scope="scope">
                      {{ maskPhone(scope.row.buyer_phone) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="buyer_address" label="收货地址" min-width="200" show-overflow-tooltip>
                    <template slot-scope="scope">
                      <span class="link-text" @click="goSearch(scope.row.buyer_address)">{{ scope.row.buyer_address }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="goods_name" label="商品名称" min-width="180" show-overflow-tooltip>
                    <template slot-scope="scope">
                      {{ scope.row.goods_name | maskGoodsName }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="goods_count" label="数量" width="50" align="center" />
                  <el-table-column label="金额" width="70" align="right">
                    <template slot-scope="scope">
                      <span class="amount">¥{{ Number(scope.row.pay_amount).toFixed(2) }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="风险对象" min-width="220">
            <template slot-scope="scope">
              <i :class="scope.row.groupType === 'account' ? 'el-icon-user' : 'el-icon-location-outline'" class="group-icon"></i>
              <span class="group-text link-text" @click="goSearch(scope.row.groupName)">{{ scope.row.groupName }}</span>
              <el-tag size="mini" :type="scope.row.groupType === 'account' ? 'primary' : 'success'" effect="plain" style="margin-left: 8px;">
                {{ scope.row.groupType === 'account' ? '账号' : '地址' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="最近下单时间" width="140">
            <template slot-scope="scope">
              {{ formatFullTime(scope.row.orders[0] && scope.row.orders[0].order_time) }}
            </template>
          </el-table-column>
          <el-table-column label="最新订单号" width="140">
            <template slot-scope="scope">
              <span class="order-no link-text" @click="goJdOrder">{{ scope.row.orders[0] && scope.row.orders[0].order_no }}</span>
            </template>
          </el-table-column>
          <el-table-column label="风险等级" width="100" align="center">
            <template slot-scope="scope">
              <el-tag
                size="small"
                :type="getRiskTagType(scope.row.riskLevel)"
                effect="dark"
              >
                <i :class="getRiskIcon(scope.row.riskLevel)"></i>
                {{ scope.row.riskLevelText }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="风险标记" min-width="280">
            <template slot-scope="scope">
              <el-tag
                v-for="(tag, idx) in scope.row.tags"
                :key="idx"
                size="mini"
                :type="getRiskTagType(scope.row.riskLevel)"
                effect="plain"
                style="margin: 2px;"
              >
                {{ tag }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="crossShopCount" label="涉及店铺" width="90" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" :type="scope.row.crossShopCount >= 2 ? 'danger' : 'info'">
                {{ scope.row.crossShopCount }} 家
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="totalOrderCount" label="关联订单" width="90" align="center" />
          <el-table-column prop="reportCount" label="被举报次数" width="100" align="center">
            <template slot-scope="scope">
              <span :class="{'report-count': scope.row.reportCount > 0}">
                {{ scope.row.reportCount }} 次
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 初始空状态 -->
    <el-empty v-else description="选择时间范围，开始跨店铺风险检测" class="empty-wrap">
      <i class="el-icon-s-data empty-icon"></i>
    </el-empty>
  </div>
</template>

<script>
import APP_CONFIG from '@/config'
export default {
  name: 'RiskDetect',
  data() {
    return {
      loading: false,
      hasSearched: false,
      quickType: 14,
      dateRange: [],
      groups: [],
      expandRowKeys: [],
      riskInfo: {
        userShopCount: 0,
        riskAccountCount: 0,
        totalOrder: 0,
        shopCount: 0
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  created() {
    this.setQuickDate(14)
    this.handleSearch()
  },
  methods: {
    setQuickDate(days) {
      this.quickType = days
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * (days - 1))

      const pad = n => String(n).padStart(2, '0')
      const formatStart = date => {
        const y = date.getFullYear()
        const m = pad(date.getMonth() + 1)
        const d = pad(date.getDate())
        return `${y}-${m}-${d} 00:00:00`
      }
      const formatEnd = date => {
        const y = date.getFullYear()
        const m = pad(date.getMonth() + 1)
        const d = pad(date.getDate())
        return `${y}-${m}-${d} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
      }

      this.dateRange = [formatStart(start), formatEnd(end)]
    },

    async handleSearch() {
      if (!this.dateRange || this.dateRange.length !== 2) {
        this.$message.warning('请选择完整的时间范围')
        return
      }
      this.loading = true
      this.hasSearched = true
      try {
        const res = await this.$http.post('/order/matchByAccount', {
          startTime: this.dateRange[0],
          endTime: this.dateRange[1]
        })
        const data = res.data || {}
        // 给每个分组加唯一rowKey
        this.groups = (data.groups || []).map(g => ({
          ...g,
          rowKey: g.groupType + '_' + g.groupKey
        }))
        this.riskInfo = {
          userShopCount: data.userShopCount || 0,
          riskAccountCount: data.riskAccountCount || 0,
          totalOrder: data.totalOrder || 0,
          shopCount: data.shopCount || 0
        }

        // 默认展开高风险
        this.expandRowKeys = this.groups
          .filter(g => g.riskLevel === 'high')
          .map(g => g.rowKey)

        if (this.groups.length === 0) {
          this.$message.info('未检测到风险账号')
        }
      } catch (e) {
        console.error(e)
        this.$message.error(e.response?.data?.msg || '检测失败')
      } finally {
        this.loading = false
      }
    },

    handleReset() {
      this.hasSearched = false
      this.groups = []
      this.setQuickDate(14)
      this.riskInfo = {
        userShopCount: 0,
        riskAccountCount: 0,
        totalOrder: 0,
        shopCount: 0
      }
    },

    handleExpandChange(row, expandedRows) {
      // 可以在这里做懒加载，目前不需要
    },

    formatFullTime(time) {
      if (!time) return '-'
      const d = new Date(time)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    },

    maskPhone(phone) {
      if (!phone) return '-'
      const str = String(phone)
      if (str.length < 7) return str
      return str.slice(0, 3) + '****' + str.slice(-4)
    },

    groupRowClassName({ row }) {
      if (row.riskLevel === 'high') return 'high-risk-row'
      if (row.riskLevel === 'medium') return 'medium-risk-row'
      if (row.riskLevel === 'low') return 'low-risk-row'
      return ''
    },

    getRiskTagType(level) {
      const map = { high: 'danger', medium: 'warning', low: 'info' }
      return map[level] || 'info'
    },

    getRiskIcon(level) {
      const map = { high: 'el-icon-warning', medium: 'el-icon-question', low: 'el-icon-info' }
      return map[level] || 'el-icon-info'
    },

    // 跳转到京东订单列表
    goJdOrder() {
      window.open(APP_CONFIG.JD_ORDER_LIST_URL, '_blank')
    },
    // 跳转到全部举报搜索
    goSearch(keyword) {
      if (!keyword) return
      this.$router.push({
        path: '/reportManage',
        query: { keyword: keyword, tab: 'all' }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.risk-detect-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 80px);

  .search-card {
    margin-bottom: 20px;
    border-radius: 8px;

    .search-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .title-wrap {
        display: flex;
        align-items: center;
        gap: 10px;

        .title-icon {
          font-size: 22px;
          color: #409EFF;
        }

        .title {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }
      }
    }

    .search-form {
      margin-bottom: 12px;
    }

    .search-tip {
      color: #909399;
      font-size: 13px;
      padding-top: 12px;
      border-top: 1px solid #ebeef5;
      line-height: 1.6;

      i {
        color: #409EFF;
        margin-right: 4px;
      }
    }
  }

  .result-section {
    .overview-row {
      margin-bottom: 20px;

      .stat-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        border-radius: 8px;
        color: #fff;
        position: relative;
        overflow: hidden;

        &::after {
          content: '';
          position: absolute;
          right: -20px;
          top: -20px;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
        }

        .stat-icon-wrap {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          z-index: 1;
        }

        .stat-info {
          z-index: 1;

          .stat-value {
            font-size: 28px;
            font-weight: bold;
            line-height: 1.2;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 13px;
            opacity: 0.9;
          }
        }

        &.stat-blue {
          background: linear-gradient(135deg, #667eea 0%, #409EFF 100%);
        }

        &.stat-green {
          background: linear-gradient(135deg, #11998e 0%, #67C23A 100%);
        }

        &.stat-orange {
          background: linear-gradient(135deg, #f093fb 0%, #E6A23C 100%);
        }

        &.stat-purple {
          background: linear-gradient(135deg, #8e2de2 0%, #909399 100%);
        }
      }
    }

    .table-card {
      border-radius: 8px;

      .table-header {
        font-weight: 600;
      }

      .account-text {
        color: #409EFF;
        font-weight: 500;
      }

      .group-icon {
        color: #909399;
        margin-right: 6px;
        font-size: 15px;
      }
      .group-text {
        color: #303133;
        font-weight: 500;
      }
      .link-text {
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }
      .order-no {
        color: #409EFF;
        font-family: monospace;
        font-size: 13px;
      }

      .amount {
        color: #f56c6c;
        font-weight: 600;
      }

      .report-count {
        color: #f56c6c;
        font-weight: 600;
      }

      // 展开内容
      .expand-inner {
        padding: 8px 20px 16px 50px;
        background: #fafafa;

        .expand-title {
          font-size: 13px;
          color: #606266;
          margin-bottom: 10px;
          font-weight: 500;

          i {
            margin-right: 4px;
            color: #409EFF;
          }
        }

        .inner-table {
          background: #fff;
        }
      }

      ::v-deep .high-risk-row {
        background-color: #fef0f0 !important;
      }
      ::v-deep .medium-risk-row {
        background-color: #fdf6ec !important;
      }
      ::v-deep .low-risk-row {
        background-color: #f4f4f5 !important;
      }
    }
  }

  .empty-wrap {
    padding: 80px 0;

    .empty-icon {
      font-size: 72px;
      color: #dcdfe6;
      margin-bottom: 16px;
    }
  }
}
</style>
