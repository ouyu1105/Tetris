const {ccclass, property} = cc._decorator;

import { md5pw } from './md5';
import { WS } from './ws';

import { Matching } from './matching';
import './matching';
import { QiPan, BlockShape } from './QiPan';

import {Login} from './ts';
import { DATA } from './Global.js';
//import {GRecord} from './record'

//定义方块颜色
const COLORS=[
    cc.Color.GREEN,
    cc.Color.YELLOW,
    cc.Color.RED,
    cc.Color.GRAY,
    cc.Color.CYAN,
    cc.Color.ORANGE
];

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

//定义等级
const LEVEL=[1,2,3,4,5,6,7,8,9,10];

//定义等级对应积分
const SCORE=[100,300,600,1000,1500,2100,2800,3600,4500,6000];

//定义等级对应速度
const SPEED=[800,750,700,640,580,510,440,360,270,150];

//定义练习模式难度
const MODEL=["hell","hard","normal","easy","match","yinxing"];
let model:string;//难度

//定义练习模式对应速度
const PSPEED=[200,300,400,500];


@ccclass
export class MatchingGame extends cc.Component {

    @property(cc.Prefab)
    endPrefab:cc.Prefab;//匹配预制体

    //倒计时时间
    countdown: number;


    //方向键开关
    isLeft = false;
    isRight = false;
    isUp = false;
    isDown = false;
    isPlaying = false;

    now: number;//当前方块
    next: number;//下一个方块
    initSpeed:number;//初始速度

    tag = false;//标记 倒计时是否结束
    
    board:QiPan = new QiPan(0);


    img: cc.SpriteFrame;
 


