
import { NodeShader, NodeShaderOutput, Parameter } from "@hology/core/shader/shader";
import { RgbNode, SimplexNoiseNode, Vec3ExpressionNode, dot, float, fragmentLinearEyeDepth, lambertMaterial, linearEyeDepth, max, mix, normalize, oneMinus, rgb, rgba, sin, step, textureSampler2d, timeUniforms, transformed, uniforms, varyingAttributes, varyingVec2, varyingVec3, vec2 } from "@hology/core/shader-nodes";
import { Color, Texture } from 'three';

export default class Water extends NodeShader {
  @Parameter()
  color: Color = new Color(0x000000)

  @Parameter()
  colorShallow: Color = new Color(0x000000)

  @Parameter()
  texture: Texture = new Texture()

  output(): NodeShaderOutput {
    const worldPosition = uniforms.modelMatrix.multiplyVec(transformed.position)
    const worldCoord = varyingVec2(worldPosition.xz())


    const noise = new SimplexNoiseNode(worldCoord)

    const white = rgb(0xffffff)

    const time = timeUniforms.elapsed
    // .add(vec2(1,1).multiplyScalar(noise).multiplyScalar(0.01)
    const waterNoise = textureSampler2d(this.texture).sample(worldCoord.multiplyScalar(0.2).add(vec2(0.3, 1).multiplyScalar(time).multiplyScalar(0.05))).rgb()
    const waterNoise2 = textureSampler2d(this.texture).sample(worldCoord.multiplyScalar(0.4).add(vec2(-0.8, .23).multiplyScalar(time).multiplyScalar(0.05))).rgb()

    const depth = linearEyeDepth.subtract(fragmentLinearEyeDepth).divide(linearEyeDepth)


    const baseWaterColor = mix(rgb(this.color), rgb(this.colorShallow), oneMinus(depth.multiply(depth))) as RgbNode
    const withWaterNoise = mix(mix(baseWaterColor, white, waterNoise.x().multiply(0.2)), white, waterNoise2.multiplyScalar(0.05))

    const withFoam = mix(white, withWaterNoise, (step(sin(time.multiply(1.2)).multiply(0.5).multiply(0.05).multiply(noise.multiply(0.5).add(0.2)).add(0.03), depth)))
    
    const cp = new Vec3ExpressionNode('cameraPosition')
    const viewDir = normalize(cp.subtract(varyingVec3(worldPosition.xyz())))

    const ndir = dot(varyingAttributes.normal, viewDir)
    
    return {
      color: rgba(lambertMaterial({color: withFoam}).rgb(), max(depth.add(ndir.divide(1)), float(0.3)))
      //color: rgba(rgb(0xffffff).multiplyScalar(depth.add(ndir.divide(2))))
    }
  } 

}
