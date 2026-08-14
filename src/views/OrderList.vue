<template>
  <div class="order-page">
    <!-- 顶部筛选栏 -->
    <div class="filter-bar">
      <el-select
        v-model="currentShopBizId"
        placeholder="请选择店铺"
        style="width: 200px"
        size="mini"
        @change="getOrderList"
      >
        <el-option
          v-for="shop in shopList"
          :key="shop.id"
          :label="shop.shop_name"
          :value="shop.shop_id"
        />
      </el-select>
      <el-button type="primary" size="mini" icon="el-icon-plus" :disabled="!currentShopBizId" @click="handleAddOrder">
        新增订单
      </el-button>
      <el-button type="success" size="mini" icon="el-icon-upload2" :disabled="!currentShopBizId" @click="openBatchDialog">
        批量导入订单
      </el-button>
      <el-button size="mini" icon="el-icon-refresh" @click="getOrderList">刷新</el-button>
    </div>

    <!-- 订单列表组件 -->
    <order-table
      :shop-id="currentShopBizId"
      :order-list="orderList"
      :total="total"
      :loading="loading"
      :current-page.sync="currentPage"
      :page-size.sync="pageSize"
      @page-change="getOrderList"
      @size-change="handleSizeChange"
      @refresh="getOrderList"
    />

    <!-- 单个新增弹窗 -->
    <order-add-dialog
      :visible.sync="addDialogVisible"
      :shop-id="currentShopBizId"
      :shop-name="currentShopName"
      @success="getOrderList"
    />

    <!-- 批量导入弹窗 -->
    <order-batch-import
      :visible.sync="batchDialogVisible"
      :shop-id="currentShopBizId"
      :shop-name="currentShopName"
      @success="getOrderList"
    />
  </div>
</template>

<script>
import OrderTable from '../components/order/OrderTable.vue'
import OrderAddDialog from '../components/order/OrderAddDialog.vue'
import OrderBatchImport from '../components/order/OrderBatchImport.vue'
export default {
  name: 'OrderList',
  components: { OrderTable, OrderAddDialog, OrderBatchImport },
  data() {
    return {
      loading: false,
      shopList: [],
      // currentShopBizId = shop.shop_id（业务店铺ID，和订单shop_id关联）
      currentShopBizId: null,
      currentShopName: '',
      orderList: [],
      total: 0,
      currentPage: 1,
      pageSize: 20,
      // 单条新增弹窗
      addDialogVisible: false,
      // 批量导入弹窗
      batchDialogVisible: false
    }
  },
  watch: {
    '$route.query': {
      handler(val) {
        if (val.shopId) {
          this.currentShopBizId = Number(val.shopId)
          this.currentShopName = val.shopName || ''
          this.getOrderList()
        }
      },
      immediate: true
    }
  },
  created() {
    this.getShopList()
  },
  methods: {
    async getShopList() {
      try {
        const res = await this.$http.get('/shop/list')
        this.shopList = res.data || []
        if (!this.currentShopBizId && this.shopList.length > 0) {
          const firstShop = this.shopList[0]
          this.currentShopBizId = firstShop.shop_id
          this.currentShopName = firstShop.shop_name
          this.getOrderList()
        }
      } catch (e) {
        console.error(e)
      }
    },
    async getOrderList() {
      if (!this.currentShopBizId) return
      this.loading = true
      try {
        const shop = this.shopList.find(s => s.shop_id === this.currentShopBizId)
        this.currentShopName = shop ? shop.shop_name : ''
        const res = await this.$http.get('/order/list', {
          params: {
            shopId: this.currentShopBizId,
            page: this.currentPage,
            size: this.pageSize
          }
        })
        this.orderList = res.data.list || []
        this.total = res.data.total || 0
      } catch (e) {
        console.error(e)
        this.$message.error('获取订单失败')
      } finally {
        this.loading = false
      }
    },
    handleAddOrder() {
      this.addDialogVisible = true
    },
    openBatchDialog() {
      this.batchDialogVisible = true
    },
    handleSizeChange() {
      // 切换每页条数时回到第一页
      this.currentPage = 1
      this.getOrderList()
    }
  }
}
</script>

<style lang="scss" scoped>
.order-page {
  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
  }
}
</style>
