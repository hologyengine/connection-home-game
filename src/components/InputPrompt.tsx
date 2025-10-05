import styles from './InputPrompt.module.css'

export default function InputPrompt() {
  const lang = typeof navigator !== 'undefined' ? navigator.language?.toLowerCase() : ''
  const isChinese = lang?.startsWith('zh')
  const isKorean = lang?.startsWith('ko')
  const isJapanese = lang?.startsWith('ja')
  const isCjk = isChinese || isKorean || isJapanese

  const labelMove = isChinese ? '移动' : isKorean ? '이동' : isJapanese ? '移動' : 'Move'
  const labelBuild = isChinese ? '建造' : isKorean ? '건설' : isJapanese ? '建築' : 'Build'
  const labelJump = isChinese ? '跳跃' : isKorean ? '점프' : isJapanese ? 'ジャンプ' : 'Jump'
  const labelSprint = isChinese ? '冲刺' : isKorean ? '전력 질주' : isJapanese ? 'ダッシュ' : 'Sprint'
  const labelLook = isChinese ? '视角' : isKorean ? '시점' : isJapanese ? '視点' : 'Look'

  return <div className={styles.container}>
    <div className={styles.item}>
      <h5 className={`${styles.label} ${isCjk ? styles.labelCjk : ''}`}>{labelLook}</h5>
      <img className={styles.icon} src={new URL('../assets/input/keyboard/mouse_move.svg', import.meta.url).toString()} alt="Mouse Move" />
    </div>
    <div className={styles.item}>
      <h5 className={`${styles.label} ${isCjk ? styles.labelCjk : ''}`}>{labelMove}</h5>
      <img className={styles.icon} src={new URL('../assets/input/keyboard/keyboard_arrows.svg', import.meta.url).toString()} alt="Arrows" />
    </div>
    <div className={styles.item}>
      <h5 className={`${styles.label} ${isCjk ? styles.labelCjk : ''}`}>{labelBuild}</h5>
      <img className={styles.icon} src={new URL('../assets/input/keyboard/keyboard_q.svg', import.meta.url).toString()} alt="Q" />
    </div>
    <div className={styles.item}>
      <h5 className={`${styles.label} ${isCjk ? styles.labelCjk : ''}`}>{labelJump}</h5>
      <img className={styles.icon} src={new URL('../assets/input/keyboard/keyboard_space.svg', import.meta.url).toString()} alt="Space" />
    </div>
    <div className={styles.item}>
      <h5 className={`${styles.label} ${isCjk ? styles.labelCjk : ''}`}>{labelSprint}</h5>
      <img className={styles.icon} src={new URL('../assets/input/keyboard/keyboard_shift.svg', import.meta.url).toString()} alt="Shift" />
    </div>

  </div>
}