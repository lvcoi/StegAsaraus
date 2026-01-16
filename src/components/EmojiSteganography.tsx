import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const ZERO_WIDTH_CHARS = {
  '0': '\u200B',
  '1': '\u200C',
  '2': '\u200D',
  '3': '\uFEFF',
};

function EmojiSteganography() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [secretMessage, setSecretMessage] = useState('');
  const [coverEmoji, setCoverEmoji] = useState('🌟✨🎉🎊🎈');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const encodeMessage = () => {
    if (!secretMessage || !coverEmoji) return;

    const binary = secretMessage
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');

    const encoded = binary
      .split('')
      .map(bit => {
        if (bit === '0') return ZERO_WIDTH_CHARS['0'];
        else return ZERO_WIDTH_CHARS['1'];
      })
      .join('');

    const result = coverEmoji + encoded;
    setOutput(result);
  };

  const decodeMessage = () => {
    if (!output) return;

    const zwChars = output
      .split('')
      .filter(char => Object.values(ZERO_WIDTH_CHARS).includes(char))
      .map(char => {
        if (char === ZERO_WIDTH_CHARS['0']) return '0';
        else return '1';
      })
      .join('');

    let decoded = '';
    for (let i = 0; i < zwChars.length; i += 8) {
      const byte = zwChars.slice(i, i + 8);
      if (byte.length === 8) {
        decoded += String.fromCharCode(parseInt(byte, 2));
      }
    }

    setSecretMessage(decoded);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMode('encode')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
            mode === 'encode'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
            mode === 'decode'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Decode
        </button>
      </div>

      {mode === 'encode' ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Message
            </label>
            <textarea
              value={secretMessage}
              onChange={(e) => setSecretMessage(e.target.value)}
              placeholder="Enter your secret message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Emoji Text
            </label>
            <input
              type="text"
              value={coverEmoji}
              onChange={(e) => setCoverEmoji(e.target.value)}
              placeholder="🌟✨🎉"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl"
            />
          </div>

          <button
            onClick={encodeMessage}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Hide Message in Emoji
          </button>

          {output && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Encoded Output (Copy This!)
              </label>
              <div className="relative">
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-2xl break-all">
                  {output}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Encoded Emoji Text
            </label>
            <textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="Paste encoded emoji text here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-2xl"
              rows={4}
            />
          </div>

          <button
            onClick={decodeMessage}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Reveal Hidden Message
          </button>

          {secretMessage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decoded Message
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-green-50 border-green-200">
                {secretMessage}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> This method hides your message using invisible zero-width characters between the emoji. The emoji look normal but contain hidden data.
        </p>
      </div>
    </div>
  );
}

export default EmojiSteganography;
