import { Sprite, Position } from "./sprite";

class Fighter extends Sprite {
    velocity: Position;

    constructor({
        position,
        imageSrc,
        frameCount,
        scale,
    }: {
        position: Position;
        imageSrc: string;
        frameCount: number;
        scale: number;
        velocity: Position; 
    }) {
        super({ position, imageSrc, frameCount, scale });
        this.velocity = {
            x: 0,
            y: 0
        };
    }

    update(ctx: CanvasRenderingContext2D) {
        super.update(ctx);

        if (this.position.y + this.image.height + this.velocity.y >= ctx.canvas.height - 135) {
            this.velocity.y = 0;
        } else {
            this.velocity.y += 0.2;
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    jump() {
        this.position.y -= 10;
    }
}
