
import { Actor, AssetLoader, attach, BaseActor, inject } from "@hology/core/gameplay";
import { TriggerVolumeComponent } from "@hology/core/gameplay/actors";
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Vector3 } from "three";

@Actor()
class TutorialStep extends BaseActor {

  private assetLoader = inject(AssetLoader)

  public readonly volume = attach(TriggerVolumeComponent, {
    dimensions: new Vector3(1,1,1)
  })

  private mesh?: Object3D

  async onInit() {
    const {scene} = await this.assetLoader.getModelByAssetName('tutorial_arrow')
    scene.scale.set(0.5, 0.5, 0.5)

    this.object.add(scene)
    this.mesh = scene
  }

  onUpdate(): void {
    if (this.mesh) {
      this.mesh.position.y = 0.5 + 0.1 * Math.sin(Date.now() * 0.005) - 1
      this.mesh.rotation.y += 0.01
    }
  }

  onEnter() {

  }

  onBeginPlay() {

  }

  onEndPlay() {

  }

}

export default TutorialStep
