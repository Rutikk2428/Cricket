import React, { useEffect, useRef, useState } from 'react';
import { InningsState, MatchPhase, BallResult } from '../types';
import { Button } from './Button';
import { RotateCcw, Target } from 'lucide-react';

interface ScoringScreenProps {
  inningsState: InningsState;
  phase: MatchPhase;
  totalOvers: number;
  target: number | null;
  onBall: (runs: number, isWicket: boolean, isExtra: boolean) => void;
  onUndo: () => void;
}

export const ScoringScreen: React.FC<ScoringScreenProps> = ({
  inningsState,
  phase,
  totalOvers,
  target,
  onBall,
  onUndo,
}) => {
  const { runs, wickets, validBalls, battingTeam, currentOver, oversHistory } = inningsState;

  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Animation State
  const [anim, setAnim] = useState<{ type: '4' | '6' | 'W' | null, key: number }>({ type: null, key: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-scroll current over history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [currentOver]);

  // Clear animation after delay
  useEffect(() => {
    if (anim.type) {
      // Keep animation visible for 1.2s
      const timer = setTimeout(() => {
        setAnim({ type: null, key: 0 });
        setIsProcessing(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [anim]);

  const handleInput = (runs: number, isWicket: boolean, isExtra: boolean) => {
    if (isProcessing) return; // Prevent double taps

    const isHighImpact = isWicket || runs === 4 || runs === 6;

    if (isHighImpact) {
      setIsProcessing(true);
      
      // Trigger Visuals immediately
      if (isWicket) setAnim({ type: 'W', key: Date.now() });
      else if (runs === 4) setAnim({ type: '4', key: Date.now() });
      else if (runs === 6) setAnim({ type: '6', key: Date.now() });

      // Delay the logic update so the user sees the animation before any potential screen change
      setTimeout(() => {
        onBall(runs, isWicket, isExtra);
        // We do not clear isProcessing here, it clears when animation ends in useEffect
      }, 800); 
    } else {
      // Immediate update for normal balls
      onBall(runs, isWicket, isExtra);
    }
  };

  const oversDone = Math.floor(validBalls / 6);
  const ballsInOver = validBalls % 6;
  const displayOver = `${oversDone}.${ballsInOver}`;

  // Second Innings Stats
  let statsBlock = null;
  if (phase === MatchPhase.INNINGS_2 && target !== null) {
    const runsNeeded = target - runs;
    const ballsRemaining = (totalOvers * 6) - validBalls;
    const reqPerBall = ballsRemaining > 0 && runsNeeded > 0
      ? (runsNeeded / ballsRemaining).toFixed(2)
      : '0.00';

    statsBlock = (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2f3336]">
        <div className="flex flex-col">
            <span className="text-[#71767b] text-[10px] font-bold uppercase tracking-wider">Need</span>
            <span className="text-xl font-bold text-[#e7e9ea]">{Math.max(0, runsNeeded)}</span>
        </div>
        <div className="h-6 w-px bg-[#2f3336]"></div>
        <div className="flex flex-col items-center">
            <span className="text-[#71767b] text-[10px] font-bold uppercase tracking-wider">Balls</span>
            <span className="text-xl font-bold text-[#e7e9ea]">{Math.max(0, ballsRemaining)}</span>
        </div>
        <div className="h-6 w-px bg-[#2f3336]"></div>
        <div className="flex flex-col items-end">
            <span className="text-[#71767b] text-[10px] font-bold uppercase tracking-wider">R.R.</span>
            <span className="text-xl font-bold text-[#f91880]">{reqPerBall}</span>
        </div>
      </div>
    );
  }

  // Helper to render ball icon
  const renderBall = (ball: BallResult, idx: number) => {
    // X Color Palette
    let bgClass = "bg-[#16181c] text-[#71767b] border border-[#2f3336]";
    
    if (ball.isWicket) bgClass = "bg-[#f91880] text-white border-transparent";
    else if (ball.runs === 4) bgClass = "bg-[#1d9bf0] text-white border-transparent";
    else if (ball.runs === 6) bgClass = "bg-[#00ba7c] text-white border-transparent";
    else if (ball.isExtra) bgClass = "bg-[#ffd400] text-black border-transparent";
    else if (ball.runs > 0) bgClass = "bg-[#eff3f4] text-black border-transparent";

    return (
      <div key={`${ball.timestamp}-${idx}`} className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${bgClass} animate-pop`}>
        {ball.label}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-black text-[#e7e9ea] relative">
      
      {/* Animation Overlay */}
      {anim.type && (
        <div key={anim.key} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/80 backdrop-blur-md animate-fade-in">
           <div className={`flex flex-col items-center justify-center transform ${
              anim.type === 'W' ? 'animate-shake' : 
              anim.type === '6' ? 'animate-pop' : 
              'animate-slide-up'
           }`}>
              <div className={`text-[8rem] font-black italic tracking-tighter leading-none drop-shadow-2xl filter ${
                  anim.type === 'W' ? 'text-[#f91880]' : 
                  anim.type === '6' ? 'text-[#00ba7c]' : 
                  'text-[#1d9bf0]'
              }`}>
                  {anim.type === 'W' ? 'OUT' : anim.type === '4' ? '4' : '6'}
              </div>
              <div className="text-3xl font-bold text-white uppercase tracking-[0.3em] mt-4 animate-pulse">
                {anim.type === 'W' ? 'Wicket' : anim.type === '4' ? 'Boundary' : 'Maximum'}
              </div>
           </div>
        </div>
      )}

      {/* Top Scoreboard - Sticky & Blur */}
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-[#2f3336] px-4 pt-4 pb-4 shadow-sm">
        
        {/* Teams & Target Header */}
        <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col">
                 <h2 className="text-xs font-bold text-[#71767b] uppercase tracking-wider flex items-center gap-2">
                    {battingTeam} Batting
                 </h2>
            </div>
            {target && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#16181c] rounded-full border border-[#2f3336]">
                    <Target size={10} className="text-[#1d9bf0]" />
                    <span className="text-[10px] font-mono font-bold text-[#1d9bf0]">Target: {target}</span>
                </div>
            )}
        </div>

        {/* Main Score Display */}
        <div className="flex items-baseline space-x-3">
            <div className="text-6xl font-black tracking-tighter text-[#e7e9ea] leading-none">
              {runs}<span className="text-3xl text-[#71767b] font-bold">/{wickets}</span>
            </div>
            <div className="text-xl text-[#71767b] font-medium">
               Ov {displayOver}
            </div>
        </div>

        {statsBlock}
      </div>

      {/* Scrollable History Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[280px]"> {/* Large padding bottom for fixed keypad */}
        <div className="px-4 py-6 space-y-8">
            
            {/* Current Over Timeline */}
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <div className="text-xs font-bold text-[#71767b] uppercase tracking-wider">This Over</div>
                </div>
                <div 
                  ref={scrollRef}
                  className="flex space-x-3 overflow-x-auto no-scrollbar pb-2"
                >
                  {currentOver.length === 0 ? (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-dashed border-[#2f3336]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2f3336]" />
                    </div>
                  ) : (
                    currentOver.map((ball, idx) => renderBall(ball, idx))
                  )}
                </div>
            </div>

            {/* Previous Overs History */}
            {oversHistory.length > 0 && (
              <div className="space-y-3 animate-fade-in">
                 <div className="text-xs font-bold text-[#71767b] uppercase tracking-wider">Previous Overs</div>
                 <div className="space-y-2">
                    {[...oversHistory].reverse().map((over, idx) => {
                      const overNum = oversHistory.length - idx;
                      const runsInOver = over.reduce((acc, b) => acc + b.runs + (b.isExtra ? 1 : 0), 0);
                      
                      return (
                        <div key={overNum} className="flex items-center justify-between p-3 rounded-2xl border border-[#2f3336] bg-[#16181c]/50">
                            <span className="font-bold text-[#71767b] text-xs w-12">Ov {overNum}</span>
                            <div className="flex space-x-1 overflow-hidden flex-1 px-2">
                                {over.map((b, i) => (
                                    <span key={i} className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${b.isWicket ? 'bg-[#f91880] text-white' : b.runs >= 4 ? 'text-[#1d9bf0]' : 'text-[#71767b]'}`}>
                                        {b.label}
                                    </span>
                                ))}
                            </div>
                            <span className="font-mono font-bold text-[#e7e9ea] text-xs">
                                {runsInOver} runs
                            </span>
                        </div>
                      );
                    })}
                 </div>
              </div>
            )}
        </div>
      </div>

      {/* Sticky Bottom Keypad */}
      <div className="fixed bottom-0 w-full max-w-lg bg-black border-t border-[#2f3336] p-4 pb-6 backdrop-blur-xl bg-black/95">
         <div className="grid grid-cols-4 gap-3 mb-3">
            <Button disabled={isProcessing} variant="secondary" className="h-14 text-xl" onClick={() => handleInput(0, false, false)}>0</Button>
            <Button disabled={isProcessing} variant="secondary" className="h-14 text-xl" onClick={() => handleInput(1, false, false)}>1</Button>
            <Button disabled={isProcessing} variant="secondary" className="h-14 text-xl" onClick={() => handleInput(2, false, false)}>2</Button>
            <Button disabled={isProcessing} variant="secondary" className="h-14 text-xl" onClick={() => handleInput(3, false, false)}>3</Button>
         </div>
         <div className="grid grid-cols-4 gap-3">
            <Button 
                disabled={isProcessing}
                className="h-14 text-xl bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white border-transparent" 
                onClick={() => handleInput(4, false, false)}
            >4</Button>
            <Button 
                disabled={isProcessing}
                className="h-14 text-xl bg-[#00ba7c] hover:bg-[#00a26b] text-white border-transparent" 
                onClick={() => handleInput(6, false, false)}
            >6</Button>
            <Button disabled={isProcessing} variant="danger" className="h-14 text-xl font-black" onClick={() => handleInput(0, true, false)}>W</Button>
            <Button disabled={isProcessing} variant="outline" className="h-14 text-sm font-bold" onClick={() => handleInput(1, false, true)}>+1</Button>
         </div>
         
         <div className="mt-4 flex justify-center">
             <button 
                onClick={onUndo} 
                disabled={isProcessing || (inningsState.validBalls === 0 && inningsState.runs === 0 && inningsState.wickets === 0)}
                className="flex items-center space-x-2 text-[#71767b] hover:text-[#e7e9ea] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold uppercase tracking-widest py-2 px-4"
             >
                <RotateCcw size={12} />
                <span>Undo Last Ball</span>
             </button>
         </div>
      </div>
    </div>
  );
};