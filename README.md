# TipTap - React + TypeScript + Vite

Dự án base được xây dựng với các công nghệ hiện đại:

- ⚛️ **React** - Thư viện UI
- 📘 **TypeScript** - Type-safe development
- ⚡ **Vite** - Build tool nhanh chóng
- 🎨 **Ant Design** - UI component library
- 💨 **Tailwind CSS** - Utility-first CSS framework
- 🎯 **SCSS** - CSS preprocessor

## 🚀 Bắt đầu

### Cài đặt dependencies

```bash
npm install
```

### Chạy development server

```bash
npm run dev
```

### Build cho production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## 📁 Cấu trúc dự án

```
.
├── public/          # Static files
├── src/
│   ├── App.tsx      # Component chính
│   ├── main.tsx     # Entry point
│   ├── index.scss   # Global styles với Tailwind và SCSS
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## 🛠️ Công nghệ sử dụng

### React + TypeScript

- Type-safe components
- Modern React hooks
- JSX support

### Vite

- Fast HMR (Hot Module Replacement)
- Optimized builds
- Native ES modules

### Ant Design

- Rich component library
- Customizable theme
- Enterprise-grade UI

### Tailwind CSS

- Utility-first CSS
- Responsive design
- Custom configuration

### SCSS

- Variables và mixins
- Nested selectors
- Modular styles

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎨 Customization

### Tailwind CSS

Chỉnh sửa `tailwind.config.js` để tùy chỉnh theme và utilities.

### Ant Design Theme

Có thể tùy chỉnh theme trong `src/main.tsx` thông qua `ConfigProvider`.

### SCSS Variables

Thêm các biến SCSS vào `src/index.scss` hoặc tạo file riêng.

## 📦 Dependencies

### Production

- react
- react-dom
- antd
- @ant-design/icons

### Development

- typescript
- vite
- tailwindcss
- postcss
- autoprefixer
- sass
- @types/react
- @types/react-dom

## 📄 License

MIT
