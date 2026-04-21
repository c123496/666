'use client';

import { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

export function HeroSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16">
      <div className="max-w-5xl mx-auto w-full">
        {/* 主标题 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-black leading-tight mb-6 max-w-4xl mx-auto">
            移除图片中任何不需要的{' '}
            <span className="bg-[#C6FF00] px-2">对象</span>
            {' '}、{' '}
            <span className="bg-[#C6FF00] px-2">瑕疵</span>
            {' '}、{' '}
            <span className="bg-[#C6FF00] px-2">人物</span>
            {' '}或{' '}
            <span className="bg-[#C6FF00] px-2">文字</span>
            {' '}，只需几秒钟
          </h1>
        </div>

        {/* 示例图片 */}
        <div className="mb-12 flex justify-center">
          <div className="relative bg-[#F5F5F5] rounded-lg p-8 max-w-md w-full">
            {/* 示例图片占位 */}
            <div className="aspect-square bg-gradient-to-br from-pink-200 to-pink-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎒</div>
                <p className="text-gray-600 text-sm">示例效果</p>
              </div>
            </div>
          </div>
        </div>

        {/* 拖拽上传区域 */}
        <div className="max-w-2xl mx-auto">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-lg
              flex flex-col items-center justify-center py-16 px-8 cursor-pointer
              transition-all duration-200
              ${isDragging
                ? 'border-black bg-gray-50'
                : 'border-gray-300 hover:border-black'
              }
            `}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {uploadedImage ? (
              <div className="relative w-full">
                <img
                  src={uploadedImage}
                  alt="上传的图片"
                  className="max-h-96 mx-auto object-contain rounded"
                />
                <p className="text-center text-sm text-gray-600 mt-4">
                  图片已上传，点击或拖拽可更换
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-700 mb-2">
                  点击这里或拖拽图片文件
                </p>
                <p className="text-sm text-gray-500">
                  支持 JPG、PNG、WebP 格式
                </p>
              </div>
            )}
          </div>

          {/* 提示文字 */}
          <div className="text-center mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>向上箭头拖拽图片到上方开始免费使用</span>
          </div>
        </div>
      </div>
    </section>
  );
}
