import { useState } from 'react';
import { Lock, Image, FileText, Tag, Smile } from 'lucide-react';
import EmojiSteganography from './components/EmojiSteganography';
import ImageSteganography from './components/ImageSteganography';
import PdfSteganography from './components/PdfSteganography';
import ExifSteganography from './components/ExifSteganography';

type TabType = 'emoji' | 'image' | 'pdf' | 'exif';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('emoji');

  const tabs = [
    { id: 'emoji' as TabType, label: 'Emoji', icon: Smile },
    { id: 'image' as TabType, label: 'Image', icon: Image },
    { id: 'pdf' as TabType, label: 'PDF', icon: FileText },
    { id: 'exif' as TabType, label: 'EXIF', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Lock className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            SteganoVault
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hide messages in plain sight. Secure steganography for emoji, images, PDFs, and EXIF data.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'emoji' && <EmojiSteganography />}
            {activeTab === 'image' && <ImageSteganography />}
            {activeTab === 'pdf' && <PdfSteganography />}
            {activeTab === 'exif' && <ExifSteganography />}
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>All processing happens in your browser. Your data never leaves your device.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
