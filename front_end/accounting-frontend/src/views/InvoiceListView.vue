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
      <div style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center;">
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

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 300px"
          @change="handleSearch"
        />

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
        <el-table-column prop="quantity" label="數量" width="80" align="right" />
        <el-table-column prop="unitPrice" label="單價" width="100" align="right">
          <template #default="{ row }">
            {{ row.unitPrice !== null && row.unitPrice !== undefined ? Number(row.unitPrice).toFixed(2) : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金額" width="120" align="right">
          <template #default="{ row }">
            {{ row.amount !== null && row.amount !== undefined ? Math.round(Number(row.amount)) : '' }}
          </template>
        </el-table-column>
        <el-table-column label="未稅金額" width="100" align="right">
          <template #default="{ row }">
            {{ row.taxExcludedAmount !== null && row.taxExcludedAmount !== undefined ? Math.round(Number(row.taxExcludedAmount)) : '' }}
          </template>
        </el-table-column>
        <el-table-column label="稅金" width="100" align="right">
          <template #default="{ row }">
            {{ row.tax !== null && row.tax !== undefined ? Math.round(Number(row.tax)) : '' }}
          </template>
        </el-table-column>
        <el-table-column label="含稅金額" width="120" align="right">
          <template #default="{ row }">
            {{ row.taxIncludedAmount !== null && row.taxIncludedAmount !== undefined ? Math.round(Number(row.taxIncludedAmount)) : '' }}
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
import { Search } from '@element-plus/icons-vue'
import { invoiceApi, type Invoice } from '@/services/api'

const router = useRouter()

const loading = ref(false)
const invoices = ref<Invoice[]>([])
const searchKeyword = ref('')
const dateRange = ref<[string, string] | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

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
      // 處理作廢發票（沒有商品項目）
      if (invoice.isVoided || !invoice.items || invoice.items.length === 0) {
        flatInvoices.push({
          id: invoice.id,
          invoiceDate: invoice.invoiceDate,
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
            invoiceDate: index === 0 ? invoice.invoiceDate : '', // 只在第一個商品顯示發票資訊
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
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.actions {
  display: flex;
  gap: 10px;
}

.voided-mark {
  color: #f56c6c;
  font-weight: bold;
}
</style>
