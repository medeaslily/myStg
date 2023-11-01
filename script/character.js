/**
 * @constructor
 * @param{number}x - x坐标
 * @param{number}y - y坐标
 */
class Position {
  constructor(x, y) {
    /**
     * @type{number} - x坐标
     */
    this.x = null
    /**
     * @type{number} - y坐标
     */
    this.y = null
    // 更符合面向对象的编程思想
    this.set(x, y)
  }

  set(x, y) {
    if (x != null) {
      this.x = x
    }
    if (y != null) {
      this.y = y
    }
  }

  /**
   * 対象の Position クラスのインスタンスとの距離を返す
   * @param {Position} target - 距離を測る対象
   */
  distance(target) {
    let x = this.x - target.x
    let y = this.y - target.y
    return Math.sqrt(x * x + y * y)
  }
}

/**
 * @constructor
 * @param {CanvasRenderingContext2D} ctx - 描画な どに 利用する 2Dコ ンテ キ ス ト
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {number} w - 幅
 * @param {number} h - 高さ
 * @param {number} life - キ ャ ラ ク タ ーのラ イ フ （生存フ ラ グ を 兼ねる ）
 * @param {Image} image - キ ャ ラ ク タ ーの画像
 */
class Character {
  constructor(ctx, x, y, w, h, life, imagePath) {
    this.ctx = ctx
    this.position = new Position(x, y)
    /**
     * @type {Position}
     */
    this.vector = new Position(0.0, -1.0)
    /**
     * 绘制使用的坐标系旋转角度
     * @type {number}
     */
    this.angle = 270 * Math.PI / 180
    this.width = w
    this.height = h
    this.life = life
    this.ready = false
    this.image = new Image()
    this.image.addEventListener('load', () => {
      this.ready = true
    }, false)
    this.image.src = imagePath
  }

  /**
   * 设定子弹移动方向
   * @param {number} x - X方向的移动量
   * @param {number} y - Y方向的移动量
   */
  setVector(x, y) {
    this.vector.set(x, y)
  }

  /**
   * 设置坐标系旋转的弧度以及对应的向量
   * @param angle
   */
  setVectorFromAngle(angle) {
    this.angle = angle
    let sin = Math.sin(angle)
    let cos = Math.cos(angle)
    this.vector.set(cos, sin)
  }

  draw() {
    let offsetX = this.width / 2
    let offsetY = this.height / 2

    this.ctx.drawImage(
        this.image,
        this.position.x - offsetX, // 以角色的中心作为定位点
        this.position.y - offsetY,
        this.width,
        this.height)
  }

  rotationDraw() {
    this.ctx.save()
    this.ctx.translate(this.position.x, this.position.y)
    this.ctx.rotate(this.angle - Math.PI * 1.5)

    let offsetX = this.width / 2
    let offsetY = this.height / 2

    this.ctx.drawImage(
        this.image,
        -offsetX, // 考虑到原点在自机中心点，使图像中心在自机中心
        -offsetY,
        this.width,
        this.height
    )

    this.ctx.restore()
  }
}

