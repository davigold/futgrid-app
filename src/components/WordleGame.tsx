'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, Check, X, Share2, AlertCircle } from 'lucide-react';
import { getCleanPlayers, getDailyPlayer, evaluateGuess, PlayerData, GuessResult, MatchStatus } from '../lib/gameLogic';

export default function WordleGame() {
  const [searchTerm, setSearchTerm] = useState('');
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  
  const allPlayers = useMemo(() => getCleanPlayers(), []);
  const targetPlayer = useMemo(() => getDailyPlayer(), []);
  const maxGuesses = 6;
  const isWin = guesses.length > 0 && guesses[0].player.id === targetPlayer.id;
  const isGameOver = guesses.length >= maxGuesses || isWin;

  const filteredPlayers = allPlayers
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !guesses.find(g => g.player.id === p.id))
    .slice(0, 5);

  const handleGuess = (player: PlayerData) => {
    if (isGameOver) return;
    const result = evaluateGuess(player, targetPlayer);
    setGuesses([result, ...guesses]);
    setSearchTerm('');
  };

  const handleShare = () => {
    const text = isWin 
      ? `🏆 Achei o jogador no FutGrid em ${guesses.length}/${maxGuesses} tentativas!` 
      : `❌ Não consegui achar o jogador no FutGrid hoje.`;
      
    if (navigator.share) {
      navigator.share({ title: 'FutGrid', text: text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      alert('Resultado copiado para a área de transferência!');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      {/* Header Premium Sports Casual */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 uppercase italic tracking-tighter drop-shadow-sm">
          Adivinhe o <span className="text-emerald-500">Jogador</span>
        </h1>
        <p className="text-slate-500 font-bold text-lg md:text-xl bg-white inline-block px-4 py-1 rounded-full shadow-sm border border-slate-200">
          Tentativas restantes: <span className="text-rose-500">{maxGuesses - guesses.length}</span>
        </p>
      </div>

      {/* Input */}
      {!isGameOver && (
        <div className="relative z-50 max-w-2xl mx-auto w-full">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome de um jogador..."
              className="w-full p-4 pl-14 bg-white border-4 border-slate-200 rounded-2xl shadow-sm text-xl font-bold text-slate-700 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-300"
            />
            <Search className="absolute left-5 text-slate-400 w-6 h-6" />
          </div>
          
          {searchTerm.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden"
            >
              {filteredPlayers.length > 0 ? filteredPlayers.map(p => (
                <button 
                  key={p.id}
                  onClick={() => handleGuess(p)}
                  className="w-full text-left p-4 hover:bg-slate-50 border-b-2 border-slate-100 last:border-0 flex items-center justify-between group transition-colors"
                >
                  <span className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">{p.name}</span>
                  <span className="text-sm text-slate-400 font-bold bg-slate-100 px-3 py-1 rounded-full">{p.team}</span>
                </button>
              )) : (
                <div className="p-4 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Nenhum jogador encontrado.
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Game Over Card */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`max-w-2xl mx-auto w-full p-8 border-4 rounded-3xl shadow-xl text-center space-y-6 ${isWin ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}
          >
            <h2 className={`text-4xl font-black italic uppercase tracking-tight ${isWin ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isWin ? '🏆 Golaço!' : '❌ Fim de Jogo'}
            </h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-100 inline-block">
              <p className="text-slate-500 font-bold mb-1 uppercase tracking-widest text-sm">O Jogador Era</p>
              <p className="text-3xl font-black text-slate-800">{targetPlayer.name}</p>
            </div>
            
            <button 
              className={`w-full py-5 text-white font-black text-2xl italic uppercase rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-3 ${isWin ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-800 hover:bg-slate-900'}`}
              onClick={handleShare}
            >
              <Share2 className="w-6 h-6" />
              Compartilhar Resultado
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Header (Desktop only) */}
      {guesses.length > 0 && (
        <div className="hidden md:grid grid-cols-6 gap-3 text-center text-xs font-black text-slate-400 uppercase tracking-widest px-2">
          <div>Jogador</div>
          <div>Nac.</div>
          <div>Liga</div>
          <div>Time</div>
          <div>Pos.</div>
          <div>Idade</div>
        </div>
      )}

      {/* Guesses List */}
      <div className="flex flex-col gap-4 relative z-0">
        {guesses.map((guess, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            key={i} 
            className="grid grid-cols-2 md:grid-cols-6 gap-3 bg-white p-3 rounded-2xl shadow-sm border-2 border-slate-100"
          >
            <div className="col-span-2 md:col-span-1 bg-slate-50 rounded-xl p-3 flex items-center justify-center text-center border-2 border-slate-100">
              <span className="font-black text-slate-700 text-sm md:text-base leading-tight">{guess.player.name}</span>
            </div>
            <StatusBox status={guess.nationality} value={guess.player.nationality} label="Nac." />
            <StatusBox status={guess.league} value={guess.player.league} label="Liga" />
            <StatusBox status={guess.team} value={guess.player.team} label="Time" />
            <StatusBox status={guess.position} value={guess.player.position} label="Pos." />
            <StatusBox status={guess.age} value={guess.player.age.toString()} label="Idade" isAge />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatusBox({ status, value, label, isAge = false }: { status: MatchStatus, value: string, label: string, isAge?: boolean }) {
  let bgColor = "bg-slate-100 border-slate-200 text-slate-500";
  let Icon = null;

  if (status === 'match') {
    bgColor = "bg-emerald-500 border-emerald-600 text-white shadow-md";
    Icon = Check;
  } else if (status === 'mismatch') {
    bgColor = "bg-rose-500 border-rose-600 text-white shadow-md";
    Icon = X;
  } else if (status === 'higher') {
    bgColor = "bg-amber-400 border-amber-500 text-white shadow-md";
    Icon = ChevronUp;
  } else if (status === 'lower') {
    bgColor = "bg-amber-400 border-amber-500 text-white shadow-md";
    Icon = ChevronDown;
  }

  return (
    <div className={`relative border-2 rounded-xl p-2 md:p-1 flex flex-col md:flex-row items-center justify-center text-center transition-all min-h-[60px] md:min-h-0 ${bgColor}`}>
      <span className="md:hidden text-[10px] font-black uppercase opacity-60 mb-1">{label}</span>
      <span className="font-bold text-xs md:text-sm leading-tight z-10 break-words line-clamp-2" title={value}>{value}</span>
      {Icon && <Icon className="absolute opacity-20 w-8 h-8 pointer-events-none md:relative md:w-5 md:h-5 md:opacity-50 md:ml-1" />}
    </div>
  );
}
