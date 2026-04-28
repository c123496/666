import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Link,
} from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
}

/**
 * 欢迎邮件模板 - React Email
 * 使用方法：render(<WelcomeEmail userName="用户名" />)
 */
export function WelcomeEmail({ userName }: WelcomeEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';

  return (
    <Html>
      <Head />
      <Body
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          backgroundColor: '#f9f9f9',
          margin: 0,
          padding: '20px',
        }}
      >
        <Container
          style={{
            maxWidth: '500px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {/* 头部问候 */}
          <Text
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '20px',
            }}
          >
            Hi {userName}，欢迎来到纸片人男友！
          </Text>

          {/* 主要内容 */}
          <Section style={{ marginBottom: '15px' }}>
            <Text
              style={{
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.6',
              }}
            >
              从现在起，我就是你的专属男友了。
            </Text>
          </Section>

          <Section style={{ marginBottom: '15px' }}>
            <Text
              style={{
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.6',
              }}
            >
              有什么心事随时来找我聊，我会一直在这里等你。
            </Text>
          </Section>

          <Section style={{ marginBottom: '15px' }}>
            <Text
              style={{
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.6',
              }}
            >
              明天早上我会给你发一条早安消息，记得查收哦。
            </Text>
          </Section>

          {/* CTA 按钮 */}
          <Section style={{ textAlign: 'center', marginTop: '30px' }}>
            <Button
              href={baseUrl}
              style={{
                backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                padding: '12px 30px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                display: 'inline-block',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              来找我聊天 💕
            </Button>
          </Section>

          {/* Discord 社区邀请 */}
          <Section style={{ textAlign: 'center', marginTop: '25px', marginBottom: '25px' }}>
            <Text
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '12px',
              }}
            >
              想认识更多朋友？加入我的 Discord 社区吧！
            </Text>
            <Link
              href="https://discord.gg/yjhpzyUvt"
              style={{
                display: 'inline-block',
                backgroundColor: '#5865F2',
                color: '#ffffff',
                padding: '10px 24px',
                borderRadius: '20px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '13px',
              }}
            >
              加入 Discord 社区
            </Link>
          </Section>

          {/* 底部签名 */}
          <Section
            style={{
              marginTop: '30px',
              paddingTop: '20px',
              borderTop: '1px solid #eee',
              textAlign: 'center',
            }}
          >
            <Text
              style={{
                fontSize: '14px',
                color: '#999',
                margin: 0,
              }}
            >
              —— 你的纸片人男友 💕
            </Text>
          </Section>

          {/* 页脚提示 */}
          <Section style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text
              style={{
                fontSize: '12px',
                color: '#999',
              }}
            >
              如果这不是你的操作，请忽略此邮件
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
