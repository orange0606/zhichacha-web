<template>
  <el-dialog
    title="我要举报"
    :visible.sync="dialogVisible"
    width="620px"
    size="mini"
    :close-on-click-modal="false"
    @closed="resetForm"
  >
    <el-form :model="form" :rules="rules" ref="reportForm" label-width="120px" size="mini">
      <el-form-item label="纠纷类型" prop="disputeType">
        <el-select v-model="form.disputeType" placeholder="请选择纠纷类型" size="mini" style="width: 100%;">
          <el-option label="异常索赔" :value="1"></el-option>
          <el-option label="仅退款" :value="2"></el-option>
          <el-option label="异常退货" :value="3"></el-option>
          <el-option label="异常评价" :value="4"></el-option>
          <el-option label="骗取财物" :value="5"></el-option>
          <el-option label="其它" :value="6"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="平台账号" prop="buyerAccount">
        <el-input v-model="form.buyerAccount" placeholder="请输入买家平台账号（必填）" size="mini"></el-input>
      </el-form-item>

      <el-form-item label="订单编号" prop="orderNo">
        <el-input v-model="form.orderNo" placeholder="请输入订单编号（选填）" size="mini"></el-input>
      </el-form-item>

      <el-form-item label="发生时间" prop="happenTime">
        <el-date-picker
          v-model="form.happenTime"
          type="datetime"
          placeholder="选择发生时间（选填）"
          value-format="yyyy-MM-dd HH:mm:ss"
          size="mini"
          style="width: 100%;">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="收货名称" prop="receiverName">
        <el-input v-model="form.receiverName" placeholder="请输入收货人姓名（选填）" size="mini"></el-input>
      </el-form-item>

      <el-form-item label="收货手机" prop="receiverPhone">
        <el-input v-model="form.receiverPhone" placeholder="请输入手机号或后4位（选填）" size="mini"></el-input>
      </el-form-item>

      <el-form-item label="收货地址" prop="receiverAddress">
        <el-input v-model="form.receiverAddress" type="textarea" :rows="2" placeholder="请输入收货地址（选填）" size="mini"></el-input>
      </el-form-item>

      <el-form-item label="举报缘由" prop="reason">
        <el-input v-model="form.reason" type="textarea" :rows="5" placeholder="请详细描述举报内容（必填）" size="mini"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button size="mini" @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" size="mini" @click="submitForm" :loading="submitLoading">提交举报</el-button>
    </span>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ReportSubmitDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      submitLoading: false,
      form: this.getEmptyForm(),
      rules: {
        disputeType: [
          { required: true, message: '请选择纠纷类型', trigger: 'change' }
        ],
        buyerAccount: [
          { required: true, message: '请输入平台账号', trigger: 'blur' }
        ],
        reason: [
          { required: true, message: '请输入举报缘由', trigger: 'blur' },
          { min: 5, message: '举报内容至少5个字', trigger: 'blur' }
        ]
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
        this.form = this.getEmptyForm()
        this.$nextTick(() => {
          this.$refs.reportForm && this.$refs.reportForm.clearValidate()
        })
      }
    }
  },
  methods: {
    getEmptyForm() {
      return {
        disputeType: '',
        orderNo: '',
        buyerAccount: '',
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        reason: '',
        happenTime: ''
      }
    },
    submitForm() {
      this.$refs.reportForm.validate(async valid => {
        if (!valid) return
        this.submitLoading = true
        try {
          await request.post('/report/submit', this.form)
          this.$message.success('举报提交成功！')
          this.dialogVisible = false
          this.$emit('success')
        } catch (e) {
          console.error(e)
        } finally {
          this.submitLoading = false
        }
      })
    },
    resetForm() {
      this.form = this.getEmptyForm()
      this.$nextTick(() => {
        this.$refs.reportForm && this.$refs.reportForm.clearValidate()
      })
    }
  }
}
</script>
