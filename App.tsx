import React, { useState, useEffect, useCallback } from 'react';
import { 
  Team, 
  MatchPhase, 
  MatchState, 
  InningsState, 
  BallResult 
} from './types';
import { SetupScreen } from './components/SetupScreen';
import { ScoringScreen } from './components/ScoringScreen';
import { BreakScreen } from './components/BreakScreen';
import { ResultScreen } from './components/ResultScreen';

// Initial empty state helper
const createEmptyInnings = (batting: Team, bowling: Team): InningsState => ({
  battingTeam: batting,
  bowlingTeam: bowling,
  runs: 0,
  wickets: 0,
  validBalls: 0,
  oversHistory: [],
  currentOver: [],
});

const App: React.FC = () => {
  // --- STATE ---
  // Store previous states for undo functionality
  const [historyStack, setHistoryStack] = useState<MatchState[]>([]);
  
  const [match, setMatch] = useState<MatchState>({
    totalOvers: 0,
    phase: MatchPhase.SETUP,
    innings1: createEmptyInnings('Team A', 'Team B'), // Placeholders
    innings2: createEmptyInnings('Team B', 'Team A'), // Placeholders
    target: null,
    winner: null,
    winMargin: null,
  });

  // --- ACTIONS ---

  const handleStartMatch = (totalOvers: number, battingFirst: Team) => {
    const bowlingFirst = battingFirst === 'Team A' ? 'Team B' : 'Team A';
    
    setMatch({
      totalOvers,
      phase: MatchPhase.INNINGS_1,
      innings1: createEmptyInnings(battingFirst, bowlingFirst),
      innings2: createEmptyInnings(bowlingFirst, battingFirst),
      target: null,
      winner: null,
      winMargin: null,
    });
    setHistoryStack([]);
  };

  const handleBall = (runs: number, isWicket: boolean, isExtra: boolean) => {
    // 1. Push current state to history stack for Undo
    setHistoryStack(prev => [...prev, match]);

    setMatch(prev => {
      const isInnings1 = prev.phase === MatchPhase.INNINGS_1;
      const currentInnings = isInnings1 ? prev.innings1 : prev.innings2;
      
      // Calculate new values
      let newRuns = currentInnings.runs + runs;
      if (isExtra) newRuns += 1; // Basic extra rule: +1 run

      const newWickets = currentInnings.wickets + (isWicket ? 1 : 0);
      
      const isValidBall = !isExtra; 
      const newValidBalls = currentInnings.validBalls + (isValidBall ? 1 : 0);

      // Label generation
      let label = runs.toString();
      if (isWicket) label = "W";
      if (isExtra) label = "Ex"; 

      const newBall: BallResult = {
        runs,
        isWicket,
        isExtra,
        label,
        timestamp: Date.now()
      };

      // Handle Overs
      let newCurrentOver = [...currentInnings.currentOver, newBall];
      let newOversHistory = [...currentInnings.oversHistory];

      const validBallsInCurrentOver = newCurrentOver.filter(b => !b.isExtra).length;
      
      if (validBallsInCurrentOver === 6) {
        newOversHistory.push(newCurrentOver);
        newCurrentOver = [];
      }

      const updatedInnings: InningsState = {
        ...currentInnings,
        runs: newRuns,
        wickets: newWickets,
        validBalls: newValidBalls,
        currentOver: newCurrentOver,
        oversHistory: newOversHistory,
      };

      return {
        ...prev,
        [isInnings1 ? 'innings1' : 'innings2']: updatedInnings,
      };
    });
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    
    const previousState = historyStack[historyStack.length - 1];
    setMatch(previousState);
    setHistoryStack(prev => prev.slice(0, -1));
  };

  const startSecondInnings = () => {
    setMatch(prev => ({
      ...prev,
      phase: MatchPhase.INNINGS_2,
      target: prev.innings1.runs + 1
    }));
    setHistoryStack([]); // Clear undo history for clean slate
  };

  const resetMatch = () => {
    setMatch({
      totalOvers: 0,
      phase: MatchPhase.SETUP,
      innings1: createEmptyInnings('Team A', 'Team B'),
      innings2: createEmptyInnings('Team B', 'Team A'),
      target: null,
      winner: null,
      winMargin: null,
    });
    setHistoryStack([]);
  };

  // --- GAME LOGIC CHECKER ---
  useEffect(() => {
    const { phase, totalOvers, innings1, innings2, target } = match;

    if (phase === MatchPhase.INNINGS_1) {
      const allOut = innings1.wickets >= 10;
      const oversFinished = innings1.validBalls >= totalOvers * 6;

      if (allOut || oversFinished) {
        setMatch(prev => ({ ...prev, phase: MatchPhase.BREAK }));
      }
    } else if (phase === MatchPhase.INNINGS_2 && target !== null) {
      const allOut = innings2.wickets >= 10;
      const oversFinished = innings2.validBalls >= totalOvers * 6;
      const chased = innings2.runs >= target;

      if (chased || allOut || oversFinished) {
        // Calculate Result
        let winner: Team | 'Draw' | null = null;
        let winMargin = '';

        if (chased) {
          winner = innings2.battingTeam;
          const wicketsLeft = 10 - innings2.wickets;
          winMargin = `Won by ${wicketsLeft} Wicket${wicketsLeft !== 1 ? 's' : ''}`;
        } else if (innings2.runs === target - 1) {
          winner = 'Draw';
          winMargin = 'Scores Level';
        } else {
          winner = innings2.bowlingTeam; // Actually the first innings team
          const runsDiff = (target - 1) - innings2.runs;
          winMargin = `Won by ${runsDiff} Run${runsDiff !== 1 ? 's' : ''}`;
        }

        setMatch(prev => ({
          ...prev,
          phase: MatchPhase.RESULT,
          winner,
          winMargin
        }));
      }
    }
  }, [match]);

  return (
    <div className="h-[100dvh] w-full max-w-lg mx-auto bg-black shadow-2xl overflow-hidden relative border-x border-[#2f3336]">
      {match.phase === MatchPhase.SETUP && (
        <SetupScreen onStartMatch={handleStartMatch} />
      )}

      {match.phase === MatchPhase.INNINGS_1 && (
        <ScoringScreen 
          inningsState={match.innings1}
          phase={MatchPhase.INNINGS_1}
          totalOvers={match.totalOvers}
          target={null}
          onBall={handleBall}
          onUndo={handleUndo}
        />
      )}

      {match.phase === MatchPhase.BREAK && (
        <BreakScreen 
          innings1={match.innings1}
          totalOvers={match.totalOvers}
          onStartSecondInnings={startSecondInnings}
        />
      )}

      {match.phase === MatchPhase.INNINGS_2 && (
        <ScoringScreen 
          inningsState={match.innings2}
          phase={MatchPhase.INNINGS_2}
          totalOvers={match.totalOvers}
          target={match.target}
          onBall={handleBall}
          onUndo={handleUndo}
        />
      )}

      {match.phase === MatchPhase.RESULT && (
        <ResultScreen 
          state={match}
          onReset={resetMatch}
        />
      )}
    </div>
  );
};

export default App;