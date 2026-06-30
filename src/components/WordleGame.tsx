'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, Check, X, Share2, AlertCircle } from 'lucide-react';
import { getCleanPlayers, getDailyPlayer, evaluateGuess, PlayerData, GuessResult, MatchStatus, normalizeString } from '../lib/gameLogic';

export default function WordleGame() {
  const [searchTerm, setSearchTerm] = useState('');
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  
  const allPlayers = useMemo(() => getCleanPlayers(), []);
  const targetPlayer = useMemo(() => getDailyPlayer(), []);
  const maxGuesses = 6;
  const isWin = guesses.length > 0 && guesses[0].player.id === targetPlayer.id;
  const isGameOver = guesses.length >= maxGuesses || isWin;

  const normalizedSearch = normalizeString(searchTerm);
  const filteredPlayers = allPlayers
    .filter(p => normalizeString(p.name).includes(normalizedSearch) && !guesses.find(g => g.player.id === p.id))
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
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-10">
      {/* Header Premium Sports Casual */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-athletic text-slate-900 uppercase tracking-tight drop-shadow-md">
          Adivinhe o <span className="text-emerald-500">Jogador</span>
        </h1>
        <div className="inline-flex items-center gap-3 glass-panel px-6 py-2 rounded-full font-bold text-lg text-slate-700">
          Tentativas restantes: 
          <span className="flex gap-1 ml-2">
            {Array.from({ length: maxGuesses }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < maxGuesses - guesses.length ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
            ))}
          </span>
        </div>
      </div>

      {/* Input Area */}
      {!isGameOver && (
        <div className="relative z-50 max-w-2xl mx-auto w-full">
          <div className="relative flex items-center rounded-2xl shadow-xl">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquise o nome do jogador..."
              className="w-full p-5 pl-16 bg-white/90 backdrop-blur-md border-4 border-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.05)] text-xl font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
            <Search className="absolute left-6 text-slate-400 w-7 h-7" />
          </div>
          
          <AnimatePresence>
            {searchTerm.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-3 glass-panel rounded-2xl overflow-hidden border-2 border-white/80 shadow-2xl"
              >
                {filteredPlayers.length > 0 ? filteredPlayers.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => handleGuess(p)}
                    className="w-full text-left p-4 hover:bg-white/80 border-b border-slate-200/50 last:border-0 flex items-center justify-between group transition-all"
                  >
                    <span className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">{p.name}</span>
                    <span className="text-xs font-black uppercase text-slate-500 bg-slate-200/50 px-3 py-1 rounded-md">{p.team}</span>
                  </button>
                )) : (
                  <div className="p-6 text-center text-slate-500 font-bold flex items-center justify-center gap-2 bg-white/50">
                    <AlertCircle className="w-5 h-5 text-rose-500" /> Nenhum jogador encontrado. Tente outro nome.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Game Over Card */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`max-w-2xl mx-auto w-full p-8 border-[6px] rounded-[2rem] shadow-2xl text-center space-y-6 ${isWin ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-400' : 'bg-gradient-to-b from-rose-50 to-white border-rose-400'}`}
          >
            <h2 className={`text-5xl font-athletic uppercase tracking-tight ${isWin ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isWin ? '🏆 GOLAÇO!' : '❌ FIM DE JOGO'}
            </h2>
            <div className="bg-white p-8 rounded-2xl card-shadow border border-slate-100 inline-block">
              <p className="text-slate-400 font-black mb-1 uppercase tracking-widest text-xs">O Jogador Era</p>
              <p className="text-4xl font-black text-slate-800 tracking-tight">{targetPlayer.name}</p>
            </div>
            
            <button 
              className={`w-full py-5 text-white font-athletic tracking-wide text-2xl uppercase rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 ${isWin ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-slate-800 to-slate-700'}`}
              onClick={handleShare}
            >
              <Share2 className="w-6 h-6" />
              COMPARTILHAR RESULTADO
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Container */}
      <div className="w-full glass-panel p-4 md:p-8 rounded-[2rem] border-2 border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        {/* Grid Header */}
        <div className="hidden md:grid grid-cols-6 gap-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest px-2 mb-6">
          <div>JOGADOR</div>
          <div>NACIONALIDADE</div>
          <div>LIGA</div>
          <div>TIME</div>
          <div>POSIÇÃO</div>
          <div>IDADE</div>
        </div>

        {/* Guesses List & Empty Slots */}
        <div className="flex flex-col gap-4 relative z-0">
          {Array.from({ length: maxGuesses }).map((_, i) => {
            const guess = guesses[i];
            if (guess) {
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -30, rotateX: 90 }}
                  animate={{ opacity: 1, x: 0, rotateX: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                  key={`guess-${i}`} 
                  className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-2xl card-shadow border border-slate-100"
                >
                  <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 flex items-center justify-center text-center border border-slate-200">
                    <span className="font-bold text-slate-800 text-sm md:text-base leading-tight font-athletic tracking-wide uppercase">{guess.player.name}</span>
                  </div>
                  <StatusBox status={guess.nationality} value={guess.player.nationality} label="Nac." />
                  <StatusBox status={guess.league} value={guess.player.league} label="Liga" />
                  <StatusBox status={guess.team} value={guess.player.team} label="Time" />
                  <StatusBox status={guess.position} value={guess.player.position} label="Pos." />
                  <StatusBox status={guess.age} value={guess.player.age.toString()} label="Idade" isAge />
                </motion.div>
              );
            } else {
              // Empty Slots (Trading Card Silhouettes)
              return (
                <div key={`empty-${i}`} className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 bg-slate-100/50 p-3 md:p-4 rounded-2xl border-2 border-dashed border-slate-300/60">
                  <div className="col-span-2 md:col-span-1 bg-white/40 rounded-xl h-14 md:h-full"></div>
                  <div className="bg-white/40 rounded-xl h-16 md:h-20"></div>
                  <div className="bg-white/40 rounded-xl h-16 md:h-20"></div>
                  <div className="bg-white/40 rounded-xl h-16 md:h-20"></div>
                  <div className="bg-white/40 rounded-xl h-16 md:h-20"></div>
                  <div className="bg-white/40 rounded-xl h-16 md:h-20"></div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}

function StatusBox({ status, value, label, isAge = false }: { status: MatchStatus, value: string, label: string, isAge?: boolean }) {
  let bgStyle = "bg-slate-100 border-slate-200 text-slate-500";
  let Icon = null;

  if (status === 'match') {
    bgStyle = "bg-gradient-to-br from-emerald-400 to-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20";
    Icon = Check;
  } else if (status === 'mismatch') {
    bgStyle = "bg-gradient-to-br from-slate-200 to-slate-300 border-slate-400 text-slate-700";
    Icon = X;
  } else if (status === 'higher' || status === 'lower') {
    bgStyle = "bg-gradient-to-br from-amber-400 to-orange-400 border-orange-500 text-white shadow-lg shadow-orange-500/20";
    Icon = status === 'higher' ? ChevronUp : ChevronDown;
  }

  // To prevent the React unused vars warning (isAge is kept for future specific logic if needed)
  void isAge;

  return (
    <motion.div 
      initial={{ rotateY: 90 }}
      animate={{ rotateY: 0 }}
      transition={{ duration: 0.4, type: "spring" }}
      className={`relative border-b-4 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all min-h-[70px] md:min-h-0 ${bgStyle}`}
    >
      <span className="md:hidden text-[10px] font-black uppercase opacity-50 mb-1">{label}</span>
      <span className="font-bold text-xs md:text-sm leading-tight z-10 break-words line-clamp-2 drop-shadow-sm" title={value}>{value}</span>
      {Icon && <Icon className="absolute opacity-20 w-10 h-10 pointer-events-none md:relative md:w-6 md:h-6 md:opacity-40 md:mt-1 drop-shadow-sm" />}
    </motion.div>
  );
}
