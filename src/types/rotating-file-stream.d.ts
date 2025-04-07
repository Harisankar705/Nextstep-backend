declare module 'rotating-file-stream' {
    export interface RotatingFileStreamOptions {
      interval?: string;
      path?: string;
      size?: string;
      compress?: 'gzip' | boolean;
      maxFiles?: number;
      [key: string]: any;
    }
  
    export interface RotatingFileStream extends NodeJS.WritableStream {
    }
  
    export function createStream(
      filename: string | ((time: Date, index: number) => string),
      options?: RotatingFileStreamOptions
    ): RotatingFileStream;
  }