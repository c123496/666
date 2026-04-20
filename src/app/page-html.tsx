// 简单的 HTML 页面用于测试
export default function Home() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>虚拟男友</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          text-align: center;
          color: white;
        }
        h1 {
          font-size: 48px;
          margin-bottom: 20px;
        }
        button {
          padding: 15px 30px;
          font-size: 18px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎉 虚拟男友</h1>
        <p>欢迎来到虚拟男友体验</p>
        <button onclick="window.location.reload()">重新加载</button>
      </div>
    </body>
    </html>
  `;
}
