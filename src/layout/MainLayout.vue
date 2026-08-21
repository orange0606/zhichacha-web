<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <i class="el-icon-search"></i>
        <span>智查查</span>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <i class="el-icon-data-analysis"></i>
          <span slot="title">数据看板</span>
        </el-menu-item>
        <el-menu-item index="/home">
          <i class="el-icon-s-home"></i>
          <span slot="title">店铺管理</span>
        </el-menu-item>
        <el-menu-item index="/order">
          <i class="el-icon-document"></i>
          <span slot="title">订单查询</span>
        </el-menu-item>
        <el-menu-item index="/villainsSearch">
          <i class="el-icon-warning-outline"></i>
          <span slot="title">搜索恶人</span>
        </el-menu-item>
        <el-menu-item index="/riskSearch">
          <i class="el-icon-warning-outline"></i>
          <span slot="title">风险检测</span>
        </el-menu-item>
        <el-menu-item index="/reportManage">
          <i class="el-icon-s-order"></i>
          <span slot="title">举报管理</span>
        </el-menu-item>
        <el-menu-item index="/extension/manage">
          <i class="el-icon-upload2"></i>
          <span slot="title">插件管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部栏 -->
      <el-header class="header">
        <div class="header-left">
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <el-button size="mini" type="text" icon="el-icon-download" class="download-btn" @click="goDownload">
            下载插件
          </el-button>
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <i class="el-icon-user-solid"></i>
              {{ username }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="changeUsername">修改用户名</el-dropdown-item>
              <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>

    <!-- 修改用户名弹窗 -->
    <el-dialog title="修改用户名" :visible.sync="usernameDialog" width="420px" custom-class="account-dialog">
      <el-form :model="usernameForm" size="mini" :rules="usernameRules" ref="usernameForm" label-width="90px">
        <el-form-item label="当前用户名">
          <span>{{ username }}</span>
        </el-form-item>
        <el-form-item label="新用户名" prop="newUsername">
          <el-input v-model="usernameForm.newUsername" placeholder="请输入新用户名（2-20位）" maxlength="20" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="usernameForm.password" type="password" placeholder="请输入当前登录密码" show-password></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="usernameDialog = false">取消</el-button>
        <el-button size="mini" type="primary" :loading="usernameLoading" @click="submitUsername">确认修改</el-button>
      </div>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog title="修改密码" :visible.sync="passwordDialog" width="420px" custom-class="account-dialog">
      <el-form :model="passwordForm" size="mini" :rules="passwordRules" ref="passwordForm" label-width="100px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="至少6位" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="再次输入新密码" show-password></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="passwordDialog = false">取消</el-button>
        <el-button size="mini" type="primary" :loading="passwordLoading" @click="submitPassword">确认修改</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'MainLayout',
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    return {
      username: '',
      usernameDialog: false,
      usernameLoading: false,
      usernameForm: { newUsername: '', password: '' },
      usernameRules: {
        newUsername: [
          { required: true, message: '请输入新用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度为2-20位', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' }
        ]
      },
      passwordDialog: false,
      passwordLoading: false,
      passwordForm: { oldPassword: '', newPassword: '', confirmPassword: '' },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码至少6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: validateConfirm, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    pageTitle() {
      const titleMap = {
        '/dashboard': '数据看板',
        '/home': '店铺管理',
        '/order': '订单查询',
        '/villainsSearch': '搜索恶人',
        '/riskSearch': '风险检测',
        '/reportManage': '举报管理',
        '/extension/manage': '插件管理'
      }
      return titleMap[this.$route.path] || '智查查'
    }
  },
  created() {
    this.username = localStorage.getItem('username') || '用户'
  },
  methods: {
    goDownload() {
      this.$router.push('/extension/download')
    },
    handleCommand(command) {
      if (command === 'logout') {
        this.$confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          localStorage.clear()
          this.$router.push('/login')
          this.$message.success('已退出登录')
        }).catch(() => {})
      } else if (command === 'changeUsername') {
        this.usernameForm = { newUsername: '', password: '' }
        this.usernameDialog = true
        this.$nextTick(() => {
          this.$refs.usernameForm && this.$refs.usernameForm.clearValidate()
        })
      } else if (command === 'changePassword') {
        this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' }
        this.passwordDialog = true
        this.$nextTick(() => {
          this.$refs.passwordForm && this.$refs.passwordForm.clearValidate()
        })
      }
    },
    submitUsername() {
      this.$refs.usernameForm.validate(async (valid) => {
        if (!valid) return
        this.usernameLoading = true
        try {
          const res = await request.post('/auth/change-username', this.usernameForm)
          this.username = res.data.username
          localStorage.setItem('username', res.data.username)
          this.usernameDialog = false
          this.$message.success('用户名修改成功')
        } catch (e) {
          // 错误已由拦截器提示
        } finally {
          this.usernameLoading = false
        }
      })
    },
    submitPassword() {
      this.$refs.passwordForm.validate(async (valid) => {
        if (!valid) return
        this.passwordLoading = true
        try {
          await request.post('/auth/change-password', {
            oldPassword: this.passwordForm.oldPassword,
            newPassword: this.passwordForm.newPassword
          })
          this.passwordDialog = false
          this.$message.success('密码修改成功，请重新登录')
          setTimeout(() => {
            localStorage.clear()
            this.$router.push('/login')
          }, 1500)
        } catch (e) {
          // 错误已由拦截器提示
        } finally {
          this.passwordLoading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
}

/* 内部容器撑满高度，header(60px) + main 填满 100vh */
.main-container {
  height: 100%;
}

.sidebar {
  background-color: #304156;
  height: 100vh;
  overflow-y: auto;

  .logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: #fff;
    font-size: 20px;
    font-weight: bold;
    background-color: #2b3a4b;

    i {
      margin-right: 8px;
      font-size: 24px;
      color: #409EFF;
    }
  }

  .el-menu {
    border-right: none;
  }
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .download-btn {
      color: #409eff;
      font-size: 13px;
    }
  }

  .user-info {
    cursor: pointer;
    color: #606266;

    i {
      margin-right: 4px;
    }
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  flex: 1;
  overflow: auto;
}
</style>
