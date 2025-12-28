<script setup lang="ts">
import { RouterView, useRouter, useRoute } from 'vue-router'
import { Document, HomeFilled, InfoFilled, User, Plus } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const getActiveMenu = () => {
  const path = route.path
  // 如果路徑以 /invoices 開頭（包含子路由），回傳 /invoices
  if (path.startsWith('/invoices')) {
    return '/invoices'
  }
  // 如果路徑以 /customers 開頭，回傳 /customers
  if (path.startsWith('/customers')) {
    return '/customers'
  }
  // 其他情況回傳實際路徑
  return path
}

const handleMenuSelect = (key: string) => {
  router.push(key)
}

const handleCreateInvoice = () => {
  router.push('/invoices/create')
}
</script>

<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-content">
        <h1 class="title">會計管理系統</h1>
        <el-menu
          mode="horizontal"
          :default-active="getActiveMenu()"
          class="navbar"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            首頁
          </el-menu-item>
          <el-menu-item index="/invoices">
            <el-icon><Document /></el-icon>
            發票管理
          </el-menu-item>
          <el-menu-item index="/customers">
            <el-icon><User /></el-icon>
            客戶管理
          </el-menu-item>
          <el-menu-item index="/about">
            <el-icon><InfoFilled /></el-icon>
            關於
          </el-menu-item>
        </el-menu>
        <el-button
          type="primary"
          :icon="Plus"
          @click="handleCreateInvoice"
          class="create-invoice-btn"
        >
          建立發票
        </el-button>
      </div>
    </el-header>

    <el-main class="main-content">
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  height: 60px;
  line-height: 60px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 0 20px;
  width: 100%;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}

.navbar {
  flex: 1;
  border: none;
}

.main-content {
  background-color: #f5f7fa;
  padding: 0 !important;
  min-height: calc(100vh - 60px);
  width: 100%;
}

:deep(.el-menu-item) {
  height: 60px;
  line-height: 60px;
}

.create-invoice-btn {
  margin-left: auto;
  height: 36px;
}

/* 移除 Element Plus 預設的最大寬度限制 */
:deep(.el-main) {
  padding: 0 !important;
  max-width: none !important;
}
</style>
