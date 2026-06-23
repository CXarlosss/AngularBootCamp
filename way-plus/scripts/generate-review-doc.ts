import { waysMasterData } from '../src/data/ways-master-data';
import * as fs from 'fs';

const generateReviewDoc = () => {
  let doc = '# WAY+ — Revisión de Contenido Terapéutico (41 Ways Nuevos)\n\n';
  doc += '> **Instrucciones para Maite:** Por favor revisa cada way y marca los ajustes necesarios.\n';
  doc += '> La diferencia entre "barriga" y "tripa", o las fobias específicas, son detalles clínicos de oro.\n\n';
  
  for (let step = 1; step <= 3; step++) {
    const stepWays = waysMasterData.filter(w => w.step === step);
    if (stepWays.length === 0) continue;
    
    doc += `\n## ${stepWays[0].stepTitle}\n\n`;
    doc += '| ID | Título | Dificultad | Revisado | Notas de Maite |\n';
    doc += '|----|--------|------------|----------|----------------|\n';
    
    for (const way of stepWays) {
      doc += `| ${way.id} | ${way.title} | ${way.difficulty} | [ ] | |\n`;
    }
    
    doc += '\n### Detalles por way\n\n';
    
    for (const way of stepWays) {
      doc += `#### ${way.id}: ${way.title}\n\n`;
      doc += `- **Descripción**: ${way.shortDescription}\n`;
      doc += `- **Estímulo**: ${way.stimulusText}\n`;
      doc += `- **Opción A (correcta)**: ${way.choiceA}\n`;
      doc += `- **Opción B**: ${way.choiceB}\n`;
      doc += `- **Skills**: ${way.skills.join(', ')}\n`;
      doc += `- **Imagen**: ${way.imageFilename}\n`;
      doc += `- [ ] **Vocabulario adecuado** (edad, región)\n`;
      doc += `- [ ] **Contexto familiar** (colegio, casa, parque)\n`;
      doc += `- [ ] **Sin fobias/sensibilidades** (perros, oscuridad, ruidos)\n`;
      doc += `- [ ] **Imagen realista disponible**\n`;
      doc += `- **Notas**: ___________________\n\n`;
    }
  }
  
  doc += '\n---\n';
  doc += `Documento generado automáticamente el ${new Date().toLocaleDateString('es-ES')}\n`;
  
  return doc;
};

const doc = generateReviewDoc();
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/revision-maite.md', doc, 'utf-8');
console.log('✅ Documento generado: docs/revision-maite.md');