class Viper extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath)
    /**
     * viper が登場中かどうかを表すフラグ
     * @type {boolean}
     */
    this.isComing = false
    /**
     * 登場演出を開始した際のタイムスタンプ
     * @type {number}
     */
    this.comingStart = null
    /**
     * 登場演出を開始する座標
     * @type {Position}
     */
    this.comingStartPosition = null
    /**
     * 登場演出を完了とする座標
     * @type {Position}
     */
    this.comingEndPosition = null
    /**
     * 自身移动的速度 （update一次的移动量）
     * @type{number}
     */
    this.speed = 3
    /**
     * 它自身（Viper）拥有子弹数组
     * @param{Array<Shot>}
     */
    this.shotArray = null
    /**
     * 双发子弹数组
     * @type {Array<Shot>}
     */
    this.singleShotArray = null
    /**
     * 子弹检查计数器
     * @type {number}
     */
    this.shotCheckCounter = 0
    /**
     * 子弹间隔
     * @type {number}
     */
    this.shotInterval = 10
  }

  setComing(startX, startY, endX, endY) {
    this.isComing = true
    this.comingStart = Date.now()
    this.position.set(startX, startY)
    // 登場開始位置を設定する
    this.comingStartPosition = new Position(startX, startY);
    this.comingEndPosition = new Position(endX, endY)
  }

  /**
   * 设置子弹
   * @param {Array<Shot>}shotArray - 设置自身的子弹数组
   * @param {Array<Shot>} singleShotArray - 设置双发子弹数组
   */
  setShotArray(shotArray, singleShotArray) {
    this.shotArray = shotArray
    this.singleShotArray = singleShotArray
  }

  update() {
    // 获取现在的时间
    let justTime = Date.now()

    if (this.isComing === true) {
      // 登场开始经过的时间
      let comingTime = (justTime - this.comingStart) / 1000
      // 随着时间的推移，角色会越来越向上前进
      let y = this.comingStartPosition.y - comingTime * 50
      // 达到最大上移距离 解除“登场中”的状态
      if (y <= this.comingEndPosition.y) {
        this.isComing = false
        y = this.comingEndPosition.y // 有可能超过设定的位置，所以重新设置位置。
      }
      // 更新坐标
      this.position.set(this.position.x, y)

      // 仅当 justTime 除以 100 时余数小于 50 时才使其半透明
      // 用于闪烁半透明
      if (justTime % 100 < 50) {
        this.ctx.globalAlpha = 0.5
      }
    } else {
      if (window.isKeyDown.key_ArrowLeft === true) {
        this.position.x -= this.speed; // アローキーの左
      }
      if (window.isKeyDown.key_ArrowRight === true) {
        this.position.x += this.speed; // アローキーの右
      }
      if (window.isKeyDown.key_ArrowUp === true) {
        this.position.y -= this.speed; // アローキーの上
      }
      if (window.isKeyDown.key_ArrowDown === true) {
        this.position.y += this.speed; // アローキーの下
      }
      // 检查移动后的位置是否脱离屏幕并修正
      let canvasWidth = this.ctx.canvas.width
      let canvasHeight = this.ctx.canvas.height
      let tx = Math.min(Math.max(this.position.x, 0), canvasWidth)
      let ty = Math.min(Math.max(this.position.y, 0), canvasHeight)
      this.position.set(tx, ty)

      // 通过检查按键来更新子弹状态
      if (window.isKeyDown.key_z === true) {
        let i
        // 计数器为0及以上允许生成子弹
        if (this.shotCheckCounter >= 0) {
          // 检查子弹生存状态并生成任何非生存的子弹
          for (i = 0; i < this.shotArray.length; ++i) {
            // 生成尚未出现在屏幕上的子弹
            if (this.shotArray[i].life <= 0) {
              // 以自机坐标设定生存状态的子弹
              this.shotArray[i].set(this.position.x, this.position.y)
              // 设定自机子弹的攻击力
              this.shotArray[i].setPower(2)
              // 计数器设置为负间隔
              this.shotCheckCounter = -this.shotInterval
              // 避免所有的子弹在一瞬间生成，无法逐个按顺序发射子弹
              break;
            }
          }
          // 生成双发子弹
          for (i = 0; i < this.singleShotArray.length; i += 2) {
            // 生成尚未出现在屏幕上的子弹
            if (this.singleShotArray[i].life <= 0 && this.singleShotArray[i + 1].life <= 0) {
              // 以自机坐标设定生存状态的子弹
              let radCw = 280 * Math.PI / 180
              let radCCW = 260 * Math.PI / 180

              this.singleShotArray[i].set(this.position.x, this.position.y)
              this.singleShotArray[i].setVectorFromAngle(radCw)  // 右上方向
              this.singleShotArray[i + 1].set(this.position.x, this.position.y)
              this.singleShotArray[i + 1].setVectorFromAngle(radCCW)  // 右上方向
              // 计数器设置为负间隔
              this.shotCheckCounter = -this.shotInterval
              // 避免所有的子弹在一瞬间生成，无法逐个按顺序发射子弹
              break;
            }
          }
        }
      }
      // 计数器每帧递增
      ++this.shotCheckCounter
    }

    this.draw()
    // 为了稳妥起见，将全局alpha状态恢复原状
    this.ctx.globalAlpha = 1.0
  }
}

