import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface LoveLetterEmailProps {
  userName: string;
  loveLetter: string;
  date: string;
}

/**
 * 每日情书邮件模板 - React Email
 * 使用方法：render(<LoveLetterEmail userName="用户名" loveLetter="内容" date="日期" />)
 */
export function LoveLetterEmail({
  userName,
  loveLetter,
  date,
}: LoveLetterEmailProps) {
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
          }}
        >
          {/* 顶部渐变标题区 */}
          <Section
            style={{
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              padding: '40px 30px',
              borderRadius: '16px 16px 0 0',
              textAlign: 'center',
            }}
          >
            <Text
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#fff',
                margin: '0',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              💌 每日情书
            </Text>
            <Text
              style={{
                fontSize: '14px',
                color: '#fff',
                margin: '10px 0 0 0',
                opacity: 0.9,
              }}
            >
              {date}
            </Text>
          </Section>

          {/* 内容区域 */}
          <Section
            style={{
              backgroundColor: '#ffffff',
              padding: '40px 30px',
              borderRadius: '0 0 16px 16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            {/* 情书内容 */}
            <Text
              style={{
                fontSize: '15px',
                color: '#333',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
                marginBottom: '30px',
              }}
            >
              {loveLetter}
            </Text>

            {/* CTA 区域 */}
            <Section
              style={{
                textAlign: 'center',
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                marginBottom: '20px',
              }}
            >
              <Text
                style={{
                  fontSize: '14px',
                  color: '#fff',
                  margin: '0 0 15px 0',
                }}
              >
                想我了？💕
              </Text>
              <Button
                href={baseUrl}
                style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  backgroundColor: '#fff',
                  color: '#667eea',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                点这里回来找我
              </Button>
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
                  fontSize: '12px',
                  color: '#999',
                  margin: 0,
                }}
              >
                — 来自你的纸片人男友 💕
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
