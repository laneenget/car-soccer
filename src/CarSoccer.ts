/* Assignment 2: Car Soccer
 * CSCI 4611, Fall 2022, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { Vector3 } from 'gophergfx';
import { Ball } from './Ball';
import { Car } from './Car';

export class CarSoccer extends gfx.GfxApp
{
    private car: Car;
    private ball: Ball;
    private inputVector: gfx.Vector2;

    constructor()
    {
        // Call the base class constructor
        super();

        // Initialize member variables
        this.car = new Car(4.5, 4.5, 5.5);
        this.ball = new Ball(2.6);
        this.inputVector = new gfx.Vector2();
    }

    createScene(): void 
    {
        // Setup the camera projection matrix, position, and look direction.
        // We will learn more about camera models later in this course.
        this.camera.setPerspectiveCamera(60, 2, 0.1, 500)
        this.camera.position.set(0, 63, 73);
        this.camera.lookAt(gfx.Vector3.ZERO);

        // Create an ambient light
        const ambientLight = new gfx.AmbientLight(new gfx.Color(0.3, 0.3, 0.3));
        this.scene.add(ambientLight);

        // Create a directional light
        const directionalLight = new gfx.DirectionalLight(new gfx.Color(0.6, 0.6, 0.6));
        directionalLight.position.set(0, 2, 1);
        this.scene.add(directionalLight);

        // Set the background image
        const background = new gfx.Rectangle(2, 2);
        background.material.texture = new gfx.Texture('./assets/crowd.png');
        background.layer = 1;
        this.scene.add(background);

        // Create a mesh for the field
        const field = new gfx.BoxMesh(100, 1, 120);
        field.position.set(0, -0.51, 0);
        this.scene.add(field);

        // Set the field material
        const fieldMaterial = new gfx.GouraudMaterial();
        fieldMaterial.ambientColor.set(16/255, 46/255, 9/255);
        fieldMaterial.diffuseColor.copy(fieldMaterial.ambientColor);
        field.material = fieldMaterial;

        // Create a mesh for the pitch
        const pitch = new gfx.BoxMesh(80, 1, 100);
        pitch.position.set(0, -0.5, 0);
        this.scene.add(pitch);

        // Set the pitch material
        const pitchMaterial = new gfx.GouraudMaterial();
        pitchMaterial.texture = new gfx.Texture('./assets/pitch.png');
        pitch.material = pitchMaterial;
        
        // Add the car to the scene
        this.car.startPosition.z = 44;
        this.car.boundingSphere.radius = 2.25;
        this.car.reset();
        this.scene.add(this.car);

        // Add the ball to the scene
        this.ball.reset();
        this.scene.add(this.ball);


        // PART 1: 3D DRAWING
        // You should add code here to draw the 3D boundaries of the pitch
        // and a grid of boxes that form the "net" for each goal.


        // ADD PART 1 CODE HERE
        const box = new gfx.BoundingBox3();
        box.min.set(-40, -35, -50);
        box.max.set(40, 35, 50);
        const boundary = new gfx.Line3();
        boundary.createFromBox(box);
        this.scene.add(boundary);

        const goalOne = new gfx.Transform3();
        const goalTwo = new gfx.Transform3();

        for(let i = 0; i < 20; i++) {
            for(let j = 0; j < 10; j++) {
                const boxOne = new gfx.BoxMesh();
                const boxTwo = new gfx.BoxMesh();
                boxOne.position.x = i-10;
                boxTwo.position.x = i-10;
                boxOne.position.y = j;
                boxTwo.position.y = j;
                boxOne.scale.x = 0.5;
                boxTwo.scale.x = 0.5;
                boxOne.scale.y = 0.5;
                boxTwo.scale.y = 0.5;
                goalOne.add(boxOne);
                goalTwo.add(boxTwo);
            }
        }

        goalOne.position.z = 49.5;
        this.scene.add(goalOne);

        goalTwo.position.z = -49.5;
        this.scene.add(goalTwo);
    }

    update(deltaTime: number): void 
    {
        // Speed in meters/sec
        const carMaxSpeed = 80;
        const carAcceleration = 80;

        // The gravity constant should be continuously applied each frame
        const gravity = -22 * deltaTime;

        // The friction constant should be applied when the ball collides
        // with the ground, walls, or ceiling boundaries to slow it down
        let frictionSlowDown = 1 - deltaTime / 0.08;
        frictionSlowDown = gfx.MathUtils.clamp(frictionSlowDown,  0, 1);



        // Accelerate the car based on the user input vector
        if(this.inputVector.y != 0)
        {
            // The input vector controls the direction and the
            // speed is determined by the acceleration constant
            // multiplied by deltaTime
            this.car.forwardSpeed += carAcceleration * deltaTime * -this.inputVector.y;
            
            // The clamp() convenience function makes sure that
            // the speed never exceeds the min or max limit
            this.car.forwardSpeed = gfx.MathUtils.clamp(this.car.forwardSpeed, -carMaxSpeed, carMaxSpeed);
        }
        // If the user is not pressing forward or backward
        // then decelerate the car due to friction
        else
        {
            // If the car is moving forward, then the speed should decrease.
            if(this.car.forwardSpeed > 0)
            {
                this.car.forwardSpeed -= carAcceleration * deltaTime;

                // If the speed drops below a threshold, then stop it entirely
                if(this.car.forwardSpeed < 0.01)
                    this.car.forwardSpeed = 0;
            }
            // If the car is moving backwards, then the speed should increase.
            else if(this.car.forwardSpeed < 0) 
            {
                this.car.forwardSpeed += carAcceleration * deltaTime;

                // If the speed increases above a threshold, then stop it entirely
                if(this.car.forwardSpeed > -0.01)
                    this.car.forwardSpeed = 0;
            }
        }


        // PART 2: CAR DRIVING
        // You should add code here to implement car-like steering.  You will likely
        // also need to extend the movement code in the Car class to account for rotation.
        
        // **Add left and right steering with proportional turn rate
        // **Prevent car from leaving boundaries
        // ADD PART 2 CODE HERE
        this.car.rotationSpeed = this.inputVector.x * this.car.forwardSpeed * 0.1;

        if (this.car.position.x < -40 + this.car.width)
            this.car.position.x = -40 + this.car.width;
        
        if (this.car.position.x > 40 - this.car.width)
            this.car.position.x = 40 - this.car.width;

        if (this.car.position.z < -50 + this.car.width)
            this.car.position.z = -50 + this.car.width;

        if (this.car.position.z > 50 - this.car.width)
            this.car.position.z = 50 - this.car.width;

        // Update the car's velocity and position based on its forward speed
        this.car.update(deltaTime);



        // PART 3: BALL PHYSICS
        // This code defines the gravity and friction parameters used in the
        // instructor's example implementation.  You can feel free to change
        // them if you want to adjust your game mechanics and difficulty.
        // Note that these constants are already multiplied by deltaTime,
        // so they correspond to the movement in this frame only.

        // **Launch the ball through the air based on a random velocity
        // **Update the ball's velocity each time step based on the acceleration due to gravity
        // **Detect contacts between the ball and the ground and make the ball bounce in the correct direction
        // **Detect when the ball hits the walls and the ceiling and make it bounce off them too
        // Decrease the speed of the ball when it bounces due to friction
        // ADD PART 3 CODE HERE
        this.ball.velocity.y += gravity;

        if (this.ball.position.x >= 40 - this.ball.radius){
            this.ball.position.x = 40 - this.ball.radius;
            this.ball.velocity.x *= -frictionSlowDown;
        }
        if (this.ball.position.x <= -40 + this.ball.radius) {
            this.ball.position.x = -40 + this.ball.radius;
            this.ball.velocity.x *= -frictionSlowDown;
        }
        if (this.ball.position.y <= this.ball.radius) {
            this.ball.position.y = this.ball.radius;
            this.ball.velocity.y *= -frictionSlowDown;
        }
        if (this.ball.position.y >= 35 - this.ball.radius) {
            this.ball.position.y = 35 - this.ball.radius;
            this.ball.velocity.y *= -frictionSlowDown;
        }
        if (this.ball.position.z >= 50 - this.ball.radius) {
            this.ball.position.z = 50 - this.ball.radius;
            this.ball.velocity.z *= -frictionSlowDown;
        }
        if (this.ball.position.z <= -50 + this.ball.radius) {
            this.ball.position.z = -50 + this.ball.radius;
            this.ball.velocity.z *= -frictionSlowDown;
        }

        // After you change the ball's velocity, this method needs to be
        // called to compute its updated position.
        this.ball.update(deltaTime);



        // PART 4: BALL-GOAL INTERSECTIONS
        // If the ball enters a goal, then reset both the car and ball.
        // Note that a sphere is not a good representation of the rectangular
        // goal, so if you decide to use a built-in intersection test, you
        // should use axis-aligned bounding boxes and not bounding spheres.
        
        // **Reset the car to the initial position
        // **Relaunch the ball from the center of the pitch
        // ADD YOUR CODE HERE
        if (this.ball.position.z <= -48 + this.ball.radius) {
            if (this.ball.position.x < 10 && this.ball.position.x > -10 && this.ball.position.y <= 10) {
                this.ball.reset();
                this.car.reset();
            }
        }



        // PART 5: CAR-BALL COLLISIONS
        // This is the most challenging part of this assignment.  Make sure
        // to read all the information described in the README.  If you are
        // struggling with understanding the math or have questions about
        // how to implement the equations, then you should seek help from
        // the instructor or TA. 


        // **Detect that the two spheres have collided
        // **Correct the collision by adjusting the ball's position
        // **Compute the relative velocity of the ball vrel = vball - vcar
        // REflect the relative velocity about the collision normal
        // r = v - 2(v*n)n
        // Set the new velocity of the ball vball = vcar + vrel
        // ADD YOUR CODE HERE
        if (this.car.intersects(this.ball)) {
            const normal = new Vector3;
            normal.set(this.ball.position.x - this.car.position.x, this.ball.position.y - this.car.position.y, this.ball.position.z - this.car.position.z);
            normal.normalize();
            this.ball.position.add(normal);
            const relativeVelocity = new Vector3;
            relativeVelocity.set(this.ball.velocity.x - this.car.velocity.x, this.ball.velocity.y - this.car.velocity.y, this.ball.velocity.z - this.car.velocity.z);
            const dotProd = relativeVelocity.dot(normal);
            normal.multiplyScalar(1.2 * dotProd);
            relativeVelocity.subtract(normal);
            this.ball.velocity.set(relativeVelocity.x + this.car.velocity.x, relativeVelocity.y + this.car.velocity.y, relativeVelocity.z + this.car.velocity.z);
        }
    }

    // Set the x or y components of the input vector when either
    // the WASD or arrow keys are pressed.  If the space bar is
    // pressed, then reset the game.
    onKeyDown(event: KeyboardEvent): void 
    {
        if(event.key == 'w' || event.key == 'ArrowUp')
            this.inputVector.y = 1;
        else if(event.key == 's' || event.key == 'ArrowDown')
            this.inputVector.y = -1;
        else if(event.key == 'a' || event.key == 'ArrowLeft')
            this.inputVector.x = -1;
        else if(event.key == 'd' || event.key == 'ArrowRight')
            this.inputVector.x = 1;
        else if(event.key == ' ')
        {
            this.car.reset();
            this.ball.reset();
        }
    }

    // Reset the x or y components of the input vector when either
    // the WASD or arrow keys are released.
    onKeyUp(event: KeyboardEvent): void 
    {
        if((event.key == 'w' || event.key == 'ArrowUp') && this.inputVector.y == 1)
            this.inputVector.y = 0;
        else if((event.key == 's' || event.key == 'ArrowDown') && this.inputVector.y == -1)
            this.inputVector.y = 0;
        else if((event.key == 'a' || event.key == 'ArrowLeft')  && this.inputVector.x == -1)
            this.inputVector.x = 0;
        else if((event.key == 'd' || event.key == 'ArrowRight')  && this.inputVector.x == 1)
            this.inputVector.x = 0;
    }
}