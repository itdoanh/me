/**
 * Futuristic Three.js Geometric Background
 * Creates a dynamic network of interconnected nodes with floating geometry
 * Represents distributed systems / neural network aesthetics
 */

class GeometricBackground {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = [];
    this.geometries = [];
    this.connections = [];
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.frameCount = 0;

    this.CONFIG = {
      particleCount: 80,
      connectionDistance: 3.5,
      geometryCount: 6,
      fieldSize: 25,
      cameraZ: 18,
      mouseInfluence: 0.3,
      rotationSpeed: 0.0003,
      particleSpeed: 0.008,
      colors: {
        cyan: new THREE.Color(0x00f0ff),
        purple: new THREE.Color(0x7b2ff7),
        magenta: new THREE.Color(0xff006e),
        blue: new THREE.Color(0x3a86ff),
        dim: new THREE.Color(0x1a1a3e)
      }
    };

    this.init();
    this.createParticles();
    this.createFloatingGeometries();
    this.createConnectionLines();
    this.createAmbientParticles();
    this.addEventListeners();
    this.animate();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050510, 0.035);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.z = this.CONFIG.cameraZ;

    // Renderer
    const canvas = document.getElementById('bg-canvas');
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x050510, 1);
  }

  createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    for (let i = 0; i < this.CONFIG.particleCount; i++) {
      const x = (Math.random() - 0.5) * this.CONFIG.fieldSize;
      const y = (Math.random() - 0.5) * this.CONFIG.fieldSize;
      const z = (Math.random() - 0.5) * this.CONFIG.fieldSize * 0.5;

      positions.push(x, y, z);

      // Random color between cyan and purple
      const t = Math.random();
      const color = this.CONFIG.colors.cyan.clone().lerp(this.CONFIG.colors.purple, t);
      colors.push(color.r, color.g, color.b);

      sizes.push(Math.random() * 3 + 1);

      this.particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * this.CONFIG.particleSpeed,
          (Math.random() - 0.5) * this.CONFIG.particleSpeed,
          (Math.random() - 0.5) * this.CONFIG.particleSpeed * 0.5
        ),
        originalPosition: new THREE.Vector3(x, y, z)
      });
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const vertexShader = `
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        alpha *= 0.7;
        gl_FragColor = vec4(vColor, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  createFloatingGeometries() {
    const geometryTypes = [
      () => new THREE.IcosahedronGeometry(1, 0),
      () => new THREE.OctahedronGeometry(0.8, 0),
      () => new THREE.TetrahedronGeometry(0.7, 0),
      () => new THREE.DodecahedronGeometry(0.9, 0),
      () => new THREE.TorusGeometry(0.6, 0.2, 8, 16),
      () => new THREE.TorusKnotGeometry(0.5, 0.15, 48, 8, 2, 3),
    ];

    for (let i = 0; i < this.CONFIG.geometryCount; i++) {
      const geomFn = geometryTypes[i % geometryTypes.length];
      const geometry = geomFn();

      // Wireframe material with gradient-like color
      const t = i / this.CONFIG.geometryCount;
      const color = this.CONFIG.colors.cyan.clone().lerp(this.CONFIG.colors.purple, t);

      const material = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });

      // Inner glow mesh
      const innerMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.03,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geometry, material);
      const innerMesh = new THREE.Mesh(geometry.clone(), innerMaterial);

      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * this.CONFIG.fieldSize * 0.8,
        (Math.random() - 0.5) * this.CONFIG.fieldSize * 0.6,
        (Math.random() - 0.5) * 8
      );

      mesh.position.copy(pos);
      innerMesh.position.copy(pos);

      const scale = Math.random() * 1.5 + 0.8;
      mesh.scale.setScalar(scale);
      innerMesh.scale.setScalar(scale);

      this.scene.add(mesh);
      this.scene.add(innerMesh);

      this.geometries.push({
        wireframe: mesh,
        inner: innerMesh,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.008,
          y: (Math.random() - 0.5) * 0.008,
          z: (Math.random() - 0.5) * 0.004
        },
        floatSpeed: Math.random() * 0.5 + 0.3,
        floatAmplitude: Math.random() * 0.5 + 0.2,
        originalY: pos.y,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  createConnectionLines() {
    const material = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.06,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const maxConnections = this.CONFIG.particleCount * 3;
    const positions = new Float32Array(maxConnections * 6);
    const colors = new Float32Array(maxConnections * 6);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setDrawRange(0, 0);

    this.connectionGeometry = geometry;
    this.connectionMesh = new THREE.LineSegments(geometry, material);
    this.scene.add(this.connectionMesh);
  }

  createAmbientParticles() {
    const count = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];

    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20
      );
      sizes.push(Math.random() * 0.8 + 0.2);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const vertexShader = `
      attribute float size;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (150.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.1, 0.5, dist);
        alpha *= 0.15;
        gl_FragColor = vec4(0.4, 0.5, 0.8, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.ambientParticles = new THREE.Points(geometry, material);
    this.scene.add(this.ambientParticles);
  }

  updateParticles() {
    const positions = this.particleSystem.geometry.attributes.position.array;
    const halfField = this.CONFIG.fieldSize / 2;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Move particle
      p.position.add(p.velocity);

      // Boundary wrap
      if (p.position.x > halfField) p.position.x = -halfField;
      if (p.position.x < -halfField) p.position.x = halfField;
      if (p.position.y > halfField) p.position.y = -halfField;
      if (p.position.y < -halfField) p.position.y = halfField;
      if (p.position.z > halfField * 0.25) p.position.z = -halfField * 0.25;
      if (p.position.z < -halfField * 0.25) p.position.z = halfField * 0.25;

      // Mouse influence
      const dx = this.mouse.x * 5 - p.position.x;
      const dy = this.mouse.y * 5 - p.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 5) {
        const force = (5 - dist) / 5 * 0.002;
        p.velocity.x += dx * force;
        p.velocity.y += dy * force;
      }

      // Damping
      p.velocity.multiplyScalar(0.999);

      // Update buffer
      const idx = i * 3;
      positions[idx] = p.position.x;
      positions[idx + 1] = p.position.y;
      positions[idx + 2] = p.position.z;
    }

    this.particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  updateConnections() {
    const positions = this.connectionGeometry.attributes.position.array;
    const colors = this.connectionGeometry.attributes.color.array;
    let vertexIndex = 0;

    const maxDist = this.CONFIG.connectionDistance;
    const maxDistSq = maxDist * maxDist;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const pi = this.particles[i].position;
        const pj = this.particles[j].position;

        const dx = pi.x - pj.x;
        const dy = pi.y - pj.y;
        const dz = pi.z - pj.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < maxDistSq) {
          const alpha = 1 - distSq / maxDistSq;

          // Color interpolation based on distance
          const r = 0.0 + alpha * 0.0;
          const g = 0.6 * alpha + 0.2;
          const b = 1.0 * alpha + 0.3;

          const baseIdx = vertexIndex * 6;
          positions[baseIdx] = pi.x;
          positions[baseIdx + 1] = pi.y;
          positions[baseIdx + 2] = pi.z;
          positions[baseIdx + 3] = pj.x;
          positions[baseIdx + 4] = pj.y;
          positions[baseIdx + 5] = pj.z;

          colors[baseIdx] = r;
          colors[baseIdx + 1] = g;
          colors[baseIdx + 2] = b;
          colors[baseIdx + 3] = r;
          colors[baseIdx + 4] = g;
          colors[baseIdx + 5] = b;

          vertexIndex++;

          if (vertexIndex >= this.CONFIG.particleCount * 3) break;
        }
      }
      if (vertexIndex >= this.CONFIG.particleCount * 3) break;
    }

    this.connectionGeometry.setDrawRange(0, vertexIndex * 2);
    this.connectionGeometry.attributes.position.needsUpdate = true;
    this.connectionGeometry.attributes.color.needsUpdate = true;
  }

  updateGeometries(elapsed) {
    this.geometries.forEach(geo => {
      // Rotation
      geo.wireframe.rotation.x += geo.rotationSpeed.x;
      geo.wireframe.rotation.y += geo.rotationSpeed.y;
      geo.wireframe.rotation.z += geo.rotationSpeed.z;
      geo.inner.rotation.copy(geo.wireframe.rotation);

      // Floating motion
      const floatY = Math.sin(elapsed * geo.floatSpeed + geo.phase) * geo.floatAmplitude;
      geo.wireframe.position.y = geo.originalY + floatY;
      geo.inner.position.y = geo.wireframe.position.y;

      // Subtle opacity pulse
      const pulse = (Math.sin(elapsed * 0.5 + geo.phase) + 1) * 0.5;
      geo.wireframe.material.opacity = 0.08 + pulse * 0.12;
      geo.inner.material.opacity = 0.01 + pulse * 0.03;
    });
  }

  addEventListeners() {
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(event) {
    this.mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();
    this.frameCount++;

    // Smooth mouse tracking
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Camera subtle movement
    this.camera.position.x += (this.mouse.x * 1.5 - this.camera.position.x) * 0.02;
    this.camera.position.y += (this.mouse.y * 1.0 - this.camera.position.y) * 0.02;
    this.camera.lookAt(0, 0, 0);

    // Update scene
    this.updateParticles();
    this.updateGeometries(elapsed);

    // Update connections every 2 frames for performance
    if (this.frameCount % 2 === 0) {
      this.updateConnections();
    }

    // Rotate ambient particles
    if (this.ambientParticles) {
      this.ambientParticles.rotation.y = elapsed * 0.02;
      this.ambientParticles.rotation.x = Math.sin(elapsed * 0.01) * 0.1;
    }

    // Slow scene rotation
    this.scene.rotation.y = elapsed * this.CONFIG.rotationSpeed;

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('bg-canvas')) {
    new GeometricBackground();
  }
});
