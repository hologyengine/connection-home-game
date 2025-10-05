
import { Actor, BaseActor, inject, Parameter, World } from "@hology/core/gameplay";
import { filter, first, takeUntil } from "rxjs";
import Character from "./character";
import TutorialStep from "./tutorial-step";

@Actor()
class TutorialManager extends BaseActor {
  @Parameter() collectStep?: TutorialStep
  @Parameter() buildStep?: TutorialStep

  private world = inject(World)
  private currentStepIdx = -1

  onInit(): void | Promise<void> {
  }

  start(character: Character) {
    this.steps.forEach((step, i) => {
      step.object.visible = false
      step.volume.onBeginOverlapWithActor(character)
        .pipe(takeUntil(this.disposed), filter(() => i === this.currentStepIdx),  first())
        .subscribe(() => {
          step.onEnter()
          step.object.visible = false
          this.showNextStep()
          this.world.removeActor(step)
        })
    })
    this.showNextStep()
  } 

  get steps() {
    const steps: TutorialStep[] = []
    if (this.collectStep) steps.push(this.collectStep)
    if (this.buildStep) steps.push(this.buildStep)
    return steps
  }

  onBeginPlay() {
  }

  showNextStep() {
    this.currentStepIdx++
    const nextIdx = this.currentStepIdx
    if (nextIdx >= 0 && nextIdx < this.steps.length) {
      this.steps[nextIdx].object.visible = true
    }
  }

  onEndPlay() {

  }

}

export default TutorialManager
