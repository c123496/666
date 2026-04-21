'use client';

import Image from 'next/image';

interface PersonAvatarProps {
  name: string;
  type: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PersonAvatar({
  name,
  type,
  className = '',
  size = 'md'
}: PersonAvatarProps) {
  const sizeMap = {
    sm: { width: 40, height: 40 },
    md: { width: 80, height: 80 },
    lg: { width: 160, height: 160 },
  };

  const { width, height } = sizeMap[size];

  // 根据角色ID获取对应的本地图片路径
  const getAvatarPath = (): string => {
    const avatarMap: Record<string, string> = {
      '顾承川': '/characters/gu-chengchuan.png',
      '沈予安': '/characters/shen-yuan.png',
      '陆景言': '/characters/lu-jingyan.png',
      '周屿川': '/characters/zhou-yuchuan.png',
    };

    return avatarMap[name] || avatarMap['沈予安'];
  };

  return (
    <div
      className={`rounded-full overflow-hidden shadow-lg ${className}`}
      style={{
        width,
        height,
        position: 'relative',
      }}
    >
      <Image
        src={getAvatarPath()}
        alt={`${name} - ${type}`}
        title={`${name} - ${type}`}
        width={width}
        height={height}
        className="object-cover"
        style={{
          objectFit: 'cover',
          objectPosition: 'center top', // 偏上裁切，只显示头部
        }}
        priority={size === 'lg'} // 大尺寸头像优先加载
      />
    </div>
  );
}
