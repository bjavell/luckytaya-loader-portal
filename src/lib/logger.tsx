import * as winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file';

// Import only if on the server-side

let backendLogger: any
let backendErrorLogger: any

interface LogEntry {
    timestamp: string;
    message: string;
    level: string;
    correlationId: string;
}


if (typeof window === 'undefined') {
    // Import winston and daily rotate file only in the server-side context
    // winston = require('winston');
    // DailyRotateFile = require('winston-daily-rotate-file');


    // Server-side logging setup with Winston
    const logFormat = winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
        return `[Correlation ID: ${correlationId}] ${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    });

    const apiLogTransport = new DailyRotateFile({
        filename: 'logs/api-logs-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        level: 'info'
    });

    const errorLogTransport = new DailyRotateFile({
        filename: 'logs/error-logs-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        level: 'error'
    });

    backendLogger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            logFormat
        ),
        transports: [apiLogTransport],
    });

    backendErrorLogger = winston.createLogger({
        level: 'error',
        format: winston.format.combine(
            winston.format.timestamp(),
            logFormat
        ),
        transports: [errorLogTransport],
    });

}

const logger = {
    info: (message: string, { ...meta }) => {
        if (typeof window === 'undefined') {
            return backendLogger.info(message, meta)
        } else {
            console.log(`MESSAGE: ${message}, META: ${JSON.stringify(meta)}`)
        }
    },
    error: (message: string, { ...meta }) => {
        if (typeof window === 'undefined') {
            return backendErrorLogger.error(message, meta)
        } else {
            console.log(`MESSAGE: ${message}, META: ${JSON.stringify(meta)}`)
        }
    }
}





export default logger 
