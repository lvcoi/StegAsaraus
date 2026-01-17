import { createSignal, onMount } from 'solid-js';
import { Download, FileText, Upload } from 'lucide-solid';
import { logger } from '../utils/logger.js';

const MARKER_START = '###STEGANO_START###';
const MARKER_END = '###STEGANO_END###';
const SAMPLE_MESSAGE = 'Drop site changed. New time: 21:45.';

const encodeBase64Utf8 = (value) => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
};

const decodeBase64Utf8 = (value) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
};

const findSubarray = (haystack, needle, start = 0) => {
  if (!needle.length || needle.length > haystack.length) return -1;
  for (let i = start; i <= haystack.length - needle.length; i += 1) {
    let match = true;
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j] !== needle[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
};

function PdfSteganography() {
  const [mode, setMode] = createSignal('encode');
  const [secretMessage, setSecretMessage] = createSignal('');
  const [decodedMessage, setDecodedMessage] = createSignal('');
  const [encodePdfBytes, setEncodePdfBytes] = createSignal(null);
  const [encodePdfName, setEncodePdfName] = createSignal('');
  const [decodePdfBytes, setDecodePdfBytes] = createSignal(null);
  const [decodePdfName, setDecodePdfName] = createSignal('');
  let fileInputRef;

  onMount(() => {
    logger.info('[PdfSteganography] mounted');
  });

  const handlePdfUpload = (e) => {
    try {
      const file = e.currentTarget.files?.[0];
      if (!file) {
        logger.warn('[PdfSteganography] handlePdfUpload: no file selected');
        return;
      }
      logger.info('[PdfSteganography] handlePdfUpload file', { name: file.name, size: file.size, type: file.type });
      if (mode() === 'encode') {
        setEncodePdfName(file.name);
      } else {
        setDecodePdfName(file.name);
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result;
        if (!buffer) {
          logger.warn('[PdfSteganography] handlePdfUpload: empty buffer');
          return;
        }
        const bytes = new Uint8Array(buffer);
        if (mode() === 'encode') {
          setEncodePdfBytes(bytes);
        } else {
          setDecodePdfBytes(bytes);
          setDecodedMessage('');
        }
      };
      reader.onerror = (err) => {
        logger.error('[PdfSteganography] FileReader error', err);
        logger.userError('Failed to read PDF file.', { err });
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      logger.error('[PdfSteganography] handlePdfUpload error', err);
      logger.userError('PDF upload error.', { err });
    }
  };

  const downloadEncodedPdf = () => {
    logger.info('[PdfSteganography] downloadEncodedPdf clicked');
    try {
      const original = encodePdfBytes();
      if (!original || !secretMessage()) {
        logger.warn('[PdfSteganography] downloadEncodedPdf aborted: missing pdf or message');
        return;
      }

      const encodedMessage = encodeBase64Utf8(secretMessage());
      const markerBytes = new TextEncoder().encode(MARKER_START + encodedMessage + MARKER_END);
      const combined = new Uint8Array(original.length + markerBytes.length);
      combined.set(original, 0);
      combined.set(markerBytes, original.length);

      const blob = new Blob([combined], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = encodePdfName() ? encodePdfName().replace(/\.pdf$/i, '') + '-stego.pdf' : 'stego-document.pdf';
      link.click();
      URL.revokeObjectURL(url);
      logger.info('[PdfSteganography] encoded PDF download generated');
    } catch (err) {
      logger.error('[PdfSteganography] downloadEncodedPdf error', err);
      logger.userError('Failed to generate encoded PDF.', { err });
    }
  };

  const decodeMessage = () => {
    logger.info('[PdfSteganography] decodeMessage invoked');
    try {
      const data = decodePdfBytes();
      if (!data) {
        logger.warn('[PdfSteganography] decodeMessage aborted: no PDF loaded');
        return;
      }

      const encoder = new TextEncoder();
      const startBytes = encoder.encode(MARKER_START);
      const endBytes = encoder.encode(MARKER_END);

      const startIndex = findSubarray(data, startBytes, 0);
      if (startIndex === -1) {
        logger.warn('[PdfSteganography] no marker found');
        setDecodedMessage('No hidden message found in this PDF.');
        return;
      }

      const messageStart = startIndex + startBytes.length;
      const endIndex = findSubarray(data, endBytes, messageStart);
      if (endIndex === -1) {
        logger.warn('[PdfSteganography] end marker missing');
        setDecodedMessage('Corrupted hidden message.');
        return;
      }

      const messageBytes = data.slice(messageStart, endIndex);
      const messageBase64 = new TextDecoder().decode(messageBytes);
      const decoded = decodeBase64Utf8(messageBase64);
      setDecodedMessage(decoded);
      logger.info('[PdfSteganography] decode complete', { decodedLen: decoded.length });
    } catch (err) {
      logger.error('[PdfSteganography] decodeMessage error', err);
      logger.userError('Failed to decode message from PDF.', { err });
    }
  };

  return (
    <div class="space-y-6">
      <div class="inline-flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          onClick={() => {
            logger.info('[PdfSteganography] set mode: encode');
            setMode('encode');
            setDecodedMessage('');
            if (fileInputRef) fileInputRef.value = '';
          }}
          class={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
            mode() === 'encode'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => {
            logger.info('[PdfSteganography] set mode: decode');
            setMode('decode');
            setSecretMessage('');
            if (fileInputRef) fileInputRef.value = '';
          }}
          class={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
            mode() === 'decode'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Decode
        </button>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-gray-900">
          Upload PDF
        </label>
        <div class="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            class="hidden"
          />
          <button
            onClick={() => {
              logger.info('[PdfSteganography] open file picker');
              fileInputRef?.click();
            }}
            class="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Upload class="h-4 w-4" />
            Choose PDF
          </button>
          {mode() === 'encode' && encodePdfName() && (
            <span class="truncate text-sm font-medium text-gray-600">{encodePdfName()}</span>
          )}
          {mode() === 'decode' && decodePdfName() && (
            <span class="truncate text-sm font-medium text-gray-600">{decodePdfName()}</span>
          )}
        </div>
      </div>

      {mode() === 'encode' ? (
        <div class="space-y-6">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-900">
              Secret Message
            </label>
            <textarea
              value={secretMessage()}
              onInput={(e) => {
                logger.info('[PdfSteganography] secretMessage input len', e.currentTarget.value.length);
                setSecretMessage(e.currentTarget.value);
              }}
              placeholder="Enter your secret message..."
              class="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              rows={4}
            />
          </div>

          <div class="flex gap-3">
            <button
              onClick={downloadEncodedPdf}
              disabled={!secretMessage() || !encodePdfBytes()}
              class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Download class="h-4 w-4" />
              Download PDF with Hidden Message
            </button>
            <button
              onClick={() => setSecretMessage(SAMPLE_MESSAGE)}
              class="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Use Sample
            </button>
          </div>
        </div>
      ) : (
        <div class="space-y-6">
          <button
            onClick={decodeMessage}
            disabled={!decodePdfBytes()}
            class="w-full rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Reveal Hidden Message
          </button>

          {decodedMessage() && (
            <div class="rounded-lg border border-green-200 bg-green-50 p-5">
              <label class="mb-3 block text-sm font-medium text-gray-900">
                Decoded Message
              </label>
              <div class="whitespace-pre-wrap rounded-lg border border-green-300 bg-white px-4 py-4">
                {decodedMessage()}
              </div>
            </div>
          )}
        </div>
      )}

      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div class="flex items-start gap-3">
          <div class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-gray-200">
            <span class="text-sm">💡</span>
          </div>
          <div>
            <p class="mb-1 text-sm font-medium text-gray-900">How it works</p>
            <p class="text-sm leading-relaxed text-gray-600">
              This method appends an encoded message to the end of the PDF file. PDF readers ignore trailing data, but the message can be recovered by scanning for the hidden marker.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdfSteganography;
