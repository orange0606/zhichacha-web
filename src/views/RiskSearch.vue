<template>
  <div class="risk-detect-page">
    <el-card shadow="hover" class="search-card">
      <div class="search-header">
        <div class="title-wrap">
          <i class="el-icon-data-line title-icon"></i>
          <span class="title">跨店铺风险检测</span>
        </div>
        <div class="quick-btns">
          <el-button size="small" :type="quickType === 7 ? 'primary' : ''" @click="setQuickDate(7)">近7天</el-button>
          <el-button size="small" :type="quickType === 14 ? 'primary' : ''" @click="setQuickDate(14)">近14天</el-button>
          <el-button size="small" :type="quickType === 30 ? 'primary' : ''" @click="setQuickDate(30)">近30天</el-button>
        </div>
      </div>

      <el-form :inline="true" size="small">
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
          <el-button type="primary" icon="el-icon-search" :loading="accountLoading" @click="handleSearch">开始检测</el-button>
          <el-button icon="el-icon-refresh-left" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="search-tip">
        <i class="el-icon-info"></i>
        系统将基于您名下所有店铺的订单数据，自动匹配全平台相同买家账号/收货地址的下单记录，识别跨店铺下单、多次下单、被举报账号等风险行为
      </div>
    </el-card>

    <div v-if="hasSearched" class="result-section">
      <el-row :gutter="12" type="flex" justify="space-between" class="overview-row">
        <el-col :span="4">
          <div class="stat-card stat-red">
            <div class="stat-icon-wrap"><i class="el-icon-warning"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ riskInfo.highRiskCount }}</div>
              <div class="stat-label">高风险数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card stat-blue">
            <div class="stat-icon-wrap"><i class="el-icon-shop"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ riskInfo.userShopCount }}</div>
              <div class="stat-label">自有店铺数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card stat-green">
            <div class="stat-icon-wrap"><i class="el-icon-user"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ riskInfo.riskAccountCount }}</div>
              <div class="stat-label">风险账号数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card stat-orange">
            <div class="stat-icon-wrap"><i class="el-icon-document"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ riskInfo.totalOrder }}</div>
              <div class="stat-label">关联订单数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card stat-purple">
            <div class="stat-icon-wrap"><i class="el-icon-share"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ riskInfo.shopCount }}</div>
              <div class="stat-label">涉及店铺数</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-card shadow="hover" class="table-card">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="下单账号检测" name="account">
            <el-table
              v-loading="accountLoading"
              :data="accountGroups"
              border
              size="small"
              style="width: 100%"
              empty-text="未检测到风险账号"
              :row-class-name="groupRowClassName"
              :expand-row-keys="expandRowKeys"
              row-key="rowKey"
            >
              <el-table-column type="expand">
                <template slot-scope="props">
                  <div class="expand-title">
                    <i class="el-icon-tickets"></i>
                    全库匹配订单（共 {{ props.row.orders.length }} 条）
                  </div>
                  <el-table :data="props.row.orders" size="small" border style="width: calc(100% - 40px); margin: 0 20px">
                    <el-table-column type="index" label="#" width="50" align="center" />
                    <el-table-column label="下单时间" width="135">
                      <template slot-scope="scope">{{ scope.row.order_time | formatTime }}</template>
                    </el-table-column>
                    <el-table-column label="订单号" width="135">
                      <template slot-scope="scope">
                        <span class="link-text" @click="goJdOrder(scope.row.order_no)">
                          {{ scope.row.order_no }}
                        </span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="buyer_account" label="买家账号" width="130" />
                    <el-table-column label="所属店铺" width="140">
                      <template slot-scope="scope">{{ scope.row.shop_name | maskShopName }}</template>
                    </el-table-column>
                    <el-table-column prop="goods_count" label="数量" width="60" align="center" />
                    <el-table-column label="金额" width="70" align="right">
                      <template slot-scope="scope">
                        <span class="amount-text">￥{{ scope.row.pay_amount }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="buyer_name" label="收货人" width="75" />
                    <el-table-column prop="buyer_phone" label="电话/尾号" width="90" />
                    <el-table-column prop="buyer_address" label="收货地址" min-width="220" show-overflow-tooltip />
                    <el-table-column prop="goods_name" label="商品名称" min-width="200" show-overflow-tooltip >
                      <template slot-scope="scope">
                        {{ scope.row.goods_name | formatGoodsName }}
                      </template>
                    </el-table-column>

                  </el-table>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#" width="50" align="center" />
              <el-table-column label="最近下单时间" width="135">
                <template slot-scope="scope">
                  {{ scope.row.orders[0] && scope.row.orders[0].order_time | formatTime }}
                </template>
              </el-table-column>
              <el-table-column label="风险对象" width="200">
                <template slot-scope="scope">
                  <i class="el-icon-user group-icon"></i>
                  <!-- <span class="link-text" @click="goSearch(scope.row.groupName)">{{ scope.row.groupName }}</span> -->
                  <span>{{ scope.row.groupName }}</span>
                  <el-tag size="mini" type="primary" effect="plain" style="margin-left: 8px">账号</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="avgPrice" label="客单价" width="70" align="center" />
              <el-table-column label="涉及店铺" width="70" align="center">
                <template slot-scope="scope">
                  <el-tag size="mini" :type="getRiskTagType(scope.row.riskLevel)">
                    {{ scope.row.crossShopCount }} 家
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="totalOrderCount" label="关联订单" width="70" align="center" />
              <el-table-column prop="reportCount" label="举报次数" width="70" align="center" />
              <!-- <el-table-column label="最新订单号" width="135">
                <template slot-scope="scope">
                  <span class="link-text" @click="goJdOrder(scope.row.orders[0] && scope.row.orders[0].order_no)">
                    {{ scope.row.orders[0] && scope.row.orders[0].order_no }}
                  </span>
                </template>
              </el-table-column> -->
              
              <el-table-column label="风险等级" width="100" align="center">
                <template slot-scope="scope">
                  <el-tag size="small" :type="getRiskTagType(scope.row.riskLevel)" effect="dark">
                    <i :class="getRiskIcon(scope.row.riskLevel)"></i>
                    {{ scope.row.riskLevelText }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="风险标记" min-width="300">
                <template slot-scope="scope">
                  <el-tag
                    v-for="(tag, idx) in scope.row.tags"
                    :key="idx"
                    size="mini"
                    :type="getRiskTagType(scope.row.riskLevel)"
                    effect="plain"
                    style="margin: 2px"
                  >{{ tag }}</el-tag>
                </template>
              </el-table-column>

            </el-table>
          </el-tab-pane>

          <el-tab-pane label="收货地址检测" name="address">
            <el-table
              v-loading="addressLoading"
              :data="addressGroups"
              border
              size="small"
              style="width: 100%"
              empty-text="未检测到风险地址"
              :row-class-name="groupRowClassName"
              row-key="rowKey"
            >
              <el-table-column type="expand">
                <template slot-scope="props">
                  <div class="expand-title">
                    <i class="el-icon-tickets"></i>
                    全库匹配订单（共 {{ props.row.orders.length }} 条）
                  </div>
                  <el-table :data="props.row.orders" size="small" border style="width: calc(100% - 40px); margin: 0 20px">
                    <el-table-column type="index" label="#" width="50" align="center" />
                    <el-table-column label="下单时间" width="135">
                      <template slot-scope="scope">{{ scope.row.order_time | formatTime }}</template>
                    </el-table-column>
                    <el-table-column label="订单号" width="135">
                      <template slot-scope="scope">
                        <span class="link-text" @click="goJdOrder(scope.row.order_no)">
                          {{ scope.row.order_no }}
                        </span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="buyer_account" label="买家账号" width="130" />
                    <el-table-column label="所属店铺" width="140">
                      <template slot-scope="scope">{{ scope.row.shop_name | maskShopName }}</template>
                    </el-table-column>
                    <el-table-column prop="goods_count" label="数量" width="55" align="center" />
                    <el-table-column label="金额" width="70" align="right">
                      <template slot-scope="scope">
                        <span class="amount-text">￥{{ scope.row.pay_amount }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="buyer_name" label="收货人" width="75" />
                    <el-table-column prop="buyer_phone" label="电话/尾号" width="90" />
                    <el-table-column prop="buyer_address" label="收货地址" min-width="220" show-overflow-tooltip />
                    <el-table-column prop="goods_name" label="商品名称" min-width="200" show-overflow-tooltip >
                      <template slot-scope="scope">
                        {{ scope.row.goods_name | formatGoodsName }}
                      </template>
                    </el-table-column>

                  </el-table>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#" width="50" align="center" />
              <el-table-column label="最近下单时间" width="135">
                <template slot-scope="scope">
                  {{ scope.row.orders[0] && scope.row.orders[0].order_time | formatTime }}
                </template>
              </el-table-column>
              <el-table-column label="风险对象" min-width="250">
                <template slot-scope="scope">
                  <i class="el-icon-location-outline group-icon"></i>
                  <span>{{ scope.row.groupName }}</span>
                  <el-tag size="mini" type="success" effect="plain" style="margin-left: 8px">地址</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="avgPrice" label="客单价" width="70" align="center" />
              <el-table-column label="涉及店铺" width="70" align="center">
                <template slot-scope="scope">
                  <el-tag size="mini" :type="getRiskTagType(scope.row.riskLevel)">
                    {{ scope.row.crossShopCount }} 家
                  </el-tag>
                </template>
              </el-table-column>
              <!-- <el-table-column label="最新订单号" width="150">
                <template slot-scope="scope">
                  {{ scope.row.orders[0] && scope.row.orders[0].order_no }}
                </template>
              </el-table-column> -->
              
              <el-table-column prop="totalOrderCount" label="关联订单" width="70" align="center" />
              <el-table-column prop="reportCount" label="举报次数" width="70" align="center" />
              <el-table-column label="风险等级" width="100" align="center">
                <template slot-scope="scope">
                  <el-tag size="small" :type="getRiskTagType(scope.row.riskLevel)" effect="dark">
                    <i :class="getRiskIcon(scope.row.riskLevel)"></i>
                    {{ scope.row.riskLevelText }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="风险标记" min-width="300">
                <template slot-scope="scope">
                  <el-tag
                    v-for="(tag, idx) in scope.row.tags"
                    :key="idx"
                    size="mini"
                    :type="getRiskTagType(scope.row.riskLevel)"
                    effect="plain"
                    style="margin: 2px"
                  >{{ tag }}</el-tag>
                </template>
              </el-table-column>
              
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RiskDetect',
  data() {
    return {
      hasSearched: false,
      quickType: 14,
      dateRange: [],
      activeTab: 'account',
      accountLoading: false,
      addressLoading: false,
      accountGroups: [],
      addressGroups: [],
      expandRowKeys: [],
      riskInfo: {
        highRiskCount: 0,
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
  filters: {
    formatTime(time) {
      if (!time) return '-'
      const d = new Date(time)
      const pad = n => String(n).padStart(2, '0')
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
    },
    formatGoodsName(name) {
      if (!name) return '-';
      const str = String(name).trim();
      const maskLen = 25;
      if (str.length >= maskLen) {
        return '*'.repeat(maskLen) + str.substring(maskLen);
      } else {
        return '*'.repeat(maskLen);
      }
    }
  },
  watch: {
    activeTab(newVal) {
      if (!this.hasSearched) return
      if (newVal === 'account' && !this.accountLoading) {
        this.loadAccountData()
      } else if (newVal === 'address' && !this.addressLoading) {
        this.loadAddressData()
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
      const fmtStart = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' 00:00:00'
      const fmtEnd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())

      this.dateRange = [fmtStart(start), fmtEnd(end)]
    },

    async handleSearch() {
      if (!this.dateRange || this.dateRange.length !== 2) {
        this.$message.warning('请选择完整的时间范围')
        return
      }
      this.hasSearched = true
      await this.loadAccountData()
    },

    async loadAccountData() {
      this.accountLoading = true
      try {
        const res = await this.$http.post('/order/matchByAccount', {
          startTime: this.dateRange[0],
          endTime: this.dateRange[1],
          type: 'account'
        })
        const data = res.data || {}
        const groups = data.groups || [];
        // console.log(groups)
        this.accountGroups = groups.map(g => {
          // 计算当前分组orders的平均单价
          let totalMoney = 0;
          let totalNum = 0;
          if (g.orders && g.orders.length > 0) {
            g.orders.forEach(item => {
              totalMoney += Number(item.pay_amount);
              totalNum += Number(item.goods_count);
            })
          }
          const avgPrice = totalNum > 0 ? (totalMoney / totalNum).toFixed(2) : '0.00';

          return Object.assign({}, g, {
            rowKey: g.groupType + '_' + g.groupKey,
            avgPrice // 新增平均单价字段
          })
        })

        this.riskInfo = {
          highRiskCount: data.highRiskCount || 0,
          userShopCount: data.userShopCount || 0,
          riskAccountCount: data.riskAccountCount || 0,
          totalOrder: data.totalOrder || 0,
          shopCount: data.shopCount || 0
        }
        // this.expandRowKeys = this.accountGroups
        //   .filter(g => g.riskLevel === 'high')
        //   .map(g => g.rowKey)
      } catch (e) {
        console.error(e)
        this.$message.error(e.response?.data?.msg || '账号检测失败')
      } finally {
        this.accountLoading = false
      }
    },

    async loadAddressData() {
      this.addressLoading = true
      try {
        const res = await this.$http.post('/order/matchByAccount', {
          startTime: this.dateRange[0],
          endTime: this.dateRange[1],
          type: 'address'
        })
        const data = res.data || {}
        const groups = data.groups || [];
        // console.log(groups)
        this.addressGroups = groups.map(g => {
          // 计算当前分组orders的平均单价
          let totalMoney = 0;
          let totalNum = 0;
          if (g.orders && g.orders.length > 0) {
            g.orders.forEach(item => {
              totalMoney += Number(item.pay_amount);
              totalNum += Number(item.goods_count);
            })
          }
          const avgPrice = totalNum > 0 ? (totalMoney / totalNum).toFixed(2) : '0.00';

          return Object.assign({}, g, {
            rowKey: g.groupType + '_' + g.groupKey,
            avgPrice // 新增平均单价字段
          })
        })
      } catch (e) {
        console.error(e)
        this.$message.error(e.response?.data?.msg || '地址检测失败')
      } finally {
        this.addressLoading = false
      }
    },

    handleReset() {
      this.hasSearched = false
      this.accountGroups = []
      this.addressGroups = []
      this.setQuickDate(14)
      this.riskInfo = {
        highRiskCount: 0,
        userShopCount: 0,
        riskAccountCount: 0,
        totalOrder: 0,
        shopCount: 0
      }
    },

    maskShopNameText(name) {
      if (!name) return '-'
      const len = name.length
      if (len === 1) return name
      if (len === 2) return name[0] + '*'
      return name[0] + '**' + name.substring(3)
    },

    groupRowClassName(params) {
      const row = params.row
      if (row.riskLevel === 'high') return 'high-risk-row'
      if (row.riskLevel === 'medium') return 'medium-risk-row'
      return ''
    },

    getRiskTagType(level) {
      if (level === 'high') return 'danger'
      if (level === 'medium') return 'warning'
      if (level === 'low') return 'info'
      return 'success'
    },

    getRiskIcon(level) {
      if (level === 'high') return 'el-icon-warning'
      if (level === 'medium') return 'el-icon-warning-outline'
      if (level === 'low') return 'el-icon-info'
      return 'el-icon-success'
    },

    goSearch(keyword) {
      this.$router.push({ path: '/riskQuery', query: { keyword: keyword } })
    },

    goJdOrder(orderNo) {
      if (!orderNo) return
      window.open('https://shop.jd.com/jdm/trade/orders/order-details?orderId=' + orderNo, '_blank')
    }
  }
}
</script>

<style scoped>
.risk-detect-page {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.search-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.title-wrap {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.title-icon {
  margin-right: 10px;
  color: #409eff;
  font-size: 24px;
}

.quick-btns .el-button {
  margin-left: 8px;
}

.search-tip {
  margin-top: 10px;
  padding: 8px 12px;
  color: #606266;
  font-size: 13px;
  background: #f4f6f9;
  border-radius: 4px;
}

.search-tip i {
  color: #409eff;
  margin-right: 5px;
}

.overview-row {
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 22px;
  border-radius: 10px;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
}

.stat-card::after {
  content: '';
  position: absolute;
  right: -30px;
  top: -30px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.stat-icon-wrap {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 26px;
  color: #fff;
  background: rgba(255, 255, 255, 0.22);
  z-index: 1;
}

.stat-info {
  z-index: 1;
}

.stat-value {
  font-size: 30px;
  font-weight: bold;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.stat-red {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5253 100%);
}

.stat-blue {
  background: linear-gradient(135deg, #667eea 0%, #4c6ef5 100%);
}

.stat-green {
  background: linear-gradient(135deg, #20c997 0%, #51cf66 100%);
}

.stat-orange {
  background: linear-gradient(135deg, #f5576c 0%, #fda085 100%);
}

.stat-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
}

.table-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.expand-title {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: bold;
  color: #606266;
}

.expand-title i {
  margin-right: 6px;
  color: #409eff;
}

.group-icon {
  margin-right: 6px;
  color: #909399;
}

.link-text {
  cursor: pointer;
  color: #409eff;
}

.link-text:hover {
  text-decoration: underline;
}

.amount-text {
  color: #f56c6c;
  font-weight: bold;
}

/deep/ .high-risk-row td {
  background: #fef0f0 !important;
}

/deep/ .medium-risk-row td {
  background: #fdf6ec !important;
}
</style>

