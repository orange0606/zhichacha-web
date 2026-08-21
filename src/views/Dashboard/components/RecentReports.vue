<template>
  <div class="panel panel-reports">
    <div class="panel-header">
      <h3>📋 最近举报</h3>
    </div>
    <div class="panel-body">
      <div class="report-list">
        <div v-for="item in list" :key="item.id" class="report-item">
          <div class="report-top">
            <!-- <el-tag size="mini" :type="getStatusType(item.status)">{{ item.statusText }}</el-tag> -->
            <el-tag size="mini" type="danger">{{ item.disputeTypeText }}</el-tag>
            <span v-if="item.reporterName" class="report-reporter">举报人：{{ item.reporterName }}</span>
            <span class="report-time">{{ formatTime(item.createTime) }}</span>
          </div>
          <div class="report-account">
            <i class="el-icon-user"></i>
            {{ item.buyerAccount }}
            <span v-if="item.orderNo" class="report-order order-no" @click="goOrderDetail(item.orderNo)">订单：{{ item.orderNo }}</span>
          </div>
          <div v-if="item.receiverName || item.receiverPhone || item.receiverAddress" class="report-receiver">
            <i class="el-icon-location-outline"></i>
            <span v-if="item.receiverName">{{ item.receiverName }}</span>
            <span v-if="item.receiverPhone" class="receiver-phone">{{ item.receiverPhone }}</span>
            <span v-if="item.receiverAddress" class="receiver-addr">{{ item.receiverAddress }}</span>
          </div>
          <div class="report-reason">{{ item.reason }}</div>
        </div>
        <el-empty v-if="list.length === 0" description="暂无举报记录" :image-size="60" />
      </div>
    </div>
  </div>
</template>

<script>
import APP_CONFIG from '@/config'
export default {
  name: 'RecentReports',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      const pad = n => String(n).padStart(2, '0')
      return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },
    getStatusType(status) {
      const map = { 0: 'warning', 1: 'success', 2: 'danger', 3: 'info' }
      return map[status] || 'info'
    },
    goOrderDetail(orderNo) {
      if (orderNo) {
        window.open(APP_CONFIG.JD_ORDER_DETAIL_URL + orderNo, '_blank')
      }
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

.report-list {
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

.report-item {
  padding: 12px;
  border-radius: 8px;
  background: #fafafa;
  margin-bottom: 10px;
  transition: background 0.2s;

  &:hover {
    background: #f5f7fa;
  }

  &:last-child {
    margin-bottom: 0;
  }

  .report-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .report-reporter {
      font-size: 12px;
      color: #909399;
    }

    .report-time {
      margin-left: auto;
      font-size: 12px;
      color: #909399;
    }
  }

  .report-account {
    font-size: 14px;
    color: #303133;
    margin-bottom: 6px;

    i {
      margin-right: 4px;
      color: #409eff;
    }

    .report-order {
      margin-left: 12px;
      font-size: 12px;
      color: #909399;
    }
  }

  .report-receiver {
    font-size: 12px;
    color: #606266;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    i {
      color: #67c23a;
      flex-shrink: 0;
    }

    .receiver-phone {
      color: #409eff;
      font-family: monospace;
      flex-shrink: 0;
    }

    .receiver-addr {
      color: #909399;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .report-reason {
    font-size: 13px;
    color: #606266;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
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
</style>
