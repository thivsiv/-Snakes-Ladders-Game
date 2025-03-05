import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Modal from 'react-modal';
import useSound from 'use-sound';
import diceSound from './sounds/dice.mp3';
import winSound from './sounds/win.mp3';

const snakes = {16:6,47:26,49:11,56:53,62:19,64:60,87:24,93:73,95:75,98:78};
const ladders = {1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100};

Modal.setAppElement('#root');

function App() {
  const [players, setPlayers] = useState([
    { id: 1, position: 1, color: 'bg-blue-500', emoji: '🚀', isComputer: false },
    { id: 2, position: 1, color: 'bg-green-500', emoji: '🤖', isComputer: true }
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [dice, setDice] = useState({ human: 0, computer: 0 });
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showWinModal, setShowWinModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [playDiceSound] = useSound(diceSound);
  const [playWinSound] = useSound(winSound);
  const [enableSound, setEnableSound] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [playerName, setPlayerName] = useState('Player');
  const [computerName] = useState('Computer');
  const [showSettings, setShowSettings] = useState(false);
  const [tempName, setTempName] = useState('');

  // Timer control
  useEffect(() => {
    let timer;
    if (isGameActive && !showWinModal) {
      timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isGameActive, showWinModal]);

  // Win detection
  useEffect(() => {
    if (players.some(p => p.position === 100)) {
      setIsGameActive(false);
      setShowWinModal(true);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      if(enableSound) playWinSound();
    }
  }, [players]);

  const rollDice = async (isComputer = false) => {
    if (!isGameActive) setIsGameActive(true);
    if (isComputer || currentPlayer !== 0) return;
    
    setIsRolling(true);
    if(enableSound) playDiceSound();

    const diceRoll = Math.floor(Math.random() * 6) + 1;
    setDice(prev => ({ ...prev, human: diceRoll }));
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    movePlayer(0, diceRoll);
    setIsRolling(false);
    setCurrentPlayer(1);
  };

  const movePlayer = (playerIndex, diceRoll) => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      let newPosition = newPlayers[playerIndex].position + diceRoll;
      let message = '';

      while (newPosition in snakes || newPosition in ladders) {
        if (newPosition in snakes) {
          message = `🐍 Snake from ${newPosition} to ${snakes[newPosition]}`;
          newPosition = snakes[newPosition];
        } else {
          message = `🪜 Ladder from ${newPosition} to ${ladders[newPosition]}`;
          newPosition = ladders[newPosition];
        }
      }

      if(newPosition > 100) newPosition = newPlayers[playerIndex].position;

      newPlayers[playerIndex].position = newPosition;

      setHistory(prev => [...prev, {
        player: newPlayers[playerIndex].id,
        dice: diceRoll,
        from: newPlayers[playerIndex].position - diceRoll,
        to: newPosition,
        message,
        isComputer: newPlayers[playerIndex].isComputer
      }]);

      return newPlayers;
    });
  };

  // Computer move
  useEffect(() => {
    if (currentPlayer === 1 && !showWinModal) {
      const computerMove = async () => {
        setIsRolling(true);
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        setDice(prev => ({ ...prev, computer: diceRoll }));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        movePlayer(1, diceRoll);
        
        setIsRolling(false);
        setCurrentPlayer(0);
      };
      computerMove();
    }
  }, [currentPlayer]);

  const resetGame = () => {
    setPlayers(prev => prev.map(p => ({ ...p, position: 1 })));
    setDice({ human: 0, computer: 0 });
    setTimeElapsed(0);
    setShowWinModal(false);
    setHistory([]);
    setCurrentPlayer(0);
    setIsGameActive(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNameSave = () => {
    setPlayerName(tempName);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onRequestClose={() => setShowSettings(false)}
        className="animate-pop-in"
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center"
      >
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
          <h2 className="text-2xl font-bold mb-4">Game Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter your name"
              />
                 <label className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={enableSound}
                    onChange={(e) => setEnableSound(e.target.checked)}
                  />
                  Sound Effects
                </label>
            </div>
            <button
              onClick={handleNameSave}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      </Modal>

      {/* Main Interface */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-purple-600">
              🐍 <span className="text-blue-500">Snakes</span> & <span className="text-green-500">Ladders</span> 🪜
            </h1>
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 px-4 py-2 rounded-lg">
                ⏱️ <span className="font-semibold text-purple-700">{formatTime(timeElapsed)}</span>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 100 }, (_, i) => {
                const number = 100 - i;
                const isSnake = number in snakes;
                const isLadder = number in ladders;
                
                return (
                  <div 
                    key={number}
                    className={`aspect-square flex items-center justify-center text-sm
                      ${isSnake ? 'bg-red-50' : isLadder ? 'bg-green-50' : 'bg-gray-50'}
                      ${number === 100 ? 'bg-yellow-100 font-bold' : ''}
                      relative border border-gray-200 rounded transition-all duration-200 hover:scale-105`}
                  >
                    <span className="text-xs text-gray-500">{number}</span>
                    {players.map(player => (
                      player.position === number && (
                        <div
                          key={player.id}
                          className={`${player.color} w-6 h-6 rounded-full absolute 
                            shadow-md flex items-center justify-center text-white
                            animate-bounce`}
                          style={{
                            top: player.id === 1 ? '4px' : '4px',
                            left: player.id === 1 ? '4px' : 'auto',
                            right: player.id === 2 ? '4px' : 'auto'
                          }}
                        >
                          {player.emoji}
                        </div>
                      )
                    ))}
                    {isSnake && <div className="absolute bottom-0 right-0 text-red-500 text-xl">🐍</div>}
                    {isLadder && <div className="absolute top-0 left-0 text-green-500 text-xl">🪜</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <button
                onClick={() => rollDice()}
                disabled={isRolling || currentPlayer !== 0}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all
                  ${isRolling ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'}
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isRolling ? (
                  <>
                    <span className="animate-spin">🎲</span>
                    Rolling...
                  </>
                ) : (
                  <>
                    🎲 Roll Dice
                    <span className="text-sm opacity-75">(Last: {dice.human})</span>
                  </>
                )}
              </button>

              {/* Player Status */}
              <div className="space-y-3">
                {players.map(player => (
                  <div 
                    key={player.id}
                    className={`p-4 rounded-lg ${player.color.replace('bg', 'bg-opacity-20')}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${player.color} w-8 h-8 rounded-full flex items-center justify-center`}>
                        <span className="text-white">{player.emoji}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {player.isComputer ? computerName : playerName}
                          <span className="text-sm text-gray-500 ml-2">Position: {player.position}</span>
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-2xl shadow-lg p-6 h-96 overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Game History</h2>
              <div className="space-y-3">
                {[...history].reverse().map((entry, i) => (
                  <div 
                    key={i}
                    className={`p-3 rounded-lg ${entry.isComputer ? 'bg-blue-50' : 'bg-green-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {entry.isComputer ? '🤖 Computer' : `👤 ${playerName}`}
                      </span>
                      <span className="text-sm text-gray-500">rolled {entry.dice}</span>
                    </div>
                    <div className="mt-1 text-sm">
                      <span className="font-medium">{entry.from}</span> →{' '}
                      <span className="font-medium text-purple-600">{entry.to}</span>
                    </div>
                    {entry.message && (
                      <div className="mt-1 text-xs text-red-500">
                        {entry.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Win Modal */}
      <Modal
        isOpen={showWinModal}
        onRequestClose={() => setShowWinModal(false)}
        className="animate-pop-in"
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center"
      >
        <div className="bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-4xl font-bold mb-4">
            {players.find(p => p.position === 100)?.isComputer ? (
              <>🤖 {computerName} Wins!</>
            ) : (
              <>🎉 {playerName} Wins!</>
            )}
          </h2>
          <div className="space-y-4">
            <p className="text-xl">
              Time: {formatTime(timeElapsed)}
            </p>
            <button
              onClick={resetGame}
              className="w-full bg-white text-purple-600 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
            >
              Play Again
            </button>
            <button
              onClick={() => setShowWinModal(false)}
              className="text-white hover:text-gray-200 underline text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;