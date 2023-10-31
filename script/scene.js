/**
 * 用于管理场景的类
 */
class SceneManager {
  /**
   * @constructor
   */
  constructor() {
    /**
     * 用于储存场景的对象
     * @type {object}
     */
    this.scene = {}
    /**
     * 当前活动的场景
     * @type {function}
     */
    this.activeScene = null
    /**
     * 当前场景变为活动状态时的时间戳
     * @type {number}
     */
    this.startTime = null
    /**
     * 帧计数器
     * @type {number}
     */
    this.frame = null
  }

  /**
   * 添加场景
   * @param {String} name - 场景的名称
   * @param {Function} updateFunction - 场景中的处理
   */
  add(name, updateFunction) {
    this.scene[name] = updateFunction
  }

  /**
   * 设置活动的场景
   * @param {String} name - 要设为活动的场景的名称
   */
  use(name) {
    // 检查指定的场景是否存在
    if (this.scene.hasOwnProperty(name) !== true) {
      // 如果不存在，则不做任何操作并结束
      return
    }
    // 根据名称设置活动的场景
    this.activeScene = this.scene[name]
    // 重置开始时间
    this.startTime = Date.now()
    // 重置帧计数器
    this.frame = -1
  }

  /**
   * 更新场景
   */
  update() {
    // 场景变为活动状态后的经过时间（秒）
    let activeTime = (Date.now() - this.startTime) / 1000
    // 传递经过的时间作为参数，调用 updateFunction
    this.activeScene(activeTime)
    // 帧计数器加一
    ++this.frame
  }
}