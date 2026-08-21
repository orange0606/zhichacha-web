<template>
  <div class="extension-manage">
    <!-- 顶部操作栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <span class="toolbar-title">📦 浏览器插件版本管理</span>
        <div>
          <el-button size="small" type="primary" icon="el-icon-plus" @click="openPublishDialog">发布新版本</el-button>
          <el-button size="small" icon="el-icon-refresh" @click="loadList">刷新</el-button>
          <el-button size="small" type="text" icon="el-icon-view" @click="$router.push('/extension/download')">预览下载页</el-button>
        </div>
      </div>
    </el-card>

    <!-- 版本列表 -->
    <el-card class="list-card">
      <el-table :data="list" v-loading="loading" border size="small" stripe>
        <el-table-column type="index" label="#" width="45" align="center" />
        <el-table-column prop="version" label="版本号" width="90" />
        <el-table-column prop="releaseDate" label="发布日期" width="105" />
        <el-table-column prop="publisherName" label="发布人" width="100" />
        <el-table-column label="更新日志" min-width="220">
          <template slot-scope="scope">
            <div class="changelog-cell">{{ scope.row.changelog || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Chrome版" width="110" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.chromeFile" size="mini" type="text" icon="el-icon-download" @click="downloadFile(scope.row, 'chrome')">
              {{ formatSize(scope.row.chromeSize) }}
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="360版" width="110" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.browser360File" size="mini" type="text" icon="el-icon-download" @click="downloadFile(scope.row, '360')">
              {{ formatSize(scope.row.browser360Size) }}
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="下载量" width="100" align="center">
          <template slot-scope="scope">
            <span style="color:#409eff;">{{ scope.row.downloadCountChrome }}</span>
            /
            <span style="color:#67c23a;">{{ scope.row.downloadCount360 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="75" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isPublished ? 'success' : 'info'" size="mini">
              {{ scope.row.isPublished ? '已发布' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.canManage">
              <el-button size="mini" :type="scope.row.isPublished ? 'warning' : 'success'" @click="confirmTogglePublish(scope.row)">
                {{ scope.row.isPublished ? '下架' : '上架' }}
              </el-button>
              <el-button size="mini" type="danger" @click="confirmDelete(scope.row)">删除</el-button>
            </template>
            <span v-else style="color:#c0c4cc;font-size:12px;">仅发布人可操作</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 发布新版本弹窗 -->
    <el-dialog title="发布新版本" :visible.sync="publishDialog" width="560px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="publishForm" label-width="100px" size="small">
        <el-form-item label="版本号" prop="version">
          <el-input v-model="form.version" placeholder="如 1.0.3" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="发布日期" prop="releaseDate">
          <el-date-picker
            v-model="form.releaseDate"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            style="width: 200px;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="更新日志" prop="changelog">
          <el-input
            v-model="form.changelog"
            type="textarea"
            :rows="5"
            placeholder="请输入更新日志，每行一条，如：&#10;1. 新增定时同步物流功能&#10;2. 修复查单发货弹窗兼容问题"
          ></el-input>
        </el-form-item>
        <el-form-item label="Chrome版">
          <el-upload
            :auto-upload="false"
            :limit="1"
            accept=".zip,.crx"
            :on-change="(file) => onFileChange(file, 'chrome')"
            :on-remove="() => onFileRemove('chrome')"
            :file-list="chromeFileList"
          >
            <el-button size="small" type="primary" icon="el-icon-upload2">选择Chrome插件文件</el-button>
            <div slot="tip" class="el-upload__tip">支持 .zip / .crx 格式</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="360浏览器版">
          <el-upload
            :auto-upload="false"
            :limit="1"
            accept=".zip,.crx,.nex"
            :on-change="(file) => onFileChange(file, '360')"
            :on-remove="() => onFileRemove('360')"
            :file-list="browser360FileList"
          >
            <el-button size="small" type="success" icon="el-icon-upload2">选择360插件文件</el-button>
            <div slot="tip" class="el-upload__tip">支持 .zip / .crx / .nex 格式</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="publishDialog = false">取消</el-button>
        <el-button size="small" type="primary" :loading="publishing" @click="handlePublish">确认发布</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ExtensionManage',
  data() {
    return {
      loading: false,
      publishing: false,
      publishDialog: false,
      list: [],
      form: {
        version: '',
        releaseDate: '',
        changelog: '',
        chromeFile: null,
        browser360File: null
      },
      chromeFileList: [],
      browser360FileList: [],
      rules: {
        version: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
        releaseDate: [{ required: true, message: '请选择发布日期', trigger: 'change' }]
      }
    }
  },
  created() {
    this.loadList()
  },
  methods: {
    async loadList() {
      this.loading = true
      try {
        const res = await request.get('/extension/list')
        this.list = res.data || []
      } catch (e) {
        // 拦截器已提示
      } finally {
        this.loading = false
      }
    },
    openPublishDialog() {
      const d = new Date()
      const pad = n => String(n).padStart(2, '0')
      this.form = {
        version: '',
        releaseDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        changelog: '',
        chromeFile: null,
        browser360File: null
      }
      this.chromeFileList = []
      this.browser360FileList = []
      this.publishDialog = true
      this.$nextTick(() => {
        this.$refs.publishForm && this.$refs.publishForm.clearValidate()
      })
    },
    onFileChange(file, type) {
      if (type === 'chrome') {
        this.form.chromeFile = file.raw
        this.chromeFileList = [file]
      } else {
        this.form.browser360File = file.raw
        this.browser360FileList = [file]
      }
    },
    onFileRemove(type) {
      if (type === 'chrome') {
        this.form.chromeFile = null
        this.chromeFileList = []
      } else {
        this.form.browser360File = null
        this.browser360FileList = []
      }
    },
    handlePublish() {
      this.$refs.publishForm.validate(async valid => {
        if (!valid) return
        if (!this.form.chromeFile && !this.form.browser360File) {
          this.$message.warning('请至少上传一个浏览器版本的插件文件')
          return
        }
        this.publishing = true
        try {
          const fd = new FormData()
          fd.append('version', this.form.version)
          fd.append('releaseDate', this.form.releaseDate)
          fd.append('changelog', this.form.changelog)
          if (this.form.chromeFile) fd.append('chromeFile', this.form.chromeFile)
          if (this.form.browser360File) fd.append('browser360File', this.form.browser360File)

          await request.post('/extension/publish', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          this.$message.success('发布成功')
          this.publishDialog = false
          this.loadList()
        } catch (e) {
          // 拦截器已提示
        } finally {
          this.publishing = false
        }
      })
    },
    downloadFile(row, type) {
      const baseURL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api'
      window.open(baseURL + '/extension/download/' + row.id + '/' + type, '_blank')
    },
    confirmTogglePublish(row) {
      const action = row.isPublished ? '下架' : '上架'
      this.$confirm(`确定要${action}版本 v${row.version} 吗？`, '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          await request.put(`/extension/toggle-publish/${row.id}`)
          this.$message.success(`${action}成功`)
          this.loadList()
        } catch (e) {}
      }).catch(() => {})
    },
    confirmDelete(row) {
      this.$confirm(`确定删除版本 v${row.version} 吗？文件也会一并删除，不可恢复！`, '删除确认', {
        type: 'error',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }).then(async () => {
        try {
          await request.delete(`/extension/${row.id}`)
          this.$message.success('删除成功')
          this.loadList()
        } catch (e) {}
      }).catch(() => {})
    },
    formatSize(bytes) {
      if (!bytes) return '0B'
      const mb = bytes / 1024 / 1024
      if (mb >= 1) return mb.toFixed(1) + 'MB'
      return (bytes / 1024).toFixed(0) + 'KB'
    }
  }
}
</script>

<style lang="scss" scoped>
.extension-manage {
  .toolbar-card {
    margin-bottom: 16px;
  }
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  .changelog-cell {
    white-space: pre-wrap;
    line-height: 1.5;
    font-size: 13px;
    color: #606266;
  }
}
</style>
