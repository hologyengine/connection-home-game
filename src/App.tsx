import 'reflect-metadata'
import './App.css';
import { HologyScene, useService } from '@hology/react'
import shaders from './shaders'
import actors from './actors'
import Game from './services/game'
import { useCallback, useEffect, useRef, useState } from 'react';
import { effect } from '@preact/signals-react';
import { ViewController } from '@hology/core/gameplay';


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

function GameOverOverlay({onRestart} : {onRestart?: () => void}) {
  const game = useService(Game)
  const drowned = game.drowned.value
  const hasHandledDeath = useRef(false)
  const view = useService(ViewController)

  useEffect(() => {
    if (drowned) {
      if (!hasHandledDeath.current) {
        if (__POKI__) {
          PokiSDK.gameplayStop()
        }
        hasHandledDeath.current = true
      }
    }
  }, [drowned])

  const onClickRestart = useCallback(() => {
    if (onRestart) {
      onRestart()
    }
    // Make sure nothing interferes with the ad playing
    view.setMuted(true)
    view.paused = true
  }, [onRestart, view])

  if (!drowned) {
    return false
  }

  return <>
    <div className='end-overlay'>
      <h1>Game over</h1>
      <button onClick={onClickRestart}>Try again</button>
    </div>
  </>
}

function App() {
  const [sceneKey, setSceneKey] = useState(0);


  // create callback for restarting the scene by changing the key
  const handleRestart = async () => {
    if (__POKI__) {
      await PokiSDK.commercialBreak(() => {
        // If there is any audio playing we should pause it
        // but in this case we are on the game over page which
        // doesn't have audio.
      })
    }
    setSceneKey(prev => prev + 1);
  };


  return (
    <div>
      <p>Loading...</p>
      <HologyScene
        key={sceneKey}
        gameClass={Game}
        sceneName="demo"
        dataDir="data"
        shaders={shaders}
        actors={actors}
      >
        <ResourceDisplay />
        <GameOverOverlay onRestart={handleRestart}></GameOverOverlay>
        <WonOverlay />
        <HighScores></HighScores>
      </HologyScene>
    </div>
  )
}

export default App;

function numberToTime(num: number|null) {
  if (num == null) {
    return '–'
  }
  return num.toFixed(2) + ' seconds'
}