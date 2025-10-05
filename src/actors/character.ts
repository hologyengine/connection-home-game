
import { Actor, AnimationState, AnimationStateMachine, AssetLoader, BaseActor, attach, inject } from "@hology/core/gameplay";
import { CharacterAnimationComponent, CharacterMovementComponent, CharacterMovementMode, ThirdPersonCameraComponent } from "@hology/core/gameplay/actors";
import { signal } from "@preact/signals-react";
import { MathUtils, Vector3 } from "three";

@Actor()
class Character extends BaseActor {
  public wood = signal(0);
  public maxWood = 30

  public swimming = signal(false)

  private animation = attach(CharacterAnimationComponent)
  public readonly movement = attach(CharacterMovementComponent, {
    maxSpeed: 2.7,
    maxSpeedSprint: 4,
    maxSpeedBackwards: 2.3,
    snapToGround: 0.1,
    autoStepMinWidth: 0.1,
    autoStepMaxHeight: 0.3,
    maxSlopeClimbAngle: MathUtils.degToRad(60),
    minSlopeSlideAngle: MathUtils.degToRad(60),
    fallingReorientation: true,
    // fallingMovementControl: 1,
    colliderHeight: .4,
    colliderRadius: 0.2,
    jumpVelocity: 3.5,
    offset: .15,
    // gravityOverride: 0
    

  })
  public readonly thirdPersonCamera = attach(ThirdPersonCameraComponent, {
    height: .7,
    offsetX: 0,
    offsetZ: 0.2,
    minDistance: 3,
    maxDistance: 3,
    distance: 3,
    collision: false,
  })

  private assetLoader = inject(AssetLoader)

  async onInit(): Promise<void> {
    const { scene, animations } = await this.assetLoader.getModelByAssetName('character-human')

    scene.traverse(o => o.castShadow = true)
    this.object.add(scene)

    const clips = Object.fromEntries(animations.map(clip => [clip.name, clip]))
  
    const idle = new AnimationState(clips.idle)
    const walk = new AnimationState(clips.walk)
    const sit = new AnimationState(clips.sit)
    const jump = new AnimationState(clips.jump)
    const sprint = new AnimationState(clips.sprint)

    idle.transitionsBetween(walk, () => this.movement.horizontalSpeed > 0)
    walk.transitionsBetween(sprint, () => this.movement.isSprinting)
    idle.transitionsTo(sit, elapsedTime => elapsedTime > 5)
    sit.transitionsTo(walk, () => this.movement.horizontalSpeed > 0)
    sprint.transitionsTo(idle, () => this.movement.horizontalSpeed === 0)
  
    for (const state of [idle, walk, sit, sprint]) {
      state.transitionsBetween(jump, () => this.movement.mode === CharacterMovementMode.falling)
    }

    const sm = new AnimationStateMachine(idle)

    this.animation.setup(scene)
    this.animation.playStateMachine(sm)

    this.movement.jumpInput.onStart(() => {
      if (this.swimming.value) {
        const inputDir = this.movement.directionInput.vector
        const jump = new Vector3(0, this.movement.isGrounded ? .1 : 6, 0)
          .add(new Vector3(-inputDir.x, 0, inputDir.y).applyQuaternion(this.object.quaternion).multiplyScalar(2))
        this.movement.applyImpulse(jump)
      }
    })

  }
}

export default Character
