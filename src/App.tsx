import 'reflect-metadata'
import './App.css';
import { HologyScene, useService } from '@hology/react'
import shaders from './shaders'
import actors from './actors'
import Game from './services/game'
import { useEffect, useState } from 'react';
import { effect } from '@preact/signals-react';


function HighScores() {
  const game = useService(Game)
  const [bestTime, setBestTime] = useState<number|null>(0)
  const [currentTime, setCurrentTime] = useState<number|null>()

  useEffect(() => {
    effect(() => {
      setBestTime(game.bestTime.value)
      setCurrentTime(game.currentTime.value)
    })
  }, [game])
  
  return <div style={{position: 'absolute', zIndex: 5, right: '40px', top: '0px'}}>
    <h4 style={{marginBottom:'0px'}}>Best</h4>
    <p style={{marginTop:'0px'}}>{numberToTime(bestTime)}</p>
    <h4 style={{marginBottom:'0px'}}>Current</h4>
    <p style={{marginTop:'0px'}}>{numberToTime(currentTime ?? null)}</p>
  </div>
}

function ResourceDisplay() {
  const game = useService(Game)
  const player = game.player.value

  return <div className='resource-item'>
    <div className='resource-amount'>{player?.wood} / {player?.maxWood}</div>
    <div className="resource">
      <img src="./wood.png" alt="" width={'10'} />
    </div>
  </div>
}

function WonOverlay() {
  const game = useService(Game)
  const won = game.won.value
  if (!won) {
    return false
  }

  return <>
    <h1>You made it!</h1>
    <button onClick={() => game.restart()}>Play again</button>
  </>
}

function GameOverOverlay() {

  const game = useService(Game)
  const drowned = game.drowned.value
  if (!drowned) {
    return false
  }

  // Clicking restart should remove all wood, respawn all resources or maybe just refresh page

  

  return <>
  <div className='end-overlay'>
  <h1>Game over</h1>
  <button onClick={() => game.restart()}>Try again</button>
  </div>
   
  </>
}

function App() {
  return (
    <div>
      <p>Loading...</p>
      <HologyScene gameClass={Game} sceneName='demo' dataDir='data' shaders={shaders} actors={actors}>
        <ResourceDisplay/>
        <GameOverOverlay/>
        <WonOverlay/>
        <HighScores></HighScores>
      </HologyScene>
    </div>

  );
}

export default App;

function numberToTime(num: number|null) {
  if (num == null) {
    return '–'
  }
  return num.toFixed(2) + ' seconds'
}