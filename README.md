# 智查查 - 电商订单风险检测平台（前端）

## 技术栈
- Vue 2.7
- Vue Router 3
- Element UI
- Axios

## 项目结构
```
zhichacha-web/
├── public/
│   └── index.html          # HTML 入口
├── src/
│   ├── layout/
│   │   └── MainLayout.vue  # 主布局（侧边栏+顶部栏）
│   ├── router/
│   │   └── index.js        # 路由配置
│   ├── utils/
│   │   └── request.js      # Axios 封装
│   ├── views/
│   │   ├── Login.vue       # 登录页
│   │   ├── Register.vue    # 注册页
│   │   ├── Home.vue        # 首页/店铺管理
│   │   ├── OrderList.vue   # 订单查询
│   │   └── RiskSearch.vue  # 风险检测
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── babel.config.js
├── package.json
└── vue.config.js
```

## 启动步骤

### 1. 安装依赖
```bash
cd zhichacha-web
npm install
```

### 2. 启动开发服务器
```bash
npm run serve
```

启动后访问 http://localhost:8080

### 3. 打包构建
```bash
npm run build
```

## 注意事项
- 后端接口地址默认配置为 `http://localhost:3001/api`，如需修改请编辑 `src/utils/request.js`
- 请确保后端服务（Node.js + MySQL）已启动
- 数据库建表 SQL 请参考后端项目中的 `init.sql`
