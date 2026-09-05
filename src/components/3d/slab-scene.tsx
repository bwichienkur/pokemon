"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  MeshReflectorMaterial,
  Sparkles,
  useTexture,
} from "@react-three/drei";

import { shouldSimplify3D } from "@/lib/device";
import { cn } from "@/lib/utils";

export interface SlabSceneProps {
  frontUrl: string;
  backUrl: string;
  showBack?: boolean;
  enableScrollTilt?: boolean;
  className?: string;
  /** Optional controlled rotation, used by the detail viewer's drag controls. */
  rotation?: [number, number];
  /** Optional controlled scale, used by the detail viewer's zoom controls. */
  scale?: number;
  enablePointerTilt?: boolean;
  cinematic?: boolean;
  /** Shift the slab in world space — useful for full-bleed heroes with left copy. */
  stageOffset?: [number, number, number];
}

interface SlabModelProps extends Omit<SlabSceneProps, "className" | "cinematic"> {
  simplify: boolean;
  cinematic: boolean;
  scrollTilt: React.MutableRefObject<number>;
  pointerTarget: React.MutableRefObject<{ x: number; y: number }>;
  stageOffset: [number, number, number];
}

function HoloSheen({ simplify }: { simplify: boolean }) {
  const materialRef = React.useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  if (simplify) return null;

  return (
    <mesh position={[0, 0.05, 0.108]}>
      <planeGeometry args={[2.05, 2.55]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            float wave = sin((vUv.x * 8.0) + (vUv.y * 4.0) + uTime * 1.4) * 0.5 + 0.5;
            float sweep = smoothstep(0.15, 0.55, fract(vUv.x * 0.85 + vUv.y * 0.35 + uTime * 0.08));
            vec3 aqua = vec3(0.45, 0.82, 1.0);
            vec3 violet = vec3(0.72, 0.42, 1.0);
            vec3 gold = vec3(1.0, 0.82, 0.42);
            vec3 color = mix(aqua, violet, wave);
            color = mix(color, gold, sweep * 0.65);
            float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x)
              * smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
            float alpha = (0.12 + wave * 0.18 + sweep * 0.16) * edge;
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

function SlabModel({
  frontUrl,
  backUrl,
  showBack = false,
  simplify,
  cinematic,
  scrollTilt,
  pointerTarget,
  rotation = [0, 0],
  scale = 1,
  enablePointerTilt = true,
  stageOffset,
}: SlabModelProps) {
  const group = React.useRef<THREE.Group>(null);
  const glowRef = React.useRef<THREE.Mesh>(null);
  const [frontTexture, backTexture] = useTexture([frontUrl, backUrl]);
  const { invalidate, viewport } = useThree();
  const baseX = stageOffset[0];
  const baseY = stageOffset[1];
  const baseZ = stageOffset[2];

  React.useEffect(() => {
    for (const texture of [frontTexture, backTexture]) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = simplify ? 2 : 16;
      texture.needsUpdate = true;
    }
  }, [backTexture, frontTexture, simplify]);

  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.getElapsedTime();
    const intensity = cinematic && !simplify ? 1 : 0.55;
    const idleY = Math.sin(time * 0.85) * (0.18 * intensity);
    const idleRoll = Math.sin(time * 0.45) * (0.045 * intensity);
    const pointerY = enablePointerTilt ? pointerTarget.current.x * (0.55 * intensity) : 0;
    const pointerX = enablePointerTilt ? -pointerTarget.current.y * (0.36 * intensity) : 0;
    const scrollBoost = scrollTilt.current * (cinematic ? 0.28 : 0.05);
    const targetX = rotation[0] + pointerX + scrollBoost + idleRoll * 0.25;
    const targetY = rotation[1] + pointerY + (showBack ? Math.PI : 0) + idleRoll;
    const targetZ = idleRoll * 0.55;

    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, baseX, 0.08);
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      baseY + idleY,
      0.08,
    );
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, baseZ, 0.08);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.1);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.1);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetZ, 0.08);
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, scale, 0.12));

    if (glowRef.current) {
      const pulse = 0.85 + Math.sin(time * 1.6) * 0.15;
      glowRef.current.scale.setScalar(pulse);
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.22 + Math.sin(time * 1.2) * 0.06;
    }

    // Keep demand-mode canvases alive while the slab is moving.
    if (
      Math.abs(pointerTarget.current.x) > 0.002 ||
      Math.abs(pointerTarget.current.y) > 0.002 ||
      Math.abs(scrollTilt.current) > 0.002 ||
      cinematic
    ) {
      invalidate();
    }

    // Soft camera parallax for cinematic hero scenes.
    if (cinematic && !simplify) {
      const lookX = baseX * 0.35;
      state.camera.position.x = THREE.MathUtils.lerp(
        state.camera.position.x,
        lookX + pointerTarget.current.x * 0.65,
        0.06,
      );
      state.camera.position.y = THREE.MathUtils.lerp(
        state.camera.position.y,
        -pointerTarget.current.y * 0.38 + scrollTilt.current * 0.32,
        0.06,
      );
      state.camera.position.z = THREE.MathUtils.lerp(
        state.camera.position.z,
        5.2 - Math.abs(pointerTarget.current.x) * 0.25,
        0.04,
      );
      state.camera.lookAt(baseX * 0.55, baseY * 0.2, 0);
    }

    void viewport;
  });

  const caseBody = (
    <group ref={group} position={stageOffset}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.55, 3.55, 0.22]} />
        <meshPhysicalMaterial attach="material-0" color="#d5dde4" roughness={0.18} metalness={0.12} clearcoat={0.55} />
        <meshPhysicalMaterial attach="material-1" color="#c4ced6" roughness={0.2} metalness={0.12} clearcoat={0.5} />
        <meshPhysicalMaterial attach="material-2" color="#eef3f6" roughness={0.16} metalness={0.08} clearcoat={0.65} />
        <meshPhysicalMaterial attach="material-3" color="#b7c2cb" roughness={0.24} metalness={0.1} clearcoat={0.45} />
        <meshPhysicalMaterial
          attach="material-4"
          map={frontTexture}
          roughness={0.12}
          metalness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.12}
          iridescence={simplify ? 0.08 : 0.55}
          iridescenceIOR={1.4}
          iridescenceThicknessRange={[120, 480]}
          envMapIntensity={cinematic ? 1.35 : 0.9}
        />
        <meshPhysicalMaterial
          attach="material-5"
          map={backTexture}
          roughness={0.18}
          metalness={0.05}
          clearcoat={0.75}
          clearcoatRoughness={0.2}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Acrylic edge highlight shell */}
      <mesh scale={[1.01, 1.01, 1.08]}>
        <boxGeometry args={[2.55, 3.55, 0.22]} />
        <meshPhysicalMaterial
          color="#f7fbff"
          transparent
          opacity={0.08}
          roughness={0.05}
          metalness={0.0}
          transmission={simplify ? 0 : 0.55}
          thickness={0.35}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Label band */}
      <mesh position={[0, 1.34, 0.115]}>
        <planeGeometry args={[2.15, 0.46]} />
        <meshPhysicalMaterial color="#f6eee0" roughness={0.28} metalness={0.05} transparent opacity={0.72} />
      </mesh>

      {/* Gold rim frame */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.57, 3.57, 0.23)]} />
        <lineBasicMaterial color="#e8c87a" transparent opacity={0.45} />
      </lineSegments>

      <HoloSheen simplify={simplify} />

      {!simplify && (
        <mesh ref={glowRef} position={[0, 0, -0.18]}>
          <planeGeometry args={[3.4, 4.4]} />
          <meshBasicMaterial color="#c6a75e" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}
    </group>
  );

  return (
    <>
      {cinematic && !simplify ? (
        <Float speed={1.35} rotationIntensity={0.22} floatIntensity={0.42}>
          {caseBody}
        </Float>
      ) : (
        caseBody
      )}

      <ContactShadows
        position={[baseX, -2.15 + baseY, baseZ]}
        opacity={cinematic ? 0.5 : 0.28}
        scale={10}
        blur={2.6}
        far={4.5}
      />

      {!simplify && (
        <>
          <Environment preset={cinematic ? "studio" : "city"} environmentIntensity={cinematic ? 1.05 : 0.7} />
          {cinematic && (
            <>
              <Sparkles
                count={90}
                scale={[12, 8, 5]}
                size={3.2}
                speed={0.48}
                opacity={0.7}
                color="#f0d58a"
                position={[baseX * 0.4, 0.5, 0]}
              />
              <Sparkles
                count={48}
                scale={[10, 6, 4]}
                size={1.8}
                speed={0.28}
                opacity={0.5}
                color="#9ec8ff"
                position={[baseX * 0.35, -0.15, -0.4]}
              />
            </>
          )}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[baseX * 0.25, -2.05 + baseY, baseZ]}>
            <planeGeometry args={[18, 16]} />
            <MeshReflectorMaterial
              blur={[240, 90]}
              resolution={cinematic ? 1024 : 256}
              mixBlur={0.45}
              mixStrength={cinematic ? 0.95 : 0.25}
              roughness={0.7}
              depthScale={0.85}
              minDepthThreshold={0.25}
              maxDepthThreshold={1.15}
              color="#0a0d14"
              metalness={0.55}
            />
          </mesh>
        </>
      )}
    </>
  );
}

