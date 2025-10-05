import 'reflect-metadata'
import './App.css';
import { HologyScene, useService } from '@hology/react'
import shaders from './shaders'
import actors from './actors'
import Game from './services/game'
import { useCallback, useEffect, useRef, useState } from 'react';
import { effect } from '@preact/signals-react';
import { ViewController } from '@hology/core/gameplay';
import InputPrompt from './components/InputPrompt';


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
    <h4 style={{marginBottom:'0px', textShadow:'0 1px 2px rgba(0,0,0,0.8)'}}>Best</h4>
    <p style={{marginTop:'0px', textShadow:'0 1px 2px rgba(0,0,0,0.8)'}}>{numberToTime(bestTime)}</p>
    <h4 style={{marginBottom:'0px', textShadow:'0 1px 2px rgba(0,0,0,0.8)'}}>Current</h4>
    <p style={{marginTop:'0px', textShadow:'0 1px 2px rgba(0,0,0,0.8)'}}>{numberToTime(currentTime ?? null)}</p>
  </div>
}

function StartHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 15000)
    const dismiss = () => setVisible(false)
    window.addEventListener('keydown', dismiss, { once: true })
    window.addEventListener('mousedown', dismiss, { once: true })
    window.addEventListener('touchstart', dismiss, { once: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', dismiss)
      window.removeEventListener('mousedown', dismiss)
      window.removeEventListener('touchstart', dismiss)
    }
  }, [])

  if (!visible) return false

  const lang = typeof navigator !== 'undefined' ? navigator.language?.toLowerCase() : ''
  const isZh = lang?.startsWith('zh')
  const isKo = lang?.startsWith('ko')
  const isJa = lang?.startsWith('ja')

  const title = isZh
    ? '前往大岛！'
    : isKo
    ? '큰 섬으로 가자!'
    : isJa
    ? '大きな島へ出発！'
    : 'Reach the Big Island!'

  const line1 = isZh
    ? '在小岛上收集🪵木材。'
    : isKo
    ? '작은 섬에서 🪵 나무를 모으세요.'
    : isJa
    ? '小さな島で🪵木材を集めよう。'
    : 'Collect 🪵 wood from the small islands.'

  const line2 = isZh
    ? '在水面上建造道路，朝大岛前进。'
    : isKo
    ? '물 위에 길을 만들어 큰 섬으로 건너가세요.'
    : isJa
    ? '水上に足場を作って島へ進もう。'
    : 'Build across the water to reach the big island.'

  const startHint = isZh
    ? '按任意键开始'
    : isKo
    ? '아무 키나 눌러 시작'
    : isJa
    ? '何かキーを押して開始'
    : 'Press any key to start'

  return <div style={{
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6
  }}>
    <div style={{
      background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.4) 100%)',
      padding: '14px 18px',
      borderRadius: '14px',
      border: '1px solid rgba(255,255,255,0.15)',
      maxWidth: '86%',
      color: '#fff',
      textAlign: 'center',
      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
      boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
      backdropFilter: 'blur(4px)',
      fontSize: '14px',
      lineHeight: 1.35
    }}>
      <div style={{fontWeight: 700, fontSize: '16px', marginBottom: '6px'}}>{title} 🏝️</div>
      <div style={{opacity: 0.95}}>{line1}</div>
      <div style={{opacity: 0.95}}>{line2}</div>
      <div style={{marginTop: '8px', fontSize: '12px', opacity: 0.9}}>{startHint} ▶</div>
    </div>
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
        <StartHint />
        <GameOverOverlay onRestart={handleRestart}></GameOverOverlay>
        <WonOverlay />
        <HighScores></HighScores>
        <InputPrompt />
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