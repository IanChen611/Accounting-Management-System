<template>
  <div class="invoice-create-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>新增發票</h2>
          <el-button text @click="handleBack">
            <el-icon><Back /></el-icon> 返回列表
          </el-button>
        </div>
      </template>

      <InvoiceForm
        ref="invoiceFormRef"
        submit-button-text="建立發票"
        @submit="handleSubmit"
        @cancel="handleBack"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import InvoiceForm from '@/components/InvoiceForm.vue'
import { invoiceApi, type Invoice } from '@/services/api'

const router = useRouter()
const invoiceFormRef = ref()

const handleSubmit = async (data: Invoice) => {
  try {
    await invoiceApi.createInvoice(data)
    ElMessage.success('發票建立成功')

    // 發票建立成功後，自動將發票號碼加一並清空其他欄位
    if (invoiceFormRef.value) {
      invoiceFormRef.value.resetFormWithIncrementedInvoiceNumber()
    }
  } catch (error) {
    ElMessage.error('發票建立失敗')
    console.error(error)
  }
}

const handleBack = () => {
  router.push('/invoices')
}
</script>

<style scoped>
.invoice-create-container {
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