class Shot extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath)
    /**
     * 自身移动的速度（update一次的移动量）
     * @type {number}
     */
    this.speed = 7
    /**
     * 子弹的攻击力
     * @type {number}
     */
    this.power = 1
    /**
     * 储存与其自身进行碰撞判定的目标
     * @type {Array<Character>}
     */
    this.targetArray = []
  }

  set(x, y) {
    // 将子弹移至起始位置
    this.position.set(x, y)
    // 将子弹设为生存状态
    this.life = 1
  }

  /**
   * 设定子弹的攻击力
   * @param {number} [power] - 设定攻击力
   */
  setPower(power) {
    if (power != null && power > 0) {
      this.power = power
    }
  }

  /**
   * 设定与子弹进行冲突判定的对象
   * @param {Array<Character>} [targets] - 含有冲突判定对象的数组
   */
  setTargets(targets) {
    if (targets != null
        && Array.isArray(targets) === true
        && targets.length > 0) {
      this.targetArray = targets
    }
  }

  /**
   * 设置子弹的速度
   * @param {number} [speed] - 设定速度
   */
  setSpeed(speed) {
    if (speed != null && speed > 0) {
      this.speed = speed
    }
  }

  update() {
    // 如果子弹是非生存状态的场合，不做任何绘制
    if (this.life <= 0) {
      return
    }
    // 如果子弹移动到画面(上端)外，life设定为0
    if (this.position.y + this.height < 0) {
      this.life = 0
    }
    // 使用vector进行移动
    this.position.x += this.vector.x * this.speed
    this.position.y += this.vector.y * this.speed

    // 进行子弹和目标的碰撞判定
    this.targetArray.map((v) => {
      // 忽略生命值为 0 或以下的自身或目标
      if (this.life <= 0 || v.life <= 0) {return}
      // 测量自身位置和目标的距离
      let dist = this.position.distance(v.position)
      // 如果接近到自身和目标宽度的1/4的距离，就认为发生了碰撞
      if (dist <= (this.width + v.width) / 4) {
        v.life -= this.power
        this.life = 0
      }
    })

    // 考虑到坐标系的旋转进行绘制
    this.rotationDraw();
  }
}

class Enemy extends Character {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @param {number} w - 幅
   * @param {number} h - 高さ
   * @param {String} imagePath - キャラクター用の画像のパス
   */
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath)
    /**
     * 类型
     * @type {string}
     */
    this.type = 'default'
    /**
     * 帧计数器
     * @type {number}
     */
    this.frame = 0
    /**
     * 自身的移动速度（update 一次的移动量）
     * @type {number}
     */
    this.speed = 3
    /**
     * 敌机拥有的子弹实例数组
     * @type {Array<Shot>}
     */
    this.shotArray = null
  }

  set(x, y, life = 1, type = 'default') {
    // 敌机移动到的登场开始位置
    this.position.set(x, y)
    // 设置敌机大于0的生命值
    this.life = life
    // 设置敌机类型
    this.type = type
    // 重置敌机帧数
    this.frame = 0
  }

  /**
   * 设置子弹
   * @param {Array<Shot>} shotArray - 设置子弹数组到自身
   */
  setShotArray(shotArray) {
    this.shotArray = shotArray
  }

  /**
   * 发射从自身开始,指定方向的子弹
   * @param {number} [x=0.0] - 移动方向向量的X元素
   * @param {number} [y=1.0] - 移动方向向量的Y元素
   */
  fire(x = 0.0, y = 1.0) {
    // 生成非生存状态的子弹
    for (let i = 0; i < this.shotArray.length; i++) {
      // 非生存状态确认
      if (this.shotArray[i].life <= 0) {
        // 在敌机坐标处生成子弹
        this.shotArray[i].set(this.position.x, this.position.y)
        this.shotArray[i].setSpeed(5.0)
        // 设置子弹的移动方向（默认真下）
        this.shotArray[i].setVector(x, y)
        // 一次生成一发子弹
        break
      }
    }
  }

  update() {
    if (this.life <= 0) {
      return
    }
    // 根据类型改变行为
    // 也改变使生命值变为0的条件
    switch (this.type) {
        // 默认类型只是直接按设定的方向前进
      case 'default':
      default:
        if (this.frame === 50) {
          this.fire()
        }
        // 敌机沿 vector 移动
        this.position.x += this.vector.x * this.speed
        this.position.y += this.vector.y * this.speed
        // 移动到画面（下端）外生命设0
        if (this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0
        }
        break
    }
    // 进行绘制（目前不需要旋转，所以直接绘制）
    this.draw()
    // 自身的帧计数器累加
    ++this.frame
  }
}