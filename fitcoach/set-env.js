const fs = require('fs');
const path = require('path');

const targetPathProd = path.join(__dirname, './src/environments/environment.prod.ts');
const targetPathDev = path.join(__dirname, './src/environments/environment.ts');
const envDirectory = path.join(__dirname, './src/environments');

const envConfigFile = `
export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL || 'https://btfafaujqwldptlfpmfb.supabase.co'}',
  supabaseAnonKey: '${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'}',
};
`;

if (!fs.existsSync(envDirectory)) {
  fs.mkdirSync(envDirectory, { recursive: true });
}

fs.writeFileSync(targetPathProd, envConfigFile);
fs.writeFileSync(targetPathDev, envConfigFile);
console.log(`Environment files generated at ${envDirectory}`);
