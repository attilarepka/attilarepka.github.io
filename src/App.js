//import React from 'react';
// import logo from './logo.svg'; // deprecate later
import './App.css'; // remove unnecessary things later
import { extend as applyThree, Canvas, useFrame, useThree } from 'react-three-fiber'
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { apply as applySpring, useSpring, a, interpolate } from 'react-spring/three'
import * as THREE from 'three/src/Three'

// Import and register postprocessing classes as three-native-elements for both react-three-fiber & react-spring
// They'll be available as native elements <effectComposer /> from then on ...
import { EffectComposer } from './lib/EffectComposer'
import { RenderPass } from './lib/RenderPass'
import { GlitchPass } from './lib/GlitchPass'
applySpring({ EffectComposer, RenderPass, GlitchPass })
applyThree({ EffectComposer, RenderPass, GlitchPass })

/** This component creates a fullscreen colored plane */
const Background = ({ color }) => {
  const { viewport } = useThree()
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry attach="geometry" args={[1, 1]} />
      <a.meshBasicMaterial attach="material" color={color} depthTest={false} />
    </mesh>
  )
}

/** This renders text via canvas and projects it as a sprite */
const Text = ({ children, position, opacity, color = 'white', fontSize = 410 }) => {
  const {
    viewport: { width: viewportWidth, height: viewportHeight }
  } = useThree()
  const scale = viewportWidth > viewportHeight ? viewportWidth : viewportHeight
  const canvas = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 2048
    const context = canvas.getContext('2d')
    context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = color
    context.fillText(children, 1024, 1024 - 410 / 2)
    return canvas
  }, [])
  return (
    <a.sprite scale={[scale, scale, 1]} position={position}>
      <a.spriteMaterial attach="material" transparent opacity={opacity}>
        <canvasTexture attach="map" image={canvas} premultiplyAlpha onUpdate={s => (s.needsUpdate = true)} />
      </a.spriteMaterial>
    </a.sprite>
  )
}

/** This component creates a glitch effect */
const Effects = React.memo(({ factor }) => {
  const { gl, scene, camera, size } = useThree()
  const composer = useRef()
  useEffect(() => void composer.current.setSize(size.width, size.height), [size])
  // This takes over as the main render-loop (when 2nd arg is set to true)
  useFrame(() => composer.current.render(), 1)
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" args={[scene, camera]} />
      <a.glitchPass attachArray="passes" renderToScreen factor={factor} />
    </effectComposer>
  )
})

/** This component rotates a bunch of stars */
const Stars = ({ position }) => {
  let group = useRef()
  let theta = 0
  useFrame(() => {
    const r = 5 * Math.sin(THREE.Math.degToRad((theta += 0.01)))
    const s = Math.cos(THREE.Math.degToRad(theta * 2))
    group.current.rotation.set(r, r, r)
    group.current.scale.set(s, s, s)
  })
  const [geo, mat, coords] = useMemo(() => {
    const geo = new THREE.SphereBufferGeometry(1, 10, 10)
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color('peachpuff'), transparent: true })
    const coords = new Array(1000).fill().map(i => [Math.random() * 800 - 400, Math.random() * 800 - 400, Math.random() * 800 - 400])
    return [geo, mat, coords]
  }, [])
  return (
    <a.group ref={group} position={position}>
      {coords.map(([p1, p2, p3], i) => (
        <mesh key={i} geometry={geo} material={mat} position={[p1, p2, p3]} />
      ))}
    </a.group>
  )
}

/** This component maintains the scene */
const Scene = ({ top, mouse }) => {
  return (
    <>
      <a.spotLight intensity={1.2} color="white"/>
      <Effects factor={1}/>
      <Background color={['#27282F', '#247BA0', '#70C1B3', '#f8f3f1']}/>
      <Stars/>
      <Text fontSize={200}>
        attila repka
      </Text>
    </>
  )
}

const App = () => {
  // This tiny spring right here controlls all(!) the animations, one for scroll, the other for mouse movement ...
  const [{ top, mouse }] = useSpring(() => ({ top: 0, mouse: [0, 0] }))
  return (
    <>
      <Canvas className="canvas">
        <Scene top={top} mouse={mouse} />
      </Canvas>
    </>
  )
}

export default App;
