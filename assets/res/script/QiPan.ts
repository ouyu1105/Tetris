const HardLevel = [
    [10, 20, 400],     // easy
    [12, 19, 600],     // normal
    [14, 22, 400],     // hard
    [16, 26, 200]      // devil+
];


// 定义块的`形状`
const BlockShape = [
    [[ 0, 0],[ 0, 1],[ 1, 0],[ 1, 1]],  // 0
    [[-1, 0],[ 0, 0],[ 1, 0],[ 2, 0]],  // 1
    [[ 0,-1],[ 0, 0],[ 0, 1],[ 0, 2]],  // 2
    [[ 0, 0],[ 0, 1],[ 1,-1],[ 1, 0]],  // 3
    [[-1,-1],[ 0,-1],[ 0, 0],[ 1, 0]],  // 4
    [[ 0,-1],[ 0, 0],[ 1, 0],[ 1, 1]],  // 5
    [[-1, 0],[ 0,-1],[ 0, 0],[ 1,-1]],  // 6
    [[-1, 0],[ 0, 0],[ 1, 0],[ 1, 1]],  // 7
    [[ 0,-1],[ 0, 0],[ 0, 1],[ 1,-1]],  // 8
    [[-1,-1],[-1, 0],[ 0, 0],[ 1, 0]],  // 9
    [[-1, 1],[ 0,-1],[ 0, 0],[ 0, 1]],  // 10
    [[-1, 0],[ 0, 0],[ 1,-1],[ 1, 0]],  // 11
    [[-1,-1],[ 0,-1],[ 0, 0],[ 0, 1]],  // 12
    [[-1, 0],[-1, 1],[ 0, 0],[ 1, 0]],  // 13
    [[ 0,-1],[ 0, 0],[ 0, 1],[ 1, 1]],  // 14
    [[ 0,-1],[ 0, 0],[ 0, 1],[ 1, 0]],  // 15
    [[-1, 0],[ 0,-1],[ 0, 0],[ 1, 0]],  // 16
    [[-1, 0],[ 0,-1],[ 0, 0],[ 0, 1]],  // 17
    [[-1, 0],[ 0, 0],[ 0, 1],[ 1, 0]]   // 18
];

// 定义块的`转换`
const BlockTrans = [
    0,  // 0 --> 0
    2,  // 1 --> 2
    1,  // 2 --> 1
    4,  // 3 --> 4
    3,  // 4 --> 3
    6,  // 5 --> 6
    5,  // 6 --> 5
    8,  // 7 --> 8
    9,  // 8 --> 9
    10, // 9 --> 10
    7,  // 10 --> 7
    12, // 11 --> 12
    13, // 12 --> 13
    14, // 13 --> 14
    11, // 14 --> 11
    16, // 15 --> 16
    17, // 16 --> 17
    18, // 17 --> 18
    15  // 18 --> 15
];

