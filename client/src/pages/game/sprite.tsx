export interface Position {
  x: number;
  y: number;
}

export class Sprite {
  position: Position;
  scale: number;
  frameCount: number;
  frameIndex: number;
  frameElapsed: number;
  frameHold: number;
  image: HTMLImageElement;

  constructor({
    position,
    imageSrc,
    frameCount,
    scale = 1,
  }: {
    position: Position;
    imageSrc: string;
    frameCount: number;
    scale?: number;
  }) {
    this.position = position;
    this.scale = scale || 1;
    this.frameCount = frameCount;
    this.frameIndex = 0;
    this.frameElapsed = 0;
    this.frameHold = 5;

    this.image = new Image();
    this.image.src = imageSrc;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.image,
      this.frameIndex * (this.image.width / this.frameCount),
      0,
      this.image.width / this.frameCount,
      this.image.height,
      this.position.x,
      this.position.y,
      (this.image.width / this.frameCount) * this.scale,
      this.image.height * this.scale
    );
  }

  animate() {
    this.frameIndex =  (this.frameIndex + 1) % this.frameCount;
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
    this.frameElapsed++;
    if (this.frameElapsed % this.frameHold == 0) {
      this.animate();
    }
  }
}
