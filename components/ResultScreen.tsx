import React from 'react';
import { MatchState } from '../types';
import { Button } from './Button';
import { Trophy } from 'lucide-react';

interface ResultScreenProps {
  state: MatchState;
  onReset: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ state, onReset }) => {
  const isDraw = state.winner === 'Draw';

  return (
    <div className="flex flex-col h-full bg-black text-[#e7e9ea] p-6 items-center justify-center text-center space-y-12 animate-fade-in">
      
      <div className="flex flex-col items-center space-y-8">
        <div className="w-24 h-24 bg-[#ffd400] text-black rounded-full flex items-center justify-center shadow-[0_0_40px_-10px_rgba(255,212,0,0.5)]">
          <Trophy size={48} fill="currentColor" strokeWidth={1.5} />
        </div>
        
        <div className="space-y-4">
          {isDraw ? (
            <h1 className="text-4xl font-black tracking-tight text-[#e7e9ea]">It's a Draw!</h1>
          ) : (
            <>
              <p className="text-sm text-[#71767b] uppercase tracking-[0.2em] font-bold">Winner</p>
              <p className="text-5xl font-black text-[#e7e9ea]">
                {state.winner}
              </p>
              <p className="text-xl font-medium text-[#1d9bf0]">{state.winMargin}</p>
            </>
          )}
        </div>
      </div>

      <div className="w-full max-w-sm bg-[#16181c] rounded-3xl border border-[#2f3336] overflow-hidden">
        <div className="p-5 flex justify-between items-center hover:bg-[#1d1f23] transition-colors">
          <span className="font-bold text-[#e7e9ea]">{state.innings1.battingTeam}</span>
          <span className="font-mono font-bold text-[#71767b] text-xl">{state.innings1.runs}/{state.innings1.wickets}</span>
        </div>
        <div className="h-px bg-[#2f3336] w-full" />
        <div className="p-5 flex justify-between items-center hover:bg-[#1d1f23] transition-colors">
          <span className="font-bold text-[#e7e9ea]">{state.innings2.battingTeam}</span>
          <span className="font-mono font-bold text-[#71767b] text-xl">{state.innings2.runs}/{state.innings2.wickets}</span>
        </div>
      </div>

      <Button onClick={onReset} variant="primary" className="w-full max-w-xs h-14 text-lg">
        Start New Match
      </Button>
    </div>
  );
};