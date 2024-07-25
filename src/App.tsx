import 'reflect-metadata'
import './App.css';
import { HologyRuntimeContext, HologyScene, useService } from '@hology/react'
import shaders from './shaders'
import actors from './actors'
import Game from './services/game'
import { HologyRuntimeStatus, World } from '@hology/core/gameplay';
import Character from './actors/character';
import { useContext } from 'react';


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
        <Loading></Loading>
        <ResourceDisplay/>
        <GameOverOverlay/>
        <WonOverlay/>
      </HologyScene>
    </div>

  );
}

export default App;