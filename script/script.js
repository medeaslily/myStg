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
   * @type {Viper} - 自机实例
   */
  let viper = null
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
    canvas.height = CANVAS_HEIGHT
    canvas.width = CANVAS_WIDTH

    viper = new Viper(ctx, 0, 0, 64, 64, './image/viper.png')
    // 进行登场场景设定
    viper.setComing(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT + 50,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT - 100
    )

    // 初始化子弹实例
    for (let i = 0; i < SHOT_MAX_COUNT; i++) {
      shotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/viper_shot.png')
    }
    // 设置自机拥有的子弹实例数组
    viper.setShotArray(shotArray)
  }

  /**
   * 检查实例是否准备好
   */
  function loadCheck() {
    // 准备确认
    let ready = true
    // 使用 AND 运算检查是否准备好
    ready = ready && viper.ready
    // 还要检查子弹的准备情况
    shotArray.map((v) => {
      ready = ready && v.ready
    })

    // 所有准备工作完成后，进行下一步
    if (ready === true) {
      // 运行开始时获取时间戳
      startTime = Date.now()
      eventSetting()
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

    // 自机实例的状态更新
    viper.update()

    // 子弹的状态更新
    shotArray.map((v) => {v.update()})

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
})()