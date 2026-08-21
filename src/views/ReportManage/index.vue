<template>
  <div class="report-manage">
    <el-card class="main-card">
      <!-- 右上角悬浮举报按钮 -->
      <el-button 
        type="primary" 
        icon="el-icon-edit-outline" 
        size="mini" 
        class="report-btn" 
        @click="openSubmitDialog"
      >我要举报</el-button>

      <div class="page-header">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="report-tabs">
          <!-- Tab 1: 我的举报 -->
          <el-tab-pane label="我的举报" name="my">
            <!-- 搜索栏 -->
            <div class="search-bar">
              <el-input
                v-model="mySearch.keyword"
                placeholder="搜索账号/收货地址"
                clearable
                size="mini"
                style="width: 260px; margin-right: 10px;"
                @keyup.enter.native="handleMySearch">
              </el-input>
              <el-select v-model="mySearch.disputeType" placeholder="纠纷类型" clearable size="mini" style="width: 140px; margin-right: 10px;">
                <el-option label="异常索赔" :value="1"></el-option>
                <el-option label="仅退款" :value="2"></el-option>
                <el-option label="异常退货" :value="3"></el-option>
                <el-option label="异常评价" :value="4"></el-option>
                <el-option label="骗取财物" :value="5"></el-option>
                <el-option label="其它" :value="6"></el-option>
              </el-select>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleMySearch">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="handleMyReset">重置</el-button>
            </div>

            <!-- 卡片列表 -->
            <div class="card-list" v-loading="myLoading">
              <div 
                v-for="item in myList" 
                :key="item.id" 
                class="report-card"
                :style="{ '--similarity-color': getSimilarityColor(item.similarity || 0) }"
              >
                <!-- 卡片头部 -->
                <div class="card-header">
                  <div class="card-title-wrap">
                    <el-tag size="mini" :type="disputeTypeTagType(item.dispute_type)" effect="light">{{ item.dispute_type_text }}</el-tag>
                    <span class="card-id">举报编号 #{{ item.id }}</span>
                  </div>
                  <div class="card-header-right">
                    <span 
                      v-if="mySearch.keyword" 
                      class="similarity-text"
                      :style="{ color: getSimilarityColor(item.similarity || 0) }"
                    >
                      匹配度 {{ item.similarity || 0 }}%
                    </span>
                    <el-tag :type="statusTagType(item.status)" size="mini" effect="dark">{{ item.status_text }}</el-tag>
                  </div>
                </div>

                <!-- 卡片内容 -->
                <div class="card-body">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">平台账号</span>
                      <span class="info-value" v-html="highlightKeyword(item.buyer_account, mySearch.keyword)"></span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">订单号</span>
                      <span class="info-value order-no" @click="goJdOrder(item.order_no)">{{ item.order_no || '-' }}</span>
                    </div>
                    <div class="info-item full-width">
                      <span class="info-label">收货信息</span>
                      <span class="info-value">{{ item.receiver_name || '-' }}</span>
                      <span class="info-value" style="margin-left: 15px;">{{ item.receiver_phone || '-' }}</span>
                      <span class="info-value" style="margin-left: 15px;" v-html="highlightKeyword(item.receiver_address, mySearch.keyword)"></span>
                    </div>
                    <div class="info-item full-width">
                      <span class="info-label">举报缘由</span>
                      <span class="info-value reason-text">{{ item.reason }}</span>
                    </div>
                  </div>
                </div>

                <!-- 卡片底部 -->
                <div class="card-footer">
                  <div class="time-info">
                    <span>创建时间：{{ formatTime(item.create_time) }}</span>
                    <span v-if="item.happen_time" class="happen-time">发生时间：{{ formatTime(item.happen_time) }}</span>
                  </div>
                  <div class="card-actions">
                    <el-tooltip content="查看详情" placement="top">
                      <i class="action-icon el-icon-view" @click="viewDetail(item)"></i>
                    </el-tooltip>
                    <el-tooltip v-if="[1, 2].includes(item.status)" content="撤销举报" placement="top">
                      <i class="action-icon action-danger el-icon-delete" @click="cancelReport(item)"></i>
                    </el-tooltip>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="myList.length === 0 && !myLoading" class="empty-state">
                <i class="el-icon-document"></i>
                <span>暂无举报记录</span>
              </div>
            </div>

            <el-pagination
              class="pagination"
              size="mini"
              @size-change="handleMySizeChange"
              @current-change="handleMyCurrentChange"
              :current-page="myPage"
              :page-sizes="[10, 20, 50]"
              :page-size="myPageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="myTotal">
            </el-pagination>
          </el-tab-pane>

          <!-- Tab 2: 全部举报 -->
          <el-tab-pane label="全部举报" name="all">
            <!-- 搜索栏 -->
            <div class="search-bar">
              <el-input
                v-model="allSearch.keyword"
                placeholder="搜索账号/收货地址"
                clearable
                size="mini"
                style="width: 260px; margin-right: 10px;"
                @keyup.enter.native="handleAllSearch">
              </el-input>
              <el-select v-model="allSearch.disputeType" placeholder="纠纷类型" clearable size="mini" style="width: 140px; margin-right: 10px;">
                <el-option label="异常索赔" :value="1"></el-option>
                <el-option label="仅退款" :value="2"></el-option>
                <el-option label="异常退货" :value="3"></el-option>
                <el-option label="异常评价" :value="4"></el-option>
                <el-option label="骗取财物" :value="5"></el-option>
                <el-option label="其它" :value="6"></el-option>
              </el-select>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleAllSearch">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="handleAllReset">重置</el-button>
            </div>

            <!-- 卡片列表 -->
            <div class="card-list" v-loading="allLoading">
              <div 
                v-for="item in allList" 
                :key="item.id" 
                class="report-card"
                :style="{ '--similarity-color': getSimilarityColor(item.similarity || 0) }"
              >
                <!-- 卡片头部 -->
                <div class="card-header">
                  <div class="card-title-wrap">
                    <el-tag size="mini" :type="disputeTypeTagType(item.dispute_type)" effect="light">{{ item.dispute_type_text }}</el-tag>
                    <span class="card-id">举报编号 #{{ item.id }}</span>
                    <span class="reporter">举报人：{{ item.username }}</span>
                  </div>
                  <div class="card-header-right">
                    <span 
                      v-if="allSearch.keyword" 
                      class="similarity-text"
                      :style="{ color: getSimilarityColor(item.similarity || 0) }"
                    >
                      匹配度 {{ item.similarity || 0 }}%
                    </span>
                    <el-tag :type="statusTagType(item.status)" size="mini" effect="dark">{{ item.status_text }}</el-tag>
                  </div>
                </div>

                <!-- 卡片内容 -->
                <div class="card-body">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">平台账号</span>
                      <span class="info-value" v-html="highlightKeyword(item.buyer_account, allSearch.keyword)"></span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">订单号</span>
                      <span class="info-value order-no" @click="goJdOrder(item.order_no)">{{ item.order_no || '-' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">收货人</span>
                      <span class="info-value">{{ item.receiver_name || '-' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">联系电话</span>
                      <span class="info-value">{{ item.receiver_phone || '-' }}</span>
                    </div>
                    <div class="info-item full-width">
                      <span class="info-label">收货地址</span>
                      <span class="info-value" v-html="highlightKeyword(item.receiver_address, allSearch.keyword)"></span>
                    </div>
                    <div class="info-item full-width">
                      <span class="info-label">举报缘由</span>
                      <span class="info-value reason-text">{{ item.reason }}</span>
                    </div>
                  </div>
                </div>

                <!-- 卡片底部 -->
                <div class="card-footer">
                  <div class="time-info">
                    <span>创建时间：{{ formatTime(item.create_time) }}</span>
                    <span v-if="item.happen_time" class="happen-time">发生时间：{{ formatTime(item.happen_time) }}</span>
                  </div>
                  <div class="card-actions">
                    <el-tooltip content="查看详情" placement="top">
                      <i class="action-icon el-icon-view" @click="viewDetail(item)"></i>
                    </el-tooltip>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="allList.length === 0 && !allLoading" class="empty-state">
                <i class="el-icon-document"></i>
                <span>暂无举报记录</span>
              </div>
            </div>

            <el-pagination
              class="pagination"
              size="mini"
              @size-change="handleAllSizeChange"
              @current-change="handleAllCurrentChange"
              :current-page="allPage"
              :page-sizes="[10, 20, 50]"
              :page-size="allPageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="allTotal">
            </el-pagination>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- 提交举报弹窗（子组件） -->
    <report-submit-dialog
      :visible.sync="submitDialogVisible"
      @success="handleSubmitSuccess"
    />

    <!-- 详情弹窗 -->
    <el-dialog title="举报详情" :visible.sync="detailVisible" width="600px" size="mini">
      <el-descriptions :column="1" border v-if="currentDetail" size="mini">
        <el-descriptions-item label="ID">{{ currentDetail.id }}</el-descriptions-item>
        <el-descriptions-item v-if="activeTab === 'all'" label="举报人">{{ currentDetail.username }}</el-descriptions-item>
        <el-descriptions-item label="纠纷类型">{{ currentDetail.dispute_type_text }}</el-descriptions-item>
        <el-descriptions-item label="平台账号">{{ currentDetail.buyer_account }}</el-descriptions-item>
        <el-descriptions-item label="订单号">
          <span class="order-no" @click="goJdOrder(currentDetail.order_no)">{{ currentDetail.order_no || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="收货名称">{{ currentDetail.receiver_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="收货手机">{{ currentDetail.receiver_phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">{{ currentDetail.receiver_address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发生时间">{{ formatTime(currentDetail.happen_time) }}</el-descriptions-item>
        <el-descriptions-item label="举报缘由">{{ currentDetail.reason }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(currentDetail.status)" size="mini">
            {{ statusText(currentDetail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(currentDetail.create_time) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(currentDetail.update_time) }}</el-descriptions-item>
        <el-descriptions-item label="管理员备注" v-if="currentDetail.admin_remark">
          {{ currentDetail.admin_remark }}
        </el-descriptions-item>
      </el-descriptions>
      <span slot="footer">
        <el-button size="mini" @click="detailVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import APP_CONFIG from '@/config'
import ReportSubmitDialog from './components/ReportSubmitDialog.vue'

export default {
  name: 'ReportManage',
  components: { ReportSubmitDialog },
  data() {
    return {
      activeTab: 'my',

      // ====== Tab1: 我的举报 ======
      myLoading: false,
      myList: [],
      myTotal: 0,
      myPage: 1,
      myPageSize: 10,
      mySearch: {
        keyword: '',
        disputeType: ''
      },

      // ====== Tab2: 全部举报 ======
      allLoading: false,
      allList: [],
      allTotal: 0,
      allPage: 1,
      allPageSize: 10,
      allSearch: {
        keyword: '',
        disputeType: ''
      },

      // ====== 提交举报弹窗 ======
      submitDialogVisible: false,

      // ====== 详情弹窗 ======
      detailVisible: false,
      currentDetail: null
    }
  },
  created() {
    // 支持从其他页面跳转过来带关键词搜索
    const { keyword, tab } = this.$route.query
    if (keyword) {
      this.activeTab = tab === 'my' ? 'my' : 'all'
      if (this.activeTab === 'all') {
        this.allSearch.keyword = keyword
        this.loadAllData()
      } else {
        this.mySearch.keyword = keyword
        this.loadMyData()
      }
    } else {
      this.loadMyData()
    }
  },
  methods: {
    // Tab 切换时加载对应数据
    handleTabClick(tab) {
      if (tab.name === 'my') {
        this.loadMyData()
      } else if (tab.name === 'all') {
        this.loadAllData()
      }
    },

    /**
     * 纠纷类型标签颜色映射
     * 异常索赔(1) 为危险红色，其余为蓝色
     */
    disputeTypeTagType(type) {
      return type === 1 ? 'danger' : 'primary'
    },

    /**
     * 根据相似度获取渐变颜色（绿→黄→红）
     * 0%: 绿色 #67c23a
     * 50%: 黄色 #e6a23c
     * 100%: 红色 #f56c6c
     */
    getSimilarityColor(percent) {
      const p = Math.max(0, Math.min(100, percent))
      if (p <= 50) {
        const ratio = p / 50
        return this.interpolateColor('#67c23a', '#e6a23c', ratio)
      } else {
        const ratio = (p - 50) / 50
        return this.interpolateColor('#e6a23c', '#f56c6c', ratio)
      }
    },

    /**
     * 十六进制颜色插值计算
     */
    interpolateColor(color1, color2, ratio) {
      const hex = (c) => parseInt(c.slice(1), 16)
      const r1 = (hex(color1) >> 16) & 0xff
      const g1 = (hex(color1) >> 8) & 0xff
      const b1 = hex(color1) & 0xff
      const r2 = (hex(color2) >> 16) & 0xff
      const g2 = (hex(color2) >> 8) & 0xff
      const b2 = hex(color2) & 0xff

      const r = Math.round(r1 + (r2 - r1) * ratio)
      const g = Math.round(g1 + (g2 - g1) * ratio)
      const b = Math.round(b1 + (b2 - b1) * ratio)
      return `rgb(${r}, ${g}, ${b})`
    },

    /**
     * 关键词高亮标红
     * @param {String} text 原文
     * @param {String} keyword 搜索关键词
     * @returns {String} 高亮后的HTML字符串
     */
    highlightKeyword(text, keyword) {
      if (!text || !keyword || !keyword.trim()) return text || '-'
      // 转义正则特殊字符，避免报错
      const safeKeyword = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const reg = new RegExp(`(${safeKeyword})`, 'gi')
      return text.replace(reg, '<span class="highlight-text">$1</span>')
    },

    // ====== Tab1: 我的举报 ======
    async loadMyData() {
      this.myLoading = true
      try {
        const res = await request.get('/report/my', {
          params: {
            page: this.myPage,
            pageSize: this.myPageSize,
            keyword: this.mySearch.keyword,
            disputeType: this.mySearch.disputeType
          }
        })
        this.myList = res.data.list
        this.myTotal = res.data.total
      } catch (e) {
        console.error(e)
      } finally {
        this.myLoading = false
      }
    },
    handleMySearch() {
      this.myPage = 1
      this.loadMyData()
    },
    handleMyReset() {
      this.mySearch.keyword = ''
      this.mySearch.disputeType = ''
      this.myPage = 1
      this.loadMyData()
    },
    handleMySizeChange(val) {
      this.myPageSize = val
      this.myPage = 1
      this.loadMyData()
    },
    handleMyCurrentChange(val) {
      this.myPage = val
      this.loadMyData()
    },
    cancelReport(row) {
      this.$confirm(`确定要撤销这条举报吗？撤销后状态将变更为已撤销`, '提示', {
        confirmButtonText: '确定撤销',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await request.post(`/report/cancel/${row.id}`)
          this.$message.success('举报已撤销')
          this.loadMyData()
        } catch (e) {
          console.error(e)
        }
      }).catch(() => {})
    },

    // ====== Tab2: 全部举报 ======
    async loadAllData() {
      this.allLoading = true
      try {
        const res = await request.get('/report/all', {
          params: {
            page: this.allPage,
            pageSize: this.allPageSize,
            keyword: this.allSearch.keyword,
            disputeType: this.allSearch.disputeType
          }
        })
        this.allList = res.data.list
        this.allTotal = res.data.total
      } catch (e) {
        console.error(e)
      } finally {
        this.allLoading = false
      }
    },
    handleAllSearch() {
      this.allPage = 1
      this.loadAllData()
    },
    handleAllReset() {
      this.allSearch.keyword = ''
      this.allSearch.disputeType = ''
      this.allPage = 1
      this.loadAllData()
    },
    handleAllSizeChange(val) {
      this.allPageSize = val
      this.allPage = 1
      this.loadAllData()
    },
    handleAllCurrentChange(val) {
      this.allPage = val
      this.loadAllData()
    },

    // ====== 提交举报弹窗 ======
    openSubmitDialog() {
      this.submitDialogVisible = true
    },
    handleSubmitSuccess() {
      this.activeTab = 'my'
      this.myPage = 1
      this.loadMyData()
    },

    // ====== 跳转京东订单详情 ======
    goJdOrder(orderNo) {
      if (orderNo) {
        window.open(APP_CONFIG.JD_ORDER_DETAIL_URL + orderNo, '_blank')
      }
    },

    // ====== 共用方法 ======
    viewDetail(row) {
      this.currentDetail = row
      this.detailVisible = true
    },
    formatTime(time) {
      if (!time) return '-'
      const d = new Date(time)
      if (isNaN(d.getTime())) return time
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    },
    statusTagType(status) {
      const map = { 0: 'warning', 1: 'success', 2: 'danger', 3: 'info' }
      return map[status] || 'info'
    },
    statusText(status) {
      const map = { 0: '待处理', 1: '已处理', 2: '驳回', 3: '已撤销' }
      return map[status] || '未知'
    }
  }
}
</script>

<style lang="scss" scoped>
.report-manage {
  .main-card {
    position: relative;
  }

  // 右上角悬浮举报按钮
  .report-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    margin-top: 0;
  }

  .page-header {
    .report-tabs {
      flex: 1;
    }
  }

  .search-bar {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  // 卡片列表容器
  .card-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 200px;
  }

  // 单张举报卡片
  .report-card {
    border: 1px solid #ebeef5;
    border-left: 4px solid var(--similarity-color, #ebeef5);
    border-radius: 8px;
    background: #fff;
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-color: #dcdfe6;
      transform: translateY(-2px);
    }

    // 卡片头部
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #fafafa;
      border-bottom: 1px solid #ebeef5;

      .card-title-wrap {
        display: flex;
        align-items: center;
        gap: 12px;

        .card-id {
          font-size: 13px;
          color: #909399;
        }

        .reporter {
          font-size: 13px;
          color: #606266;
        }
      }

      .card-header-right {
        display: flex;
        align-items: center;
        gap: 12px;

        .similarity-text {
          font-size: 12px;
          font-weight: 600;
        }
      }
    }

    // 卡片内容
    .card-body {
      padding: 16px;

      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px 24px;

        .info-item {
          display: flex;
          font-size: 13px;
          line-height: 1.5;
          align-items: flex-start;

          &.full-width {
            grid-column: 1 / -1;
            flex-wrap: wrap;
          }

          .info-label {
            color: #909399;
            flex-shrink: 0;
            margin-right: 8px;
            min-width: 70px;
          }

          .info-value {
            color: #303133;
            word-break: break-all;

            &.reason-text {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }

            &.order-no {
              color: #409EFF;
              font-family: monospace;
              cursor: pointer;
              &:hover {
                text-decoration: underline;
              }
            }
          }
        }
      }
    }

    // 卡片底部
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      border-top: 1px solid #f2f6fc;
      background: #fafbfc;

      .time-info {
        font-size: 12px;
        color: #909399;
        display: flex;
        gap: 20px;
      }

      .card-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }
    }
  }

  // 操作图标样式
  .action-icon {
    font-size: 16px;
    color: #409eff;
    cursor: pointer;
    transition: color 0.2s ease;
    line-height: 1;

    &:hover {
      color: #66b1ff;
    }

    &.action-danger {
      color: #f56c6c;

      &:hover {
        color: #f78989;
      }
    }
  }

  // 高亮样式
  :deep(.highlight-text) {
    color: #f56c6c;
    font-weight: 600;
    background-color: #fef0f0;
    padding: 0 3px;
    border-radius: 2px;
  }

  .order-no {
    color: #409EFF;
    font-family: monospace;
    font-size: 13px;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }

  // 空状态
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: #909399;
    font-size: 14px;

    i {
      font-size: 48px;
      margin-bottom: 12px;
      color: #c0c4cc;
    }
  }

  .pagination {
    margin-top: 20px;
    text-align: right;
  }
}
</style>