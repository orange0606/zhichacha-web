<template>
  <el-dialog
    title="新增订单"
    :visible.sync="dialogVisible"
    width="620px"
    :close-on-click-modal="false"
    @closed="onClosed"
  >
    <el-form ref="orderForm" size="mini" :model="orderForm" :rules="orderRules" label-width="110px">
      <el-form-item label="所属店铺">
        <el-input :value="shopName" disabled />
      </el-form-item>
      <el-row :gutter="20">
        <el-col span="12">
          <el-form-item label="订单号" prop="order_no">
            <el-input v-model="orderForm.order_no" placeholder="请输入订单号" />
          </el-form-item>
        </el-col>
        <el-col span="12">
          <el-form-item label="订购数量" prop="goods_count">
            <el-input-number v-model="orderForm.goods_count" :min="1" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col span="12">
          <el-form-item label="下单账号" prop="buyer_account">
            <el-input v-model="orderForm.buyer_account" placeholder="买家账号" />
          </el-form-item>
        </el-col>
        <el-col span="12">
          <el-form-item label="客户姓名" prop="buyer_name">
            <el-input v-model="orderForm.buyer_name" placeholder="客户姓名" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col span="12">
          <el-form-item label="联系电话" prop="buyer_phone">
            <el-input v-model="orderForm.buyer_phone" placeholder="手机号" />
          </el-form-item>
        </el-col>
        <el-col span="12">
          <el-form-item label="应付金额" prop="pay_amount">
            <el-input-number v-model="orderForm.pay_amount" :min="0" :precision="2" :step="0.01" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="商品名称" prop="goods_name">
        <el-input v-model="orderForm.goods_name" placeholder="请输入商品名称" />
      </el-form-item>
      <el-form-item label="客户地址" prop="buyer_address">
        <el-input v-model="orderForm.buyer_address" type="textarea" :rows="2" placeholder="收货地址" />
      </el-form-item>
      <el-form-item label="下单时间" prop="order_time">
        <el-date-picker v-model="orderForm.order_time" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%" />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="submitOrder">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'OrderAddDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    shopId: {
      type: [Number, String],
      default: null
    },
    shopName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      submitLoading: false,
      orderForm: this.getEmptyForm(),
      orderRules: {
        order_no: [{ required: true, message: '请输入订单号', trigger: 'blur' }],
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_count: [{ required: true, message: '请输入订购数量', trigger: 'blur' }],
        pay_amount: [{ required: true, message: '请输入应付金额', trigger: 'blur' }],
        buyer_account: [{ required: true, message: '请输入下单账号', trigger: 'blur' }],
        buyer_name: [{ required: true, message: '请填写客户姓名', trigger: 'blur' }],
        buyer_phone: [{ required: true, message: '请填写联系电话', trigger: 'blur' }],
        buyer_address: [{ required: true, message: '请填写收货地址', trigger: 'blur' }],
        order_time: [{ required: true, message: '请选择下单时间', trigger: 'change' }]
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.orderForm = this.getEmptyForm()
        this.$nextTick(() => {
          this.$refs.orderForm && this.$refs.orderForm.clearValidate()
        })
      }
    }
  },
  methods: {
    getEmptyForm() {
      return {
        order_no: '',
        goods_name: '',
        goods_count: 1,
        pay_amount: 0,
        buyer_account: '',
        buyer_name: '',
        buyer_phone: '',
        buyer_address: '',
        order_time: ''
      }
    },
    onClosed() {
      this.$refs.orderForm && this.$refs.orderForm.resetFields()
    },
    submitOrder() {
      this.$refs.orderForm.validate(async valid => {
        if (!valid) return
        this.submitLoading = true
        try {
          await this.$http.post('/order/add', {
            ...this.orderForm,
            shop_id: this.shopId,
            shop_name: this.shopName
          })
          this.$message.success('订单添加成功')
          this.dialogVisible = false
          this.$emit('success')
        } catch (e) {
          console.error(e)
          this.$message.error(e.response?.data?.msg || '新增失败')
        } finally {
          this.submitLoading = false
        }
      })
    }
  }
}
</script>