    onLoad()
    {
        DATA.init();

        //打开键盘监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.OnKeyDown,this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this.OnKeyUp,this);

        //设置now和next方块的形状
        let x,y;
        this.now = this.getRandomInt(0,18);
        this.next = this.getRandomInt(0,18);


        //初始化显示now、next的容器
        for (var k in DATA.information) {
            let info = DATA.information[k];
            info.nowContainer = [new cc.Node(), new cc.Node(),new cc.Node(),new cc.Node()];
            info.nextContainer = [new cc.Node(), new cc.Node(),new cc.Node(),new cc.Node()];
            info.nowContainer.forEach(node => {
                node.addComponent(cc.Sprite);
            });
            info.nextContainer.forEach(node => {
                node.addComponent(cc.Sprite);
            });
            let node = new cc.Node();
            info.scoreLabel = node.addComponent(cc.Label);
            cc.director.getScene().addChild(node);
            node.setContentSize(1280,640);
            node = new cc.Node();
            info.levelLabel = node.addComponent(cc.Label);
            cc.director.getScene().addChild(node);
            node.setContentSize(1280,640);
        }
        
        model = "match";
        this.getSpeed(model);



        //在棋盘显示方块 
        this.board.on('blockSet', st => {
            st.forEach(v => {
                y = v[0], x = v[1];
                    let node = DATA.information[DATA.uid].container[y][x];
                    node.opacity = 255;
                    node.color = DATA.information[DATA.uid].nowColor;
                });
            }
        );
        
        //下落时移除上面的方块
        this.board.on('blockRm', st => {
            st.forEach(v => {
                    y = v[0], x = v[1];
                    DATA.information[DATA.myUid].container[y][x].opacity = 0;
             });
        });

        //方块触底 结束 下一个移动
        this.board.on('bottom', ()=>{
            DATA.ws.send({desc:"newDropping"});
            
        });

        //消除方块
        let s = [0,50,150,300,950];//消除[]行对应的分数
        this.board.on('reduce', rd => {
            this.board.pause(); 
            DATA.ws.send({desc: "reduce", data: {reduce: DATA.mapToArray(rd)}});
            rd.forEach(v => {
                // v为单次行号数组
                v.forEach((row, count) => {
                    // row为行号(y)
                    for (var r = row + count; r > count; r--) {
                        // 对于第r行
                        
                        DATA.information[DATA.uid].container[r].forEach((node, x) => {
                            node.color = DATA.information[DATA.uid].container[r-1][x].color;    // 前一行的x
                            node.opacity = DATA.information[DATA.uid].container[r-1][x].opacity;
                        });
                    }
                    DATA.information[DATA.uid].container[count].forEach(node => {
                        node.opacity = 0;
                    });
                });

                DATA.information[DATA.uid].score += s[v.length];
            });

            this.board.play();
        });


        //创建棋盘精灵和now、next精灵

        var drawXStart = 397;
        for (var k in DATA.information) {

            DATA.information[k].container &&  DATA.information[k].container.forEach(v => {
                v.forEach( v => {
                        v.destroy();
                });
            });

            DATA.information[k].container = Array(...Array(20)).map(() => Array(...Array(10)).map(() => new cc.Node()));

            

            if (k == DATA.uid) 
                DATA.information[k].drawX = 37;
            else
            {
                DATA.information[k].drawX = drawXStart;
                drawXStart += 305;
            }
        }

        
        cc.assetManager.loadBundle('texture',(err, bundle) => {
            bundle.load('FinalShape',cc.SpriteFrame,(err,img)=>
            {
                this.img = img;

                for (var k in DATA.information) {
                    var info = DATA.information[k];
                    info.container.forEach((row, y) => {
                        
                        row.forEach((node, x) => {
                            node.setPosition(info.drawX+x*500/this.board.height,582-y*500/this.board.height);
                            node.addComponent(cc.Sprite);
                            node.getComponent(cc.Sprite).spriteFrame = img;
                            node.setScale(0.75);
                            node.opacity = 0;
                            cc.director.getScene().addChild(node);
                        });
                    });
                    info.nowContainer.forEach(node => {
                        node.getComponent(cc.Sprite).spriteFrame = img;
                        node.opacity = 255;
                        node.setScale(0.5);
                        cc.director.getScene().addChild(node);
                    });
                    info.nextContainer.forEach(node => {
                        node.getComponent(cc.Sprite).spriteFrame = img;
                        node.opacity = 255;
                        node.setScale(0.5);
                        cc.director.getScene().addChild(node);
                    });
                }

            });      
        });                      


        //继续
        this.board.on('play', ()=>{
            this.isPlaying = true;
        });

        //暂停
        this.board.on('pause', ()=>{
            this.isPlaying = false;
        });

         

        //结束
        this.board.on('over',()=>{
            this.board.isPlaying = false;
            DATA.ws.send({desc:"gameOver"});
            model = null;//重置难度 防止在其他场景start开始 
        })
        
        //改变的位置
        this.board.on('posChanged', (isNew) =>{
            var pos = this.board.yPos * 256 + this.board.xPos;
            if (isNew)
                pos += 256*256;

            DATA.ws.send({desc:"posChanged",data:{pos:pos}});
        })

        this.board.on('droppingChanged',() =>{
            DATA.ws.send({desc:"droppingChanged",data:{dropping:this.board.dropping}});
        })


        DATA.Game.posChangedCallback = data =>
        {
            if(data.ok && data.uid != DATA.uid)
            {
                //根据uid和next将方块画到对应位置
                //更新

                let isNew = Math.floor(data.pos / 65536);
                let DATA_UID = DATA.information[data.uid];

                isNew || BlockShape[DATA_UID.Now].forEach(v => {
                    y = v[0] + DATA_UID.y, x = v[1] + DATA_UID.x;
                    if(x>=0 && x<=9 && y>=0 && y<=19)
                    {
                        DATA_UID.container[y][x].opacity = 0;
                    }
                });
                DATA_UID.y = Math.floor(data.pos/256);
                DATA_UID.x = data.pos%256;
                BlockShape[DATA_UID.Now].forEach(v => {
                    y = v[0] + DATA_UID.y, x = v[1] + DATA_UID.x;
                    if(x>=0 && x<=9 && y>=0 && y<=19)
                    {
                        let node = DATA_UID.container[y][x];
                        node.opacity = 255;
                        node.color = DATA_UID.nowColor;
                    }
                });    
            }
        }


        //旋转改变
        DATA.Game.droppingChangedCallback = data =>
        {
            if(data.ok && data.uid != DATA.uid)
            {
                let DATA_UID = DATA.information[data.uid];
                BlockShape[DATA_UID.Now].forEach(v => {
                    
                    y = v[0] + DATA_UID.y, x = v[1] + DATA_UID.x;
                    // 清空
                    if(x>=0 && x<=9 && y>=0 && y<=19)
                    {
                        DATA_UID.container[y][x].opacity = 0;
                    }
                });
                DATA_UID.Now = data.dropping;
                BlockShape[DATA_UID.Now].forEach(v => {
                    
                    y = v[0]+DATA_UID.y, x = v[1]+DATA_UID.x;
                    if(x>=0 && x<=9 && y >= 0 && y <= 19)
                    {
                        let node = DATA_UID.container[y][x];
                        node.color = DATA_UID.nowColor;
                        node.opacity = 255;
                    }
                });
            }
        }

        //消除
        DATA.Game.reduceCallback = data =>
        {
            //cc.log(data);

            if(data.ok)
            {
                //根据消除的行数 发送给包括自己的所有人
                //解码 maptparray arraytomap
                var rd = DATA.arrayToMap(data.reduce);
                //cc.log(data.uid,rd);
                var DATA_UID = DATA.information[data.uid];

                data.uid != DATA.uid && rd.forEach(v => {
                    // v为单次行号数组
                    v.forEach((row, count) => {
                        // row为行号(y)
                        for (var r = row + count; r > count; r--) {
                            // 对于第r行
                            DATA_UID.container[r].forEach((node, x) => {
                                node.color = DATA_UID.container[r-1][x].color;    // 前一行的x
                                node.opacity = DATA_UID.container[r-1][x].opacity;
                            });
                        }
                        DATA_UID.container[count].forEach(node => {
                            node.opacity = 0;
                        });
                    });
                    DATA_UID.score += s[v.length];
                    
                    
                });
                let tempLevel = this.getLevel(DATA_UID.score);
                //cc.log(tempLevel,DATA_UID.level,data.uid,DATA.uid);
                
                //自己升级不加速
                if (tempLevel > DATA_UID.level && data.uid != DATA.uid)
                {
                    cc.log(this.board.speed);
                    //判断自己是否已经处于加速状态
                    if(DATA.information[DATA.uid].debuffTag == false)
                    {
                        this.board.speed *= 0.8;
                        cc.log(this.board.speed);
                        setTimeout(() => {
                            this.board.speed /= 0.8;
                            DATA.information[DATA.uid].debuffTag = false;
                        }, 10000);
                        DATA.information[DATA.uid].debuffTag = true;
                    }
                    else{}
                    DATA_UID.level = tempLevel;
                }
                else
                {
                    this.board.speed = SPEED[DATA_UID.level];
                }   

                DATA_UID.scoreLabel.string = DATA_UID.score.toString();
                DATA_UID.levelLabel.string = DATA_UID.level.toString();
    
            }
            
        }

        //产生新的下落的块
        DATA.Game.newDroppingCallback = data =>
        {
            if(data.ok)
            {
                var DATA_UID = DATA.information[data.uid];
                DATA_UID.Now = DATA_UID.Next;
                DATA_UID.Next = data.next;
                DATA_UID.nowColor = DATA_UID.nextColor;
                DATA_UID.nextColor = COLORS[this.getRandomInt(0,5)];
                DATA_UID.y = 0;
                DATA_UID.x = Math.floor(this.board.width / 2) - 1;
                DATA_UID.score += 5;
                //DATA_UID.level = this.getLevel(DATA_UID.score);

                if (data.uid == DATA.uid)
                {
                    this.board.newDropping(DATA_UID.Now);
                }
                
                //cc.log(data.uid,DATA_UID.Now,DATA_UID.Next);

                DATA_UID.nowContainer.forEach((node, i) => {
                    // 长度4
                    y = BlockShape[DATA_UID.Now][i][0];
                    x = BlockShape[DATA_UID.Now][i][1];
                    node.setPosition(DATA_UID.drawX+40+x*350/this.board.height,647-y*350/this.board.height);
                    // spr = node.getComponent(cc.Sprite);
                    node.color = DATA_UID.nowColor;
                });

                DATA_UID.nextContainer.forEach((node, i) => {
                    // 长度4

                    y = BlockShape[DATA_UID.Next][i][0];
                    x = BlockShape[DATA_UID.Next][i][1];
                    node.setPosition(DATA_UID.drawX+180+x*350/this.board.height,647-y*350/this.board.height);
                    // spr = node.getComponent(cc.Sprite);
                    node.color = DATA_UID.nextColor;
                });

                let tempLevel = this.getLevel(DATA_UID.score);
                //cc.log(tempLevel,DATA_UID.level,data.uid,DATA.uid);
                //自己升级不加速
                if (tempLevel > DATA_UID.level && data.uid != DATA.uid)
                {
                    cc.log(this.board.speed);
                    //判断自己是否已经处于加速状态
                    if(DATA.information[DATA.uid].debuffTag == false)
                    {
                        cc.log(this.board.speed);
                        this.board.speed *= 0.8;
                        setTimeout(() => {
                            this.board.speed /= 0.8;
                            DATA.information[DATA.uid].debuffTag = false;
                        }, 10000);
                        DATA.information[DATA.uid].debuffTag = true;
                    }
                    else{}
                    DATA_UID.level = tempLevel;
                }
                else
                {
                    this.board.speed = SPEED[DATA_UID.level];
                }    

                DATA_UID.scoreLabel.string = DATA_UID.score.toString();
                DATA_UID.levelLabel.string = DATA_UID.level.toString();

            }
            else{}
        }

        //结束
        DATA.Game.gameOverCallback = data =>
        {
            if(data.ok)
            {
                //根据uid判断是谁结束 在对应界面画出gameover
                cc.log("gameover:"+data.uid);
                //所有人都结束
                if(data.uid == 0 )
                {
                    let score:Array<number> = new Array<number>();
                    let id:Array<number> = new Array<number>();

                    //对每个人的分数进行排序 然后显示信息
                    for(let k in DATA.information)
                    {
                        let info = DATA.information[k];
                        score.push(info.score);
                        id.push(info.id);
                    }

                    //对score对应id冒泡排序
                    let tempScore,tempId;
                    for(let i=0;i<score.length-1;i++)
                    {
                        for(let j=0;j<score.length-1-i;j++)
                        {
                            if(score[j]<score[j+1])
                            {
                                tempScore = score[j+1];
                                score[j+1] = score[j];
                                score[j] = tempScore;
                                
                                tempId = id[j+1];
                                id[j+1] = id[j];
                                id[j] = tempId;
                            }
                        }
                    }
 
                    for(let i=0;i<4;i++)
                    {
                        let node = new cc.Node();
                        let idLabel = node.addComponent(cc.Label);
                        idLabel.string = id[i].toString();
                        cc.log(id[i]);
                        idLabel.node.x = 440;
                        idLabel.node.y = 510 - 90*i;
                        idLabel.fontSize = 35;
                        idLabel.node.color = cc.color(255,255,255);
                        cc.director.getScene().addChild(node);

                        let node1 = new cc.Node();
                        let LevelLabel = node1.addComponent(cc.Label);
                        LevelLabel.string = DATA.information[id[i]].level;
                        LevelLabel.node.x = 640;
                        LevelLabel.node.y = 510 - 90*i;
                        LevelLabel.fontSize = 35;
                        LevelLabel.node.color = cc.color(255,255,255);
                        cc.director.getScene().addChild(node1);

                        let node2 = new cc.Node();
                        let ScoreLabel = node2.addComponent(cc.Label);
                        ScoreLabel.string = score[i].toString();
                        ScoreLabel.node.x = 860;
                        ScoreLabel.node.y = 510 - 90*i;
                        ScoreLabel.fontSize = 35;
                        ScoreLabel.node.color = cc.color(255,255,255);
                        cc.director.getScene().addChild(node2);
                    }
                    for (var k in DATA.information) {

                        DATA.information[k].container &&  DATA.information[k].container.forEach(v => {
                            v.forEach( v => {
                                    v.destroy();
                            });
                        });
                    }

                    for (var k in DATA.information) {
                        DATA.information[k].nowContainer &&  DATA.information[k].nowContainer.forEach(v => {
                            v.destroy();
                        });
                        DATA.information[k].nextContainer &&  DATA.information[k].nextContainer.forEach(v => {    
                            v.destroy();
                        });

                    }
                    

                    cc.find("Canvas/EndLayout").active = true;

                }
            }
            else{}
        }

        this.board.reset(undefined);
    }

