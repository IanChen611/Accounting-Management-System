<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Document, Plus, Download } from '@element-plus/icons-vue'

const router = useRouter()

const goToInvoices = () => {
  router.push('/invoices')
}

const goToCreate = () => {
  router.push('/invoices/create')
}
</script>

<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <h1>歡迎使用會計管理系統</h1>
      <p class="subtitle">發票開立與管理系統</p>

      <div class="feature-cards">
        <el-card shadow="hover" class="feature-card" @click="goToInvoices">
          <div class="feature-content">
            <el-icon :size="32" color="#409EFF">
              <Document />
            </el-icon>
            <div class="feature-text">
              <h3>發票管理</h3>
              <p>查看、編輯、刪除發票記錄</p>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="feature-card" @click="goToCreate">
          <div class="feature-content">
            <el-icon :size="32" color="#67C23A">
              <Plus />
            </el-icon>
            <div class="feature-text">
              <h3>開立發票</h3>
              <p>快速建立新的發票記錄</p>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="feature-card" @click="goToInvoices">
          <div class="feature-content">
            <el-icon :size="32" color="#E6A23C">
              <Download />
            </el-icon>
            <div class="feature-text">
              <h3>匯出報表</h3>
              <p>匯出 CSV 或 PDF 格式</p>
            </div>
          </div>
        </el-card>
      </div>

      <div class="info-section">
        <h2>系統功能</h2>
        <ul>
          <li>✅ 發票資料輸入與管理</li>
          <li>✅ 自動計算稅金（5% 營業稅）</li>
          <li>✅ 搜尋與篩選功能</li>
          <li>✅ 匯出 CSV / PDF 報表</li>
          <li>✅ 資料儲存於 MySQL 資料庫</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.home-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  text-align: center;
}

.welcome-card h1 {
  font-size: 36px;
  margin-bottom: 10px;
  color: #303133;
}

.subtitle {
  font-size: 18px;
  color: #909399;
  margin-bottom: 40px;
}

.feature-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 50px;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-card {
  transition: all 0.3s;
  cursor: pointer;
  flex: 1;
  min-width: 250px;
  max-width: 350px;
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.feature-content {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.feature-text {
  text-align: left;
  flex: 1;
}

.feature-content h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #303133;
}

.feature-content p {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.info-section {
  margin-top: 40px;
  text-align: left;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.info-section h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
}

.info-section ul {
  list-style: none;
  padding: 0;
}

.info-section li {
  padding: 10px 0;
  font-size: 16px;
  color: #606266;
  border-bottom: 1px solid #EBEEF5;
}

.info-section li:last-child {
  border-bottom: none;
}
</style>
