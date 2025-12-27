<template>
  <div class="invoice-edit-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <h2>編輯發票</h2>
          <el-button text @click="handleBack">
            <el-icon><Back /></el-icon> 返回列表
          </el-button>
        </div>
      </template>

      <InvoiceForm
        v-if="invoice"
        :initial-data="invoice"
        submit-button-text="更新發票"
        @submit="handleSubmit"
        @cancel="handleBack"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import InvoiceForm from '@/components/InvoiceForm.vue'
import { invoiceApi, type Invoice } from '@/services/api'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const invoice = ref<Invoice>()

const invoiceId = Number(route.params.id)

const fetchInvoice = async () => {
  loading.value = true
  try {
    const response = await invoiceApi.getInvoice(invoiceId)
    invoice.value = response.data
  } catch (error) {
    ElMessage.error('載入發票資料失敗')
    console.error(error)
    router.push('/invoices')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (data: Invoice) => {
  try {
    await invoiceApi.updateInvoice(invoiceId, data)
    ElMessage.success('發票更新成功')
    router.push('/invoices')
  } catch (error) {
    ElMessage.error('發票更新失敗')
    console.error(error)
  }
}

const handleBack = () => {
  router.push('/invoices')
}

onMounted(() => {
  fetchInvoice()
})
</script>

<style scoped>
.invoice-edit-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
}
</style>
