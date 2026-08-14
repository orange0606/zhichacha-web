<template>
  <div class="home-page">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h3>我的店铺</h3>
        <span class="shop-count">共 {{ shopList.length }} 个店铺</span>
      </div>
      <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddShop">
        新增店铺
      </el-button>
    </div>

    <!-- 店铺卡片列表 -->
    <div v-loading="loading" class="shop-grid">
      <el-card
        v-for="shop in shopList"
        :key="shop.id"
        class="shop-card"
        shadow="hover"
      >
        <div class="shop-card-content" @click.native="goToOrders(shop)">
          <div class="shop-icon">
            <i class="el-icon-s-shop"></i>
          </div>
          <div class="shop-info">
            <h4 class="shop-name">{{ shop.shop_name | maskShopName }}</h4>
            <p class="shop-row">店铺ID：{{ shop.shop_id | maskShopId }}</p>
            <p class="shop-row">店铺拥有人：{{ shop.username }}</p>
            <p class="shop-time">创建时间：{{ formatTime(shop.create_time) }}</p>
          </div>
          <div class="shop-arrow">
            <i class="el-icon-arrow-right"></i>
          </div>
        </div>
        <!-- 操作按钮区域，阻止冒泡，避免跳转订单 -->
        <div class="shop-actions" @click.stop>
          <el-popconfirm
            title="确定清空该店铺所有订单吗？订单数据删除后无法恢复！"
            confirm-button-text="确认清空"
            cancel-button-text="取消"
            icon="el-icon-warning"
            icon-color="#E6A23C"
            @confirm="handleClearOrders(shop.shop_id)"
          >
            <el-button size="mini" type="warning" icon="el-icon-delete-solid" slot="reference">清空订单</el-button>
          </el-popconfirm>
          <el-popconfirm
            title="删除警告：删除该店铺会同步删除所有关联订单，数据无法恢复，确认删除吗？"
            confirm-button-text="确认删除"
            cancel-button-text="取消"
            icon="el-icon-warning"
            icon-color="#F56C6C"
            @confirm="handleDeleteShop(shop.shop_id)"
          >
            <el-button size="mini" type="danger" icon="el-icon-delete" slot="reference">删除店铺</el-button>
          </el-popconfirm>
        </div>
      </el-card>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && shopList.length === 0"
        description="暂无店铺，点击右上角新增店铺"
        class="empty-state"
      />
    </div>

    <!-- 新增店铺弹窗 -->
    <el-dialog
      title="新增店铺"
      :visible.sync="dialogVisible"
      width="440px"
      :close-on-click-modal="false"
    >
      <el-form ref="shopForm" :model="shopForm" :rules="shopRules" label-width="90px">
        <el-form-item label="店铺ID" prop="shop_id">
          <el-input-number
            v-model="shopForm.shop_id"
            placeholder="请输入业务店铺ID"
            :min="1"
            style="width:100%"
          />
        </el-form-item>
        <el-form-item label="店铺名称" prop="shop_name">
          <el-input
            v-model="shopForm.shop_name"
            placeholder="请输入店铺名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitShop">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      loading: false,
      shopList: [],
      dialogVisible: false,
      submitLoading: false,
      shopForm: {
        shop_id: null,
        shop_name: ''
      },
      shopRules: {
        shop_id: [
          { required: true, message: '请填写店铺ID', trigger: 'blur' }
        ],
        shop_name: [
          { required: true, message: '请输入店铺名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getShopList()
  },
  methods: {
    // 获取店铺列表
    async getShopList() {
      this.loading = true
      try {
        const res = await this.$http.get('/shop/list')
        this.shopList = res.data || []
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    // 打开新增弹窗
    handleAddShop() {
      this.shopForm = {
        shop_id: null,
        shop_name: ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.shopForm && this.$refs.shopForm.clearValidate()
      })
    },
    // 提交新增店铺
    submitShop() {
      this.$refs.shopForm.validate(async valid => {
        if (!valid) return
        this.submitLoading = true
        try {
          await this.$http.post('/shop/add', this.shopForm)
          this.$message.success('新增店铺成功')
          this.dialogVisible = false
          this.getShopList()
        } catch (e) {
          console.error(e)
          this.$message.error(e.response?.data?.msg || '新增失败')
        } finally {
          this.submitLoading = false
        }
      })
    },
    // 清空店铺所有订单（保留店铺）
    async handleClearOrders(shopId) {
      try {
        const res = await this.$http.delete('/order/clearByShop', {
          data: { shop_id: shopId }
        })
        if (res.code === 0) {
          this.$message.success(res.msg || '订单已清空')
        } else {
          this.$message.error(res.msg || '清空失败')
        }
      } catch (err) {
        console.error(err)
        this.$message.error(err.response?.data?.msg || '清空失败')
      }
    },
    // 删除店铺
    async handleDeleteShop(shopId) {
      try {
        await this.$http.delete('/shop/del', {
          data: { shopId }
        })
        this.$message.success('店铺及关联订单已全部删除')
        this.getShopList()
      } catch (err) {
        console.error(err)
        this.$message.error(err.response?.data?.msg || '删除失败')
      }
    },
    // 跳转订单页面，传真实shop_id
    goToOrders(shop) {
      this.$router.push({
        path: '/order',
        query: {
          shopId: shop.shop_id,
          shopName: shop.shop_name
        }
      })
    },
    // 时间格式化
    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
  }
}
</script>

<style lang="scss" scoped>
.home-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      display: flex;
      align-items: baseline;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 20px;
        color: #303133;
      }

      .shop-count {
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .shop-grid {
    min-height: 400px;
  }

  .shop-card {
    margin-bottom: 16px;
    transition: all 0.3s;
    position: relative;

    &:hover {
      transform: translateY(-2px);
    }

    .shop-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
    }

    .shop-actions {
      position: absolute;
      right: 16px;
      bottom: 12px;
      display: flex;
      gap: 8px;
    }

    .shop-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 28px;
        color: #fff;
      }
    }

    .shop-info {
      flex: 1;

      .shop-name {
        margin: 0 0 6px;
        font-size: 16px;
        color: #303133;
      }
      .shop-row {
        margin: 4px 0;
        font-size: 13px;
        color: #606266;
      }
      .shop-time {
        margin: 6px 0 0;
        font-size: 13px;
        color: #909399;
      }
    }

    .shop-arrow {
      i {
        font-size: 20px;
        color: #c0c4cc;
      }
    }
  }

  .empty-state {
    margin-top: 60px;
  }
}
</style>