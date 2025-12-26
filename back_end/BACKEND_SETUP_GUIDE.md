# 後端設定指南 (NestJS)

## 📋 快速開始

### 1. 安裝依賴
```bash
cd back_end/accounting-backend
npm install
```

### 2. 設定環境變數

編輯 `.env` 檔案:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password    # ← 修改這裡
DB_DATABASE=accounting_system
JWT_SECRET=your_super_secret_key_here
PORT=3001
```

### 3. 建立 MySQL 資料庫

**方法 1: 使用 Docker (推薦)**
```bash
docker run --name accounting-mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=accounting_system \
  -p 3306:3306 \
  -d mysql:8.0
```

**方法 2: 手動建立**
```bash
mysql -u root -p -P 3306
CREATE DATABASE accounting_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. 測試 MySQL 連線

```bash
node test-connection.js
```

**成功輸出**:
```
正在測試 MySQL 連線...
Host: localhost
Port: 3306
Database: accounting_system
---
✅ MySQL 連線成功!
已連接到資料庫: accounting_system
```

### 5. 啟動開發伺服器

```bash
npm run start:dev
```

**成功輸出**:
```
[Nest] Starting Nest application...
[Nest] TypeOrmModule dependencies initialized
[Nest] Nest application successfully started
Application is running on: http://localhost:3001
```

---

## 🛠️ 常用指令

### 開發指令
```bash
# 啟動開發伺服器 (自動重新載入)
npm run start:dev

# 正式環境建置
npm run build

# 正式環境啟動
npm run start:prod
```

### Migration 指令
```bash
# 生成 migration
npm run migration:generate -- src/migrations/MigrationName

# 執行 migration
npm run migration:run

# 回滾 migration
npm run migration:revert
```

### 測試指令
```bash
# 執行所有測試
npm run test

# 監聽模式測試
npm run test:watch

# 測試覆蓋率
npm run test:cov

# E2E 測試
npm run test:e2e
```

### 程式碼品質
```bash
# 程式碼格式化
npm run format

# 程式碼檢查
npm run lint
```

---

## 📦 已安裝的套件

### 核心套件
- `@nestjs/common` - NestJS 核心
- `@nestjs/core` - NestJS 核心
- `@nestjs/platform-express` - Express 平台

### 資料庫相關
- `@nestjs/typeorm` - TypeORM 整合
- `typeorm` - ORM 框架
- `mysql2` - MySQL 驅動

### 認證相關
- `@nestjs/jwt` - JWT 認證
- `@nestjs/passport` - Passport 整合
- `passport-jwt` - JWT 策略
- `bcrypt` - 密碼加密

### 工具套件
- `@nestjs/config` - 環境變數管理
- `class-validator` - 資料驗證
- `class-transformer` - 資料轉換

---

## 📁 專案結構

```
accounting-backend/
├── src/
│   ├── main.ts                 # 應用程式入口
│   ├── app.module.ts           # 根模組
│   ├── app.controller.ts       # 根控制器
│   ├── app.service.ts          # 根服務
│   ├── data-source.ts          # TypeORM Migration 設定
│   └── migrations/             # Migration 檔案
├── test/
│   ├── app.e2e-spec.ts         # E2E 測試
│   └── jest-e2e.json           # Jest 設定
├── .env                        # 環境變數
├── .gitignore                  # Git 忽略清單
├── nest-cli.json               # Nest CLI 設定
├── package.json                # 專案依賴
├── tsconfig.json               # TypeScript 設定
└── test-connection.js          # MySQL 連線測試腳本
```

---

## 🔧 核心檔案說明

### main.ts
應用程式入口,已設定:
- ✅ CORS (允許前端 localhost:5173)
- ✅ 全域驗證管道
- ✅ Port 3001

### app.module.ts
根模組,已整合:
- ✅ ConfigModule (環境變數)
- ✅ TypeOrmModule (MySQL 連線,port 3306)

### data-source.ts
TypeORM Migration 設定:
- ✅ 資料庫連線設定
- ✅ Entity 路徑
- ✅ Migration 路徑

---

## 🚀 開發流程

### 1. 建立新模組

```bash
# 使用 Nest CLI 生成模組
nest g module users
nest g controller users
nest g service users
```

### 2. 建立 Entity

在 `src/users/entities/user.entity.ts`:
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  username: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### 3. 建立 DTO

在 `src/users/dto/create-user.dto.ts`:
```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  username: string;
}
```

### 4. 實作 Service

在 `src/users/users.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async create(createUserDto: any): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }
}
```

### 5. 實作 Controller

在 `src/users/users.controller.ts`:
```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }
}
```

### 6. 註冊到 Module

在 `src/users/users.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### 7. 生成和執行 Migration

```bash
# 生成 migration (TypeORM 會自動比對 Entity 和資料庫)
npm run migration:generate -- src/migrations/CreateUserTable

# 執行 migration
npm run migration:run
```

---

## 🧪 測試 API

### 使用 curl

```bash
# 測試伺服器
curl http://localhost:3001

# GET 請求
curl http://localhost:3001/users

# POST 請求
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","username":"Test User"}'
```

### 使用 REST Client (VS Code 擴充套件)

建立 `test.http`:
```http
### 測試伺服器
GET http://localhost:3001

### 取得所有使用者
GET http://localhost:3001/users

### 建立使用者
POST http://localhost:3001/users
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456",
  "username": "Test User"
}
```

---

## ⚠️ 常見問題

### Q1: MySQL 連線失敗

**錯誤**:
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解決**:
1. 確認 MySQL 在 port 3306 運行:
   ```bash
   netstat -ano | findstr :3306
   ```
2. 執行測試腳本:
   ```bash
   node test-connection.js
   ```

### Q2: Unknown database

**錯誤**:
```
Error: Unknown database 'accounting_system'
```

**解決**:
```bash
mysql -u root -p -P 3306
CREATE DATABASE accounting_system;
```

### Q3: Port 3001 被佔用

**錯誤**:
```
EADDRINUSE: address already in use :::3001
```

**解決**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# 或修改 .env 中的 PORT
```

### Q4: Migration 執行失敗

**錯誤**:
```
QueryFailedError: Table 'xxx' already exists
```

**解決**:
1. 檢查資料庫中是否已有該表
2. 使用 `npm run migration:revert` 回滾
3. 或手動刪除表後重新執行

---

## 🔐 安全建議

1. **環境變數**
   - `.env` 已加入 `.gitignore`
   - 不要提交到 Git

2. **JWT 密鑰**
   - 使用強密碼
   - 可以用 `openssl rand -base64 32` 生成

3. **密碼加密**
   - 使用 bcrypt 加密
   - 設定適當的 salt rounds (10-12)

4. **正式環境**
   - `synchronize: false`
   - 使用 Migration 管理資料庫
   - CORS 限制允許的來源

---

## 📚 參考資源

- [NestJS 官方文件](https://docs.nestjs.com/)
- [TypeORM 官方文件](https://typeorm.io/)
- [JWT 最佳實踐](https://jwt.io/introduction)

---

祝你開發順利！🚀
