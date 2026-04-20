import { NextRequest, NextResponse } from 'next/server';
import { SearchClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 浪漫视频素材关键词映射
const VIDEO_KEYWORDS: Record<string, string[]> = {
  '纪念日': ['浪漫纪念日', '情侣纪念日', '纪念日惊喜'],
  '生日': ['生日祝福', '浪漫生日', '生日惊喜'],
  '结婚': ['婚礼视频', '求婚', '结婚纪念日'],
  '求婚': ['求婚创意', '浪漫求婚', '求婚视频'],
  '情人节': ['情人节浪漫', '情人节惊喜', '情人节礼物'],
  '圣诞': ['圣诞节浪漫', '圣诞祝福', '圣诞节情侣'],
  '跨年': ['跨年烟花', '新年浪漫', '跨年倒计时'],
  '新年': ['新年祝福', '新年浪漫', '新年快乐'],
  '浪漫': ['浪漫爱情', '浪漫场景', '浪漫时刻'],
  '惊喜': ['浪漫惊喜', '创意惊喜', '惊喜求婚'],
  '表白': ['爱情表白', '浪漫表白', '表白创意'],
  '约会': ['浪漫约会', '情侣约会', '约会攻略'],
  '周年': ['周年纪念', '情侣周年', '周年祝福'],
  '爱你': ['我爱你', '爱情表白', '浪漫表白'],
  '想你': ['思念', '想你', '爱情思念'],
};

// 官方视频网站域名（白名单）
const OFFICIAL_VIDEO_SITES = [
  'bilibili.com',
  'www.bilibili.com',
  'youtube.com',
  'www.youtube.com',
  'youku.com',
  'www.youku.com',
  'v.qq.com',
  'iqiyi.com',
  'www.iqiyi.com',
  'douyin.com',
  'www.douyin.com',
  'weibo.com',
  'www.weibo.com',
  'xiaohongshu.com',
  'www.xiaohongshu.com',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, personalityId } = body;

    console.log('[Video Search API] Received request:', { prompt, personalityId });

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 根据prompt找到合适的搜索关键词
    let searchKeywords = ['浪漫爱情', '浪漫视频'];
    for (const [key, keywords] of Object.entries(VIDEO_KEYWORDS)) {
      if (prompt.includes(key)) {
        searchKeywords = keywords;
        break;
      }
    }

    console.log('[Video Search API] Using keywords:', searchKeywords);

    // 初始化搜索客户端
    const config = new Config();
    const client = new SearchClient(config, customHeaders);

    // 只搜索官方视频网站
    const searchQuery = `${searchKeywords[0]} site:bilibili.com OR site:youku.com OR site:v.qq.com OR site:iqiyi.com OR site:douyin.com`;
    console.log('[Video Search API] Searching for:', searchQuery);

    const response = await client.advancedSearch(searchQuery, {
      searchType: 'web',
      count: 15,
      needUrl: true,
    });

    console.log('[Video Search API] Found', response.web_items?.length || 0, 'results');

    // 过滤出官方视频网站的链接
    const videoResults = response.web_items?.filter(item => {
      if (!item.url) return false;
      
      try {
        const url = new URL(item.url);
        const hostname = url.hostname.toLowerCase();
        
        // 检查是否在官方白名单中
        const isOfficial = OFFICIAL_VIDEO_SITES.some(site => 
          hostname === site || hostname.endsWith('.' + site.split('.').slice(-2).join('.'))
        );
        
        // 排除可疑域名
        const isSuspicious = hostname.includes('list') && !hostname.includes('bilibili');
        
        console.log('[Video Search API] Checking:', hostname, 'official:', isOfficial, 'suspicious:', isSuspicious);
        
        return isOfficial && !isSuspicious;
      } catch {
        return false;
      }
    }).slice(0, 5) || [];

    console.log('[Video Search API] Filtered official video results:', videoResults.length);

    if (videoResults.length > 0) {
      const videos = videoResults.map(item => {
        // 提取视频ID或构建更好的标题
        let title = item.title || '浪漫视频';
        // 清理标题中的HTML标签和多余内容
        title = title.replace(/<[^>]*>/g, '').replace(/-[^-]*$/, '').trim().slice(0, 50);
        
        return {
          title: title,
          url: item.url,
          site: item.site_name || getSiteName(item.url || ''),
          snippet: item.snippet?.slice(0, 80) || '',
        };
      });

      return NextResponse.json({
        success: true,
        type: 'search',
        videos: videos,
        message: '为你找到了这些浪漫的视频~',
      });
    } else {
      // 如果没找到，返回B站搜索链接（用户可以自己点击搜索）
      const searchUrl = `https://search.bilibili.com/all?keyword=${encodeURIComponent(searchKeywords[0])}`;
      
      return NextResponse.json({
        success: true,
        type: 'search_link',
        videos: [{
          title: `在B站搜索"${searchKeywords[0]}"相关视频`,
          url: searchUrl,
          site: 'Bilibili',
          snippet: '点击查看更多浪漫视频',
        }],
        message: '点击链接查看更多浪漫视频~',
      });
    }
  } catch (error) {
    console.error('[Video Search API] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}

// 从URL提取网站名称
function getSiteName(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('bilibili')) return 'B站';
    if (hostname.includes('youku')) return '优酷';
    if (hostname.includes('qq.com')) return '腾讯视频';
    if (hostname.includes('iqiyi')) return '爱奇艺';
    if (hostname.includes('douyin')) return '抖音';
    if (hostname.includes('youtube')) return 'YouTube';
    if (hostname.includes('weibo')) return '微博';
    if (hostname.includes('xiaohongshu')) return '小红书';
    return '视频网站';
  } catch {
    return '视频网站';
  }
}
