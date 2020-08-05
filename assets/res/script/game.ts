const {ccclass, property} = cc._decorator;

import { md5pw } from './md5';
import { WS } from './ws';

import { Matching } from './matching';
import './matching';
import { QiPan, BlockShape } from './QiPan';

import {Login} from './ts';
import { DATA } from './Global.js';


//定义方块颜色
const COLORS=[
    cc.Color.GREEN,
    cc.Color.YELLOW,
    cc.Color.RED,
    cc.Color.MAGENTA,
    cc.Color.CYAN,
    cc.Color.ORANGE
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
let tempModel:string;//存储难度

let activeContainer:boolean[][];
//定义练习模式对应速度
const PSPEED=[200,300,400,500];


@ccclass
export class Game extends cc.Component {

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

    container: cc.Node[][];//存储棋盘精灵
    nowContainer: cc.Node[];//存储now精灵
    nextContainer: cc.Node[];//存储next精灵
    COLOR: cc.Color = COLORS[this.getRandomInt(0,5)];//随机生成当前方块的颜色
    NEXTCOLOR: cc.Color = COLORS[this.getRandomInt(0,5)];//随机生成下一个方块的颜色
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

        this.nowContainer = [new cc.Node(), new cc.Node(),new cc.Node(),new cc.Node()];
        this.nextContainer = [new cc.Node(), new cc.Node(),new cc.Node(),new cc.Node()];
        this.getSpeed(model);
        let node = new cc.Node();
        let node1 = new cc.Node();
        let ScoreLabel = node.addComponent(cc.Label);
        let LevelLabel = node1.addComponent(cc.Label);
        cc.director.getScene().addChild(node);
        cc.director.getScene().addChild(node1);
        node.setContentSize(1280,640);
        node1.setContentSize(1280,640);

        //速度大于0再开始 
        if(model != null)
        {
            ScoreLabel.string = "0";
            ScoreLabel.fontSize = 30;
            ScoreLabel.node.x = 560;
            ScoreLabel.node.y = 50;
            ScoreLabel.node.color = cc.color(255,255,255);
    
            LevelLabel.string = "1";
            LevelLabel.fontSize = 30;   
            LevelLabel.node.x = 700;
            LevelLabel.node.y = 50;
            LevelLabel.node.color = cc.color(255,255,255);

            let node5 = new cc.Node();
            let timeLabel = node5.addComponent(cc.Label);
            timeLabel.node.x = 640;
            timeLabel.node.y = 380;
            timeLabel.fontSize = 55; 
            timeLabel.string = '3';
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


        //在棋盘显示方块 
        this.board.on('blockSet', st => {
            st.forEach(v => {
                y = v[0], x = v[1];
                let spr = this.container[y][x].getComponent(cc.Sprite);
                spr.node.opacity = 255;
                spr.node.color = this.COLOR;
                });
            }
        );
        
        //下落时移除上面的方块
        this.board.on('blockRm', st => {
            st.forEach(v => {
                 y = v[0], x = v[1];
                 let spr = this.container[y][x].getComponent(cc.Sprite);
                 spr.node.opacity = 0;
             });
        });

        //方块触底 结束 下一个移动
        this.board.on('bottom', ()=>{
            this.COLOR = this.NEXTCOLOR;
            this.NEXTCOLOR = COLORS[this.getRandomInt(0,5)];
            this.now = this.next;
            this.next = this.getRandomInt(0,18);
            this.board.newDropping(this.now);
            for(let i=0;i<4;i++)
            {
                y = BlockShape[this.now][i][0];
                x = BlockShape[this.now][i][1];
                this.nowContainer[i].setPosition(570+x*350/this.board.height,659-y*350/this.board.height);
                let spr = this.nowContainer[i].getComponent(cc.Sprite);
                spr.node.opacity = 255;
                spr.node.color = this.COLOR; 

                y = BlockShape[this.next][i][0];
                x = BlockShape[this.next][i][1];
                this.nextContainer[i].setPosition(702+x*350/this.board.height,659-y*350/this.board.height);
                spr = this.nextContainer[i].getComponent(cc.Sprite);
                spr.node.opacity = 255;
                spr.node.color = this.NEXTCOLOR;       
            }
            //每个方块+5分
            this.board.score += 5;

            //显示分数
            ScoreLabel.string = this.board.score.toString();
            ScoreLabel.fontSize = 30;
            ScoreLabel.node.x = 560;
            ScoreLabel.node.y = 50;
            ScoreLabel.node.color = cc.color(255,255,255);

            this.getLevel(this.board.score);
            LevelLabel.string = this.board.level.toString();
            LevelLabel.fontSize = 30;   
            LevelLabel.node.x = 700;
            LevelLabel.node.y = 50;
            LevelLabel.node.color = cc.color(255,255,255);
     
            //隐形模式需要将已经下落的方块隐藏
            if(model == "yinxing")
            {
                for(let i = 0;i < this.board.height;i++)
                {
                    for(let j = 0;j < this.board.width;j++)
                    {
                        let spr = this.container[i][j].getComponent(cc.Sprite);
                        spr.node.opacity = 0;
                    }
                }
            }
            
            //竞技模式需要根据等级改变速度
            if(model == "match")
            {
                let level = this.getLevel(this.board.score);
                this.board.speed = SPEED[level];
                cc.log("speed:"+this.board.speed);
            }
        });

        //消除方块
        let s = [0,50,150,450,950];//消除[]行对应的分数
        this.board.on('reduce', rd => {
            this.board.pause(); 
            rd.forEach(v => {
                for(let i = 0;i<v.length;i++)
                {
                    for(let j=v[i]+i;j>0;j--)
                    {
                        for(let k = 0;k<this.board.width;k++)
                        {
                            this.container[j][k].color = this.container[j-1][k].color;
                            this.container[j][k].opacity = this.container[j-1][k].opacity;
                        }
                        
                    }
                }
                this.board.score+=s[v.length];
            });
            //显示得分
            ScoreLabel.string=this.board.score.toString();
            ScoreLabel.fontSize=30;   
            ScoreLabel.node.x=560;
            ScoreLabel.node.y=50;
            ScoreLabel.node.color=cc.color(255,255,255);

            //计算等级并显示
            LevelLabel.string=this.board.level.toString();
            LevelLabel.fontSize=30;   
            LevelLabel.node.x=650;
            LevelLabel.node.y=50;
            LevelLabel.node.color=cc.color(255,255,255);

            //竞技模式需要根据等级改变速度
            if(model == "match")
            {
                let level = this.getLevel(this.board.score);
                this.board.speed = SPEED[level];
                cc.log("speed:"+this.board.speed);
            }

            this.board.play();
        });

        //
        this.board.on('reset', o => {
            //创建棋盘精灵和now、next精灵
            this.container && this.container.forEach(v => {
                v.forEach( v => {
                    v.destroy();
                });
            });
            this.container = Array(...Array(o.height)).map(() => Array(...Array(o.width)).map(()=>new cc.Node()));
            cc.assetManager.loadBundle('texture',(err, bundle) => {
                bundle.load('FinalShape',cc.SpriteFrame,(err,img)=>
                {
                    this.img = img;
                    this.container.forEach((row, y) => {
                        row.forEach((node, x) => {
                            node.setPosition(527+x*500/this.board.height,598-y*500/this.board.height);
                            node.addComponent(cc.Sprite);//在空节点上加入精灵组件spr
                            let spr = node.getComponent(cc.Sprite);
                            spr.spriteFrame = img;
                            spr.node.setScale(0.75);
                            spr.node.opacity = 0;
                            cc.director.getScene().addChild(node);
                        });
                    });
                    for(let i=0;i<4;i++)
                    {
                        this.nowContainer[i].addComponent(cc.Sprite);//在空节点上加入精灵组件spr
                        let spr = this.nowContainer[i].getComponent(cc.Sprite);
                        spr.spriteFrame = img;
                        spr.node.setScale(0.5);
                        cc.director.getScene().addChild(this.nowContainer[i]);  
                        
                        this.nextContainer[i].addComponent(cc.Sprite);//在空节点上加入精灵组件spr
                        spr = this.nextContainer[i].getComponent(cc.Sprite);
                        spr.spriteFrame = img;
                        spr.node.setScale(0.5);
                        cc.director.getScene().addChild(this.nextContainer[i]); 
                    }
                });
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

        //产生新的方块
        this.board.on('newDropping', () => {
     
        });

        //结束
        this.board.on('over',()=>{
            this.board.isPlaying = false;
            this.end(undefined,undefined);
            model = null;//重置难度 防止在其他场景start开始 
        })
        this.board.reset(undefined);  
    }

    start()
    {
        
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
  
            if(this.countdown == 0)
            {       
                let x,y;
                timeLabel.destroy();//倒计时结束 销毁文本节点
                this.tag = true;
                this.board.newDropping(this.now);
                for(let i=0;i<4;i++)
                {   
                    y = BlockShape[this.now][i][0];
                    x = BlockShape[this.now][i][1];
                    this.nowContainer[i].setPosition(570+x*350/this.board.height,659-y*350/this.board.height);
                    let spr = this.nowContainer[i].getComponent(cc.Sprite);
                    spr.node.opacity = 255;
                    spr.node.color = this.COLOR; 

                    y = BlockShape[this.next][i][0];
                    x = BlockShape[this.next][i][1];
                    this.nextContainer[i].setPosition(702+x*350/this.board.height,659-y*350/this.board.height);
                    spr = this.nextContainer[i].getComponent(cc.Sprite);
                    spr.node.opacity = 255;
                    spr.node.color = this.NEXTCOLOR; 
                }

    
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
                //cc.log(this.isPlaying);
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
                cc.log("esc");
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
        ctx.lineWidth = 3;
        
        for(let i = 0;i <= this.board.width;i++)
        {
            ctx.moveTo(-125+250/this.board.width*i,-250);
            ctx.lineTo(-125+250/this.board.width*i,250);
            ctx.fill();
            ctx.stroke();
        }

        //画横线
        for(let i = 0;i <= this.board.height;i++)
        {
            ctx.moveTo(-125,250-250/this.board.width*i);
            ctx.lineTo(125,250-250/this.board.width*i);
            ctx.fill();
            ctx.stroke();
        }

    }



    //获取范围内的随机整数
    getRandomInt(min:number,max:number)
    {  
        let Range = max - min;  
        let Rand = Math.random();  
        return(min + Math.round(Rand * Range));  
    }

    OnclickModel(target,data)
    {
           if(data == "hell")
           {
               model = MODEL[0];
               tempModel = model;
           }
           else if(data == "hard")
           {    
               model = MODEL[1];
               tempModel = model;
           }
           else if(data == "normal")
           {              
               model = MODEL[2];
               tempModel = model;
           }
           else if(data == "easy")
           {
               model = MODEL[3];
               tempModel = model;
           }
           else if(data == "match")
           {
               model = MODEL[4];
               tempModel = model;
           }
           else if(data == "yinxing")
           {
               cc.log("yinxing");
               model = MODEL[5];
               tempModel = model;

           }
           else if(data == "back")
           {
               cc.director.loadScene("GameHallView",this.showID);
               //cc.log("back");
               return;
           }
           cc.director.loadScene("PracticeGameView");
    }

 

    //得到分数对应等级
    getLevel(score):number
    {
        if(score < SCORE[0])
        {
            this.board.level = 1;
            return 1;
        }
        else if(score < SCORE[1])
        {
            this.board.level = 2;
            return 2;
        }
        else if(score < SCORE[2])
        {
            this.board.level = 3;
            return 3;
        }
        else if(score < SCORE[3])
        {
            this.board.level = 4;
            return 4;
        }
        else if(score < SCORE[4])
        {
            this.board.level = 5;
            return 5;
        }
        else if(score < SCORE[5])
        {
            this.board.level = 6;
            return 6;
        }
        else if(score < SCORE[6])
        {
            this.board.level = 7;
            return 7;
        }
        else if(score < SCORE[7])
        {
            this.board.level = 8;
            return 8;
        }
        else if(score < SCORE[8])
        {
            this.board.level = 9;
            return 9;
        }
        else if(score < SCORE[9])
        {
            this.board.level=10;
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
    

    //游戏结束弹框
    end(target,data)
    {
        
        
        //单机模式结算
        if(DATA.mod == "single" )
        {
            let node = cc.find("NewNode/Canvas/GameOverLayout");
            node.active = true;
        }
        for(let i = 0;i < this.board.width;i++)
        {
            for(let j = 0;j < this.board.height;j++)
            {
                let spr = this.container[j][i].getComponent(cc.Sprite);
                spr.node.opacity = 0;
            }
        }
    }

    //结束选择
    PracticeEnd(target,data)
    {
        if(data == "again")
        {
            model = tempModel;//切换到对应场景时 赋予难度 开始游戏
            cc.director.loadScene("PracticeGameView");
        }
        else if(data == "back")
        {
            model = null;
            cc.director.loadScene("GameHallView",this.showID);
        }
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


