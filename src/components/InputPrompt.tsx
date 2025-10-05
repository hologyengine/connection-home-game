import styles from './InputPrompt.module.css'

export default function InputPrompt() {
  return <div className={styles.container}>
    <div className={styles.item}>
      <h5 className={styles.label}>Move</h5>
      <img className={styles.icon} src={new URL('../assets/input/keyboard/keyboard_arrows.svg', import.meta.url).toString()} alt="Arrows" />
    </div>
    <div className={styles.item}>
      <h5 className={styles.label}>Build</h5>
      <img className={styles.icon} src={new URL('../assets/input/keyboard/keyboard_q.svg', import.meta.url).toString()} alt="Q" />
    </div>
    <div className={styles.item}>
      <h5 className={styles.label}>Jump</h5>
      <img className={styles.icon} src={new URL('../assets/input/keyboard/keyboard_space.svg', import.meta.url).toString()} alt="Space" />
    </div>
    <div className={styles.item}>
      <h5 className={styles.label}>Sprint</h5>
      <img className={styles.icon} src={new URL('../assets/input/keyboard/keyboard_shift.svg', import.meta.url).toString()} alt="Shift" />
    </div>
  </div>
}