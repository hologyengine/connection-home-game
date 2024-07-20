import { BoxCollisionShape, ConvexPolyhedronCollisionShape, PlaneCollisionShape } from "@hology/core";
import { Actor, AssetLoader, BaseActor, PhysicsBodyType, PhysicsSystem, RayTestResult, Service, World, inject } from "@hology/core/gameplay";
import { BoxGeometry, Euler, Mesh, MeshLambertMaterial, Vector3 } from "three";
import { Vector } from "three/examples/jsm/Addons.js";
import Character from "../actors/character";


@Actor()
class FloorActor extends BaseActor {

  private assetLoader = inject(AssetLoader)
  private physics = inject(PhysicsSystem)

  async onInit(): Promise<void> {

      const { scene } = await this.assetLoader.getModelByAssetName('floor-old')
      scene.traverse(o => o.receiveShadow = true)

      scene.scale.multiplyScalar(2)
      scene.translateY(0.1)
      this.object.add(scene)

      this.physics.showDebug = false

      this.physics.addActor(this, [
        new BoxCollisionShape(new Vector3(1, .15, 1))
          .withOffset(new Vector3(0, .15, 0))
      ], {
        type: PhysicsBodyType.static,
        friction: 0.001,
        restitution: 1
      })
    }
  }


@Service()
class BuildService {
  private world = inject(World)
  private physics = inject(PhysicsSystem)

  public player!: Character

  setup(player: Character) {
    this.player = player
    this.physics.showDebug = true
  }

  private usedLocations: Vector3[] = []


  readonly toggleBuild = (shouldBuild: boolean) => {
    if (!shouldBuild) return 
  
    const buildLocation = this.getBuildLocation(this.player)
    //const mesh = new Mesh(new BoxGeometry(1,.2,1), new MeshLambertMaterial({color: 0xff00ff}))
    //mesh.position.copy(buildLocation)
    //this.world.scene.add(mesh)

    if (this.player.wood.value <= 0) {
      console.log('Not enough resources to build')
      return
    }

    if (this.usedLocations.some(l => l.equals(buildLocation))) {
      console.log("Already built on " + buildLocation)
      return
    }

    this.physics.rayTest(new Vector3().copy(buildLocation).addScaledVector(up, 2), buildLocation, _rayTestResult)
    if (_rayTestResult.hasHit) {
      console.log('Can not build here')
      return
    }

    this.world.spawnActor(FloorActor, buildLocation)
    
    this.usedLocations.push(buildLocation.clone())

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

export { BuildService }