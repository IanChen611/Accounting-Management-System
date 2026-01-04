<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="120px"
    label-position="left"
  >
    <el-form-item label="發票日期" prop="invoiceDate">
      <el-input
        v-model="dateInputValue"
        placeholder="可輸入 1141101 或選擇日期"
        @blur="handleDateInputBlur"
        @keydown.enter="handleDateInputEnter"
        ref="dateInputRef"
        style="width: 100%"
      >
        <template #suffix>
          <el-date-picker
            v-model="formData.invoiceDate"
            type="date"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            style="width: 32px"
            @change="handleDatePickerChange"
            :teleported="false"
          >
            <template #default>
              <el-icon><Calendar /></el-icon>
            </template>
          </el-date-picker>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item label="發票號碼" prop="invoiceNumber">
      <el-input v-model="formData.invoiceNumber" placeholder="請輸入發票號碼（格式：XX12345678）" />
      <div class="field-hint">格式為兩個大寫英文字母 + 八位數字，例如：AB12345678</div>
    </el-form-item>

    <el-form-item label="作廢發票">
      <el-switch v-model="formData.isVoided" @change="handleVoidedChange" />
      <span class="void-hint">勾選此項表示此發票為作廢發票，不需填寫客戶及商品資料</span>
    </el-form-item>

    <el-form-item label="客戶代號" prop="customerCode" v-if="!formData.isVoided">
      <el-select
        v-model="formData.customerCode"
        filterable
        remote
        reserve-keyword
        placeholder="請輸入或選擇客戶代號"
        :remote-method="searchCustomers"
        :loading="customersLoading"
        @change="handleCustomerCodeChange"
        @keydown.enter="handleCustomerCodeEnter"
        style="width: 100%"
      >
        <el-option
          v-for="customer in customerOptions"
          :key="customer.code"
          :label="`${customer.code} - ${customer.name}`"
          :value="customer.code"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="買受人" prop="buyer" v-if="!formData.isVoided">
      <el-input v-model="formData.buyer" placeholder="請輸入買受人" />
    </el-form-item>

    <el-divider content-position="left" v-if="!formData.isVoided">商品明細</el-divider>

    <div
      v-if="!formData.isVoided"
      v-for="(item, index) in formData.items"
      :key="index"
      class="item-row"
    >
      <el-card shadow="hover" class="item-card">
        <template #header>
          <div class="item-header">
            <span class="item-title">商品 {{ index + 1 }}</span>
            <el-button
              v-if="formData.items.length > 1"
              type="danger"
              size="small"
              :icon="Delete"
              @click="removeItem(index)"
              >刪除</el-button
            >
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item
              :prop="`items.${index}.productName`"
              :rules="itemRules.productName"
              label="品名"
              label-width="80px"
            >
              <el-select
                v-model="item.productName"
                placeholder="請選擇品名"
                style="width: 100%"
                filterable
                allow-create
              >
                <el-option
                  v-for="product in productOptions"
                  :key="product"
                  :label="product"
                  :value="product"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item
              :prop="`items.${index}.quantity`"
              :rules="itemRules.quantity"
              label="數量"
              label-width="80px"
            >
              <el-input
                :model-value="formatNumberForDisplay(item.quantity)"
                placeholder="請輸入數量"
                style="width: 120%"
                @input="(val) => handleQuantityInput(item, val)"
                @blur="handleQuantityBlur(item)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="15">
            <el-form-item label="單價" label-width="80px">
              <el-input
                :model-value="formatNumberForDisplay(item.quantity ? parseFloat(calculateUnitPrice(item)) : null, 2)"
                disabled
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              :prop="`items.${index}.amount`"
              :rules="itemRules.amount"
              label="金額"
              label-width="80px"
            >
              <el-input
                :model-value="formatNumberForDisplay(getDisplayAmount(item), 2)"
                :placeholder="isDeductionItem(item.productName) ? '輸入正數，系統自動轉為減項' : '請輸入金額'"
                style="width: 100%"
                @input="(val) => handleAmountInput(item, val)"
                @blur="handleAmountBlur(item)"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <el-button v-if="!formData.isVoided" type="primary" :icon="Plus" @click="addItem" class="add-btn"
      >新增商品</el-button
    >

    <el-divider content-position="left" v-if="!formData.isVoided">金額統計</el-divider>

    <el-descriptions v-if="!formData.isVoided" :column="1" border class="amount-summary">
      <el-descriptions-item label="未稅金額">
        <span class="amount-value">NT$ {{ Math.round(formData.taxExcludedAmount || 0) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="稅金 (5%)">
        <span class="amount-value">NT$ {{ Math.round(formData.tax || 0) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="含稅金額">
        <span class="total-amount">NT$ {{ Math.round(formData.taxIncludedAmount || 0) }}</span>
      </el-descriptions-item>
    </el-descriptions>

    <div class="form-actions">
      <el-button @click="handleCancel" size="large">取消</el-button>
      <el-button type="primary" @click="handleSubmit" size="large">{{
        isEdit ? '更新' : '建立'
      }}</el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Delete, Calendar } from '@element-plus/icons-vue'
import { customerApi, type Invoice, type InvoiceItem } from '@/services/api'

interface Props {
  initialData?: Invoice
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false
})

const emit = defineEmits<{
  submit: [data: Invoice]
  cancel: []
}>()

// 預設商品選項
const productOptions = [
  '水槽',
  '龍頭',
  '配件',
  '工資',
  '預收貨款',
  '減預收貨款'
]

const formRef = ref<FormInstance>()
const dateInputRef = ref()
const dateInputValue = ref('')
const customersLoading = ref(false)
const customerOptions = ref<any[]>([])

const formData = reactive<Invoice>({
  invoiceDate: '',
  invoiceNumber: '',
  customerCode: '',
  buyer: '',
  items: [
    {
      productName: '',
      quantity: null as any,
      amount: null as any
    }
  ],
  taxExcludedAmount: 0,
  tax: 0,
  taxIncludedAmount: 0,
  isVoided: false
})

// 將民國年日期轉換為西元年日期
// 支援格式：1141101 或 1101 (114年11月01日 或 11月01日，預設今年)
const convertROCtoAD = (input: string): string | null => {
  // 移除所有空白和分隔符號
  const cleaned = input.replace(/[\s\-\/]/g, '')

  // 格式 1: 1141101 (7位數) - 民國年YYMMDD
  if (/^\d{7}$/.test(cleaned)) {
    const rocYear = parseInt(cleaned.substring(0, 3), 10)
    const month = cleaned.substring(3, 5)
    const day = cleaned.substring(5, 7)
    const adYear = rocYear + 1911

    // 驗證日期有效性
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

    // 驗證日期有效性
    const date = new Date(`${adYear}-${month}-${day}`)
    if (!isNaN(date.getTime())) {
      return `${adYear}-${month}-${day}`
    }
  }

  // 格式 3: 1140102 (6位數) - 民國年YMMDD (單位數月份)
  if (/^\d{6}$/.test(cleaned)) {
    const rocYear = parseInt(cleaned.substring(0, 3), 10)
    const month = cleaned.substring(3, 4)
    const day = cleaned.substring(4, 6)
    const adYear = rocYear + 1911
    const paddedMonth = month.padStart(2, '0')

    // 驗證日期有效性
    const date = new Date(`${adYear}-${paddedMonth}-${day}`)
    if (!isNaN(date.getTime())) {
      return `${adYear}-${paddedMonth}-${day}`
    }
  }

  return null
}

// 處理日期輸入失焦
const handleDateInputBlur = () => {
  if (!dateInputValue.value) return

  const convertedDate = convertROCtoAD(dateInputValue.value)
  if (convertedDate) {
    formData.invoiceDate = convertedDate
    // 更新顯示值為 YYYY/MM/DD 格式
    dateInputValue.value = convertedDate.replace(/-/g, '/')
  } else {
    ElMessage.warning('日期格式錯誤，請輸入如 1141101 或 1101 的格式')
  }
}

// 處理日期輸入按下 Enter
const handleDateInputEnter = (event: KeyboardEvent) => {
  event.preventDefault()
  handleDateInputBlur()

  // 跳到發票號碼欄位
  const invoiceNumberInput = document.querySelector('input[placeholder*="發票號碼"]') as HTMLInputElement
  if (invoiceNumberInput) {
    invoiceNumberInput.focus()
  }
}

// 處理日期選擇器變更
const handleDatePickerChange = (value: string) => {
  if (value) {
    dateInputValue.value = value.replace(/-/g, '/')
  }
}

// 千分位格式化顯示
const formatNumberForDisplay = (value: number | null | undefined, decimals: number = 0): string => {
  if (value === null || value === undefined || value === '') return ''
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return ''

  // 格式化為千分位
  const parts = num.toFixed(decimals).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

// 解析千分位數字為純數字
const parseNumberFromInput = (value: string): number | null => {
  if (!value || value.trim() === '') return null
  const cleaned = value.replace(/,/g, '').trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

// 處理數量輸入
const handleQuantityInput = (item: InvoiceItem, value: string) => {
  // 暫存輸入值，允許使用者輸入
  const num = parseNumberFromInput(value)
  if (num !== null) {
    item.quantity = Math.floor(num) // 數量只保留整數
  } else {
    item.quantity = null as any
  }
}

// 處理數量失焦
const handleQuantityBlur = (item: InvoiceItem) => {
  calculateTotals()
}

// 處理金額輸入
const handleAmountInput = (item: InvoiceItem, value: string) => {
  const num = parseNumberFromInput(value)
  if (num !== null) {
    // 如果是減項商品，自動轉為負數
    if (isDeductionItem(item.productName)) {
      item.amount = -Math.abs(num)
    } else {
      item.amount = Math.abs(num)
    }
  } else {
    item.amount = null as any
  }
}

// 處理金額失焦
const handleAmountBlur = (item: InvoiceItem) => {
  calculateTotals()
}

const rules: FormRules = {
  invoiceDate: [
    {
      required: true,
      message: '請選擇發票日期',
      trigger: 'change',
      validator: (rule, value, callback) => {
        // 如果是作廢發票，允許不輸入日期
        if (formData.isVoided) {
          callback()
        } else if (!value) {
          callback(new Error('請選擇發票日期'))
        } else {
          callback()
        }
      }
    }
  ],
  invoiceNumber: [
    { required: true, message: '請輸入發票號碼', trigger: 'blur' },
    {
      pattern: /^[A-Z]{2}\d{8}$/,
      message: '發票號碼格式錯誤，必須為兩個英文字母加八位數字（例如：AB12345678）',
      trigger: 'blur'
    }
  ],
  buyer: [{ required: true, message: '請輸入買受人', trigger: 'blur' }]
}

const itemRules = {
  productName: [{ required: true, message: '請選擇品名', trigger: 'change' }],
  quantity: [{ required: true, message: '請輸入數量', trigger: 'change' }],
  amount: [{ required: true, message: '請輸入金額', trigger: 'change' }]
}

// 判斷是否為減項商品
const isDeductionItem = (productName: string) => {
  return productName && productName.includes('減')
}

// 取得顯示金額（絕對值）
const getDisplayAmount = (item: InvoiceItem) => {
  return Math.abs(item.amount || 0)
}

// 計算單價：金額 ÷ 數量
const calculateUnitPrice = (item: InvoiceItem) => {
  if (item.quantity === 0) return '0.00'
  return (item.amount / item.quantity).toFixed(2)
}

// 計算總金額（四捨五入取整數）
const calculateTotals = () => {
  // 未稅金額 = 所有商品的金額加總（四捨五入取整數）
  const taxExcludedAmount = Math.round(
    formData.items.reduce((sum, item) => sum + (item.amount || 0), 0)
  )

  // 稅金 = 未稅金額 × 0.05（四捨五入取整數）
  const tax = Math.round(taxExcludedAmount * 0.05)

  // 含稅金額 = 未稅金額 + 稅金
  const taxIncludedAmount = taxExcludedAmount + tax

  formData.taxExcludedAmount = taxExcludedAmount
  formData.tax = tax
  formData.taxIncludedAmount = taxIncludedAmount
}

// 新增商品項目
const addItem = () => {
  formData.items.push({
    productName: '',
    quantity: null as any,
    amount: null as any
  })
}

// 刪除商品項目
const removeItem = (index: number) => {
  formData.items.splice(index, 1)
  calculateTotals()
}

// 處理作廢發票切換
const handleVoidedChange = (value: boolean) => {
  if (value) {
    // 切換為作廢發票時，清空不需要的欄位
    formData.customerCode = ''
    formData.buyer = ''
    formData.items = []
    formData.taxExcludedAmount = 0
    formData.tax = 0
    formData.taxIncludedAmount = 0
  } else {
    // 切換回正常發票時，初始化商品項目
    formData.items = [
      {
        productName: '',
        quantity: null as any,
        amount: null as any
      }
    ]
  }
}

// 搜尋客戶
const searchCustomers = async (query: string) => {
  if (query) {
    customersLoading.value = true
    try {
      const response = await customerApi.getCustomers()
      const customers = response.data || []
      // 過濾符合搜尋條件的客戶
      customerOptions.value = customers.filter((customer: any) =>
        customer.code.toLowerCase().includes(query.toLowerCase()) ||
        customer.name.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error) {
      console.error('搜尋客戶失敗:', error)
    } finally {
      customersLoading.value = false
    }
  } else {
    customerOptions.value = []
  }
}

// 處理客戶代號變更
const handleCustomerCodeChange = async (code: string) => {
  if (!code) return

  try {
    const response = await customerApi.getCustomerByCode(code)
    if (response.data) {
      formData.buyer = response.data.name
      ElMessage.success('已自動帶入客戶名稱')
    }
  } catch (error) {
    console.log('客戶代號不存在，需手動輸入買受人')
  }
}

// 處理客戶代號按下 Enter
const handleCustomerCodeEnter = () => {
  // ENTER 鍵會自動觸發 @change 事件，所以這裡不需要額外處理
  // 可以用來跳到下一個欄位（買受人）
  const buyerInput = document.querySelector('input[placeholder*="買受人"]') as HTMLInputElement
  if (buyerInput) {
    buyerInput.focus()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      // 如果是作廢發票，確保相關欄位為空
      if (formData.isVoided) {
        emit('submit', {
          ...formData,
          customerCode: undefined,
          buyer: '',
          items: [],
          taxExcludedAmount: 0,
          tax: 0,
          taxIncludedAmount: 0
        })
      } else {
        emit('submit', { ...formData })
      }
    }
  })
}

const handleCancel = () => {
  emit('cancel')
}

// 監聽 items 變化，自動重新計算
watch(
  () => formData.items,
  () => {
    calculateTotals()
  },
  { deep: true }
)

// 監聽每個商品的品名變化，自動調整金額正負號
watch(
  () => formData.items.map(item => item.productName),
  (newNames, oldNames) => {
    if (oldNames) {
      formData.items.forEach((item, index) => {
        if (newNames[index] !== oldNames[index] && item.amount !== 0) {
          // 品名改變時，根據新品名重新設定金額正負號
          if (isDeductionItem(newNames[index])) {
            // 改成減項商品，轉為負數
            item.amount = -Math.abs(item.amount)
          } else {
            // 改成一般商品，轉為正數
            item.amount = Math.abs(item.amount)
          }
        }
      })
      calculateTotals()
    }
  }
)

// 發票號碼自動加一的函式
const incrementInvoiceNumber = (invoiceNumber: string): string => {
  // 發票號碼格式：XX12345678（兩個英文字母 + 八位數字）
  const match = invoiceNumber.match(/^([A-Z]{2})(\d{8})$/)
  if (!match) return invoiceNumber

  const prefix = match[1]
  const number = parseInt(match[2], 10)
  const nextNumber = number + 1

  // 如果超過 99999999，重置為 00000001
  const newNumber = nextNumber > 99999999 ? 1 : nextNumber

  // 補零到 8 位數
  return prefix + newNumber.toString().padStart(8, '0')
}

// 重置表單並將發票號碼加一
const resetFormWithIncrementedInvoiceNumber = () => {
  const currentInvoiceNumber = formData.invoiceNumber

  // 重置所有欄位
  formData.invoiceDate = ''
  dateInputValue.value = ''
  formData.customerCode = ''
  formData.buyer = ''
  formData.items = [
    {
      productName: '',
      quantity: null as any,
      amount: null as any
    }
  ]
  formData.taxExcludedAmount = 0
  formData.tax = 0
  formData.taxIncludedAmount = 0
  formData.isVoided = false

  // 發票號碼自動加一
  formData.invoiceNumber = incrementInvoiceNumber(currentInvoiceNumber)

  // 重置表單驗證狀態
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 暴露方法給父組件使用
defineExpose({
  resetFormWithIncrementedInvoiceNumber
})

// 初始化表單數據
onMounted(() => {
  if (props.initialData) {
    Object.assign(formData, props.initialData)

    // 更新日期顯示值
    if (formData.invoiceDate) {
      dateInputValue.value = formData.invoiceDate.replace(/-/g, '/')
    }

    // 轉換 items 中的數字欄位（從 API 回傳的可能是字串）
    if (formData.items && formData.items.length > 0) {
      formData.items = formData.items.map(item => ({
        productName: item.productName,
        quantity: Number(item.quantity),
        amount: Number(item.amount)
      }))
    } else {
      formData.items = [
        {
          productName: '',
          quantity: null as any,
          amount: null as any
        }
      ]
    }
  }
  calculateTotals()
})
</script>

<style scoped>
.item-row {
  margin-bottom: 20px;
}

.item-card {
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.calculated-field {
  padding: 28px 0 0 0;
  font-size: 15px;
  text-align: center;
}

.calculated-field .label {
  color: #606266;
  font-weight: 500;
}

.calculated-field .value {
  color: #409eff;
  font-weight: 700;
  font-size: 16px;
  margin-left: 8px;
}

.add-btn {
  width: 100%;
  margin-bottom: 20px;
}

.amount-summary {
  margin-bottom: 30px;
}

.amount-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #f56c6c;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 0;
  border-top: 1px solid #eee;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-card__header) {
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.field-hint {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.void-hint {
  margin-left: 10px;
  font-size: 13px;
  color: #606266;
}
</style>