class QiPan {
    __ee: Object = {};
    __it: null | number = null;
    isPlaying: boolean = false;
    width: number;//宽
    height:number;//高
    speed:number;//速度
    level:number;//等级
    container:boolean[][];
    score:number=0;//得分
    dropping: number|null = null;
    xPos = 0;
    yPos = 0;
    debuff = 1;
    constructor (hardLevel) {
        this.width = HardLevel[hardLevel][0];
        this.height = HardLevel[hardLevel][1];  /////////number
        //this.speed =  HardLevel[hardLevel][2];
        this.speed = 0;
        this.container = Array(...Array(this.height)).map(() => Array(this.width).fill(false));
    }
    /**
     * 重置棋盘对象
     * 需注册`reset`事件，事件参数为{width, height, speed}对象
     * 故 棋盘的绘制需在该注册事件中完成
     * @param {number} hardLevel 重置难度等级，若指定hardLevel，重置为指定的难度等级(宽、高、速度改变)
     * 若不指定hardLevel，难度等级不变
     */
    reset (hardLevel:number|undefined) {
        this.__it = null;
        if (hardLevel !== undefined) {
            this.width = HardLevel[hardLevel][0];
            this.height = HardLevel[hardLevel][1];
            //this.speed = ;
        }
        this.container = Array(...Array(this.height)).map(() => Array(this.width).fill(false));
        //this.score = 0;
        this.debuff = 1;
        this.dropping = null;
        this.xPos = 0;
        this.yPos = 0;
        this.emit('reset', {
            width: this.width,
            height: this.height,
            speed: this.speed
        });
    }
    /**
     * 事件注册器
     * @param {string} en 事件名
     * @param {Function} efbk 事件处理器
     */
    on (en: string, efbk: Function) {
        (this.__ee[en] = this.__ee[en] || []).push(efbk);
    }
    /**
     * 事件触发器
     * @param {string} en 事件名
     * @param {arguments} _ 事件参数
     */
    emit (en:string, ..._:Array<any>) {
        if(!(en in this.__ee)) return;
        var _es = this.__ee[en],
            _args = Array.prototype.slice.call(arguments, 1),
            _e;
        for (_e of _es)
            _e.apply(null, _args);
    }
    /**
     * 移除下落块
     * 请勿访问&修改此函数
     * 触发`blockRm`事件 与`blockSet`类似
     */
    __blockRm () {
        if (this.dropping === null) return;
        var _rm = [],
            _bs = BlockShape[this.dropping],
            _i, _j, _bsi;
        for (_bsi of _bs) {
            _i = this.yPos + _bsi[0];
            _j = this.xPos + _bsi[1];
            if (_i >= 0 && _i < this.height && _j >= 0 && _j < this.width) {
                this.container[_i][_j] = false;
                _rm.push([_i, _j]);
            }
        }
        this.emit('blockRm', _rm);
    }
    /**
     * 设置下落块
     * 请勿访问&修改此函数
     * 触发`blockSet`事件 参数为二维数组  第一维是各被消除的点 第一维长度<=4 注意不一定是4
     * 第二维是各点横纵坐标  第二维长度总是2
     * 例如[[ 0, 4],[ 0, 5],[ 1, 5]]表示很(0, 4)、(0, 5)、(1, 5)这三个点被消除
     * 事件注册实例: 
     *  qi.on(‘blockSet’, st => {
     *      st.forEach(v => {
     *          var x = v[0], y = v[1];
     *          // 在x,y位置画上方块
     *      });
     *  });
     */
    __blockSet () {
        if (this.dropping === null) return;
        var _st = [],
            _bs = BlockShape[this.dropping],
            _i, _j, _bsi;
        for (_bsi of _bs) {
            _i = this.yPos + _bsi[0];
            _j = this.xPos + _bsi[1];
            if (_i >= 0 && _i < this.height && _j >= 0 && _j < this.width) {
                this.container[_i][_j] = true;
                _st.push([_i, _j]);
            }
        }
        this.emit('blockSet', _st);
    }
    /**
     * 更新棋盘上块的状态  触发消灭
     * 一般不用调用此函数
     * 消灭时会触发`reduce`事件 参数为二维数组 第一维为各轮消除行号数组 该维长度为连击数
     * 第二维为一轮中消除行号 该维长度为同时消除行数 
     * 在前端，需要清除这些行(推荐)  或者根据this.container重新画所有行(如果块有颜色区别的话, 无法记录颜色)
     * 例如参数为 [[9, 8, 6], [9]] 表示二连击 第一轮第9、8、6行同时消除了，上面落下导致新的第9行被消除了
     * 事件注册实例:
     *  qi.on('reduce', rd => {
     *      var add = 5;    // 底分
     *      rd.forEach(v => {
     *          add += add * Math.pow(2, v.length);
     *      });
     *      this.score += add;  // 积分
     *  });
     */
    update () {
        var _rd = [],
            _tn, _i, _ln, _fl, _lni;
        while (true) {
            _tn = [];
            for (_i = this.height - 1; _i >= 0; -- _i) {
                _ln = this.container[_i];
                _fl = true;
                for (_lni of _ln)
                    if (!_lni) {
                        _fl = false;
                        break;
                    }
                _fl && _tn.push(_i);
            }
            if (_tn.length === 0) break;
            _rd.push(_tn);
            _tn.forEach((v, i)=>{
                for (_i = v + i; _i > i; -- _i) {
                    this.container[_i] = this.container[_i - 1];
                }
                this.container[i] = Array(this.width).fill(false);
            });
        }
        _rd.length && this.emit('reduce', _rd);     // bug: 重复触发
    }
    /**
     * 下落块加速
     * 玩家自己要加速时请调用该函数
     * 如果后期加入其他加速减速相关的游戏规则，需改写此函数
     * 触发`debuffChanged`事件 无参数
     */
    down () {
        this.debuff = this.debuff === 1 ?  0.1 : 1;
        if (this.__it !== null) {
            window.clearTimeout(this.__it);
            this.__itcb();
        }
        this.emit('debuffChanged',undefined);
    }
    /**
     * 下落块变形(旋转)
     * 玩家旋转下落块时请调用该函数
     * 返回操作是否成功(地形或自身形状无法旋转)
     * 操作成功会触发`droppingChanged`事件 无参数
     */
    up () {
        if(this.dropping === null || this.dropping === 0) return false;
        var _dp = BlockTrans[this.dropping],
            _bs = BlockShape[_dp],
            _i, _j, _bsi;
        this.__blockRm();
        for (_bsi of _bs) {
            _i = this.yPos + _bsi[0];
            _j = this.xPos + _bsi[1];
            if (_i >= this.height || _j < 0 || _j >= this.width || (_i >= 0 && this.container[_i][_j])) {
                this.__blockSet();
                return false;
            }
        }
        this.dropping = _dp;
        this.__blockSet();
        this.emit('droppingChanged',undefined);
        this.update();
        return true;
    }
    /**
     * 下落块左移
     * 玩家左移下落块时请调用该函数
     * 返回操作是否成功(最左边无法左移)
     * 操作成功会触发`posChanged`事件 无参数
     */
    left () {
        if (this.xPos <= 0 || this.dropping === null) return false;
        var _bs = BlockShape[this.dropping],
            _xp = this.xPos - 1,
            _i, _j, _bsi;
        this.__blockRm();
        for (_bsi of _bs) {
            _i = this.yPos + _bsi[0];
            _j = _xp + _bsi[1];
            if (_i >= this.height || _j < 0 || _j >= this.width || (_i >= 0 && this.container[_i][_j])) {
                this.__blockSet();
                return false;
            }
        }
        this.xPos = _xp;
        this.__blockSet();
        this.emit('posChanged',undefined);
        this.update();
        this.play();
        return true;
    }
    /**
     * 下落块右移
     * 玩家右移下落块时请调用该函数
     * 返回操作是否成功(最右边无法右移)
     * 操作成功会触发`posChanged`事件 无参数
     */
    right () {
        if (this.xPos + 1 >= this.width || this.dropping === null) return false;
        var _bs = BlockShape[this.dropping],
            _xp = this.xPos + 1,
            _i, _j, _bsi;
        this.__blockRm();
        for (_bsi of _bs) {
            _i = this.yPos + _bsi[0];
            _j = _xp + _bsi[1];
            if (_i >= this.height || _j < 0 || _j >= this.width || (_i >= 0 && this.container[_i][_j])) {
                this.__blockSet();
                return false;
            }
        }
        this.xPos = _xp;
        this.__blockSet();
        this.emit('posChanged',undefined);
        this.update();
        this.play();
        return true;
    }
    /**
     * 下落块下落  由定时器触发
     * 一般情况下请不要调用此函数
     * 下落块触底会触发`bottom`事件 无参数
     * 下落块成功下落会触发`posChanged`事件 无参数
     */
    drop () {
        if (this.dropping === null) return ;
        var _bs = BlockShape[this.dropping],
            _yp = this.yPos + 1,
            _i, _j, _bsi;
        this.__blockRm();
        for (_bsi of _bs) {
            _i = _yp + _bsi[0];
            _j = this.xPos + _bsi[1];
            if (_i < 0 || _j < 0 || _j >= this.width) return; // 游戏异常
            if (_i >= this.height || this.container[_i][_j]) {
                this.__blockSet();  // 还原
                this.dropping = null;
                this.update();
                this.emit('bottom',undefined);
                return;
            }
        }
        this.yPos = _yp;
        this.__blockSet();
        this.emit('posChanged',undefined);
        // this.update();
    }
    /**
     * 新的下落块  一般在游戏开始和上一个块触底时调用词函数 后期完成服务器后dropping来自服务器  暂时可以随机生成 一定是整数且0~18
     * 成功加入新下落会触发`poschanged`事件 无参数
     * @param {number} dropping `0~18` 指定下落块的`形状`
     */
    newDropping (dropping) {
        if (this.dropping !== null) return;
        this.dropping = dropping;
        this.yPos = 0;
        this.xPos = Math.floor(this.width / 2);
        this.debuff = 1;
        var _bs = BlockShape[this.dropping],
            _i, _j, _bsi;
        
        for (_bsi of _bs) {
            _i = _bsi[0];
            _j = this.xPos + _bsi[1];
            if (_i >= 0 && this.container[_i][_j]) {
                this.over();
                return;
            }
        }
        this.__blockSet();
        this.emit('posChanged',1);  // 表示新的一行
        this.update();
        this.play();
    }
    /**
     * 定时器核心
     * 请勿访问&修改此函数
     */
    __itcb () {
        if(this.__it !== null) 
            clearTimeout(this.__it);
        if (this.isPlaying) {
            this.drop();
        }
        this.__it = window.setTimeout(() => {
            this.__itcb();
        }, this.speed * this.debuff);
    }
    /**
     * 开始&继续
     * 游戏机制触发或 者用户手动触发
     * 继续成功会触发`play`事件 无参数
     */
    play () {
        this.isPlaying = true;
        if (this.__it === null) this.__itcb();
        this.emit('play', undefined);
    }
    /**
     * 暂停
     * 游戏机制触发或 者用户手动触发
     * 暂停成功会触发`pause`事件 无参数
     */
    pause () {
        this.isPlaying = false;
        this.emit('pause', undefined);
    }
    /**
     * 结束
     * 游戏机制触发
     * 触发`over`事件 无参数
     */
    over () {
        if (this.__it !== null) {
            window.clearTimeout(this.__it);
            this.__it = null;
            this.isPlaying = false;
        }
        this.dropping = null;
        this.emit('over',undefined);
    }
}

export {
    QiPan as QiPan,
    BlockShape as BlockShape
};