import 'reflect-metadata'
import './App.css';
import { HologyScene, useService } from '@hology/react'
import shaders from './shaders'
import actors from './actors'
import Game from './services/game'
import { World } from '@hology/core/gameplay';
import Character from './actors/character';


function ResourceDisplay() {
  const game = useService(Game)
  const player = game.player.value

  return <>
    <h1>{player?.wood}</h1>
  </>
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
    <h1>Game over</h1>
    <button onClick={() => game.restart()}>Try again</button>
  </>
}

function App() {
  return (
    <HologyScene gameClass={Game} sceneName='demo' dataDir='data' shaders={shaders} actors={actors}>
      <ResourceDisplay/>
      <GameOverOverlay/>
      <WonOverlay/>
    </HologyScene>
  );
}

export default App;