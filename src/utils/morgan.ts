import express from 'express';
import morgan from 'morgan';
import * as rfs from 'rotating-file-stream';
import path from 'path';
import cron from 'node-cron';
import fs from 'fs-extra';
interface LoggerConfig {
  interval: string;
  path: string;
  size: string;
  compress: 'gzip' | boolean;
}
interface LogStats {
  mtime: Date;
}
const logsDir: string = path.join(__dirname, 'logs');
fs.ensureDirSync(logsDir);
const loggerConfig: LoggerConfig = {
  interval: '1d', 
  path: logsDir,
  size: '10M', 
  compress: 'gzip' 
};
const accessLogStream: rfs.RotatingFileStream = rfs.createStream('access.log', loggerConfig);
morgan.token('timestamp', (): string => {
  return new Date().toISOString();
});
const logFormat: string = ':timestamp :method :url :status :res[content-length] - :response-time ms';
const morganMiddleware: express.RequestHandler = morgan(logFormat, {
  stream: accessLogStream
});
cron.schedule('0 0 * * *', async (): Promise<void> => {
  try {
    const files: string[] = await fs.readdir(logsDir);
    const now: Date = new Date();
    for (const file of files) {
      const filePath: string = path.join(logsDir, file);
      const stats: LogStats = await fs.stat(filePath);
      const fileAge: number = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24); 
      if (fileAge > 7) {
        await fs.unlink(filePath);
        console.log(`Deleted old log file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up logs:', error);
  }
});
export default morganMiddleware;