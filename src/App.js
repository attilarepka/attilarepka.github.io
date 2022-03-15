import "./App.css";
import {
  extend as applyThree,
  Canvas,
  useFrame,
  useLoader,
} from "@react-three/fiber";
import {
  EffectComposer,
  Glitch,
  Bloom,
  DepthOfField,
} from "@react-three/postprocessing";
import { Flex, Box } from "@react-three/flex";
import { Text } from "@react-three/drei";

import React, { useMemo, useState, useRef, useEffect, Suspense } from "react";
import { useSpring, a } from "@react-spring/three";
import * as THREE from "three/src/Three";

import { RenderPass } from "./lib/RenderPass";

import github from "./assets/GitHub-Mark-120px-plus.png";
import linkedin from "./assets/LI-In-Bug.png";

applyThree({ EffectComposer, RenderPass });

const Image = ({ img, redirect }) => {
  const [isHovered, setIsHovered] = useState(false);

  const texture = useLoader(THREE.TextureLoader, img);

  const mesh = useRef();

  const springProps = useSpring({
    scale: isHovered ? [0.2, 0.2, 1] : [0.1, 0.1, 1],
  });

  useEffect(() => {
    document.body.style.cursor = isHovered ? "pointer" : "auto";
  }, [isHovered]);

  return (
    <a.mesh
      ref={mesh}
      scale={springProps.scale}
      onClick={() => (window.location = redirect)}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <planeBufferGeometry attach="geometry" args={[7, 7]} />
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

const DepthText = () => {
  const [hovered, setHovered] = useState(false);

  const textSpring = useSpring({
    opacity: hovered ? 1.0 : 0.5,
  });

  return (
    <>
      <Text
        anchorY="95%"
        color="white"
        fontSize={1}
        fillOpacity={0.5}
        anchorX="center"
        onPointerOver={() => {
          setHovered(true);
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
      >
        <a.meshBasicMaterial
          attach="material"
          color={"white"}
          opacity={textSpring.opacity}
          depthWrite={false}
        />
        attila repka
      </Text>
    </>
  );
};

const Scene = () => {
  const ref = useRef();

  useFrame(({ mouse }) => {
    ref.current.bokehScale = Math.max(
      Math.min(Math.abs(mouse.x) * 10, Math.abs(mouse.y) * 10),
      0
    );
  }, []);

  return (
    <>
      <Flex
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        flexDir="row"
        wrap="no-wrap"
        position={[0, -0.5, 0]}
      >
        <Box flexGrow={1} margin={0.2}>
          <Image img={github} redirect={"https://github.com/attilarepka"} />
        </Box>
        <Box flexGrow={1} margin={0.2}>
          <Image
            img={linkedin}
            redirect={"https://linkedin.com/in/attila-repka"}
          />
        </Box>
      </Flex>
      <DepthText />
      <Stars />
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} />
        <Glitch
          delay={[1.5, 3.5]}
          duration={[0.6, 1.0]}
          strength={[0.3, 1.0]}
          active
          ratio={0.85}
        />
        <DepthOfField
          ref={ref}
          focusDistance={0}
          focalLength={0}
          height={480}
          bokehScale={0}
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
      <Canvas linear flat camera={{ position: [0, 0, 5] }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </>
  );
};

export default App;
