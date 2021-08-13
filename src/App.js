import "./App.css";
import {
  extend as applyThree,
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";
import React, { useMemo, useState, useRef, useEffect, memo } from "react";
import { apply as applySpring, useSpring, a } from "@react-spring/three";
import * as THREE from "three/src/Three";

// Import and register postprocessing classes as three-native-elements for both react-three-fiber & react-spring
// They'll be available as native elements <effectComposer /> from then on ...
import { EffectComposer } from "./lib/EffectComposer";
import { RenderPass } from "./lib/RenderPass";
import { GlitchPass } from "./lib/GlitchPass";

// applySpring({ EffectComposer, RenderPass, GlitchPass });
applyThree({ EffectComposer, RenderPass, GlitchPass });

const Background = ({ color }) => {
  const { viewport } = useThree();
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry attach="geometry" args={[1, 1]} />
      <a.meshBasicMaterial attach="material" color={color} depthTest={false} />
    </mesh>
  );
};

const Text = ({
  children,
  position,
  opacity,
  color = "white",
  fontSize = 410,
}) => {
  const {
    viewport: { width: viewportWidth, height: viewportHeight },
  } = useThree();
  const scale = viewportWidth > viewportHeight ? viewportWidth : viewportHeight;
  const canvas = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 2048;
    const context = canvas.getContext("2d");
    context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;
    context.fillText(children, 1024, 1024 - 410 / 2);
    return canvas;
  }, [children, color, fontSize]);
  return (
    <a.sprite scale={[scale, scale, 1]} position={position}>
      <a.spriteMaterial attach="material" transparent opacity={opacity}>
        <canvasTexture
          attach="map"
          image={canvas}
          premultiplyAlpha
          onUpdate={(s) => (s.needsUpdate = true)}
        />
      </a.spriteMaterial>
    </a.sprite>
  );
};

// TODO: CSS -> cursor: pointer
// TODO: re-render glitch on onHover with less factor and/or write some zoom in shader
const Image = ({ url, opacity, scale, redirect, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  const texture = useMemo(() => new THREE.TextureLoader().load(url), [url]);
  texture.crossOrigin = "";
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const mesh = useRef();

  const springProps = useSpring({
    scale: isHovered ? [0.2, 0.2, 1] : [0.1, 0.1, 1],
  });

  return (
    <a.mesh
      ref={mesh}
      {...props}
      scale={springProps.scale}
      onClick={() => (window.location = redirect)}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <planeBufferGeometry attach="geometry" args={[5, 5]} />
      <a.meshLambertMaterial attach="material" transparent opacity={opacity}>
        <primitive attach="map" object={texture} />
      </a.meshLambertMaterial>
    </a.mesh>
  );
};

const Effects = memo(({ factor }) => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef();
  useEffect(
    () => void composer.current.setSize(size.width, size.height),
    [size]
  );
  // This takes over as the main render-loop (when 2nd arg is set to true)
  useFrame(() => composer.current.render(), true);
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" args={[scene, camera]} />
      <a.glitchPass attachArray="passes" renderToScreen factor={factor} />
    </effectComposer>
  );
});

const Stars = () => {
  let group = useRef();
  let theta = 0;
  useFrame(() => {
    const r = 5 * Math.sin(THREE.Math.degToRad((theta += 0.01)));
    const s = Math.cos(THREE.Math.degToRad(theta * 2));
    group.current.rotation.set(r, r, r);
    group.current.scale.set(s, s, s);
  });
  const [geo, mat, coords] = useMemo(() => {
    const geo = new THREE.SphereBufferGeometry(1, 10, 10);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("peachpuff"),
      transparent: true,
    });
    const coords = new Array(1000)
      .fill()
      .map((i) => [
        Math.random() * 800 - 400,
        Math.random() * 800 - 400,
        Math.random() * 800 - 400,
      ]);
    return [geo, mat, coords];
  }, []);
  return (
    <a.group ref={group}>
      {coords.map(([p1, p2, p3], i) => (
        <mesh key={i} geometry={geo} material={mat} position={[p1, p2, p3]} />
      ))}
    </a.group>
  );
};

const Scene = () => {
  return (
    <>
      <a.spotLight intensity={1.2} color="white" position={[0, 0, 9000]} />
      {/* <Effects factor={1} /> */}
      <Background color={"#4f4541"} />
      <Stars />
      <Text fontSize={200} opacity={1}>
        attila repka
      </Text>
      <Image
        url={"https://image.flaticon.com/icons/svg/2111/2111425.svg"}
        redirect={"https://github.com/attilarepka"}
        scale={0.1}
        opacity={1}
        position={[-0.5, 0, 1]}
      />
      <Image
        url={"https://image.flaticon.com/icons/svg/1409/1409945.svg"}
        redirect={"https://linkedin.com/in/attila-repka"}
        scale={0.1}
        opacity={1}
        position={[0.5, 0, 1]}
      />
    </>
  );
};

const App = () => {
  useEffect(() => {
    document.title = "Hello friend";
  }, []);
  return (
    <>
      <Canvas>
        <Scene />
      </Canvas>
    </>
  );
};

export default App;
