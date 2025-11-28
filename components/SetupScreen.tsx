import React, { useState } from 'react';
import { Team } from '../types';
import { Button } from './Button';
import { Settings } from 'lucide-react';

interface SetupScreenProps {
  onStartMatch: (totalOvers: number, battingFirst: Team) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartMatch }) => {
  const [overs, setOvers] = useState<number>(10);
  const [tossWinner, setTossWinner] = useState<Team | null>(null);
  const [choice, setChoice] = useState<'bat' | 'bowl' | null>(null);

  const handleStart = () => {
    if (!tossWinner || !choice) return;

    let battingFirst: Team;
    if (choice === 'bat') {
      battingFirst = tossWinner;
    } else {
      battingFirst = tossWinner === 'Team A' ? 'Team B' : 'Team A';
    }

    onStartMatch(overs, battingFirst);
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto p-4 animate-fade-in bg-black text-[#e7e9ea]">
      {/* Header */}
      <div className="flex flex-col items-center justify-center pt-8 pb-10 space-y-4">
        <div className="w-12 h-12 bg-[#e7e9ea] text-black rounded-full flex items-center justify-center">
            <Settings size={24} className="animate-spin-slow" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Match Setup</h1>
      </div>

      <div className="space-y-10 px-2">
        {/* Overs Input */}
        <div className="space-y-4">
          <label className="text-[#71767b] font-bold text-xs uppercase tracking-wider ml-1">Total Overs</label>
          <div className="flex items-center justify-between bg-[#16181c] p-4 rounded-[2rem] border border-[#2f3336]">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setOvers(Math.max(1, overs - 1))}
              aria-label="Decrease Overs"
            >-</Button>
            
            <div className="flex flex-col items-center">
                <span className="text-5xl font-black tracking-tighter leading-none">{overs}</span>
                <span className="text-[#71767b] text-sm font-medium">Overs</span>
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setOvers(overs + 1)}
              aria-label="Increase Overs"
            >+</Button>
          </div>
        </div>

        {/* Toss Section */}
        <div className="space-y-4">
          <label className="text-[#71767b] font-bold text-xs uppercase tracking-wider ml-1">Toss Winner</label>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant={tossWinner === 'Team A' ? 'primary' : 'secondary'} 
              onClick={() => { setTossWinner('Team A'); setChoice(null); }}
              size="lg"
            >
              Team A
            </Button>
            <Button 
              variant={tossWinner === 'Team B' ? 'primary' : 'secondary'} 
              onClick={() => { setTossWinner('Team B'); setChoice(null); }}
              size="lg"
            >
              Team B
            </Button>
          </div>
        </div>

        {/* Choice Section */}
        {tossWinner && (
          <div className="space-y-4 animate-slide-up">
             <label className="text-[#71767b] font-bold text-xs uppercase tracking-wider ml-1">
              {tossWinner} Elected to
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={choice === 'bat' ? 'accent' : 'secondary'} 
                onClick={() => setChoice('bat')}
                size="lg"
              >
                Bat First
              </Button>
              <Button 
                variant={choice === 'bowl' ? 'accent' : 'secondary'} 
                onClick={() => setChoice('bowl')}
                size="lg"
              >
                Bowl First
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1" />
      
      <div className="pb-6 pt-4">
        <Button 
          fullWidth 
          variant="primary"
          size="xl"
          disabled={!tossWinner || !choice}
          onClick={handleStart}
        >
          Let's Play
        </Button>
      </div>
    </div>
  );
};