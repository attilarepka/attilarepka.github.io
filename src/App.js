import "./App.css";
import {
  extend as applyThree,
  Canvas,
  useFrame,
  useThree,
  useLoader,
} from "@react-three/fiber";
import { EffectComposer, Glitch } from "@react-three/postprocessing";
import { GlitchMode } from "postprocessing";
import React, { useMemo, useState, useRef, useEffect, Suspense } from "react";
import { useSpring, a } from "@react-spring/three";
import * as THREE from "three/src/Three";

import { RenderPass } from "./lib/RenderPass";

import github from "./assets/GitHub-Mark-120px-plus.png";
import linkedin from "./assets/LI-In-Bug.png";

applyThree({ EffectComposer, RenderPass });

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
const Image = ({ img, opacity, scale, redirect, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  const texture = useLoader(THREE.TextureLoader, img);

  const mesh = useRef();

  const imgScale = texture.image.height / texture.image.width;

  const springProps = useSpring({
    scale: isHovered
      ? [imgScale * 0.2, imgScale * 0.2, 1]
      : [imgScale * 0.1, imgScale * 0.1, 1],
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
      <meshBasicMaterial
        attach="material"
        map={texture}
        transparent
        toneMapped={false}
      />
    </a.mesh>
  );
};

const Stars = () => {
  let group = useRef();
  let theta = 0;
  useFrame(() => {
    const r = 5 * Math.sin(THREE.Math.degToRad((theta += 0.02)));
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
    const coords = new Array(2000)
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
      <Image
        img={github}
        redirect={"https://github.com/attilarepka"}
        position={[-0.5, 0, 1]}
      />
      <Image
        img={linkedin}
        redirect={"https://linkedin.com/in/attila-repka"}
        position={[0.5, 0, 1]}
      />
      <Text fontSize={200} opacity={1}>
        attila repka
      </Text>
      <Stars />
      <EffectComposer>
        <Glitch
          delay={[1.5, 3.5]}
          duration={[0.6, 1.0]}
          strength={[0.3, 1.0]}
          mode={GlitchMode.SPORADIC}
          active
          ratio={0.85}
        />
      </EffectComposer>
    </>
  );
};

const App = () => {
  useEffect(() => {
    document.title = "Hello friend";
  }, []);
  return (
    <>
      <Canvas linear flat>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </>
  );
};

export default App;
