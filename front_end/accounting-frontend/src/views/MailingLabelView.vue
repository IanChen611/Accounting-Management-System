<template>
  <div class="mailing-label-container">
    <div class="header">
      <h1>寄信標籤</h1>
      <div class="actions">
        <el-button type="success" @click="handleExportExcel" :disabled="labelList.length === 0">
          匯出 Excel
        </el-button>
        <el-button @click="handleClearAll" :disabled="labelList.length === 0">
          清除全部
        </el-button>
      </div>
    </div>

    <el-card>
      <el-table :data="labelList" border style="width: 100%">
        <el-table-column label="客戶代號" width="250">
          <template #default="{ row, $index }">
            <el-select
              v-model="row.customerCode"
              filterable
              placeholder="請輸入或選擇客戶代號"
              :loading="customersLoading"
              @change="(val) => handleCustomerCodeChange(val, $index)"
              @keyup.enter="handleEnterKey($index)"
              style="width: 100%"
              :ref="(el) => setSelectRef(el, $index)"
            >
              <el-option
                v-for="customer in allCustomers"
                :key="customer.code"
                :label="`${customer.code} - ${customer.name}`"
                :value="customer.code"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="客戶名稱" min-width="200" />
        <el-table-column prop="zipCode" label="郵遞區號" width="120" />
        <el-table-column prop="address" label="地址" min-width="300" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ $index }">
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="removeRow($index)"
              :disabled="labelList.length === 1"
            />
          </template>
        </el-table-column>
      </el-table>

      <div class="add-row-hint">
        <el-icon><InfoFilled /></el-icon>
        <span>選擇客戶後按 Enter 可自動新增下一列</span>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, InfoFilled } from '@element-plus/icons-vue'
import { customerApi } from '@/services/api'
import * as XLSX from 'xlsx'

interface LabelRow {
  customerCode: string
  customerName: string
  zipCode: string
  address: string
}

const customersLoading = ref(false)
const allCustomers = ref<any[]>([])
const selectRefs = ref<any[]>([])

const labelList = ref<LabelRow[]>([
  {
    customerCode: '',
    customerName: '',
    zipCode: '',
    address: ''
  }
])

// 設定 select ref
const setSelectRef = (el: any, index: number) => {
  if (el) {
    selectRefs.value[index] = el
  }
}

// 載入所有客戶
const loadAllCustomers = async () => {
  customersLoading.value = true
  try {
    const response = await customerApi.getCustomers()
    allCustomers.value = response.data || []
  } catch (error) {
    console.error('載入客戶列表失敗:', error)
    ElMessage.error('載入客戶列表失敗')
  } finally {
    customersLoading.value = false
  }
}

// 處理客戶代號變更
const handleCustomerCodeChange = async (code: string, index: number) => {
  if (!code) {
    labelList.value[index].customerName = ''
    labelList.value[index].zipCode = ''
    labelList.value[index].address = ''
    return
  }

  try {
    const response = await customerApi.getCustomerByCode(code)
    if (response.data) {
      labelList.value[index].customerName = response.data.name || ''
      labelList.value[index].zipCode = response.data.zipCode || ''
      labelList.value[index].address = response.data.address || ''
    }
  } catch (error) {
    console.log('客戶代號不存在')
    labelList.value[index].customerName = ''
    labelList.value[index].zipCode = ''
    labelList.value[index].address = ''
  }
}

// 處理 Enter 鍵
const handleEnterKey = async (index: number) => {
  const currentRow = labelList.value[index]
  const selectRef = selectRefs.value[index]

  // 取得輸入框中的文字
  let inputValue = ''
  if (selectRef) {
    const inputElement = selectRef.$el?.querySelector('input')
    inputValue = inputElement?.value?.trim() || ''

    // 如果輸入值包含 " - "，取代號部分
    if (inputValue.includes(' - ')) {
      inputValue = inputValue.split(' - ')[0].trim()
    }
  }

  // 如果有輸入值但還沒選擇客戶，嘗試匹配
  if (inputValue && !currentRow.customerCode) {
    // 在本地客戶列表中尋找匹配
    const matchedCustomer = allCustomers.value.find(
      (customer: any) => customer.code.toLowerCase() === inputValue.toLowerCase()
    )

    if (matchedCustomer) {
      // 設定客戶代號
      currentRow.customerCode = matchedCustomer.code
      currentRow.customerName = matchedCustomer.name || ''
      currentRow.zipCode = matchedCustomer.zipCode || ''
      currentRow.address = matchedCustomer.address || ''
      ElMessage.success(`已選擇客戶：${matchedCustomer.name}`)
    } else {
      // 嘗試從 API 查詢
      try {
        const response = await customerApi.getCustomerByCode(inputValue)
        if (response.data) {
          currentRow.customerCode = response.data.code
          currentRow.customerName = response.data.name || ''
          currentRow.zipCode = response.data.zipCode || ''
          currentRow.address = response.data.address || ''
          ElMessage.success(`已選擇客戶：${response.data.name}`)
        }
      } catch (error) {
        ElMessage.error(`找不到客戶代號「${inputValue}」`)
        return
      }
    }
  }

  // 如果當前行有選擇客戶，新增下一行並聚焦
  if (currentRow.customerCode) {
    // 關閉下拉選單
    if (selectRef) {
      selectRef.blur()
    }

    // 如果是最後一行，新增一行
    if (index === labelList.value.length - 1) {
      addRow()
    }

    // 聚焦到下一行的選擇框
    setTimeout(() => {
      const nextIndex = index + 1
      if (selectRefs.value[nextIndex]) {
        selectRefs.value[nextIndex].focus()
      }
    }, 150)
  }
}

// 新增一行
const addRow = () => {
  labelList.value.push({
    customerCode: '',
    customerName: '',
    zipCode: '',
    address: ''
  })
}

// 刪除一行
const removeRow = (index: number) => {
  if (labelList.value.length > 1) {
    labelList.value.splice(index, 1)
  }
}

// 清除全部
const handleClearAll = () => {
  labelList.value = [
    {
      customerCode: '',
      customerName: '',
      zipCode: '',
      address: ''
    }
  ]
}

// 匯出 Excel
const handleExportExcel = () => {
  // 過濾掉空的行
  const dataToExport = labelList.value.filter(row => row.customerCode)

  if (dataToExport.length === 0) {
    ElMessage.warning('沒有資料可匯出')
    return
  }

  // 準備 Excel 資料
  const excelData = dataToExport.map(row => ({
    '客戶代號': row.customerCode,
    '客戶名稱': row.customerName,
    '郵遞區號': row.zipCode
  }))

  // 建立工作表
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // 設定欄寬
  worksheet['!cols'] = [
    { wch: 15 },  // 客戶代號
    { wch: 25 },  // 客戶名稱
    { wch: 12 }   // 郵遞區號
  ]

  // 建立工作簿
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '寄信標籤')

  // 匯出檔案
  const fileName = `mailing_labels_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)

  ElMessage.success('Excel 匯出成功')
}

onMounted(() => {
  loadAllCustomers()
})
</script>

<style scoped>
.mailing-label-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.actions {
  display: flex;
  gap: 10px;
}

.add-row-hint {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
  font-size: 14px;
}
</style>
