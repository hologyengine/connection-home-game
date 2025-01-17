
import { SphereCollisionShape } from '@hology/core';
import { Actor, AssetLoader, BaseActor, inject, PhysicsSystem } from '@hology/core/gameplay';
import { Vector3 } from 'three';
import Character from './character';

@Actor()
class ResourceActor extends BaseActor {
  private physics = inject(PhysicsSystem)
  private assetLoader = inject(AssetLoader)

  available = true

  async onInit(): Promise<void> { 
    const { scene } = await this.assetLoader.getModelByAssetName('resource-planks')
    scene.scale.multiplyScalar(1.2)

    this.object.add(scene)

    this.physics.addActor(this, [
      new SphereCollisionShape(.5)
        .withOffset(new Vector3(0, .15, 0))
    ], {
      isTrigger: true,
    })

    this.physics.onBeginOverlapWithActorType(this, Character).subscribe(character => {
      if (!this.available) {
        return
      }
      if (character.wood.value >= character.maxWood) {
        return
      }

      character.wood.value = Math.min(character.wood.value + 6, character.maxWood) 

      
      setTimeout(() => {
        this.available = true
        this.object.visible = true
      }, 10_000)

      //this.world.removeActor(this)
      this.available = false
      this.object.visible = false
      console.log(`Character now has ${character.wood} wood`)
    })

  }

}

export default ResourceActor