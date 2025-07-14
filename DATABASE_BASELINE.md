# 데이터베이스 초기 베이스라인

## 초기 데이터베이스 설정
- 최초 설정은 AWS EC2 t2.micro (1GB RAM) 환경을 기준으로 구성되어 있습니다.

### 기본 데이터베이스 스펙
- **MySQL 버전**: 8.0.42
- **메모리 제한**: 200MB (컨테이너)
- **최대 연결 수**: 50개
- **InnoDB 버퍼풀**: 32MB
```yaml
command: >
  --innodb-buffer-pool-size=32M
  --max-connections=50
  --innodb-redo-log-capacity=32M
  --innodb-log-buffer-size=1M
  --sort-buffer-size=64K
  --read-buffer-size=256K
mem_limit: 200m
cpus: 0.5
```

## 현재 데이터베이스 스키마

### User (사용자)
```sql
CREATE TABLE user (
  no INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  name VARCHAR(191),
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);
```

### Ticket (티켓)
```sql
CREATE TABLE ticket (
  no INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) UNIQUE NOT NULL,
  price INT NOT NULL,
  stock INT NOT NULL,           -- 현재 재고
  max_stock INT NOT NULL,       -- 전체 재고
  max_per_user INT DEFAULT 1,   -- 사용자당 최대 구매 수량
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  INDEX idx_stock (stock),
  INDEX idx_price (price),
  INDEX idx_created_at (created_at)
);
```

### Payment (결제)
```sql
CREATE TABLE payment (
  no INT AUTO_INCREMENT PRIMARY KEY,
  quantity INT DEFAULT 1,              -- 구매 수량
  payment_method VARCHAR(191) NOT NULL, -- deposit, card
  status VARCHAR(191) DEFAULT 'pending', -- pending, processing, completed, failed
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  user_no INT NOT NULL,
  ticket_no INT NOT NULL,
  
  INDEX idx_user_ticket (user_no, ticket_no),
  INDEX idx_ticket (ticket_no),
  INDEX idx_status_created (status, created_at),
  FOREIGN KEY (user_no) REFERENCES user(no),
  FOREIGN KEY (ticket_no) REFERENCES ticket(no)
);
```

### PaymentHistory (결제 이력)
```sql
CREATE TABLE payment_history (
  no INT AUTO_INCREMENT PRIMARY KEY,
  payment_no INT NOT NULL,
  type VARCHAR(191) NOT NULL,    -- pending, progress, complete, reject, error
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  
  INDEX idx_payment_created_type (payment_no, createdAt, type),
  FOREIGN KEY (payment_no) REFERENCES payment(no)
);
```