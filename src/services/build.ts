import { BoxCollisionShape, ConvexPolyhedronCollisionShape, PlaneCollisionShape } from "@hology/core";
import { Actor, AssetLoader, BaseActor, PhysicsBodyType, PhysicsSystem, Service, World, inject } from "@hology/core/gameplay";
import { BoxGeometry, Euler, Mesh, MeshLambertMaterial, Vector3 } from "three";
import { Vector } from "three/examples/jsm/Addons.js";


@Actor()
class FloorActor extends BaseActor {

  private assetLoader = inject(AssetLoader)
  private physics = inject(PhysicsSystem)

  async onInit(): Promise<void> {

      const { scene } = await this.assetLoader.getModelByAssetName('floor-old')
      scene.scale.multiplyScalar(2)
      scene.translateY(0.1)
      this.object.add(scene)

      this.physics.showDebug = false

      let mesh!: Mesh
      scene.traverseVisible((o) => {
        if (o instanceof Mesh) {
          mesh = o
        }
      })

      if (mesh == null) {
        console.log("No mesh!!")
      }

      this.physics.addActor(this, [
        //new ConvexPolyhedronCollisionShape(mesh)
        new BoxCollisionShape(new Vector3(1, .15, 1))
        //new PlaneCollisionShape(1,1)
        //  .withRotation(new Euler(-Math.PI/2, 0, 0))
          .withOffset(new Vector3(0, .15, 0))
      ], {
        type: PhysicsBodyType.static,
        friction: 0.001,
        restitution: 1
      })





      /*

      I don't even know if I am moving in the right direciton.
      Like I am putting a lot of effort into things lying to myself that it will be meaningful. 

      Pick the thing you think best showcase the engine


      Here need to load the asset to use. 

      Set it as a parameter but I want it to happen before on init.

      I don't like how I can't pass in parameters to actors.

      */
  }
}


@Service()
class BuildService {
  private world = inject(World)

  public player!: BaseActor

  setup(player: BaseActor) {
    this.player = player
  }

  private usedLocations: Vector3[] = []


  readonly toggleBuild = (shouldBuild: boolean) => {
    if (!shouldBuild) return 

    const buildLocation = this.getBuildLocation(this.player)

    console.log(shouldBuild, this.getBuildLocation(this.player))

    //const mesh = new Mesh(new BoxGeometry(1,.2,1), new MeshLambertMaterial({color: 0xff00ff}))
    //mesh.position.copy(buildLocation)
    //this.world.scene.add(mesh)

    if (this.usedLocations.some(l => l.equals(buildLocation))) {
      console.log("Already built on " + buildLocation)
      return
    }

    this.world.spawnActor(FloorActor, buildLocation)
    
    this.usedLocations.push(buildLocation.clone())

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

const _buildLocation = new Vector3()
const _direction = new Vector3()

export { BuildService }