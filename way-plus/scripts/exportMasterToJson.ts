#!/usr/bin/env tsx
// Uso: npx tsx scripts/exportMasterToJson.ts

import { waysMasterData } from '../src/data/ways-master-data';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, '..', 'src', 'data', 'ways-master-data.json');
fs.writeFileSync(outputPath, JSON.stringify(waysMasterData, null, 2), 'utf-8');
console.log(`✅ Exportados ${waysMasterData.length} ways a ${outputPath}`);
