import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import { Chess } from 'chess.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Version lite-single-thread : 11MB NNUE, démarrage rapide, aucune dépendance système
// __dirname = backend/services/ → ../node_modules/ = backend/node_modules/
const STOCKFISH_PATH = path.join(__dirname, '../node_modules/stockfish/bin/stockfish-18-lite-single.js');

const DEPTH = 12; // Bon rapport vitesse/précision pour la détection de blunders
const GLOBAL_TIMEOUT_MS = 180_000; // 3 min max pour toute une partie

// Analyse toutes les positions FEN avec un seul processus Stockfish
async function analyzePositions(fens) {
  return new Promise((resolve, reject) => {
    // Spawner stockfish.js via Node.js — fonctionne en cloud sans binaire système
    const sf = spawn(process.execPath, [STOCKFISH_PATH]);

    sf.on('error', (err) => {
      clearTimeout(globalTimer);
      reject(new Error(`Impossible de lancer Stockfish : ${err.message}`));
    });

    // Si le processus quitte avant d'avoir tout analysé (chemin invalide, crash...)
    sf.on('close', (code) => {
      if (results.length < fens.length) {
        clearTimeout(globalTimer);
        reject(new Error(`Stockfish a quitté prématurément (code ${code}). Chemin : ${STOCKFISH_PATH}`));
      }
    });

    const results = [];
    let idx = 0;
    let score = 0;
    let initialized = false;
    let buffer = '';

    const globalTimer = setTimeout(() => {
      sf.kill();
      reject(new Error('Timeout global de l\'analyse Stockfish'));
    }, GLOBAL_TIMEOUT_MS);

    sf.stdout.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // conserver la ligne incomplète pour le prochain chunk

      for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;

        // Stocker l'évaluation la plus récente (plusieurs "info" par position)
        const cpMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        if (cpMatch) score = parseInt(cpMatch[1]);
        if (mateMatch) score = parseInt(mateMatch[1]) > 0 ? 10000 : -10000;

        // Moteur prêt → analyser la première position
        if (!initialized && line === 'readyok') {
          initialized = true;
          sendNext();
          continue;
        }

        // Fin d'analyse d'une position → passer à la suivante
        if (initialized && line.startsWith('bestmove')) {
          const bestmove = line.split(' ')[1] ?? null;
          results.push({ score, bestmove });
          score = 0;
          idx++;

          if (idx < fens.length) {
            sendNext();
          } else {
            clearTimeout(globalTimer);
            sf.kill();
            resolve(results);
          }
        }
      }
    });

    sf.stderr.on('data', () => {}); // ignorer les logs Stockfish non critiques

    function sendNext() {
      sf.stdin.write(`position fen ${fens[idx]}\n`);
      sf.stdin.write(`go depth ${DEPTH}\n`);
    }

    // Séquence d'init UCI standard (l'engine a besoin d'un instant pour démarrer)
    setTimeout(() => {
      sf.stdin.write('uci\n');
      sf.stdin.write('isready\n');
    }, 300);
  });
}

// Classe un coup selon la perte d'évaluation (centipions)
function classifyMove(evalDrop, isBestMove) {
  if (evalDrop >= 200) return 'blunder';
  if (evalDrop >= 100) return 'mistake';
  if (evalDrop >= 50) return 'inaccuracy';
  if (isBestMove) return 'best';
  return 'normal';
}

// Point d'entrée principal : analyse un PGN complet
export async function analyzePGN(pgn) {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch (e) {
    throw new Error(`PGN invalide : ${e.message}`);
  }

  const history = chess.history({ verbose: true });
  if (history.length === 0) return null;

  // Reconstruire toutes les positions FEN coup par coup
  const replayChess = new Chess();
  const fens = [replayChess.fen()];
  for (const move of history) {
    replayChess.move(move.san);
    fens.push(replayChess.fen());
  }

  console.log(`[analysis] Analyse de ${fens.length} positions (depth ${DEPTH})...`);
  const start = Date.now();

  let evals;
  try {
    evals = await analyzePositions(fens);
  } catch (e) {
    console.error('[analysis] Stockfish error:', e.message);
    return null;
  }

  console.log(`[analysis] Terminé en ${((Date.now() - start) / 1000).toFixed(1)}s`);

  // Classifier chaque coup
  return history.map((move, i) => {
    const evalBefore = evals[i];
    const evalAfter = evals[i + 1];
    const moveNumber = Math.floor(i / 2) + 1;
    const color = move.color === 'w' ? 'blanc' : 'noir';

    if (!evalBefore || !evalAfter) {
      return { moveNumber, color, san: move.san, classification: 'normal' };
    }

    const cpBefore = evalBefore.score;
    const cpAfter = evalAfter.score;

    // Stockfish retourne le score du point de vue du JOUEUR AU TRAIT (pas toujours les blancs).
    // evalDrop = perte d'évaluation pour le joueur qui vient de jouer.
    // Formule : cpBefore + cpAfter
    //   - Blanc joue : absolute_before = cpBefore, absolute_after = -cpAfter → drop = cpBefore + cpAfter
    //   - Noir joue  : absolute_before = -cpBefore, absolute_after = cpAfter → drop = cpBefore + cpAfter (identique)
    const evalDrop = cpBefore + cpAfter;

    // Comparaison en format UCI (ex: "e2e4")
    const moveUCI = move.from + move.to + (move.promotion ?? '');
    const isBestMove = !!evalBefore.bestmove && moveUCI === evalBefore.bestmove;
    const evalDropRounded = Math.round(evalDrop);

    return {
      moveNumber,
      color,
      san: move.san,
      classification: classifyMove(evalDropRounded, isBestMove),
      evalDrop: evalDropRounded,
      cpBefore,
      cpAfter,
    };
  });
}

// Formate les annotations pour le prompt LLM
export function formatAnnotationsForPrompt(annotations) {
  if (!annotations || annotations.length === 0) return null;

  const keyMoves = annotations.filter(a => a.classification !== 'normal');
  if (keyMoves.length === 0) return null;

  const labels = {
    blunder: 'BLUNDER (erreur grave)',
    mistake: 'ERREUR',
    inaccuracy: 'IMPRÉCISION',
    best: 'MEILLEUR COUP',
  };

  const lines = keyMoves.map(m => {
    const label = labels[m.classification] ?? m.classification;
    const evalInfo = m.evalDrop !== undefined && m.classification !== 'best'
      ? ` — perte de ${m.evalDrop} centipions`
      : '';
    return `  - Coup ${m.moveNumber} (${m.color}, ${m.san}) : ${label}${evalInfo}`;
  });

  return `Analyse Stockfish des moments clés de la partie :
${lines.join('\n')}

Utilise ces données pour moduler ton ton :
- BLUNDER : ralentis, exprime l'incrédulité, explique l'erreur commise
- ERREUR / IMPRÉCISION : signale-le clairement, reste pédagogue
- MEILLEUR COUP : monte en intensité, célèbre le coup, explique pourquoi il est fort
- Coups normaux : commente sobrement pour que les moments forts ressortent par contraste`;
}
