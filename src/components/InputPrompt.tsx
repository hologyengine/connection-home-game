import styles from './InputPrompt.module.css'

export default function InputPrompt() {
  const isChinese = true //typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('zh')
  const labelMove = isChinese ? '移动' : 'Move'
  const labelBuild = isChinese ? '建造' : 'Build'
  const labelJump = isChinese ? '跳跃' : 'Jump'
  const labelSprint = isChinese ? '冲刺' : 'Sprint'

  return <div className={styles.container}>
    <div className={styles.item}>
      <h5 className={`${styles.label} ${isChinese ? styles.labelCn : ''}`}>{labelMove}</h5>
      <img className={styles.icon} src={new URL('../assets/input/keyboard/keyboard_arrows.svg', import.meta.url).toString()} alt="Arrows" />
    </div>
    <div className={styles.item}>
      <h5 className={`${styles.label} ${isChinese ? styles.labelCn : ''}`}>{labelBuild}</h5>
      <img className={styles.icon} src={new URL('../assets/input/keyboard/keyboard_q.svg', import.meta.url).toString()} alt="Q" />
    </div>
    <div className={styles.item}>
      <h5 className={`${styles.label} ${isChinese ? styles.labelCn : ''}`}>{labelJump}</h5>
      <img className={styles.icon} src={new URL('../assets/input/keyboard/keyboard_space.svg', import.meta.url).toString()} alt="Space" />
    </div>
    <div className={styles.item}>
      <h5 className={`${styles.label} ${isChinese ? styles.labelCn : ''}`}>{labelSprint}</h5>
      <img className={styles.icon} src={new URL('../assets/input/keyboard/keyboard_shift.svg', import.meta.url).toString()} alt="Shift" />
    </div>
  </div>
}