import { BoxCollisionShape } from "@hology/core";
import { Actor, AssetLoader, BaseActor, PhysicsBodyType, PhysicsSystem, RayTestResult, Service, World, inject } from "@hology/core/gameplay";
import { Material, Mesh, MeshLambertMaterial, Object3D, Vector3 } from "three";
import Character from "../actors/character";


const damagedMaterial = new MeshLambertMaterial({color: '#301f0e'})
let model: Object3D; 

@Actor()
class FloorActor extends BaseActor {

  private assetLoader = inject(AssetLoader)
  private physics = inject(PhysicsSystem)
  private world = inject(World)



  // Number of seconds to survive
  // Some randomness
  private health = 10 + 50 * Math.random()
  private isDisposed = false

  async onInit(): Promise<void> {
    this.disposed.subscribe(() => this.isDisposed = true)
    this.physics.addActor(this, [
      new BoxCollisionShape(new Vector3(1, 1, 1))
        .withOffset(new Vector3(0, .05 - 0.45, 0))
    ], {
      type: PhysicsBodyType.static,
      friction: 0.001,
      restitution: 1
    })

    // This await here caused me issues because it will add lag before adding the collision
    // shape

    if (model == null) {
      const { scene } = await this.assetLoader.getModelByAssetName('floor-old')
      model = scene
    }
    const scene = model.clone()
  
    scene.traverse(o => o.receiveShadow = true)

    scene.scale.multiplyScalar(2)
    scene.translateY(-0.03)
    this.object.add(scene)
  }

  private applyMaterial(material: Material) {
    this.object.traverse(o => {
      if (o instanceof Mesh) {
        o.material = material
      }
    })
  }

  private appliedMaterial = false
  onUpdate(deltaTime: number): void {
    if (this.isDisposed) {
      // This should not happen but it happens a lot 
      return
    }
    this.health -= deltaTime
    if (this.health <= 5 && !this.appliedMaterial) {
      this.applyMaterial(damagedMaterial)
      this.appliedMaterial = true
    }
    if (this.health <= 0) {
      this.health = 0

      this.object.translateY(deltaTime * -0.08)
      this.physics.updateActorTransform(this)
      setTimeout(() => {
        this.physics.removeActor(this)
        this.world.removeActor(this)
      }, 2000)
    }

  }
}


@Service()
class BuildService {
  private world = inject(World)
  private physics = inject(PhysicsSystem)

  public player!: Character

  setup(player: Character) {
    this.player = player
    this.physics.showDebug = false

    this.physics.afterStep.subscribe(() => {

      if (this.isBuilding) {
        this.tryBuild()
      }

    }) 
  }

  private usedLocations: Vector3[] = []

  private isBuilding = false

  readonly toggleBuild = (shouldBuild: boolean) => {
    this.isBuilding = shouldBuild
  }

  // Should probably be every frame when possible if held down

  private tryBuild() {
  
    const buildLocation = this.getBuildLocation(this.player)
    //const mesh = new Mesh(new BoxGeometry(1,.2,1), new MeshLambertMaterial({color: 0xff00ff}))
    //mesh.position.copy(buildLocation)
    //this.world.scene.add(mesh)

    if (this.player.wood.value <= 0) {
      console.log('Not enough resources to build')
      return
    }

    if (this.usedLocations.some(l => l.equals(buildLocation))) {
      //console.log("Already built on " + buildLocation)
      return
    }

    this.physics.rayTest(new Vector3().copy(buildLocation).addScaledVector(up, 2), buildLocation, _rayTestResult)
    if (_rayTestResult.hasHit) {
      console.log('Can not build here')
      return
    }

    this.usedLocations.push(buildLocation.clone().setComponent(1,0))

    //console.time("spawn floor")
    this.world.spawnActor(FloorActor, buildLocation).then(actor =>  {
     // console.timeEnd("spawn floor")

      actor.disposed.subscribe(() => {
        this.usedLocations.splice(this.usedLocations.findIndex(p => p.x === actor.position.x && p.z === actor.position.z))
      })
    })
    

    this.player.wood.value--
  }

  getBuildLocation(builder: BaseActor) {
    const offset = 1
    const direction = builder.object.getWorldDirection(_direction)  
    const buildLocation = _buildLocation.copy(builder.position).setComponent(1,0).addScaledVector(direction, offset)
    buildLocation.x = Math.round(buildLocation.x)
    buildLocation.y = 0
    buildLocation.z = Math.round(buildLocation.z)
    return buildLocation
  }

}


const _rayTestResult = new RayTestResult()

const _buildLocation = new Vector3()
const _direction = new Vector3()
const up = new Vector3(0,1,0)

export { BuildService, FloorActor };
