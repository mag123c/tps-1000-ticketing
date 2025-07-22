# DATABASE_BASELINE.md

## Branch: 1.only-input

이 문서는 `1.only-input` 브랜치의 데이터베이스 스키마 기준선을 정의합니다.

## 스키마 설계 원칙

### 핵심 제약사항
- **한 사용자당 같은 티켓 최대 1장만 구매 가능**
- **단순한 재고 관리**: 현재 재고 / 최대 재고만 관리
- **결제 수량 고정**: 항상 1장으로 고정 (quantity 필드 제거)

### 테이블 구성

#### UserModel (user)
```sql
- no: PK, 자동증가
- email: 유니크, 사용자 식별
- name: 선택사항
- createdAt: 가입 시간
```

#### TicketModel (ticket)
```sql
- no: PK, 자동증가  
- name: 유니크, 티켓명
- price: 가격
- stock: 현재 재고
- maxStock: 전체 재고 (초기값)
- createdAt/updatedAt: 생성/수정 시간
```

#### PaymentModel (payment)
```sql
- no: PK, 자동증가
- paymentMethod: 결제 방식 (deposit, card)
- status: 결제 상태 (pending, processing, completed, failed)
- userNo: 사용자 FK
- ticketNo: 티켓 FK
- createdAt/updatedAt: 생성/수정 시간

제약조건:
- UNIQUE(userNo, ticketNo): 한 사용자당 같은 티켓 1장만
```

#### PaymentHistoryModel 
```sql
- no: PK, 자동증가
- paymentNo: 결제 FK  
- type: 상태 변경 타입
- reason: 실패/에러 사유
- createdAt: 히스토리 생성 시간
```

## 인덱스 전략

### 성능 최적화
- `payment.userNo + ticketNo`: 유니크 제약 + 사용자별 구매 조회
- `payment.ticketNo`: 티켓별 판매 현황 
- `payment.status + createdAt`: 관리자 조회 (상태별 정렬)
- `ticket.stock`: 재고 있는 티켓 필터링
- `payment_history.paymentNo + createdAt + type`: 히스토리 조회

## 비즈니스 로직

### 티켓 구매 플로우
1. 사용자 인증
2. 티켓 재고 확인 (`stock > 0`)
3. 중복 구매 확인 (`UNIQUE 제약조건`)
4. 결제 처리
5. 재고 차감 (`stock = stock - 1`)
6. 결제 히스토리 기록

### 동시성 처리 고려사항
- **재고 차감**: 트랜잭션 내에서 원자적 처리
- **중복 구매 방지**: DB 레벨 UNIQUE 제약조건 활용
- **결제 상태 관리**: PaymentHistory로 상태 변경 추적

## 테스트 시나리오

### 기본 케이스
- 정상적인 티켓 구매
- 재고 부족시 구매 실패
- 이미 구매한 티켓 재구매 시도

### 동시성 테스트
- 1000명이 동시에 같은 티켓 구매 시도
- 재고 1장 티켓에 대한 경쟁 상황
- 결제 실패시 재고 롤백

## 확장성 고려사항

### 향후 확장 가능한 요소
- 티켓 카테고리/타입 추가
- 사용자당 구매 한도 설정 (현재는 1로 고정)
- 결제 방식 다양화
- 쿠폰/할인 시스템

### 성능 모니터링 포인트
- 동시 접속자 수
- 결제 처리 시간
- 재고 조회 응답 시간
- DB 커넥션 풀 사용률