import 'reflect-metadata'
import './App.css';
import { HologyScene, useActorQuery, useService } from '@hology/react'
import shaders from './shaders'
import actors from './actors'
import Game from './services/game'
import { useCallback, useEffect, useRef, useState } from 'react';
import { effect } from '@preact/signals-react';
import { ViewController } from '@hology/core/gameplay';
import InputPrompt from './components/InputPrompt';
import { activatePointerLock } from './utils/pointer-lock';
import TutorialManager, { TutorialStepType } from './actors/tutorial-manager';
import { BuildService } from './services/build';


type Lang = 'en' | 'zh' | 'ko' | 'ja'

const DICT = {
  en: {
    best: 'Best',
    current: 'Current',
    seconds: 'seconds',
    loading: 'Loading...',
    youMadeIt: 'You made it!',
    playAgain: 'Play again',
    gameOver: 'Game over',
    tryAgain: 'Try again',
    buildHintTitle: 'Build a Path',
    buildHintBody: 'Press Q to build on the water in front of you.',
  },
  zh: {
    best: '最佳',
    current: '当前',
    seconds: '秒',
    loading: '加载中...',
    youMadeIt: '你成功了！',
    playAgain: '再玩一次',
    gameOver: '游戏结束',
    tryAgain: '再试一次',
    buildHintTitle: '建造道路',
    buildHintBody: '按 Q 在你前方的水面上建造。',
  },
  ko: {
    best: '최고 기록',
    current: '현재',
    seconds: '초',
    loading: '로딩 중...',
    youMadeIt: '해냈어요!',
    playAgain: '다시 플레이',
    gameOver: '게임 오버',
    tryAgain: '다시 시도',
    buildHintTitle: '길을 건설',
    buildHintBody: 'Q 키를 눌러 앞의 물 위에 건설하세요.',
  },
  ja: {
    best: 'ベスト',
    current: '現在',
    seconds: '秒',
    loading: '読み込み中...',
    youMadeIt: 'やったね！',
    playAgain: 'もう一度遊ぶ',
    gameOver: 'ゲームオーバー',
    tryAgain: 'もう一度',
    buildHintTitle: '道を作ろう',
    buildHintBody: 'Q を押して前方の水上に建設しよう。',
  },
} as const

function getLang(): Lang {
  const lang = typeof navigator !== 'undefined' ? navigator.language?.toLowerCase() : ''
  if (lang?.startsWith('zh')) return 'zh'
  if (lang?.startsWith('ko')) return 'ko'
  if (lang?.startsWith('ja')) return 'ja'
  return 'en'
}

function t<K extends keyof typeof DICT.en>(key: K): (typeof DICT)[Lang][K] {
  const lang = getLang()
  const value = DICT[lang][key] ?? DICT.en[key]
  return value
}


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
    <h4 style={{marginBottom:'0px', textShadow:'0 1px 2px rgba(0,0,0,0.8)'}}>{t('best')}</h4>
    <p style={{marginTop:'0px', textShadow:'0 1px 2px rgba(0,0,0,0.8)'}}>{numberToTime(bestTime, t('seconds'))}</p>
    <h4 style={{marginBottom:'0px', textShadow:'0 1px 2px rgba(0,0,0,0.8)'}}>{t('current')}</h4>
    <p style={{marginTop:'0px', textShadow:'0 1px 2px rgba(0,0,0,0.8)'}}>{numberToTime(currentTime ?? null, t('seconds'))}</p>
  </div>
}

function StartHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 15000)
    const dismiss = () => {
      setVisible(false)
      activatePointerLock()
    }
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

function BuildPopup() {
  const build = useService(BuildService)
  const visible = build.canBuild.value

  if (!visible) return false

  return <div style={{
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(120px, -50%)',
    zIndex: 5,
    pointerEvents: 'none'
  }}>
    <img className="key-hint" src={new URL('./assets/input/keyboard/keyboard_q.svg', import.meta.url).toString()} alt="Q" />
  </div>
}

function BuildHint() {
  const [visible, setVisible] = useState(false)
  const [tutorialManager] = useActorQuery({type: TutorialManager})
  const view = useService(ViewController)
  useEffect(() => {
    if (tutorialManager == null) return
    const subscription = tutorialManager.onStepStart.subscribe((stepType) => {
      if (stepType === TutorialStepType.Build) {
        setVisible(true)
        // Setting it immediately will cause it to pause between frames
        // and it is all black for some reason
        setTimeout(() => {
          view.paused = true
        }, 1)
      }
    })
    return () => subscription.unsubscribe()
  }, [tutorialManager, view])
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'q' || e.key === 'Q') {
        setVisible(false)
        view.paused = false
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [view])

  if (!visible) return false

  const title = t('buildHintTitle')
  const body = t('buildHintBody')

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
      <div style={{fontWeight: 700, fontSize: '16px', marginBottom: '6px'}}>{title} 🧱</div>
      <div style={{opacity: 0.95}}>{body}</div>
      <div style={{marginTop: '10px'}}>
        <img className="key-hint" src={new URL('./assets/input/keyboard/keyboard_q.svg', import.meta.url).toString()} alt="Q" />
      </div>
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
    <h1>{t('youMadeIt')}</h1>
    <button onClick={() => game.restart()}>{t('playAgain')}</button>
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
      <h1>{t('gameOver')}</h1>
      <button onClick={onClickRestart}>{t('tryAgain')}</button>
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
      <p>{t('loading')}</p>
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
        <BuildPopup />
        <BuildHint />
        <GameOverOverlay onRestart={handleRestart}></GameOverOverlay>
        <WonOverlay />
        <HighScores></HighScores>
        <InputPrompt />
      </HologyScene>
    </div>
  )
}

export default App;

function numberToTime(num: number|null, secondsLabel: string = 'seconds') {
  if (num == null) {
    return '–'
  }
  return num.toFixed(2) + ' ' + secondsLabel
}