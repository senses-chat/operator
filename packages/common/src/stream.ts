import { Readable } from 'stream';

export function getBufferFromStream(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => {
      buffers.push(chunk);
    });
    stream.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
    stream.on('error', reject);
  });
}
