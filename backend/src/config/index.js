// src/config/index.js
import dotenv from 'dotenv';
import configSchema from './schema.js';

dotenv.config();

const config = configSchema.parse(process.env);
export default config;
