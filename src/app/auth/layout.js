export default function AuthLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}