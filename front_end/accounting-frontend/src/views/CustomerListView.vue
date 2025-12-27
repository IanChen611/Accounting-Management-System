<template>
  <div class="customer-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>客戶管理</span>
          <el-button type="primary" @click="handleCreate">新增客戶</el-button>
        </div>
      </template>

      <el-table :data="customers" border style="width: 100%">
        <el-table-column prop="code" label="客戶代號" width="150" />
        <el-table-column prop="name" label="客戶名稱" width="200" />
        <el-table-column prop="address" label="聯絡地址" />
        <el-table-column prop="phone" label="聯絡電話" width="150" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">編輯</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">刪除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/編輯對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯客戶' : '新增客戶'"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="客戶代號" prop="code">
          <el-input v-model="form.code" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="客戶名稱" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="聯絡地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="聯絡電話" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">確認</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { customerApi, type Customer } from '@/services/api'

const customers = ref<Customer[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const form = ref<Customer>({
  code: '',
  name: '',
  address: '',
  phone: ''
})

const rules: FormRules = {
  code: [{ required: true, message: '請輸入客戶代號', trigger: 'blur' }],
  name: [{ required: true, message: '請輸入客戶名稱', trigger: 'blur' }]
}

const fetchCustomers = async () => {
  try {
    const response = await customerApi.getCustomers()
    customers.value = response.data
  } catch (error) {
    ElMessage.error('載入客戶列表失敗')
    console.error(error)
  }
}

const handleCreate = () => {
  isEdit.value = false
  form.value = {
    code: '',
    name: '',
    address: '',
    phone: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row: Customer) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value && form.value.id) {
          await customerApi.updateCustomer(form.value.id, form.value)
          ElMessage.success('更新成功')
        } else {
          await customerApi.createCustomer(form.value)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        fetchCustomers()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '操作失敗')
        console.error(error)
      }
    }
  })
}

const handleDelete = async (row: Customer) => {
  try {
    await ElMessageBox.confirm('確定要刪除此客戶嗎？', '警告', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (row.id) {
      await customerApi.deleteCustomer(row.id)
      ElMessage.success('刪除成功')
      fetchCustomers()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('刪除失敗')
      console.error(error)
    }
  }
}

onMounted(() => {
  fetchCustomers()
})
</script>

<style scoped>
.customer-list {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}
</style>
