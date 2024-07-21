
import { Actor, BaseActor, GameInstance, Inject, PhysicsSystem, Service, World, attach, inject } from '@hology/core/gameplay';
import { SpawnPoint, TriggerVolume, TriggerVolumeComponent } from '@hology/core/gameplay/actors';
import Character from '../actors/character';
import PlayerController from './player-controller.js';
import { signal } from '@preact/signals-react';
import { FloorActor } from './build.js';
import { Vector3 } from 'three';

@Service()
class Game extends GameInstance {
  private world = inject(World)
  private playerController = inject(PlayerController)
  readonly player = signal<Character>()
  readonly won = signal(false)
  readonly drowned = signal(false)
  private physics = inject(PhysicsSystem)

  async onStart() {
    const spawnPoint = this.world.findActorByType(SpawnPoint)
    const character = await spawnPoint.spawnActor(Character)
    this.playerController.setup(character)
    this.player.value = character

    const goal = this.world.findActorsByType(TriggerVolume).find(o => o.object.name === 'Goal Volume')
    if (goal == null) {
      console.error("No trigger volume found with name Goal Volume")
      return
    }

    goal.trigger.onBeginOverlapWithActor(character).subscribe(() => {
      this.won.value = true
    })


    const water = await this.world.spawnActor(WaterVolume, new Vector3(0, -4, 0))

    if (water == null) {
      console.error("No trigger volume found with name Water Volume")
      return
    }

    water.trigger.onBeginOverlapWithActor(character).subscribe(() => {
      console.log("Hit water")
      this.drowned.value = true
      character.thirdPartyCamera.showCursor()
    })
  }

  restart() {
    this.drowned.value = false
    const spawnPoint = this.world.findActorByType(SpawnPoint)
    const character = this.player.value!
    character.wood.value = 0
    character.position.copy(spawnPoint.position)
    this.physics.updateActorTransform(character)
    character.thirdPartyCamera.hideCursor()

    this.world.findActorsByType(FloorActor).forEach(a => {
      this.world.removeActor(a)
      this.physics.removeActor(a)
    })
    
  }
}


export default Game


@Actor()
class WaterVolume extends BaseActor {

  trigger = attach(TriggerVolumeComponent, {dimensions: new Vector3(500, 5, 500)})


}