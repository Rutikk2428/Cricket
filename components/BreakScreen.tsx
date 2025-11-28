import React from 'react';
import { InningsState } from '../types';
import { Button } from './Button';

interface BreakScreenProps {
  innings1: InningsState;
  totalOvers: number;
  onStartSecondInnings: () => void;
}

export const BreakScreen: React.FC<BreakScreenProps> = ({ innings1, totalOvers, onStartSecondInnings }) => {
  const target = innings1.runs + 1;
  const oversBowled = Math.floor(innings1.validBalls / 6);
  const ballsBowled = innings1.validBalls % 6;

  return (
    <div className="flex flex-col h-full bg-black text-[#e7e9ea] p-6 justify-center items-center text-center space-y-10 animate-zoom-in">
      
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-[#71767b] uppercase tracking-[0.2em]">Innings Break</h2>
        <div className="text-4xl font-extrabold">{innings1.battingTeam}</div>
      </div>

      <div className="py-10 w-full border-y border-[#2f3336] space-y-1">
        <div className="text-8xl font-black tracking-tighter text-[#e7e9ea] leading-none">
          {innings1.runs}<span className="text-5xl text-[#71767b]">/{innings1.wickets}</span>
        </div>
        <p className="text-[#71767b] text-lg font-medium">
           in {oversBowled}{ballsBowled > 0 ? `.${ballsBowled}` : ''} overs
        </p>
      </div>

      <div className="bg-[#16181c] p-6 rounded-3xl w-full max-w-xs border border-[#2f3336]">
        <p className="text-[#71767b] uppercase text-[10px] font-bold tracking-widest mb-1">Target for {innings1.bowlingTeam}</p>
        <p className="text-5xl font-black text-[#1d9bf0]">{target}</p>
      </div>

      <div className="w-full max-w-xs pt-4">
        <Button onClick={onStartSecondInnings} fullWidth variant="primary" className="h-14 text-lg">
          Start 2nd Innings
        </Button>
      </div>
    </div>
  );
};