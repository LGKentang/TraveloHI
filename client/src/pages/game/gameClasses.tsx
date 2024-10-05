
const gravity: any = .45;

export class Sprite {
  position: any;
  width: any;
  height: any;
  image: any;
  scale: any;
  framesMax: any;
  framesCurrent: any;
  framesElapsed: any;
  framesHold: any;
  offset: any;
  imageSrc: any;

  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
  }: {
    position: any;
    imageSrc: any;
    scale?: any;
    framesMax?: any;
    offset?: any;
  }) {
    this.position = position;
    this.width = 50;
    this.height = 150;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.framesMax = framesMax;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 5;
    this.offset = offset;
    this.imageSrc = imageSrc;
  }

  



  draw(c: any) {
    if (c) {
      c.drawImage(
        this.image,
        this.framesCurrent * (this.image.width / (this.framesMax)),
        0,
        this.image.width / (this.framesMax ),
        this.image.height,
        this.position.x - (this.offset.x ),
        this.position.y - (this.offset.y ),
        ((this.image.width / (this.framesMax)) * (this.scale)),
        this.image.height * (this.scale)
      );
    }
  }

  animateFrames() {
    this.framesElapsed++;

    if (this.framesElapsed % (this.framesHold) === 0) {
      if (this.framesCurrent < (this.framesMax) - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    }
  }

  update(c: any) {
    this.draw(c);
    this.animateFrames();
  }
}

export class Fighter extends Sprite {
  velocity: any;
  color: any;
  lastKey: any;
  attackBox: any;
  isAttacking: any;
  health: any;
  sprites: any;
  dead: any;
  mirror : any;
  attackBoxSwapped : boolean = false;
  constructor({
    position,
    velocity,
    color = 'red',
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = { offset: { x: 0, y: 0 }, width: undefined, height: undefined },
  }: {
    position: any;
    velocity: any;
    color?: any;
    imageSrc: any;
    scale?: any;
    framesMax?: any;
    offset?: any;
    sprites: any;
    attackBox?: any;
   

  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      offset,
    });

