-- 更新資料庫 Schema
-- 執行方式：mysql -u root -p accounting_system < update-schema.sql

-- 檢查並新增 invoices.isVoided 欄位
SET @dbname = 'accounting_system';
SET @tablename = 'invoices';
SET @columnname = 'isVoided';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT ''Column isVoided already exists'' AS msg;',
  'ALTER TABLE invoices ADD COLUMN isVoided TINYINT(1) NOT NULL DEFAULT 0 COMMENT ''是否作廢'';'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 檢查並新增 customers.zipCode 欄位
SET @tablename = 'customers';
SET @columnname = 'zipCode';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT ''Column zipCode already exists'' AS msg;',
  'ALTER TABLE customers ADD COLUMN zipCode VARCHAR(10) NULL COMMENT ''郵遞區號'' AFTER name;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 驗證結果
SELECT 'Schema update completed!' AS status;
DESCRIBE invoices;
DESCRIBE customers;