export function SlabScene({
  frontUrl,
  backUrl,
  showBack,
  enableScrollTilt = false,
  className,
  cinematic = false,
  stageOffset = [0, 0, 0],
  ...modelProps
}: SlabSceneProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [simplify, setSimplify] = React.useState(true);
  const scrollTilt = React.useRef(0);
  const pointerTarget = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    setSimplify(shouldSimplify3D());
    const element = hostRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "180px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!enableScrollTilt) return;
    const updateTilt = () => {
      scrollTilt.current = THREE.MathUtils.clamp(window.scrollY / 520, -1.4, 1.4);
    };
    updateTilt();
    window.addEventListener("scroll", updateTilt, { passive: true });
    return () => window.removeEventListener("scroll", updateTilt);
  }, [enableScrollTilt]);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    pointerTarget.current = {
      x: THREE.MathUtils.clamp(x, -1, 1),
      y: THREE.MathUtils.clamp(y, -1, 1),
    };
  };

  const onPointerLeave = () => {
    pointerTarget.current = { x: 0, y: 0 };
  };

  const resolvedOffset: [number, number, number] = stageOffset;

  return (
    <div
      ref={hostRef}
      className={cn("relative h-full min-h-72 w-full overflow-hidden", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {isVisible && (
        <Canvas
          dpr={simplify ? [1, 1.25] : cinematic ? [1, 2] : [1, 1.75]}
          frameloop={cinematic && !simplify ? "always" : "demand"}
          camera={{ position: [0, 0.2, cinematic ? 4.85 : 6.3], fov: cinematic ? 28 : 34 }}
          gl={{
            antialias: !simplify,
            alpha: true,
            powerPreference: simplify ? "low-power" : "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: cinematic ? 1.22 : 1,
          }}
        >
          <color attach="background" args={[cinematic ? "#05070c" : "#0b0d12"]} />
          <fog attach="fog" args={[cinematic ? "#05070c" : "#0b0d12", 7, cinematic ? 15 : 18]} />
          <ambientLight intensity={cinematic ? 0.38 : 0.65} />
          <directionalLight
            position={[4.2 + resolvedOffset[0] * 0.2, 5.2, 3.5]}
            intensity={cinematic ? 3.1 : 2}
            color="#fff1d2"
            castShadow={!simplify}
          />
          <directionalLight
            position={[-5 + resolvedOffset[0] * 0.15, 1.5, 2.5]}
            intensity={cinematic ? 1.35 : 0.7}
            color="#8ec5ff"
          />
          <spotLight
            position={[resolvedOffset[0], 4.8, 5.2]}
            angle={0.38}
            penumbra={0.6}
            intensity={cinematic ? 3.2 : 1.2}
            color="#ffe6a8"
          />
          <pointLight
            position={[resolvedOffset[0], -1.2, 3]}
            intensity={cinematic ? 1.15 : 0.35}
            color="#7aa7ff"
          />
          <pointLight
            position={[resolvedOffset[0] + 2.2, 2.4, 1.5]}
            intensity={cinematic ? 0.75 : 0}
            color="#ffc978"
          />
          <React.Suspense fallback={null}>
            <SlabModel
              frontUrl={frontUrl}
              backUrl={backUrl}
              showBack={showBack}
              simplify={simplify}
              cinematic={cinematic}
              scrollTilt={scrollTilt}
              pointerTarget={pointerTarget}
              stageOffset={resolvedOffset}
              {...modelProps}
            />
          </React.Suspense>
        </Canvas>
      )}
    </div>
  );
}
