
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

type Media = {
  media_type: 'image' | 'video' | 'other';
  url: string; // Will be a Base64 Data URI
  title: string;
};

export function LandingPageClient() {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaTitle, setMediaTitle] = useState<string>('');
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const contentTimer = setTimeout(() => {
      setIsContentVisible(true);
    }, 500);

    async function fetchDailyMedia() {
      try {
        const response = await fetch('/api/apod');
        if (response.ok) {
          const data: Media = await response.json();
          setMediaUrl(data.url);
          setMediaTitle(data.title);
        } else {
          console.error("Failed to fetch from backend /api/apod endpoint.");
        }
      } catch (error) {
         console.error("Error fetching daily media:", error);
      }
    }
    
    fetchDailyMedia();

    return () => clearTimeout(contentTimer);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    let animationFrameId: number;
    const scene = new THREE.Scene();
    const clock = new THREE.Clock();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const geometry = new THREE.PlaneGeometry(5, 5, 64, 64);
    const material = new THREE.ShaderMaterial({
        uniforms: { u_time: { value: 0.0 } },
        vertexShader: `uniform float u_time; varying vec2 vUv; float n(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);} void main(){vUv=uv;vec3 pos=position;float noise=n(pos.xy*2.+u_time*.2);pos.z+=sin(pos.x*2.+u_time*.5)*.05+noise*.05;gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);}`,
        fragmentShader: `uniform float u_time; varying vec2 vUv; float n(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);} void main(){float w1=sin(vUv.x*10.+u_time*.5)*.02;float w2=sin(vUv.y*12.+u_time*.7)*.02;float w3=sin(dot(vUv,vec2(5.,8.))+u_time)*.03;float wc=w1+w2+w3;float i=pow(1.-abs(wc*10.),3.);float r=n(vUv+u_time*.01);float p=step(r,i*.6);gl_FragColor=vec4(vec3(1.),p*i*.25);}`,
        transparent: true
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        plane.material.uniforms.u_time.value = clock.getElapsedTime();
        renderer.render(scene, camera);
    };
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
    };
  }, []);
  
  const handleImageLoad = () => {
    setIsMediaLoaded(true);
  };
  
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background container */}
      <div
        className={cn(
          'absolute inset-0 z-0 bg-black transition-opacity duration-1000',
          isMediaLoaded ? 'opacity-100' : 'opacity-0'
        )}
      >
        {mediaUrl && (
          <Image
            src={mediaUrl}
            alt={mediaTitle}
            fill
            priority
            sizes="100vw"
            style={{objectFit: "cover"}}
            onLoad={handleImageLoad}
            data-ai-hint="space galaxy nebula"
          />
        )}
        {/* Always have a dark overlay */}
        <div className="absolute inset-0 bg-black/20 z-10" />
      </div>

      {/* WebGL Wave Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10"></canvas>
      
      {/* Initial Loading Text Overlay. This fades out as content becomes visible. */}
      <div
        className={cn(
          'absolute inset-0 z-30 flex flex-col items-center justify-center text-white transition-opacity duration-1000',
          isContentVisible ? 'opacity-0' : 'opacity-100',
          'pointer-events-none bg-black'
        )}
      >
         <h1 style={{ fontFamily: 'Microsoft YaHei, sans-serif' }} className="font-headline text-3xl tracking-widest animate-pulse">The Stars Arriving</h1>
      </div>
      
      {/* Main Content (Enter button). This fades in. */}
       <div
        className={cn(
          'absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-1000',
          isContentVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="absolute top-1/2 -translate-y-1/2">
          <Link href="/home" passHref>
            <button
              aria-label="进入网站"
              className="group relative flex h-28 w-28 items-center justify-center rounded-full border border-foreground/20 bg-black/10 text-foreground transition-all duration-300 ease-in-out hover:scale-110 hover:bg-black/20 active:scale-100 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 backdrop-blur-md"
            >
              <Rocket className="h-14 w-14 transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
