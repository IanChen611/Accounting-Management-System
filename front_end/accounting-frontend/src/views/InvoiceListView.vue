<template>
  <div class="invoice-list-container">
    <div class="header">
      <h1>發票管理</h1>
      <div class="actions">
        <el-button type="success" @click="handleExportExcel">匯出 Excel</el-button>
        <el-button type="info" @click="handleExportCsv">匯出 CSV</el-button>
        <el-button type="warning" @click="handleExportPdf">匯出 PDF</el-button>
        <el-button type="primary" @click="handleCreate">新增發票</el-button>
      </div>
    </div>

    <el-card>
      <div style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <el-input
          v-model="searchKeyword"
          placeholder="搜尋發票號碼、買受人或品名"
          clearable
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 400px;">
          <el-input
            v-model="startDateInput"
            placeholder="開始日期(可輸入1141101)"
            clearable
            style="flex: 1"
            class="date-input"
            @blur="handleStartDateBlur"
            @keydown.enter="handleStartDateEnter"
          >
            <template #append>
              <el-button @click="showStartDatePicker" :icon="Calendar" />
            </template>
          </el-input>
          <el-date-picker
            ref="startDatePickerRef"
            v-model="startDate"
            type="date"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            @change="handleStartDatePickerChange"
            :teleported="true"
            style="display: none"
          />
          <span style="margin: 0 5px; white-space: nowrap;">至</span>
          <el-input
            v-model="endDateInput"
            placeholder="結束日期(可輸入1141101)"
            clearable
            style="flex: 1"
            class="date-input"
            @blur="handleEndDateBlur"
            @keydown.enter="handleEndDateEnter"
          >
            <template #append>
              <el-button @click="showEndDatePicker" :icon="Calendar" />
            </template>
          </el-input>
          <el-date-picker
            ref="endDatePickerRef"
            v-model="endDate"
            type="date"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            @change="handleEndDatePickerChange"
            :teleported="true"
            style="display: none"
          />
        </div>

        <el-button @click="handleClearFilters">清除篩選</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="invoices"
        :span-method="objectSpanMethod"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="invoiceDate" label="發票日期" width="120">
          <template #default="{ row }">
            <span v-if="row.isVoided" class="voided-mark">作廢</span>
            <span v-else>{{ row.invoiceDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="invoiceNumber" label="發票號碼" width="150" />
        <el-table-column label="狀態" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isVoided" type="danger" size="small">作廢</el-tag>
            <el-tag v-else type="success" size="small">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="buyer" label="買受人" width="150" />
        <el-table-column prop="productName" label="品名" />
        <el-table-column prop="quantity" label="數量" width="80" align="right">
          <template #default="{ row }">
            {{ row.quantity !== null && row.quantity !== undefined ? Number(row.quantity).toLocaleString() : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="單價" width="100" align="right">
          <template #default="{ row }">
            {{ row.unitPrice !== null && row.unitPrice !== undefined ? Number(row.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金額" width="120" align="right">
          <template #default="{ row }">
            {{ row.amount !== null && row.amount !== undefined ? Math.round(Number(row.amount)).toLocaleString() : '' }}
          </template>
        </el-table-column>
        <el-table-column label="未稅金額" width="100" align="right">
          <template #default="{ row }">
            {{ row.taxExcludedAmount !== null && row.taxExcludedAmount !== undefined ? Math.round(Number(row.taxExcludedAmount)).toLocaleString() : '' }}
          </template>
        </el-table-column>
        <el-table-column label="稅金" width="100" align="right">
          <template #default="{ row }">
            {{ row.tax !== null && row.tax !== undefined ? Math.round(Number(row.tax)).toLocaleString() : '' }}
          </template>
        </el-table-column>
        <el-table-column label="含稅金額" width="120" align="right">
          <template #default="{ row }">
            {{ row.taxIncludedAmount !== null && row.taxIncludedAmount !== undefined ? Math.round(Number(row.taxIncludedAmount)).toLocaleString() : '' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              編輯
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="fetchInvoices"
        @current-change="fetchInvoices"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Calendar } from '@element-plus/icons-vue'
import { invoiceApi, type Invoice } from '@/services/api'

const router = useRouter()

const loading = ref(false)
const invoices = ref<Invoice[]>([])
const searchKeyword = ref('')
const startDateInput = ref('')
const endDateInput = ref('')
const startDate = ref('')
const endDate = ref('')
const startDatePickerRef = ref()
const endDatePickerRef = ref()
const dateRange = ref<[string, string] | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 顯示開始日期選擇器
const showStartDatePicker = () => {
  if (startDatePickerRef.value) {
    startDatePickerRef.value.focus()
  }
}

// 顯示結束日期選擇器
const showEndDatePicker = () => {
  if (endDatePickerRef.value) {
    endDatePickerRef.value.focus()
  }
}

// 處理開始日期選擇器變更
const handleStartDatePickerChange = (value: string) => {
  if (value) {
    startDateInput.value = value.replace(/-/g, '/')
    dateRange.value = [value, endDate.value || value]
    fetchInvoices()
  }
}

// 處理結束日期選擇器變更
const handleEndDatePickerChange = (value: string) => {
  if (value) {
    endDateInput.value = value.replace(/-/g, '/')
    dateRange.value = [startDate.value || value, value]
    fetchInvoices()
  }
}

// 將民國年日期轉換為西元年日期
const convertROCtoAD = (input: string): string | null => {
  const cleaned = input.replace(/[\s\-\/]/g, '')

  // 格式 1: 1141101 (7位數) - 民國年YYMMDD
  if (/^\d{7}$/.test(cleaned)) {
    const rocYear = parseInt(cleaned.substring(0, 3), 10)
    const month = cleaned.substring(3, 5)
    const day = cleaned.substring(5, 7)
    const adYear = rocYear + 1911

    const date = new Date(`${adYear}-${month}-${day}`)
    if (!isNaN(date.getTime())) {
      return `${adYear}-${month}-${day}`
    }
  }

  // 格式 2: 1101 (4位數) - MMDD，使用當前民國年
  if (/^\d{4}$/.test(cleaned)) {
    const currentYear = new Date().getFullYear()
    const currentROCYear = currentYear - 1911
    const month = cleaned.substring(0, 2)
    const day = cleaned.substring(2, 4)
    const adYear = currentROCYear + 1911

    const date = new Date(`${adYear}-${month}-${day}`)
    if (!isNaN(date.getTime())) {
      return `${adYear}-${month}-${day}`
    }
  }

  // 格式 3: 1140102 (6位數) - 民國年YMMDD
  if (/^\d{6}$/.test(cleaned)) {
    const rocYear = parseInt(cleaned.substring(0, 3), 10)
    const month = cleaned.substring(3, 4)
    const day = cleaned.substring(4, 6)
    const adYear = rocYear + 1911
    const paddedMonth = month.padStart(2, '0')

    const date = new Date(`${adYear}-${paddedMonth}-${day}`)
    if (!isNaN(date.getTime())) {
      return `${adYear}-${paddedMonth}-${day}`
    }
  }

  return null
}

// 處理開始日期輸入失焦
const handleStartDateBlur = () => {
  if (!startDateInput.value) {
    dateRange.value = null
    return
  }

  const convertedDate = convertROCtoAD(startDateInput.value)
  if (convertedDate) {
    startDateInput.value = convertedDate.replace(/-/g, '/')
    updateDateRange()
  } else {
    ElMessage.warning('開始日期格式錯誤，請輸入如 1141101 或 1101 的格式')
  }
}

// 處理開始日期按下 Enter
const handleStartDateEnter = (event: KeyboardEvent) => {
  event.preventDefault()
  handleStartDateBlur()
  handleSearch()
}

// 處理結束日期輸入失焦
const handleEndDateBlur = () => {
  if (!endDateInput.value) {
    dateRange.value = null
    return
  }

  const convertedDate = convertROCtoAD(endDateInput.value)
  if (convertedDate) {
    endDateInput.value = convertedDate.replace(/-/g, '/')
    updateDateRange()
  } else {
    ElMessage.warning('結束日期格式錯誤，請輸入如 1141101 或 1101 的格式')
  }
}

// 處理結束日期按下 Enter
const handleEndDateEnter = (event: KeyboardEvent) => {
  event.preventDefault()
  handleEndDateBlur()
  handleSearch()
}

// 更新日期範圍
const updateDateRange = () => {
  const start = startDateInput.value.replace(/\//g, '-')
  const end = endDateInput.value.replace(/\//g, '-')
  
  if (start && end) {
    dateRange.value = [start, end]
  } else if (start) {
    dateRange.value = [start, start]
  } else if (end) {
    dateRange.value = [end, end]
  } else {
    dateRange.value = null
  }
}

// 合併儲存格方法
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  // 需要合併的欄位：發票日期(0)、發票號碼(1)、狀態(2)、買受人(3)、未稅金額(8)、稅金(9)、含稅金額(10)、操作(11)
  // 品名(4)、數量(5)、單價(6)、金額(7) 不合併，每個商品都分別顯示
  const mergeColumns = [0, 1, 2, 3, 8, 9, 10, 11]

  if (mergeColumns.includes(columnIndex)) {
    // 如果是第一個商品項目，顯示並合併
    if (row._itemIndex === 0) {
      return {
        rowspan: row._rowspan,
        colspan: 1
      }
    } else {
      // 如果不是第一個商品項目，隱藏
      return {
        rowspan: 0,
        colspan: 0
      }
    }
  }

  // 其他欄位不合併（品名、數量、單價、金額）
  return {
    rowspan: 1,
    colspan: 1
  }
}

// 載入發票列表
const fetchInvoices = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value
    }

    // 如果有日期範圍，加入參數
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    const response = await invoiceApi.getInvoices(params)

    console.log('API Response:', response.data)

    // 將發票資料扁平化：每個商品項目變成一筆記錄
    const flatInvoices: any[] = []
    const invoiceList = response.data.data || []

    console.log('Invoice List:', invoiceList)

    invoiceList.forEach((invoice: Invoice) => {
      console.log('處理發票:', invoice.invoiceNumber, 'invoiceDate:', invoice.invoiceDate, 'typeof:', typeof invoice.invoiceDate, 'isArray:', Array.isArray(invoice.invoiceDate))

      // 確保 invoiceDate 是 string（防禦性編程）
      let safeInvoiceDate: string = invoice.invoiceDate
      if (Array.isArray(invoice.invoiceDate)) {
        console.error('❌ 發票日期是 Array！', invoice.invoiceNumber, invoice.invoiceDate)
        safeInvoiceDate = invoice.invoiceDate.length > 0 ? String(invoice.invoiceDate[0]) : ''
      } else if (invoice.invoiceDate) {
        safeInvoiceDate = String(invoice.invoiceDate)
      }

      // 處理作廢發票（沒有商品項目）
      if (invoice.isVoided || !invoice.items || invoice.items.length === 0) {
        flatInvoices.push({
          id: invoice.id,
          invoiceDate: safeInvoiceDate,
          invoiceNumber: invoice.invoiceNumber,
          buyer: invoice.buyer || '',
          isVoided: invoice.isVoided,
          productName: '',
          quantity: null,
          unitPrice: null,
          amount: null,
          taxExcludedAmount: null,
          tax: null,
          taxIncludedAmount: null,
          _originalInvoice: invoice,
          _rowspan: 1, // 用於合併儲存格
          _itemIndex: 0 // 商品在發票中的索引
        })
      } else {
        // 處理正常發票（有商品項目）
        const itemCount = invoice.items.length
        invoice.items.forEach((item: any, index: number) => {
          flatInvoices.push({
            id: invoice.id,
            invoiceDate: index === 0 ? safeInvoiceDate : '', // 只在第一個商品顯示發票資訊
            invoiceNumber: index === 0 ? invoice.invoiceNumber : '',
            buyer: index === 0 ? invoice.buyer : '',
            isVoided: false,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            taxExcludedAmount: invoice.taxExcludedAmount,
            tax: invoice.tax,
            taxIncludedAmount: invoice.taxIncludedAmount,
            // 保留原始發票物件以便編輯
            _originalInvoice: invoice,
            _rowspan: itemCount, // 該發票的商品總數
            _itemIndex: index // 商品在發票中的索引
          })
        })
      }
    })

    console.log('Flat Invoices:', flatInvoices)

    invoices.value = flatInvoices
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('載入發票列表失敗')
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

// 搜尋
const handleSearch = () => {
  currentPage.value = 1
  fetchInvoices()
}

// 清除篩選
const handleClearFilters = () => {
  searchKeyword.value = ''
  startDateInput.value = ''
  endDateInput.value = ''
  dateRange.value = null
  currentPage.value = 1
  fetchInvoices()
}

// 新增發票
const handleCreate = () => {
  router.push('/invoices/create')
}

// 編輯發票
const handleEdit = (row: any) => {
  const invoiceId = row._originalInvoice?.id || row.id
  router.push(`/invoices/${invoiceId}/edit`)
}

// 刪除發票
const handleDelete = async (row: any) => {
  const invoice = row._originalInvoice || row
  try {
    await ElMessageBox.confirm(
      `確定要刪除發票「${invoice.invoiceNumber}」嗎？`,
      '刪除確認',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await invoiceApi.deleteInvoice(invoice.id!)
    ElMessage.success('刪除成功')
    fetchInvoices()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('刪除失敗')
      console.error(error)
    }
  }
}

// 匯出 Excel
const handleExportExcel = async () => {
  try {
    const params: any = {}

    // 如果有搜尋關鍵字，加入參數
    if (searchKeyword.value) {
      params.search = searchKeyword.value
    }

    // 如果有日期範圍，加入參數
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    const response = await invoiceApi.exportExcel(params)
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoices_${new Date().toISOString().split('T')[0]}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('Excel 匯出成功')
  } catch (error) {
    ElMessage.error('Excel 匯出失敗')
    console.error(error)
  }
}

// 匯出 CSV
const handleExportCsv = async () => {
  try {
    const params: any = {}

    // 如果有搜尋關鍵字，加入參數
    if (searchKeyword.value) {
      params.search = searchKeyword.value
    }

    // 如果有日期範圍，加入參數
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    const response = await invoiceApi.exportCsv(params)
    const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('CSV 匯出成功')
  } catch (error) {
    ElMessage.error('CSV 匯出失敗')
    console.error(error)
  }
}

// 匯出 PDF
const handleExportPdf = async () => {
  try {
    const params: any = {}

    // 如果有搜尋關鍵字，加入參數
    if (searchKeyword.value) {
      params.search = searchKeyword.value
    }

    // 如果有日期範圍，加入參數
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    const response = await invoiceApi.exportPdf(params)
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoices_${new Date().toISOString().split('T')[0]}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('PDF 匯出成功')
  } catch (error) {
    ElMessage.error('PDF 匯出失敗')
    console.error(error)
  }
}

onMounted(() => {
  fetchInvoices()
})
</script>

<style scoped>
.invoice-list-container {
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
  flex-wrap: wrap;
}

.voided-mark {
  color: #f56c6c;
  font-weight: bold;
}

/* 只有日期输入框的文字和placeholder置中 */
:deep(.date-input .el-input__inner::placeholder) {
  text-align: center;
}

:deep(.date-input .el-input__inner) {
  text-align: center;
}
</style>
