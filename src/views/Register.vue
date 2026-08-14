<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <i class="el-icon-search logo-icon"></i>
        <h2>注册账号</h2>
        <p>加入智查查，开启订单风险检测</p>
      </div>
      <el-form ref="registerForm" :model="registerForm" :rules="rules" class="register-form">
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入账号"
            prefix-icon="el-icon-user"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            prefix-icon="el-icon-lock"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            prefix-icon="el-icon-lock"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="register-btn"
            @click="handleRegister"
          >
            注 册
          </el-button>
        </el-form-item>
        <div class="register-footer">
          已有账号？<router-link to="/login">返回登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      registerForm: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { min: 3, max: 20, message: '账号长度在3到20个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirm, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleRegister() {
      this.$refs.registerForm.validate(async valid => {
        if (!valid) return
        this.loading = true
        try {
          await this.$http.post('/auth/register', {
            username: this.registerForm.username,
            password: this.registerForm.password
          })
          this.$message.success('注册成功，请登录')
          this.$router.push('/login')
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
.register-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-box {
  width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-header {
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

.register-form {
  .register-btn {
    width: 100%;
  }

  .register-footer {
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
