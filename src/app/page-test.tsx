export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-4xl text-white mb-4">虚拟男友</h1>
        <p className="text-white/60">欢迎来到虚拟男友体验</p>
        <button
          onClick={() => alert('点击开始')}
          className="mt-8 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full"
        >
          开始体验
        </button>
      </div>
    </div>
  );
}
