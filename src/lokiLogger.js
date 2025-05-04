const winston = require('winston');
const { createLogger, format, transports } = winston;
const LokiTransport = require('winston-loki');


const lokiTransport = new LokiTransport({
    host: "https://loki.dev.aritraghorai.in", // Default Loki server URL
    labels: {
        app: 'node-express-app-local',
        environment: process.env.NODE_ENV || 'development'
    },
    json: true,
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
});


// Create Winston Logger
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'hairandscare-backend-prod' },
    transports: [
        // Console transport for local development
        new transports.Console({
            format: format.simple()
        }),

        // Loki transport for centralized logging
        // lokiTransport
    ]
});

const originalConsoleLog = console.log;
console.log = (...args) => {
    logger.info(args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : arg
    ).join(' '));
    originalConsoleLog(...args);
};

console.error = (...args) => {
    logger.error(args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : arg
    ).join(' '));
    originalConsoleLog(...args);
};

module.exports = { logger };
