export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', fontWeight: 'bold' }}>
          🎉 虚拟男友
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>
          体验最温暖的陪伴，最贴心的关怀
        </p>
        <div>
          <a
            href="/test-api.html"
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            开始体验 →
          </a>
        </div>
        <div style={{ marginTop: '40px', fontSize: '14px', opacity: 0.8 }}>
          <p>💬 聊天功能正常 | 🖼️ 图片生成正常 | 💕 情感互动正常</p>
        </div>
      </div>
    </div>
  );
}
