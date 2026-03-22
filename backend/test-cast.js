// Test script for cast generation
// Usage: ANTHROPIC_API_KEY=sk-ant-... node test-cast.js

import { generateCast } from './services/llm.js';

const SAMPLE_PGN = `[Event "Casual Game"]
[Site "Chess.com"]
[Date "2024.01.15"]
[White "Player1"]
[Black "Player2"]
[Result "1-0"]
[WhiteElo "1200"]
[BlackElo "1150"]
[TimeControl "600"]
[ECO "C20"]

1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6?? 4. Qxf7# 1-0`;

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set');
    console.error('Usage: ANTHROPIC_API_KEY=sk-ant-... node test-cast.js');
    process.exit(1);
  }

  console.log('Generating cast for sample game...\n');
  console.log('PGN:', SAMPLE_PGN);
  console.log('\n--- Generated Cast ---\n');

  try {
    const cast = await generateCast(SAMPLE_PGN);
    console.log(cast);
    console.log('\n--- Done ---');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
