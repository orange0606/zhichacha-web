<template>
  <div class="user-manage">
    <!-- 顶部操作栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <span class="toolbar-title">👥 用户管理</span>
        <div class="toolbar-actions">
          <el-input
            v-model="keyword"
            placeholder="搜索用户名"
            size="small"
            style="width: 200px; margin-right: 10px;"
            clearable
            @keyup.enter.native="loadList"
          >
            <el-button slot="append" icon="el-icon-search" @click="loadList"></el-button>
          </el-input>
          <el-button size="small" type="primary" icon="el-icon-plus" @click="openAddDialog">新增用户</el-button>
          <el-button size="small" icon="el-icon-refresh" @click="loadList">刷新</el-button>
        </div>
      </div>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="list-card">
      <el-table :data="list" v-loading="loading" border size="small" stripe>
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="username" label="用户名" min-width="140">
          <template slot-scope="scope">
            <span style="font-weight: 500;">{{ scope.row.username | maskShopName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="80" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.is_admin === 1" size="mini" type="warning">管理员</el-tag>
            <el-tag v-else size="mini" type="info">普通用户</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 1" size="mini" type="success">正常</el-tag>
            <el-tag v-else size="mini" type="danger">已禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shop_count" label="绑定店铺" width="85" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" type="info">{{ scope.row.shop_count }} 家</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="report_count" label="举报数" width="85" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" :type="scope.row.report_count > 0 ? 'danger' : 'success'">
              {{ scope.row.report_count }} 条
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="注册时间" width="155" align="center">
          <template slot-scope="scope">
            {{ formatTime(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="text" icon="el-icon-key" @click="openResetPwdDialog(scope.row)">重置密码</el-button>
            <el-button size="mini" type="text" class="delete-btn" icon="el-icon-delete" @click="confirmDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </el-card>

    <!-- 新增/编辑用户弹窗 -->
    <el-dialog
      :title="editDialog.title"
      :visible.sync="editDialog.visible"
      width="450px"
      :close-on-click-modal="false"
    >
      <el-form :model="editDialog.form" :rules="editDialog.rules" ref="editForm" label-width="80px" size="small">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editDialog.form.username" placeholder="请输入用户名" style="width: 100%;"></el-input>
        </el-form-item>
        <el-form-item v-if="editDialog.isAdd" label="密码" prop="password">
          <el-input v-model="editDialog.form.password" type="password" placeholder="至少6位" show-password></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-radio-group v-model="editDialog.form.isAdmin">
            <el-radio :label="0">普通用户</el-radio>
            <el-radio :label="1">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editDialog.form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="editDialog.visible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="editDialog.loading" @click="submitEdit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog
      title="重置密码"
      :visible.sync="resetPwdDialog.visible"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="resetPwdDialog.form" :rules="resetPwdDialog.rules" ref="resetPwdForm" label-width="80px" size="small">
        <el-form-item label="用户">
          <span style="font-weight: 500;">{{ resetPwdDialog.username }}</span>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetPwdDialog.form.newPassword" type="password" placeholder="至少6位" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPwdDialog.form.confirmPassword" type="password" placeholder="再次输入新密码" show-password></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="resetPwdDialog.visible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="resetPwdDialog.loading" @click="submitResetPwd">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'UserManage',
  data() {
    return {
      loading: false,
      keyword: '',
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,

      // 新增/编辑弹窗
      editDialog: {
        visible: false,
        title: '',
        isAdd: true,
        loading: false,
        form: {
          id: null,
          username: '',
          password: '',
          isAdmin: 0,
          status: 1
        },
        rules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 2, max: 20, message: '长度为2-20位', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, message: '密码至少6位', trigger: 'blur' }
          ]
        }
      },

      // 重置密码弹窗
      resetPwdDialog: {
        visible: false,
        loading: false,
        userId: null,
        username: '',
        form: {
          newPassword: '',
          confirmPassword: ''
        },
        rules: {
          newPassword: [
            { required: true, message: '请输入新密码', trigger: 'blur' },
            { min: 6, message: '密码至少6位', trigger: 'blur' }
          ],
          confirmPassword: [
            { required: true, message: '请确认密码', trigger: 'blur' },
            { validator: this.validateConfirmPwd, trigger: 'blur' }
          ]
        }
      }
    }
  },
  created() {
    // 路由守卫：非管理员直接跳走
    if (localStorage.getItem('isAdmin') !== '1') {
      this.$message.error('无权限访问用户管理')
      this.$router.push('/dashboard')
      return
    }
    this.loadList()
  },
  methods: {
    // 加载用户列表
    async loadList() {
      this.loading = true
      try {
        const res = await request.get('/user/list', {
          params: {
            page: this.page,
            pageSize: this.pageSize,
            keyword: this.keyword
          }
        })
        if (res.code === 0) {
          this.list = res.data.list
          this.total = res.data.total
        } else {
          this.$message.error(res.msg || '加载失败')
        }
      } catch (e) {
        this.$message.error('加载失败: ' + e.message)
      } finally {
        this.loading = false
      }
    },

    // 打开新增弹窗
    openAddDialog() {
      this.editDialog.isAdd = true
      this.editDialog.title = '新增用户'
      this.editDialog.form = {
        id: null,
        username: '',
        password: '',
        isAdmin: 0,
        status: 1
      }
      this.editDialog.visible = true
      this.$nextTick(() => {
        this.$refs.editForm?.clearValidate()
      })
    },

    // 打开编辑弹窗
    openEditDialog(row) {
      this.editDialog.isAdd = false
      this.editDialog.title = '编辑用户'
      this.editDialog.form = {
        id: row.id,
        username: row.username,
        password: '',
        isAdmin: row.is_admin,
        status: row.status
      }
      this.editDialog.visible = true
      this.$nextTick(() => {
        this.$refs.editForm?.clearValidate()
      })
    },

    // 提交新增/编辑
    submitEdit() {
      this.$refs.editForm.validate(async (valid) => {
        if (!valid) return

        this.editDialog.loading = true
        try {
          const api = this.editDialog.isAdd ? '/user/add' : '/user/update'
          const payload = this.editDialog.isAdd
            ? {
                username: this.editDialog.form.username,
                password: this.editDialog.form.password,
                isAdmin: this.editDialog.form.isAdmin,
                status: this.editDialog.form.status
              }
            : {
                id: this.editDialog.form.id,
                username: this.editDialog.form.username,
                isAdmin: this.editDialog.form.isAdmin,
                status: this.editDialog.form.status
              }

          const res = await request.post(api, payload)
          if (res.code === 0) {
            this.$message.success(res.msg)
            this.editDialog.visible = false
            this.loadList()
          } else {
            this.$message.error(res.msg)
          }
        } catch (e) {
          this.$message.error('操作失败: ' + e.message)
        } finally {
          this.editDialog.loading = false
        }
      })
    },

    // 打开重置密码弹窗
    openResetPwdDialog(row) {
      this.resetPwdDialog.userId = row.id
      this.resetPwdDialog.username = row.username
      this.resetPwdDialog.form = {
        newPassword: '',
        confirmPassword: ''
      }
      this.resetPwdDialog.visible = true
      this.$nextTick(() => {
        this.$refs.resetPwdForm?.clearValidate()
      })
    },

    // 确认密码校验
    validateConfirmPwd(rule, value, callback) {
      if (value !== this.resetPwdDialog.form.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },

    // 提交重置密码
    submitResetPwd() {
      this.$refs.resetPwdForm.validate(async (valid) => {
        if (!valid) return

        this.resetPwdDialog.loading = true
        try {
          const res = await request.post('/user/reset-password', {
            id: this.resetPwdDialog.userId,
            newPassword: this.resetPwdDialog.form.newPassword
          })
          if (res.code === 0) {
            this.$message.success(res.msg)
            this.resetPwdDialog.visible = false
          } else {
            this.$message.error(res.msg)
          }
        } catch (e) {
          this.$message.error('操作失败: ' + e.message)
        } finally {
          this.resetPwdDialog.loading = false
        }
      })
    },

    // 确认删除
    confirmDelete(row) {
      this.$confirm(
        `确定要删除用户「${row.username}」吗？该用户的店铺和订单数据将保留。`,
        '确认删除',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          const res = await request.post('/user/delete', { id: row.id })
          if (res.code === 0) {
            this.$message.success(res.msg)
            this.loadList()
          } else {
            this.$message.error(res.msg)
          }
        } catch (e) {
          this.$message.error('删除失败: ' + e.message)
        }
      }).catch(() => {})
    },

    // 分页
    handleSizeChange(val) {
      this.pageSize = val
      this.page = 1
      this.loadList()
    },
    handleCurrentChange(val) {
      this.page = val
      this.loadList()
    },

    // 时间格式化
    formatTime(time) {
      if (!time) return '-'
      return new Date(time).toLocaleString('zh-CN', { hour12: false })
    }
  }
}
</script>

<style scoped>
.user-manage {
  padding: 16px;
}

.toolbar-card {
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.toolbar-actions {
  display: flex;
  align-items: center;
}

.list-card {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}

.delete-btn {
  color: #f56c6c;
}

.delete-btn:hover {
  color: #ff4d4f;
}
</style>
