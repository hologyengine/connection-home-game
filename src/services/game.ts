
import { Actor, BaseActor, GameInstance, PhysicsSystem, Service, ViewController, World, attach, inject } from '@hology/core/gameplay';
import { SpawnPoint, TriggerVolume, TriggerVolumeComponent } from '@hology/core/gameplay/actors';
import Character from '../actors/character';
import PlayerController from './player-controller.js';
import { signal } from '@preact/signals-react';
import { FloorActor } from './build.js';
import { Vector3 } from 'three';
import TutorialManager from '../actors/tutorial-manager.js';

let pokiFinishedLoadingEvent = false


@Service()
class Game extends GameInstance {
  private world = inject(World)
  private playerController = inject(PlayerController)
  readonly player = signal<Character>()
  readonly won = signal(false)
  readonly drowned = signal(false)
  private physics = inject(PhysicsSystem)
  private viewController = inject(ViewController)

  public readonly bestTime = signal<number|null>(null)
  public readonly currentTime = signal<number|null>(null)

  async onStart() {
    if (__POKI__) {
      if (!pokiFinishedLoadingEvent) {
        PokiSDK.gameLoadingFinished()
        pokiFinishedLoadingEvent = true
      }
    }

    const spawnPoint = this.world.findActorByType(SpawnPoint)
    const character = await spawnPoint.spawnActor(Character)
    this.playerController.setup(character)
    this.player.value = character
    let finished = false

    this.world.findActorByType(TutorialManager)?.start(character)

    this.viewController.onLateUpdate().subscribe(deltaTime => {
      // Delta time could be used to move softly

      const distanceFromSpawn = spawnPoint.position.distanceTo(character.position)
      if (distanceFromSpawn > 2 && this.currentTime.value == null) {
        this.currentTime.value = 0
      } else if (this.currentTime.value != null && !finished) {
        this.currentTime.value += deltaTime
      }
    })

    const storedBestTime = localStorage.getItem('besttime')
    if (storedBestTime != null && !isNaN(parseFloat(storedBestTime))) {
      this.bestTime.value = parseFloat(storedBestTime)
    }


    const goal = this.world.findActorsByType(TriggerVolume).find(o => o.object.name === 'Goal Volume')
    if (goal == null) {
      console.error("No trigger volume found with name Goal Volume")
      return
    }

    goal.trigger.onBeginOverlapWithActor(character).subscribe(() => {
      this.won.value = true
      character.thirdPersonCamera.showCursor()
      this.playerController.stop()

      if (this.currentTime.value != null) {
        if (this.bestTime.value == null || this.currentTime.value < this.bestTime.value) {
          const bestTime = this.bestTime.value = this.currentTime.value
          localStorage.setItem('besttime', bestTime.toString())
        }
      }
      finished = true
    })


    const water = await this.world.spawnActor(WaterVolume, new Vector3(0, -2.8 -2.5, 0))

    if (water == null) {
      console.error("No trigger volume found with name Water Volume")
      return
    }

    water.trigger.onBeginOverlapWithActor(character).subscribe(() => {
      console.log("Hit water")
      character.swimming.value = true
      character.movement.gravityOverride = 0
      character.movement.velocity.set(0,0,0)
      character.movement.fallingMovementControl = 1
      // Whould still be able to jump though
      // Maybe have a separate launch instead of regular jump

      // this.drowned.value = true
      // character.thirdPersonCamera.showCursor()
      // this.playerController.stop()
    })
    water.trigger.onEndOverlapWithActor(character).subscribe(() => {
      character.swimming.value = false
      console.log("Hit water")
      character.movement.gravityOverride = null as unknown as number
      character.movement.fallingMovementControl = 0.1
      // Whould still be able to jump though
      // Maybe have a separate launch instead of regular jump

      // this.drowned.value = true
      // character.thirdPersonCamera.showCursor()
      // this.playerController.stop()
    })
  }

  restart() {
    window.location.reload()
    this.won.value = false
    this.drowned.value = false
    const spawnPoint = this.world.findActorByType(SpawnPoint)
    const character = this.player.value!
    character.wood.value = 0
    character.position.copy(spawnPoint.position)
    this.physics.updateActorTransform(character)
    character.thirdPersonCamera.hideCursor()

    this.world.findActorsByType(FloorActor).forEach(a => {
      this.world.removeActor(a)
      this.physics.removeActor(a)
    })
    this.playerController.resume()
    
  }
}


export default Game


@Actor()
class WaterVolume extends BaseActor {

  trigger = attach(TriggerVolumeComponent, {dimensions: new Vector3(500, 10, 500)})


}