    start()
    {
        //速度大于0再开始 
        if(model != null)
        {
            let node5 = new cc.Node();
            let timeLabel = node5.addComponent(cc.Label);
            cc.director.getScene().addChild(node5);
            this.countdown = 3;//倒计时时间
            if(this.countdown >= 0)
            {
                //计时器 间隔1s
                this.schedule(function()
                {
                   this.DoingSomething(timeLabel);
                },1);
            }
            this.drawBoard();

        }
    }

    update(dt)
    {

    }

    
    //倒计时算法
    DoingSomething(timeLabel)
    {
        if(this.countdown >= 1)
        {
            this.countdown--;
            timeLabel.string = this.countdown.toString();
            timeLabel.node.x = 640;
            timeLabel.node.y = 380;
            timeLabel.fontSize = 55; 
            timeLabel.node.color = cc.color(255,255,255); 

            if(this.countdown == 0)
            {       
                timeLabel.destroy();//倒计时结束 销毁文本节点
                this.tag = true;
                //第一次显示所有人上方的now next
                let x,y,spr;
                
                for(let k in DATA.information)
                {
                    let info = DATA.information[k];

                    info.nowContainer.forEach((node, i) => {
                        // 长度4
                        y = BlockShape[info.Now][i][0];
                        x = BlockShape[info.Now][i][1];
                        node.setPosition(info.drawX+50+x*350/this.board.height,642-y*350/this.board.height);
                        node.color = info.nowColor;
                    });

                    info.nextContainer.forEach((node, i) => {
                        // 长度4
                        y = BlockShape[info.Next][i][0];
                        x = BlockShape[info.Next][i][1];
                        node.setPosition(info.drawX+180+x*350/this.board.height,642-y*350/this.board.height);
                        node.color = info.nextColor;
                    });

                    info.scoreLabel .string = "0";
                    info.scoreLabel .fontSize = 30;
                    info.scoreLabel .node.x = 180 + info.drawX;
                    info.scoreLabel .node.y = 30;
                    info.scoreLabel .node.color = cc.color(255,255,255);
        
                    //计算等级并显示
                    info.levelLabel.string = "1";
                    info.levelLabel.fontSize = 30;   
                    info.levelLabel.node.x = 30 + info.drawX;
                    info.levelLabel.node.y = 30;
                    info.levelLabel.node.color = cc.color(255,255,255);
                } 
                this.board.newDropping(DATA.information[DATA.uid].Now);
            }
        }
    }

