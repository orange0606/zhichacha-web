<template>
  <div class="download-page">
    <div class="download-container">
      <!-- 顶部标题 -->
      <div class="page-header">
        <h1>
          <i class="el-icon-download"></i>
          智查查浏览器插件下载
        </h1>
        <p class="subtitle">电商风控自动化助手 · 支持 Chrome / 360 浏览器</p>
      </div>

      <div v-loading="loading">
        <!-- 版本选择 + 详情 -->
        <el-card v-if="versions.length > 0" class="latest-card" shadow="hover">
          <div slot="header" class="latest-header">
            <div class="header-left">
              <span v-if="currentIndex === 0" class="latest-badge">最新版本</span>
              <span class="latest-version">v{{ current.version }}</span>
            </div>
            <div class="header-right">
              <span class="latest-date">发布日期：{{ current.releaseDate }}</span>
              <el-select v-model="selectedVersion" size="small" class="version-select" @change="onVersionChange">
                <el-option
                  v-for="(v, idx) in versions"
                  :key="v.id"
                  :label="(idx === 0 ? '最新版 ' : '') + 'v' + v.version + '（' + v.releaseDate + '）'"
                  :value="v.id"
                ></el-option>
              </el-select>
            </div>
          </div>

          <!-- 更新日志 -->
          <div class="section">
            <h3><i class="el-icon-document"></i> 更新日志</h3>
            <div class="changelog">{{ current.changelog || '暂无更新日志' }}</div>
          </div>

          <!-- 下载按钮 -->
          <div class="section">
            <h3><i class="el-icon-download"></i> 立即下载</h3>
            <div class="download-btns">
              <el-button
                v-if="current.hasChrome"
                type="primary"
                size="medium"
                icon="el-icon-download"
                @click="download(current.id, 'chrome')"
              >
                Chrome 谷歌浏览器版
                <span class="file-size">{{ formatSize(current.chromeSize) }}</span>
              </el-button>
              <el-button
                v-if="current.has360"
                type="success"
                size="medium"
                icon="el-icon-download"
                @click="download(current.id, '360')"
              >
                360 浏览器版
                <span class="file-size">{{ formatSize(current.browser360Size) }}</span>
              </el-button>
            </div>
          </div>

          <!-- 安装说明 -->
          <div class="section">
            <h3><i class="el-icon-info"></i> 安装说明</h3>
            <el-tabs v-model="activeTab" type="card">
              <el-tab-pane label="Chrome / Edge 浏览器" name="chrome">
                <ol class="install-steps">
                  <li>下载上方 Chrome 版本插件压缩包，解压到一个固定文件夹（<strong>不要删除</strong>，后续一直使用）</li>
                  <li>打开 Chrome / Edge 浏览器，地址栏输入 <code>chrome://extensions/</code>（Edge 输入 <code>edge://extensions/</code>）回车</li>
                  <li>打开右上角的<strong>「开发者模式」</strong>开关</li>
                  <li>点击左上角<strong>「加载已解压的扩展程序」</strong>，选择第1步解压出的文件夹</li>
                  <li>安装完成，浏览器右上角会出现智查查图标，固定到工具栏即可使用</li>
                  <li>后续更新版本时，下载新版替换文件夹内容，回到扩展页面点击该插件的<strong>「刷新」</strong>按钮即可</li>
                </ol>
              </el-tab-pane>
              <el-tab-pane label="360 浏览器" name="360">
                <ol class="install-steps">
                  <li>下载上方 360 版本插件压缩包，解压到一个固定文件夹（<strong>不要删除</strong>）</li>
                  <li>打开 360 浏览器，地址栏输入 <code>se://extensions/</code> 回车</li>
                  <li>勾选右上角的<strong>「开发者模式」</strong></li>
                  <li>点击<strong>「加载已解压的扩展程序」</strong>，选择解压出的文件夹</li>
                  <li>安装完成后即可在工具栏看到智查查图标</li>
                  <li>更新版本时同理，替换文件后在扩展管理页点刷新</li>
                </ol>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>

        <el-empty v-else-if="!loading" description="暂无已发布的插件版本"></el-empty>
      </div>

      <!-- 底部 -->
      <div class="page-footer">
        <span>智查查电商风控平台</span>
        <el-button type="text" @click="goHome">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExtensionDownload',
  data() {
    return {
      loading: false,
      versions: [],
      selectedVersion: null,
      activeTab: 'chrome'
    }
  },
  computed: {
    current() {
      return this.versions.find(v => v.id === this.selectedVersion) || this.versions[0] || {}
    },
    currentIndex() {
      return this.versions.findIndex(v => v.id === this.selectedVersion)
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const baseURL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api'
        const res = await fetch(baseURL + '/extension/all-published').then(r => r.json())
        if (res.code === 0) {
          this.versions = res.data || []
          if (this.versions.length > 0) {
            this.selectedVersion = this.versions[0].id
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    onVersionChange() {
      // 切换版本时tab保持不变
    },
    download(id, type) {
      const baseURL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api'
      window.open(baseURL + '/extension/download/' + id + '/' + type, '_blank')
    },
    formatSize(bytes) {
      if (!bytes) return ''
      const mb = bytes / 1024 / 1024
      if (mb >= 1) return mb.toFixed(1) + 'MB'
      return (bytes / 1024).toFixed(0) + 'KB'
    },
    goHome() {
      const token = localStorage.getItem('token')
      if (token) {
        this.$router.push('/dashboard')
      } else {
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.download-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.download-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  color: #fff;
  margin-bottom: 30px;

  h1 {
    margin: 0 0 10px;
    font-size: 32px;

    i {
      margin-right: 10px;
    }
  }

  .subtitle {
    margin: 0;
    font-size: 15px;
    opacity: 0.9;
  }
}

.latest-card {
  border-radius: 12px;

  .latest-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .latest-badge {
      background: linear-gradient(135deg, #f56c6c, #e64340);
      color: #fff;
      padding: 2px 12px;
      border-radius: 12px;
      font-size: 12px;
    }

    .latest-version {
      font-size: 20px;
      font-weight: bold;
      color: #303133;
    }

    .latest-date {
      color: #909399;
      font-size: 13px;
    }

    .version-select {
      width: 200px;
    }
  }
}

.section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    margin: 0 0 12px;
    font-size: 15px;
    color: #303133;

    i {
      margin-right: 6px;
      color: #409eff;
    }
  }
}

.changelog {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px 16px;
  white-space: pre-wrap;
  line-height: 1.8;
  font-size: 14px;
  color: #606266;
}

.download-btns {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  .el-button {
    padding: 12px 24px;
    font-size: 15px;
  }

  .file-size {
    margin-left: 6px;
    font-size: 12px;
    opacity: 0.8;
  }
}

.install-steps {
  margin: 0;
  padding-left: 20px;
  line-height: 2;
  font-size: 14px;
  color: #606266;

  li {
    margin-bottom: 4px;
  }

  code {
    background: #f0f2f5;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 13px;
    color: #e64340;
  }
}

.page-footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 30px;
  font-size: 13px;

  .el-button--text {
    color: #fff;
    opacity: 0.9;
  }
}
</style>
