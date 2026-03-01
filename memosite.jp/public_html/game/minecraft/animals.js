/**
 * Animals for WebCraft
 * Handles animal logic, movement, and rendering
 */

class Animal {
    constructor(id, type, x, y, z) {
        this.id = id;
        this.type = type; // 'pig', 'cow', 'sheep'
        this.position = new THREE.Vector3(x, y, z);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.onGround = false;

        // Stats
        this.health = 10;
        this.maxHealth = 10;
        this.reproductionTimer = 10.0; // Wait 10s after birth before reproducing

        // AI State
        this.state = 'idle'; // idle, walk
        this.stateTimer = 0;
        this.moveDir = new THREE.Vector3();
        this.moveSpeed = 2.0;

        console.log(`[Animal] Created ${this.type} at ${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}`);

        // Rendering
        this.mesh = this.createMesh();
        this.mesh.position.copy(this.position);
    }

    createMesh() {
        const group = new THREE.Group();

        // Material based on type
        let color = 0xFFC0CB; // Pink (Pig)
        if (this.type === 'cow') color = 0x8B4513;
        else if (this.type === 'sheep') color = 0xFFFFFF;

        const material = new THREE.MeshLambertMaterial({ color: color });

        // Body
        const bodyGeo = new THREE.BoxGeometry(0.9, 0.9, 1.3);
        const body = new THREE.Mesh(bodyGeo, material);
        body.position.y = 0.6;
        group.add(body);

        // Head
        const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const head = new THREE.Mesh(headGeo, material);
        head.position.set(0, 1.2, 0.8);
        group.add(head);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.25, 0.6, 0.25);
        const legPositions = [
            [-0.3, 0.3, 0.4], [0.3, 0.3, 0.4],
            [-0.3, 0.3, -0.4], [0.3, 0.3, -0.4]
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, material);
            leg.position.set(...pos);
            group.add(leg);
        });

        return group;
    }

    update(dt, world, isHost) {
        if (isHost) {
            this.updateAI(dt);
            this.applyPhysics(dt, world);
        } else {
            // Client side interpolation could go here
        }

        // Update mesh
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation.y;

        // Growth
        if (this.mesh.scale.x < 1.0) {
            const growthSpeed = 0.05 * dt; // Grow over ~10-20 sec
            this.mesh.scale.addScalar(growthSpeed);
            if (this.mesh.scale.x > 1.0) this.mesh.scale.set(1, 1, 1);
        }
    }

    updateAI(dt) {
        this.stateTimer -= dt;

        if (this.stateTimer <= 0) {
            // Pick new state
            if (Math.random() < 0.3) {
                this.state = 'walk';
                this.stateTimer = 2 + Math.random() * 3;
                const angle = Math.random() * Math.PI * 2;
                this.moveDir.set(Math.sin(angle), 0, Math.cos(angle));
                this.rotation.y = angle;
            } else {
                this.state = 'idle';
                this.stateTimer = 1 + Math.random() * 4;
                this.moveDir.set(0, 0, 0);
            }
        }

        if (this.state === 'walk') {
            this.velocity.x = this.moveDir.x * this.moveSpeed;
            this.velocity.z = this.moveDir.z * this.moveSpeed;
        } else {
            this.velocity.x = 0;
            this.velocity.z = 0;
        }

        if (this.reproductionTimer > 0) this.reproductionTimer -= dt;
    }

    applyPhysics(dt, world) {
        // Gravity
        this.velocity.y -= 28 * dt; // Match player gravity

        // Potential new position
        const dx = this.velocity.x * dt;
        const dy = this.velocity.y * dt;
        const dz = this.velocity.z * dt;

        // X collision
        if (this.checkCollision(this.position.x + dx, this.position.y, this.position.z, world)) {
            this.velocity.x = 0;
        } else {
            this.position.x += dx;
        }

        // Z collision
        if (this.checkCollision(this.position.x, this.position.y, this.position.z + dz, world)) {
            this.velocity.z = 0;
        } else {
            this.position.z += dz;
        }

        // Y collision (Ground/Ceiling)
        if (this.checkCollision(this.position.x, this.position.y + dy, this.position.z, world)) {
            if (this.velocity.y < 0) this.onGround = true;
            this.velocity.y = 0;
        } else {
            this.position.y += dy;
            this.onGround = false;
        }

        // Auto jump
        if (this.state === 'walk' && this.onGround && (this.velocity.x !== 0 || this.velocity.z !== 0)) {
            // Check if blocked ahead
            const lookX = this.position.x + this.moveDir.x * 0.8;
            const lookZ = this.position.z + this.moveDir.z * 0.8;
            if (this.checkSolid(lookX, this.position.y, lookZ, world)) {
                this.velocity.y = 8; // Jump force
                this.onGround = false;
            }
        }
    }

    checkCollision(x, y, z, world) {
        // Simple point collision check at feet and head
        const width = 0.4;
        const height = 1.2;

        // Check corners
        for (let ix = -1; ix <= 1; ix += 2) {
            for (let iz = -1; iz <= 1; iz += 2) {
                if (this.checkSolid(x + ix * width, y, z + iz * width, world)) return true;
                if (this.checkSolid(x + ix * width, y + height, z + iz * width, world)) return true;
            }
        }
        return false;
    }

    checkSolid(x, y, z, world) {
        const bx = Math.floor(x);
        const by = Math.floor(y);
        const bz = Math.floor(z);

        // Use global Game instance method if possible, or pass world object
        // Assuming 'world' is the game instance for now
        return world.getBlock(bx, by, bz) > 0;
    }

    flashRed() {
        this.mesh.traverse((child) => {
            if (child.isMesh) {
                const oldColor = child.material.color.getHex();
                child.material.color.setHex(0xff0000);
                setTimeout(() => {
                    child.material.color.setHex(oldColor);
                }, 200);
            }
        });
    }

    takeDamage(amount) {
        this.health -= amount;
        this.flashRed();
        // Death check is handled by Game loop or killAnimal
        // But we should return true/false or new health?
        return this.health;
    }
}

window.Animal = Animal;