    this.velocity = velocity;
    this.width = 50;
    this.height = 150;
    this.lastKey;
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height,
    };
    this.color = color;
    this.isAttacking = false;
    this.health = 100;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 5;
    this.sprites = sprites;
    this.dead = false;
    this.mirror = false;

    for (const spriteKey in this.sprites) {
      if (this.sprites.hasOwnProperty(spriteKey)) {
        const currentSpriteKey = spriteKey as keyof typeof this.sprites;
        const currentSprite = this.sprites[currentSpriteKey];

        currentSprite.image = new Image();
        currentSprite.image.src = currentSprite.imageSrc;
      }
    }

  }
  
  update(c: any) {
    this.draw(c);
    if (!this.dead) this.animateFrames();
    if (this.mirror && !this.attackBoxSwapped) {
      this.attackBox.offset.x = -this.attackBox.offset.x;
      this.attackBoxSwapped = true; 
  }
  else if (!this.mirror && this.attackBoxSwapped) {
    this.attackBox.offset.x = -this.attackBox.offset.x;
    this.attackBoxSwapped = false;
  }
    
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y >= c.canvas.height - 40) {
      this.velocity.y = 0;
      // this.position.y = 330;
    } else this.velocity.y += gravity;
  }

  attack() {
    this.switchSprite('attack1',this.mirror);
    this.isAttacking = true;
  }

  attack2(){
    this.switchSprite('attack2',this.mirror);
    this.isAttacking = true;
  }

  serialize(type : String){
    return {
      type : type,
      position: this.position,
      velocity: this.velocity,
      lastKey : this.lastKey,
      health : this.health,
      
    };
  }

  takeHit(damage : number) {
    this.health -= damage;

    if (this.health <= 0) {
      console.log("Should be dead")
    }
      // this.switchSprite('death');
    // } else this.switchSprite('takeHit');
  }

  switchSprite(sprite: any, mirror : boolean = this.mirror) {
    // if (this.image === this.sprites.death.image) {
    //   if (this.framesCurrent === this.sprites.death.framesMax - 1) this.dead = true;
    //   return;
    // }

    if (
      this.image === this.sprites.attack1.image &&
      this.framesCurrent < this.sprites.attack1.framesMax - 1
    )
      return;
    
    // if (
    //   this.image === this.sprites.attack2.image &&
    //   this.framesCurrent < this.sprites.attack2.framesMax - 1
    // )
    //   return;

    // if (
    //   this.image === this.sprites.takeHit.image &&
    //   this.framesCurrent < this.sprites.takeHit.framesMax - 1
    // )
    //   return;
    if (mirror){
      switch(sprite) {
        case 'idle':
          // console.log(sprite)
          if (this.image !== this.sprites.idlem.image) {
            this.image = this.sprites.idlem.image;
            this.framesMax = this.sprites.idlem.framesMax;
            this.framesCurrent = 0;
          }
          break;
        case 'run':
          if (this.image !== this.sprites.runm.image) {
            this.image = this.sprites.runm.image;
            this.framesMax = this.sprites.runm.framesMax;
            this.framesCurrent = 0;
          }
          break;
        case 'jump':
          if (this.image !== this.sprites.jumpm.image) {
            this.image = this.sprites.jumpm.image;
            this.framesMax = this.sprites.jumpm.framesMax;
            this.framesCurrent = 0;
          }
          break;
        case 'fall':
          if (this.image !== this.sprites.fallm.image) {
            this.image = this.sprites.fallm.image;
            this.framesMax = this.sprites.fallm.framesMax;
            this.framesCurrent = 0;
          }
          break;
        case 'attack1':
          if (this.image !== this.sprites.attack1m.image) {
            this.image = this.sprites.attack1m.image;
            this.framesMax = this.sprites.attack1m.framesMax;
            this.framesCurrent = 0;
          }
          break;
        case 'attack2':
          if (this.image !== this.sprites.attack2m.image) {
            this.image = this.sprites.attack2m.image;
            this.framesMax = this.sprites.attack2m.framesMax;
            this.framesCurrent = 0;
          }
          break;  
        case 'takeHit':
          if (this.image !== this.sprites.takeHitm.image) {
            this.image = this.sprites.takeHitm.image;
            this.framesMax = this.sprites.takeHitm.framesMax;
            this.framesCurrent = 0;
          }
          break;
        case 'death':
          if (this.image !== this.sprites.deathm.image) {
            this.image = this.sprites.deathm.image;
            this.framesMax = this.sprites.deathm.framesMax;
            this.framesCurrent = 0;
          }
          break;
      }
    }
    else{
      switch (sprite) {
        case 'idle':
          if (this.image !== this.sprites.idle.image) {
            this.image = this.sprites.idle.image;
            this.framesMax = this.sprites.idle.framesMax;
            this.framesCurrent = 0;
          }
          break;
        case 'run':
          if (this.image !== this.sprites.run.image) {
            this.image = this.sprites.run.image;
            this.framesMax = this.sprites.run.framesMax;
            this.framesCurrent = 0;
          }
          break;
        case 'jump':
          if (this.image !== this.sprites.jump.image) {
            this.image = this.sprites.jump.image;
            this.framesMax = this.sprites.jump.framesMax;
            this.framesCurrent = 0;
          }
          break;
        case 'fall':
          if (this.image !== this.sprites.fall.image) {
            this.image = this.sprites.fall.image;
            this.framesMax = this.sprites.fall.framesMax;
            this.framesCurrent = 0;
          }
          break;
        case 'attack1':
          if (this.image !== this.sprites.attack1.image) {
            this.image = this.sprites.attack1.image;
            this.framesMax = this.sprites.attack1.framesMax;
            this.framesCurrent = 0;
          }
          break;
        case 'attack2':
        if (this.image !== this.sprites.attack2.image) {
          this.image = this.sprites.attack2.image;
          this.framesMax = this.sprites.attack2.framesMax;
          this.framesCurrent = 0;
        }
        break;
        case 'takeHit':
          if (this.image !== this.sprites.takeHit.image) {
            this.image = this.sprites.takeHit.image;
            this.framesMax = this.sprites.takeHit.framesMax;
            this.framesCurrent = 0;
          }
          break;
        case 'death':
          if (this.image !== this.sprites.death.image) {
            this.image = this.sprites.death.image;
            this.framesMax = this.sprites.death.framesMax;
            this.framesCurrent = 0;
          }
          break;
      }

    }
  }
}