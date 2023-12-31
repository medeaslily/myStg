(() => {
  /**
   * canvas的宽
   * @type {number}
   */
  const CANVAS_WIDTH = 640
  /**
   * canvas的高
   * @type {number}
   */
  const CANVAS_HEIGHT = 480
  /**
   * 子弹最大数
   * @type {number}
   */
  const SHOT_MAX_COUNT = 10
  /**
   * 敌机实例数
   * @type {number}
   */
  const ENEMY_MAX_COUNT = 10
  /**
   * 敌机子弹实例最大数
   * @type {number}
   */
  const ENEMY_SHOT_MAX_COUNT = 50
  /**
   * 爆炸效果的最大数
   * @type {number}
   */
  const EXPLOSION_MAX_COUNT = 10

  /**
   * 包装 Canvas2D API的实用类
   * @type {Canvas2DUtility}
   */
  let util = null
  /**
   * 绘制对象 Canvas Element
   * @type {HTMLCanvasElement}
   */
  let canvas = null
  /**
   * Canvas2D API的上下文
   * @type {CanvasRenderingContext2D}
   */
  let ctx = null
  /**
   * 开始运行时的时间戳
   * @type{number}
   */
  let startTime = null
  /**
   * 场景实例
   * @type {SceneManager}
   */
  let scene = null
  /**
   * @type {Viper} - 自机实例
   */
  let viper = null
  /**
   * 敌机实例数组
   * @type {Array<Enemy>}
   */
  let enemyArray = []
  /**
   * 敌机子弹实例数组
   * @type {Array<Shot>}
   */
  let enemyShotArray = []
  /**
   * 检查按键状态的对象
   * @global
   * @type{object}
   */
  window.isKeyDown = {}
  /**
   * 子弹实例数组
   * @type {Array<Shot>}
   */
  let shotArray = []
  /**
   * 单发子弹
   * @type {Array<Shot>}
   */
  let singleShotArray = []
  /**
   * 存储爆炸效果实例的数组
   * @type {Array<Explosion>}
   */
  let explosionArray = []


  window.addEventListener('load', () => {
    util = new Canvas2DUtility(document.querySelector('#main_canvas'))
    canvas = util.canvas
    ctx = util.context

    // 进行初始化处理
    initialize()
    // 确认实例的状态
    loadCheck()
  }, false)

  function initialize() {
    let i
    // canvas大小设定
    canvas.height = CANVAS_HEIGHT
    canvas.width = CANVAS_WIDTH

    // 自机实例初始化
    viper = new Viper(ctx, 0, 0, 64, 64, './image/viper.png')
    // 进行登场场景设定
    viper.setComing(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT + 50,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT - 100
    )

    // 场景实例初始化
    scene = new SceneManager()

    // 爆炸效果实例初始化
    for (i = 0; i < EXPLOSION_MAX_COUNT; i++) {
      explosionArray[i] = new Explosion(ctx, 50.0, 15, 30.0, 0.25)
    }

    // 敌机子弹实例初始化
    for (i = 0; i < ENEMY_SHOT_MAX_COUNT; i++) {
      enemyShotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/enemy_shot.png')
    }

    // 敌机实例初始化
    for (i = 0; i < ENEMY_MAX_COUNT; i++) {
      enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, './image/enemy_small.png')
      enemyArray[i].setShotArray(enemyShotArray)
    }

    // 初始化子弹实例
    for (i = 0; i < SHOT_MAX_COUNT; i++) {
      // 双发子弹与单发子弹的数量比是1:2
      shotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/viper_shot.png')
      singleShotArray[i * 2] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png')
      singleShotArray[i * 2 + 1] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png')

      // 每个子弹实例公用一个爆炸效果数组
      shotArray[i].setExplosions(explosionArray)
      singleShotArray[i * 2].setExplosions(explosionArray)
      singleShotArray[i * 2 + 1].setExplosions(explosionArray)


      // 设定子弹的碰撞判定对象
      shotArray[i].setTargets(enemyArray)
      singleShotArray[i * 2].setTargets(enemyArray)
      singleShotArray[i * 2 + 1].setTargets(enemyArray)
    }
    // 设置自机拥有的子弹实例数组
    viper.setShotArray(shotArray, singleShotArray)

  }

  /**
   * 检查实例是否准备好
   */
  function loadCheck() {
    // 准备确认
    let ready = true
    // 使用 AND 运算检查是否准备好
    // 检测自机实例的准备情况
    ready = ready && viper.ready
    // 检查子弹实例的准备情况
    shotArray.map((v) => {ready = ready && v.ready})
    // 检查双发子弹实例的准备情况
    singleShotArray.map((v) => {ready = ready && v.ready})
    // 检查敌机实例的准备情况
    enemyArray.map((v) => {ready = ready && v.ready})
    // 检查敌机子弹的准备情况
    enemyShotArray.map((v) => {ready = ready && v.ready})

    // 所有准备工作完成后，进行下一步
    if (ready === true) {
      // 运行开始时获取时间戳
      startTime = Date.now()
      eventSetting()
      // 设置场景
      sceneSetting()
      //执行绘制
      render()
    }else{
      // 没有完成准备的场合0.1秒后再调用
      // 一直到所有图片加载完成
      setTimeout(loadCheck, 100)
    }
  }

  function render() {
    // 绘制前整个Canvas元素被填充成不透明色
    // 如果没有这个初始填充过程，
    // 之前的绘图结果会保留下来，导致不自然的绘图结果
    // 看起来好像出现了残影。
    util.drawRect(0, 0, canvas.width, canvas.height, '#333')
    ctx.globalAlpha = 1.0

    // 计算经过的时间
    let nowTime = (Date.now() - startTime) / 1000

    // 场景更新
    scene.update()

    // 自机状态更新
    viper.update()

    // 子弹状态更新
    shotArray.map((v) => {v.update()})

    // 双发子弹状态更新
    singleShotArray.map((v) => {v.update()})

    // 敌机状态更新
    enemyArray.map((v) => {v.update()})

    // 敌机子弹状态更新
    enemyShotArray.map((v) => {v.update()})

    // 爆炸效果状态更新
    explosionArray.map((v) => {v.update()})

    // 为了持续循环，进行绘制处理的递归调用
    requestAnimationFrame(render)
  }

  function eventSetting() {
    window.addEventListener('keydown', (event) => {
      isKeyDown[`key_${event.key}`] = true
    }, false)

    window.addEventListener('keyup', (event) => {
      isKeyDown[`key_${event.key}`] = false
    }, false)
  }

  /**
   * 设置场景
   */
  function sceneSetting() {
    // 添加初始场景
    scene.add('intro', (time) => {
      // 两秒后使用 invade 场景
      if (time > 2.0) {
        scene.use('invade')
      }
    })
    // 添加 invade 场景
    scene.add('invade', (time) => {
      // 如果场景的执行计数器不是0，就立即结束
      if (scene.frame === 0) {
        // 敌机从画面（上端）外向下出场
        for (let i = 0; i < ENEMY_MAX_COUNT; i++) {
          if (enemyArray[i].life <= 0) {
            let e = enemyArray[i]
            // 设置出现位置，X在画面中央，Y在画面上端外侧
            e.set(CANVAS_WIDTH / 2, -e.height, 2, 'default')
            // 设置前进方向为直下
            e.setVector(0.0, 1.0)
            break
          }
        }
      }
      // 第100帧再次使用 invade 场景
      if (scene.frame === 100) {
        scene.use('invade')
      }
    })
    // 设置初始场景
    scene.use('intro')
  }
})()