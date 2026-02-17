# Smart Expense Tracker - Frontend

Giao diện web cho ứng dụng quản lý chi tiêu thông minh, xây dựng bằng Next.js 16 với React 19.

## Giới thiệu

Frontend cung cấp giao diện người dùng với các tính năng:

- **Dashboard** - Tổng quan số dư, thu nhập, chi tiêu, biểu đồ phân tích
- **Quản lý chi tiêu** - Thêm, sửa, xóa các khoản chi tiêu theo danh mục
- **Quản lý thu nhập** - Theo dõi nguồn thu nhập
- **Phân tích & Báo cáo** - Biểu đồ tròn, biểu đồ cột, thống kê theo thời gian
- **Trợ lý AI** - Chat với AI để nhận tư vấn tài chính
- **Kết nối Gmail** - Đồng bộ tự động giao dịch từ email ngân hàng
- **Cài đặt** - Quản lý tài khoản và tùy chỉnh

## Tech Stack

| Thành phần | Công nghệ |
|------------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Ngôn ngữ | TypeScript |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| HTTP Client | Axios |
| Icons | Lucide React |

## Yêu cầu

- Node.js 20+
- npm
- Backend đang chạy tại `http://localhost:3001` (xem [BE/README.md](../BE/README.md))

## Hướng dẫn chạy

### 1. Cài đặt dependencies

```bash
cd FE
npm install
```

### 2. Khởi động dev server

```bash
npm run dev
```

Ứng dụng chạy tại `http://localhost:3000`.

> **Lưu ý:** Đảm bảo backend đã được khởi động trước khi sử dụng frontend. Xem hướng dẫn chạy backend tại [BE/README.md](../BE/README.md).

## Các lệnh có sẵn

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run start` | Chạy production server |
| `npm run lint` | Kiểm tra code style |

## Cấu trúc thư mục

```
FE/
├── src/
│   ├── app/
│   │   ├── (auth)/            # Trang đăng nhập & đăng ký
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Các trang sau đăng nhập
│   │   │   ├── dashboard/     # Trang tổng quan
│   │   │   ├── expenses/      # Quản lý chi tiêu
│   │   │   ├── incomes/       # Quản lý thu nhập
│   │   │   ├── analytics/     # Phân tích
│   │   │   ├── reports/       # Báo cáo
│   │   │   └── settings/      # Cài đặt
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Trang chủ
│   ├── components/            # React components dùng chung
│   └── lib/
│       ├── api.ts             # Axios client & API calls
│       ├── auth-store.ts      # Zustand store xác thực
│       └── utils.ts           # Tiện ích
├── public/                    # Static assets
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Các trang chính

| Đường dẫn | Mô tả |
|-----------|-------|
| `/` | Trang chủ / Landing page |
| `/login` | Đăng nhập |
| `/register` | Đăng ký tài khoản |
| `/dashboard` | Tổng quan (số dư, biểu đồ, giao dịch gần đây) |
| `/dashboard/expenses` | Danh sách & quản lý chi tiêu |
| `/dashboard/incomes` | Danh sách & quản lý thu nhập |
| `/dashboard/analytics` | Phân tích chi tiết |
| `/dashboard/reports` | Báo cáo |
| `/dashboard/settings` | Cài đặt tài khoản, kết nối Gmail |