    //键盘按下时打开开关
    OnKeyDown(event)
    {
        switch(event.keyCode)
        {
            case cc.macro.KEY.left:
                this.isLeft = true;
                this.board.left();
                break;
            case cc.macro.KEY.right:
                this.isRight = true;
                this.board.right();
                break;
            case cc.macro.KEY.up:
                this.isUp = true;
                this.board.up();
                break;
            case cc.macro.KEY.down:
                this.isDown = true;
                this.board.down();
                break;
            case cc.macro.KEY.space:

                if(this.isPlaying == true)
                {
                    this.board.pause();
                    // 10s 开始play
                }
                else if(this.isPlaying == false)
                {
                    this.board.play();
                }
                else
                {
                    
                }
                break;
            case cc.macro.KEY.escape:
                break;
        }
    }

    //键盘松开时关闭开关
    OnKeyUp(event)
    {
        switch(event.keyCode)
        {
            case cc.macro.KEY.left:
                 this.isLeft=false;
                 break;
            case cc.macro.KEY.right:
                 this.isRight=false;
                 break;
            case cc.macro.KEY.up:
                 this.isUp=false;
                 break;
            case cc.macro.KEY.down:
                 this.isDown=false;
                 break;
        }
    }

    //关闭键盘监听
    onDestroy()
    {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN,this.OnKeyDown,this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,this.OnKeyUp,this);
    }

    //画界面
    drawBoard()
    {
        let ctx = this.node.getComponent(cc.Graphics);

        //画竖线
        for(let i = 0;i <= this.board.width;i++)
        {
            ctx.moveTo(-615+250/this.board.width*i,-265);
            ctx.lineTo(-615+250/this.board.width*i,235);
            ctx.fill();
            ctx.stroke();
        }

        //画横线
        for(let i = 0;i <= this.board.height;i++)
        {
            ctx.moveTo(-615,235-250/this.board.width*i);
            ctx.lineTo(-365,235-250/this.board.width*i);
            ctx.fill();
            ctx.stroke();
        }

        for(let i = 0;i < 3;i++)
        {
            for(let j = 0;j <= this.board.width;j++)
            {
                ctx.moveTo(-255+250/this.board.width*j+305*i,-265);
                ctx.lineTo(-255+250/this.board.width*j+305*i,235);
                ctx.fill();
                ctx.stroke();
            }
        }

        for(let i = 0;i < 3;i++)
        {
            for(let j = 0;j <= this.board.height;j++)
            {
                ctx.moveTo(-255+305*i,235-250/this.board.width*j);
                ctx.lineTo(-5+305*i,235-250/this.board.width*j);
                ctx.fill();
                ctx.stroke();
            }
        }



    }



    //获取范围内的随机整数
    getRandomInt(min:number,max:number)
    {  
        let Range = max - min;  
        let Rand = Math.random();  
        return(min + Math.round(Rand * Range));  
    }

    //得到分数对应等级
    getLevel(score):number
    {
        if(score < SCORE[0])
        {
            //this.board.level = 1;
            return 1;
        }
        else if(score < SCORE[1])
        {
           // this.board.level = 2;
            return 2;
        }
        else if(score < SCORE[2])
        {
           // this.board.level = 3;
            return 3;
        }
        else if(score < SCORE[3])
        {
           // this.board.level = 4;
            return 4;
        }
        else if(score < SCORE[4])
        {
            //this.board.level = 5;
            return 5;
        }
        else if(score < SCORE[5])
        {
            //this.board.level = 6;
            return 6;
        }
        else if(score < SCORE[6])
        {
            //this.board.level = 7;
            return 7;
        }
        else if(score < SCORE[7])
        {
            //this.board.level = 8;
            return 8;
        }
        else if(score < SCORE[8])
        {
            //this.board.level = 9;
            return 9;
        }
        else if(score < SCORE[9])
        {
            //this.board.level=10;
            return 10;
        }
    }

    //获取模式对应速度
    getSpeed(model:string)
    {
        switch(model)
        {
            case "hell":
                this.board.speed = PSPEED[0];
                break;
            case "hard":
                this.board.speed = PSPEED[1];
                break;
            case "normal":
                this.board.speed = PSPEED[2];
                break;
            case "easy":
                this.board.speed = PSPEED[3];
                break;
            case "match":
                this.board.speed = SPEED[0];
                break;
            case "yinxing":
                this.board.speed = 800;
                break;
        }
    }

    backToHall()
    {
        cc.director.loadScene("GameHallView",this.showID);
        model = null;
    }

    
    showID()
    {
        let node = new cc.Node();
        let idLabel = node.addComponent(cc.Label);
        cc.director.getScene().addChild(node);
        node.setContentSize(100,100);;
        idLabel.string = "ID:"+DATA.uid;
        idLabel.fontSize = 40;   
        idLabel.node.x = 190;
        idLabel.node.y = 630;
        idLabel.node.color = cc.color(255,255,255);
    }



    // update (dt) {}
}


