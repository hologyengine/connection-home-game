
import { Actor, BaseActor, inject, Parameter, World } from "@hology/core/gameplay";
import { filter, first, Subject, takeUntil } from "rxjs";
import Character from "./character";
import TutorialStep from "./tutorial-step";

export enum TutorialStepType {
  Collect,
  Build
}

@Actor()
class TutorialManager extends BaseActor {
  @Parameter() collectStep?: TutorialStep
  @Parameter() buildStep?: TutorialStep
  @Parameter() firstIsland?: TutorialStep
  @Parameter() lastIsland?: TutorialStep

  public readonly onStepStart = new Subject<TutorialStepType>()

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
          if (step === this.buildStep) {
            this.onStepStart.next(TutorialStepType.Build)
          } else if (step === this.collectStep) {
            this.onStepStart.next(TutorialStepType.Collect)
          }
          this.world.removeActor(step)
        })
    })
    this.showNextStep()
  } 

  get steps() {
    const steps: TutorialStep[] = []
    if (this.collectStep) steps.push(this.collectStep)
    if (this.buildStep) steps.push(this.buildStep)
    if (this.firstIsland) steps.push(this.firstIsland)
    if (this.lastIsland) steps.push(this.lastIsland)
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
