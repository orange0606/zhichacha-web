<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <i class="el-icon-search logo-icon"></i>
        <h2>智查查</h2>
        <p>电商订单风险检测平台</p>
      </div>
      <el-form ref="loginForm" :model="loginForm" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账号"
            prefix-icon="el-icon-user"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            size="large"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
        <div class="login-footer">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (!valid) return
        this.loading = true
        try {
          const res = await this.$http.post('/auth/login', this.loginForm)
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('userId', res.data.userId)
          localStorage.setItem('username', res.data.username)
          this.$message.success('登录成功')
          this.$router.push('/home')
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;

  .logo-icon {
    font-size: 48px;
    color: #409EFF;
  }

  h2 {
    margin: 10px 0 5px;
    color: #303133;
    font-size: 28px;
  }

  p {
    color: #909399;
    font-size: 14px;
  }
}

.login-form {
  .login-btn {
    width: 100%;
  }

  .login-footer {
    text-align: center;
    margin-top: 10px;
    color: #909399;
    font-size: 14px;

    a {
      color: #409EFF;
      text-decoration: none;
    }
  }
}
</style>
