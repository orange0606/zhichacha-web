<template>
  <div class="risk-search-page">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form" size="mini">
        <el-form-item label="搜索类型">
          <el-radio-group v-model="searchForm.type">
            <el-radio label="account">买家账号</el-radio>
            <el-radio label="address">收货地址</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            :placeholder="searchForm.type === 'account' ? '请输入买家账号' : '请输入收货地址关键词'"
            style="width: 300px"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" :loading="loading" @click="handleSearch">
            开始检测
          </el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="search-tip">
        <i class="el-icon-info"></i>
        系统将自动匹配最近14天内的订单，检测重复下单、跨店铺下单等风险行为
      </div>
    </el-card>

    <!-- 风险结果展示 -->
    <div v-if="hasSearched" class="result-section">
      <!-- 风险概览 -->
      <el-card class="risk-overview">
        <div slot="header" class="card-header">
          <span>风险检测结果</span>
          <el-tag
            :type="riskTagType"
            size="medium"
            effect="dark"
          >
            {{ riskInfo.riskLevel }}
          </el-tag>
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ riskInfo.totalOrder }}</div>
              <div class="stat-label">匹配订单数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ riskInfo.shopCount }}</div>
              <div class="stat-label">涉及店铺数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">14天</div>
              <div class="stat-label">检测时间范围</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 订单明细 -->
      <el-card v-loading="loading" class="detail-card">
        <div slot="header">
          <span>订单明细（共 {{ resultList.length }} 条）</span>
        </div>
        <el-table
          :data="resultList"
          border
          stripe
          size="mini"
          style="width: 100%"
          empty-text="未找到匹配订单"
          :row-class-name="tableRowClassName"
        >
          <el-table-column type="index" label="序号" width="45" align="center" />
          <el-table-column prop="order_time" label="下单时间" width="120">
            <template slot-scope="scope">
              {{ formatTime(scope.row.order_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="order_no" label="订单号" width="125" />
          <el-table-column prop="shop_name" label="店铺名称" width="125">
            <template slot-scope="scope">
              <el-tag size="small">{{ scope.row.shop_name | maskShopName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="buyer_account" label="买家账号" width="130">
            <template slot-scope="scope">
              <span class="highlight-text" v-html="highlightKeyword(scope.row.buyer_account)"></span>
            </template>
          </el-table-column>
          <el-table-column prop="buyer_address" label="买家地址" min-width="200" show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-html="highlightKeyword(scope.row.buyer_address)"></span>
            </template>
          </el-table-column>
          <el-table-column prop="goods_name" label="商品名称" min-width="180" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.goods_name | maskGoodsName }}
            </template>
          </el-table-column>
          <el-table-column prop="pay_amount" label="商品金额" width="80">
            <template slot-scope="scope">
              <span class="amount">¥{{ Number(scope.row.pay_amount).toFixed(2) }}</span>
            </template>
          </el-table-column>

        </el-table>
      </el-card>
    </div>

    <!-- 初始状态提示 -->
    <el-empty
      v-else
      description="输入买家账号或地址，开始风险检测"
      class="initial-empty"
    >
      <i class="el-icon-search empty-icon"></i>
    </el-empty>
  </div>
</template>

<script>
export default {
  name: 'RiskSearch',
  data() {
    return {
      loading: false,
      hasSearched: false,
      searchForm: {
        type: 'account',
        keyword: ''
      },
      resultList: [],
      riskInfo: {
        totalOrder: 0,
        shopCount: 0,
        riskLevel: '正常'
      }
    }
  },
  computed: {
    riskTagType() {
      const level = this.riskInfo.riskLevel
      if (level.includes('高危')) return 'danger'
      if (level.includes('风险')) return 'warning'
      return 'success'
    }
  },
  methods: {
    async handleSearch() {
      if (!this.searchForm.keyword.trim()) {
        this.$message.warning('请输入搜索关键词')
        return
      }
      this.loading = true
      this.hasSearched = true
      try {
        const res = await this.$http.get('/search/riskQuery', {
          params: {
            keyword: this.searchForm.keyword.trim(),
            type: this.searchForm.type
          }
        })
        this.resultList = res.data || []
        this.riskInfo = res.riskInfo || {
          totalOrder: 0,
          shopCount: 0,
          riskLevel: '正常'
        }
        if (this.resultList.length === 0) {
          this.$message.info('未找到匹配的订单')
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    handleReset() {
      this.searchForm.keyword = ''
      this.searchForm.type = 'account'
      this.hasSearched = false
      this.resultList = []
      this.riskInfo = {
        totalOrder: 0,
        shopCount: 0,
        riskLevel: '正常'
      }
    },
    highlightKeyword(text) {
      if (!text || !this.searchForm.keyword) return text
      const keyword = this.searchForm.keyword.trim()
      const reg = new RegExp(`(${keyword})`, 'gi')
      return String(text).replace(reg, '<span style="color: #f56c6c; font-weight: bold;">$1</span>')
    },
    tableRowClassName({ row }) {
      // if (this.riskInfo.riskLevel.includes('高危')) {
      //   return 'danger-row'
      // }
      // if (this.riskInfo.riskLevel.includes('风险')) {
      //   return 'warning-row'
      // }
      return ''
    },
    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
  }
}
</script>

<style lang="scss" scoped>
.risk-search-page {
  .search-card {
    margin-bottom: 20px;

    .search-form {
      margin-bottom: 10px;
    }

    .search-tip {
      color: #909399;
      font-size: 13px;
      padding-top: 10px;
      border-top: 1px solid #ebeef5;

      i {
        color: #409EFF;
        margin-right: 4px;
      }
    }
  }

  .risk-overview {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-item {
      text-align: center;
      padding: 10px 0;

      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .detail-card {
    .amount {
      color: #f56c6c;
      font-weight: 600;
    }

    ::v-deep .danger-row {
      background-color: #fef0f0;
    }

    ::v-deep .warning-row {
      background-color: #fdf6ec;
    }
  }

  .initial-empty {
    margin-top: 60px;

    .empty-icon {
      font-size: 64px;
      color: #dcdfe6;
    }
  }
}
</style>
