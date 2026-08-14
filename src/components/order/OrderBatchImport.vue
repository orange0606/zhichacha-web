<template>
  <el-dialog
    title="批量导入订单"
    :visible.sync="dialogVisible"
    width="90%"
    size="mini"
    top="8vh"
    :close-on-click-modal="false"
    @closed="onClosed"
  >
    <!-- 文件上传区域 -->
    <div class="upload-area" style="margin-bottom:16px;">
      <el-upload
        ref="uploadRef"
        action=""
        :auto-upload="false"
        accept=".xlsx,.xls"
        :on-change="handleExcelChange"
      >
        <el-button type="primary" icon="el-icon-folder-opened" size="mini">选择Excel文件</el-button>
        <div slot="tip" class="el-upload__tip">仅支持 xlsx/xls 格式，表格字段需包含：订单号、商品名称、数量、金额、下单账号、姓名、电话、地址、下单时间</div>
      </el-upload>
    </div>

    <!-- 预览表格（保留序号列） -->
    <el-card v-if="previewList.length > 0" shadow="hover">
      <div style="margin-bottom:10px;display:flex;align-items:center;gap:12px;">
        <span>共 {{ previewList.length }} 条数据，请勾选需要导入的订单</span>
        <el-checkbox v-model="isAllCheck" @change="toggleAllCheck">全选/取消全选</el-checkbox>
      </div>
      <el-table
        ref="previewTable"
        :data="previewList"
        size="mini"
        border
        stripe
        max-height="400"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40" />
        <!-- 序列号 -->
        <el-table-column label="序号" width="45" align="center">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="order_no" label="订单号" width="130" />
        <el-table-column prop="goods_name" label="商品名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="goods_count" label="数量" width="70" align="center" />
        <el-table-column prop="pay_amount" label="应付金额" width="100" align="center" />
        <el-table-column prop="buyer_account" label="下单账号" width="130" />
        <el-table-column prop="buyer_name" label="客户姓名" width="80" />
        <el-table-column prop="buyer_phone" label="联系电话" width="90" />
        <el-table-column prop="buyer_address" label="客户地址" min-width="180" show-overflow-tooltip />
        <el-table-column prop="order_time" label="下单时间" width="130" />
      </el-table>
    </el-card>
    <div v-else style="padding:40px;text-align:center;color:#999;">上传Excel后预览数据</div>

    <span slot="footer">
      <el-button @click="dialogVisible = false" size="mini">取消</el-button>
      <el-button type="success" :loading="batchLoading" @click="submitBatchOrder" size="mini">确认导入勾选数据</el-button>
    </span>
  </el-dialog>
</template>

<script>
import * as XLSX from 'xlsx'
export default {
  name: 'OrderBatchImport',
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
      batchLoading: false,
      previewList: [],
      isAllCheck: false,
      selectedRows: []
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
        this.previewList = []
        this.selectedRows = []
        this.isAllCheck = false
        this.$nextTick(() => {
          this.$refs.uploadRef && this.$refs.uploadRef.clearFiles()
        })
      }
    }
  },
  methods: {
    onClosed() {
      this.previewList = []
      this.selectedRows = []
      this.isAllCheck = false
    },
    handleExcelChange(file) {
      const fileReader = new FileReader()
      fileReader.readAsArrayBuffer(file.raw)
      fileReader.onload = ev => {
        try {
          const data = new Uint8Array(ev.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(sheet)
          console.log(jsonData)
          this.previewList = jsonData.map(item => {
            return {
              order_no: item['订单号'] || '',
              goods_name: item['商品名称'] || '',
              goods_count: Number(item['数量']) || 1,
              pay_amount: Number(item['应付金额']) || 0,
              buyer_account: item['下单帐号'] || '',
              buyer_name: item['客户姓名'] || '',
              buyer_phone: item['联系电话'] || '',
              buyer_address: item['客户地址'] || '',
              order_time: item['下单时间'] || ''
            }
          })
          this.selectedRows = []
          this.isAllCheck = false
        } catch (err) {
          console.error('解析异常：', err)
          this.previewList = []
          this.selectedRows = []
          if (err.message.includes('password-protected')) {
            this.$message.error('Excel文件设有打开密码，请解除加密后重新上传！')
          } else {
            this.$message.error('文件解析失败，请另存为标准xlsx文件重试')
          }
        }
      }
    },
    // 表格选中回调
    handleSelectionChange(selected) {
      this.selectedRows = selected
    },
    // 全选切换
    toggleAllCheck() {
      const table = this.$refs.previewTable
      if (!table) return
      table.toggleAllSelection(this.isAllCheck)
    },
    async submitBatchOrder() {
      const selectedList = this.selectedRows
      if (selectedList.length === 0) {
        return this.$message.warning('请至少勾选一条订单数据')
      }
      this.batchLoading = true
      try {
        const submitData = selectedList.map(item => {
          return {
            ...item,
            shop_id: this.shopId,
            shop_name: this.shopName
          }
        })
        await this.$http.post('/order/batchAdd', { list: submitData })
        this.$message.success(`成功导入${selectedList.length}条订单`)
        this.dialogVisible = false
        this.$emit('success')
      } catch (err) {
        console.error(err)
        this.$message.error(err.response?.data?.msg || '批量导入失败')
      } finally {
        this.batchLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-area {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
