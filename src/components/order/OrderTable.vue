<template>
  <el-card class="order-table-card">
    <!-- 表格顶部操作栏 -->
    <div class="table-toolbar" v-if="shopId">
      <div class="toolbar-left">
        <el-button
          type="danger"
          size="mini"
          icon="el-icon-delete"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
          <span v-if="selectedRows.length > 0">({{ selectedRows.length }})</span>
        </el-button>
        <span v-if="selectedRows.length > 0" class="selected-tip">
          已选择 {{ selectedRows.length }} 项
        </span>
      </div>
    </div>

    <el-table
      ref="orderTable"
      :data="orderList"
      border
      stripe
      height="calc(100vh - 280px)"
      size="mini"
      style="width: 100%"
      empty-text="暂无订单数据"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="45" align="center" />
      <el-table-column prop="order_time" label="下单时间" width="130">
        <template slot-scope="scope">
          {{ formatTime(scope.row.order_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="order_no" label="订单号" width="125">
        <template slot-scope="scope">
          <span class="order-no link-text" @click="goJdOrder">{{ scope.row.order_no }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="shop_name" label="店铺名称" width="110">
        <template slot-scope="scope">
          {{ scope.row.shop_name | maskShopName }}
        </template>
      </el-table-column>
      <el-table-column prop="goods_name" label="商品名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="goods_count" label="数量" width="50" align="center" />
      <el-table-column prop="pay_amount" label="金额" width="80" align="center">
        <template slot-scope="scope">
          <span class="amount">¥{{ Number(scope.row.pay_amount).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="buyer_account" label="下单账号" width="130" />
      <el-table-column prop="buyer_name" label="客户姓名" width="90" />
      <el-table-column prop="buyer_phone" label="联系电话" width="90">
        <template slot-scope="scope">
          {{ maskPhone(scope.row.buyer_phone) }}
        </template>
      </el-table-column>
      <el-table-column prop="buyer_address" label="客户地址" min-width="200" show-overflow-tooltip />
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrap">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100, 200, 500]"
        :current-page.sync="innerPage"
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>
  </el-card>
</template>

<script>
import APP_CONFIG from '@/config'
export default {
  name: 'OrderTable',
  props: {
    shopId: {
      type: [Number, String],
      default: null
    },
    orderList: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    loading: {
      type: Boolean,
      default: false
    },
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 20
    }
  },
  data() {
    return {
      selectedRows: []
    }
  },
  computed: {
    innerPage: {
      get() {
        return this.currentPage
      },
      set(val) {
        this.$emit('update:currentPage', val)
      }
    }
  },
  watch: {
    // 列表数据变化时清空选中
    orderList() {
      this.selectedRows = []
      if (this.$refs.orderTable) {
        this.$refs.orderTable.clearSelection()
      }
    }
  },
  methods: {
    goJdOrder() {
      window.open(APP_CONFIG.JD_ORDER_LIST_URL, '_blank')
    },
    onPageChange(page) {
      this.$emit('page-change', page)
    },
    onSizeChange(size) {
      this.$emit('update:pageSize', size)
      this.$emit('size-change', size)
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows
    },
    async handleBatchDelete() {
      if (this.selectedRows.length === 0) return
      if (!this.shopId) {
        this.$message.warning('请先选择店铺')
        return
      }

      try {
        await this.$confirm(
          `确定要删除选中的 ${this.selectedRows.length} 条订单吗？此操作不可恢复。`,
          '批量删除确认',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
      } catch (e) {
        return
      }

      const ids = this.selectedRows.map(row => row.id)

      try {
        const res = await this.$http.delete('/order/batchDel', {
          data: {
            ids,
            shop_id: this.shopId
          }
        })
        if (res.code === 0) {
          this.$message.success(res.msg || '删除成功')
          this.$emit('refresh')
        } else {
          this.$message.error(res.msg || '删除失败')
        }
      } catch (e) {
        console.error(e)
        this.$message.error('删除失败，请重试')
      }
    },
    // 手机号脱敏 138****1234
    maskPhone(phone) {
      if (!phone) return ''
      const str = String(phone)
      if (str.length < 7) return str
      return str.slice(0, 3) + '****' + str.slice(-4)
    },
    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }
  }
}
</script>

<style lang="scss" scoped>
.order-table-card {
  .order-no {
    color: #409EFF;
    font-family: monospace;
    font-size: 13px;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  .table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .selected-tip {
      font-size: 13px;
      color: #e6a23c;
    }
  }

  .amount {
    color: #f56c6c;
    font-weight: 600;
  }

  .pagination-wrap {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
