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
  constructor(ctx, x, y, w, h, life, image) {
    this.ctx = ctx
    this.position = new Position(x, y)
    this.width = w
    this.height = h
    this.life = life
    this.image = image
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
}

class Viper extends Character {
  constructor(ctx, x, y, w, h, image) {
    super(ctx, x, y, w, h, 0, image)
    /**
     * viper が登場中かどうかを表すフラグ
     * @type {boolean}
     */
    this.isComing = false;
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
   */
  setShotArray(shotArray) {
    this.shotArray = shotArray
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
      if(window.isKeyDown.key_ArrowLeft === true){
        this.position.x -= this.speed; // アローキーの左
      }
      if(window.isKeyDown.key_ArrowRight === true){
        this.position.x += this.speed; // アローキーの右
      }
      if(window.isKeyDown.key_ArrowUp === true){
        this.position.y -= this.speed; // アローキーの上
      }
      if(window.isKeyDown.key_ArrowDown === true){
        this.position.y += this.speed; // アローキーの下
      }
      // 检查移动后的位置是否脱离屏幕并修正
      let canvasWidth = this.ctx.canvas.width
      let canvasHeight = this.ctx.canvas.height
      let tx = Math.min(Math.max(this.position.x, 0), canvasWidth)
      let ty = Math.min(Math.max(this.position.y, 0), canvasHeight)
      this.position.set(tx, ty)
    }

    // キーの押下状態を調べてショットを生成する
    if(window.isKeyDown.key_z === true){
      // ショットの生存を確認し非生存のものがあれば生成する
      for(let i = 0; i < this.shotArray.length; ++i){
        // 非生存かどうかを確認する
        if(this.shotArray[i].life <= 0){
          // 自機キャラクターの座標にショットを生成する
          this.shotArray[i].set(this.position.x, this.position.y);
          // ひとつ生成したらループを抜ける
          break;
        }
      }
    }

    this.draw()
  }
}

class Shot extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath)
  }

  set(x, y) {
    // 移动shot到登场位置
    this.position.set(x, y)
    this.life = 1
  }

  update() {
    // 如果shot的life为0及以下的场合
    if (this.life <= 0) {return}
    // 如果shot移动到画面(上端)外，life设定为0
    if (this.position.y + this.height < 0) {
      this.life = 0
    }
    // 向上移动
    this.position.y -= this.speed
    // 绘制shot
    this.draw()
  }
}