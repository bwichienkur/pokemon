"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, MeshReflectorMaterial, useTexture } from "@react-three/drei";

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
}

interface SlabModelProps extends Omit<SlabSceneProps, "className"> {
  simplify: boolean;
  scrollTilt: React.MutableRefObject<number>;
}

function SlabModel({
  frontUrl,
  backUrl,
  showBack = false,
  simplify,
  scrollTilt,
  rotation = [0, 0],
  scale = 1,
  enablePointerTilt = true,
}: SlabModelProps) {
  const group = React.useRef<THREE.Group>(null);
  const pointer = React.useRef({ x: 0, y: 0 });
  const [frontTexture, backTexture] = useTexture([frontUrl, backUrl]);
  const { invalidate } = useThree();

  React.useEffect(() => {
    [frontTexture, backTexture].forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = simplify ? 2 : 8;
      texture.needsUpdate = true;
    });
  }, [backTexture, frontTexture, simplify]);

  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.getElapsedTime();
    const idleY = simplify ? 0 : Math.sin(time * 0.7) * 0.075;
    const pointerY = enablePointerTilt ? pointer.current.x * 0.14 : 0;
    const pointerX = enablePointerTilt ? -pointer.current.y * 0.1 : 0;
    const targetX = rotation[0] + pointerX + scrollTilt.current * 0.025;
    const targetY = rotation[1] + pointerY + (showBack ? Math.PI : 0);

    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, idleY, 0.06);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.09);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.09);
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, scale, 0.1));

    // A demand canvas only draws while this visible scene requests another frame.
    invalidate();
  });

  return (
    <>
      <group
        ref={group}
        onPointerMove={(event) => {
          pointer.current = { x: event.pointer.x, y: event.pointer.y };
        }}
        onPointerOut={() => {
          pointer.current = { x: 0, y: 0 };
        }}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.5, 3.5, 0.2]} />
          <meshPhysicalMaterial attach="material-0" color="#d9dfe4" roughness={0.24} metalness={0.06} />
          <meshPhysicalMaterial attach="material-1" color="#c7ced5" roughness={0.24} metalness={0.06} />
          <meshPhysicalMaterial attach="material-2" color="#eaf0f2" roughness={0.2} metalness={0.05} />
          <meshPhysicalMaterial attach="material-3" color="#bdc6cc" roughness={0.28} metalness={0.06} />
          <meshPhysicalMaterial
            attach="material-4"
            map={frontTexture}
            roughness={0.18}
            metalness={0.04}
            clearcoat={0.62}
            clearcoatRoughness={0.2}
            iridescence={simplify ? 0 : 0.22}
            iridescenceIOR={1.25}
            iridescenceThicknessRange={[140, 320]}
          />
          <meshPhysicalMaterial
            attach="material-5"
            map={backTexture}
            roughness={0.22}
            metalness={0.03}
            clearcoat={0.56}
            clearcoatRoughness={0.23}
          />
        </mesh>
        <mesh position={[0, 1.3, 0.106]}>
          <planeGeometry args={[2.1, 0.42]} />
          <meshPhysicalMaterial color="#f4ede0" roughness={0.32} metalness={0.04} transparent opacity={0.6} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(2.51, 3.51, 0.205)]} />
          <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
        </lineSegments>
      </group>
      <ContactShadows position={[0, -2.05, 0]} opacity={0.28} scale={6} blur={2.5} far={3.5} />
      {!simplify && (
        <>
          <Environment preset="city" />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
            <planeGeometry args={[8, 8]} />
            <MeshReflectorMaterial
              blur={[120, 40]}
              resolution={256}
              mixBlur={0.35}
              mixStrength={0.22}
              roughness={0.9}
              color="#090b10"
              metalness={0.25}
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
  ...modelProps
}: SlabSceneProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [simplify, setSimplify] = React.useState(true);
  const scrollTilt = React.useRef(0);

  React.useEffect(() => {
    setSimplify(shouldSimplify3D());
    const element = hostRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "160px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!enableScrollTilt) return;
    const updateTilt = () => {
      scrollTilt.current = THREE.MathUtils.clamp(window.scrollY / 900, -1, 1);
    };
    updateTilt();
    window.addEventListener("scroll", updateTilt, { passive: true });
    return () => window.removeEventListener("scroll", updateTilt);
  }, [enableScrollTilt]);

  return (
    <div ref={hostRef} className={cn("relative h-full min-h-72 w-full overflow-hidden", className)}>
      {isVisible && (
        <Canvas
          dpr={simplify ? [1, 1.25] : [1, 2]}
          frameloop="demand"
          camera={{ position: [0, 0, 6.4], fov: 34 }}
          gl={{ antialias: !simplify, alpha: true, powerPreference: simplify ? "low-power" : "high-performance" }}
        >
          <color attach="background" args={["#0b0d12"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 4, 4]} intensity={2.1} color="#fff7e4" />
          <directionalLight position={[-4, 1, 2]} intensity={0.7} color="#bfd3e6" />
          <React.Suspense fallback={null}>
            <SlabModel
              frontUrl={frontUrl}
              backUrl={backUrl}
              showBack={showBack}
              simplify={simplify}
              scrollTilt={scrollTilt}
              {...modelProps}
            />
          </React.Suspense>
        </Canvas>
      )}
    </div>
  );
}
