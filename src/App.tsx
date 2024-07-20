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

function App() {
  return (
    <HologyScene gameClass={Game} sceneName='demo' dataDir='data' shaders={shaders} actors={actors}>
      <ResourceDisplay/>
    </HologyScene>
  );
}

export default App;