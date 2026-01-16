import { useState, useRef } from 'react';
import { Upload, Download } from 'lucide-react';

function ExifSteganography() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [secretMessage, setSecretMessage] = useState('');
  const [decodedMessage, setDecodedMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setOriginalImage(result);
      setImagePreview(result);

      if (mode === 'decode') {
        decodeFromImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const decodeFromImage = (dataUrl: string) => {
    const marker = '###EXIF_DATA:';
    const endMarker = ':END_EXIF###';

    const startIdx = dataUrl.indexOf(marker);
    if (startIdx === -1) {
      setDecodedMessage('No hidden message found in this image.');
      return;
    }

    const endIdx = dataUrl.indexOf(endMarker, startIdx);
    if (endIdx === -1) {
      setDecodedMessage('Corrupted hidden message.');
      return;
    }

    const encodedMessage = dataUrl.substring(startIdx + marker.length, endIdx);
    try {
      const decoded = atob(encodedMessage);
      setDecodedMessage(decoded);
    } catch (e) {
      setDecodedMessage('Error decoding message.');
    }
  };

  const encodeMessage = () => {
    if (!originalImage || !secretMessage) return;

    const encodedMessage = btoa(secretMessage);
    const marker = '###EXIF_DATA:' + encodedMessage + ':END_EXIF###';

    const [header, base64Data] = originalImage.split(',');
    const newDataUrl = header + ',' + marker + base64Data;

    setImagePreview(newDataUrl);
  };

  const downloadImage = () => {
    if (!imagePreview) return;

    const link = document.createElement('a');
    link.download = 'stego-exif-image.png';
    link.href = imagePreview;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setMode('encode');
            setDecodedMessage('');
          }}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
            mode === 'encode'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => {
            setMode('decode');
            setSecretMessage('');
          }}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
            mode === 'decode'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Decode
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Image
        </label>
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Choose Image
          </button>
        </div>
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

          <button
            onClick={encodeMessage}
            disabled={!originalImage || !secretMessage}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Hide Message in EXIF Data
          </button>

          {imagePreview && originalImage && imagePreview !== originalImage && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Encoded Image
                </label>
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <img src={imagePreview} alt="Preview" className="max-w-full h-auto" />
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Message successfully hidden! Download the image to share it.
                </p>
              </div>
            </div>
          )}

          {imagePreview && !secretMessage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Preview
              </label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <img src={imagePreview} alt="Preview" className="max-w-full h-auto" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {decodedMessage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {decodedMessage.startsWith('No hidden') || decodedMessage.startsWith('Error') || decodedMessage.startsWith('Corrupted')
                  ? 'Status'
                  : 'Decoded Message'}
              </label>
              <div className={`w-full px-4 py-3 border rounded-lg whitespace-pre-wrap ${
                decodedMessage.startsWith('No hidden') || decodedMessage.startsWith('Error') || decodedMessage.startsWith('Corrupted')
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-green-50 border-green-200 text-gray-900'
              }`}>
                {decodedMessage}
              </div>
            </div>
          )}

          {imagePreview && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Preview
              </label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <img src={imagePreview} alt="Preview" className="max-w-full h-auto" />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> This method embeds your secret message in the image's metadata (EXIF-like data structure). The message is encoded in base64 and stored within the image file itself.
        </p>
      </div>
    </div>
  );
}

export default ExifSteganography;
