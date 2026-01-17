import { createSignal, onMount, onCleanup, lazy, Suspense } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Lock, Image, FileText, Tag, Smile } from 'lucide-solid';
import { logger } from './utils/logger.js';

const EmojiSteganography = lazy(() => import('./components/EmojiSteganography.jsx'));
const ImageSteganography = lazy(() => import('./components/ImageSteganography.jsx'));
const PdfSteganography = lazy(() => import('./components/PdfSteganography.jsx'));
const ExifSteganography = lazy(() => import('./components/ExifSteganography.jsx'));

function App() {
  const [activeTab, setActiveTab] = createSignal('emoji');
  const [errorVisible, setErrorVisible] = createSignal(false);
  const [errorText, setErrorText] = createSignal('');

  onMount(() => {
    logger.info('[App] mounted');
    const handler = (e) => {
      const msg = e?.detail?.message || 'An unexpected error occurred';
      setErrorText(msg);
      setErrorVisible(true);
    };
    window.addEventListener('steg:error', handler);
    onCleanup(() => {
      window.removeEventListener('steg:error', handler);
    });
  });

  const tabs = [
    { id: 'emoji', label: 'Emoji', icon: Smile },
    { id: 'image', label: 'Image', icon: Image },
    { id: 'pdf', label: 'PDF', icon: FileText },
    { id: 'exif', label: 'EXIF', icon: Tag },
  ];

  return (
    <div class="min-h-screen bg-white">
      {/* Header - Next.js style */}
      <header class="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div class="flex h-16 items-center px-6">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
              <Lock class="h-5 w-5 text-white" />
            </div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-semibold tracking-tight">SteganoSaurus</h1>
              <span class="text-xl">🦕</span>
            </div>
          </div>
          <div class="ml-auto flex items-center gap-2 text-sm">
            <Lock class="h-4 w-4 text-gray-500" />
            <span class="text-gray-600">Client-side only</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div class="flex">
        {/* Sidebar Navigation - Next.js style */}
        <aside class="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-gray-50/50">
          <nav class="flex flex-col gap-1 p-4">
            <div class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Steganography Tools
            </div>
            {tabs.map((tab) => {
              return (
                <button
                  onClick={() => {
                    logger.info('[App] switching tab to', tab.id);
                    setActiveTab(tab.id);
                  }}
                  class={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeTab() === tab.id
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Dynamic component={tab.icon} class="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
          
          {/* Info Panel in Sidebar */}
          <div class="mx-4 mt-6 rounded-lg border border-gray-200 bg-white p-4">
            <div class="mb-2 flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded bg-gray-100">
                <span class="text-sm">💡</span>
              </div>
              <h3 class="text-sm font-semibold text-gray-900">About</h3>
            </div>
            <p class="text-xs leading-relaxed text-gray-600">
              Hide messages in plain sight using secure client-side steganography. All processing happens in your browser.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main class="flex-1">
          <div class="mx-auto max-w-4xl px-8 py-8">
            {/* Page Header */}
            <div class="mb-8">
              <h2 class="mb-2 text-3xl font-bold tracking-tight text-gray-900">
                {tabs.find(t => t.id === activeTab())?.label} Steganography
              </h2>
              <p class="text-gray-600">
                {activeTab() === 'emoji' && 'Hide messages using invisible zero-width characters between emoji'}
                {activeTab() === 'image' && 'Encode secret messages into images using LSB technique'}
                {activeTab() === 'pdf' && 'Conceal data within PDF documents'}
                {activeTab() === 'exif' && 'Hide information in image metadata'}
              </p>
            </div>

            {/* Error Display */}
            {errorVisible() && (
              <div class="mb-6 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <div class="text-sm text-red-800">{errorText()}</div>
                <button 
                  class="text-sm font-medium text-red-600 hover:text-red-700" 
                  onClick={() => setErrorVisible(false)}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Content */}
            <Suspense fallback={
              <div class="flex items-center justify-center py-20">
                <div class="text-center">
                  <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
                  <div class="text-sm text-gray-600">Loading...</div>
                </div>
              </div>
            }>
              {activeTab() === 'emoji' && <EmojiSteganography />}
              {activeTab() === 'image' && <ImageSteganography />}
              {activeTab() === 'pdf' && <PdfSteganography />}
              {activeTab() === 'exif' && <ExifSteganography />}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
