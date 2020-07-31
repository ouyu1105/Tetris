// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
//import game=require("./game");
//import QiPan from './game';


//@ccclass
// export default class NewClass extends cc.Component {

//     @property(cc.Label)
//     label: cc.Label = null;

//     @property
//     text: string = 'hello';
//     // LIFE-CYCLE CALLBACKS:
//     player:QiPan=new QiPan(0);
//     AI:QiPan=new QiPan(0);

//     isLeft=false;
//     isRight=false;
//     isUp=false;
//     isDown=false;
//     isPlaying=false;

//     now:number;//当前方块
//     next:number;//下一个方块

//     countdown:number;

//     tag=false;//标记 倒计时是否结束

//     onLoad()
//     {
//         this.drawBoard();

//         //设置now和next方块的形状
//         this.now = this.getRandomInt(0,18);
//         this.next = this.getRandomInt(0,18);

//         //键盘监听
//         cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.OnKeyDown,this);
//         cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this.OnKeyUp,this);
        
//         //在棋盘上画方块
//         let x,y,drawX,drawY;
//         let ctx = this.node.getComponent(cc.Graphics);
//         this.player.on('blockSet', st => {
//                 st.forEach(v => {
//                     y = v[0], x = v[1];
//                     drawX=-125-340+x*25;
//                     drawY=225-y*25;
//                     ctx.fillColor = new cc.Color().fromHEX('#FFFFFF');
//                     ctx.rect(drawX+1,drawY+1,23,23);    
//                     ctx.fill();  
//                 });
//         });

        

//         //下落时移除上面的方块
//         this.player.on('blockRm', st => {
//             st.forEach(v => {
//                  y = v[0], x = v[1];
//                  drawX=-125-340+x*25;
//                  drawY=225-y*25;
//                  ctx.fillColor = new cc.Color().fromHEX('#000000');
//                  ctx.rect(drawX+1,drawY+1,23,23);
//                  ctx.fill();          
//              });
//         });

//         //方块触底 结束 下一个移动
//         this.player.on('bottom', () =>{
//             this.now=this.next;
//             this.next=this.getRandomInt(0,18);
//             this.player.newDropping(this.now);
//         });

//     }

//     start()
//     {
//         //创建倒计时文本
//         let node=new cc.Node();
//         let timeLabel=node.addComponent(cc.Label);
//         cc.director.getScene().addChild(node);
//         this.countdown=1;//倒计时时间
//         if(this.countdown>=0)
//         {
//             //计时器 间隔1s
//             this.schedule(function()
//             {
//                 this.DoingSomething(timeLabel);
//             },1);
//         }
//     }
//     //倒计时算法
//     DoingSomething(timeLabel)
//     {
//         if(this.countdown>=1)
//         {
//             this.countdown--;
//             timeLabel.string=this.countdown.toString();
//             timeLabel.node.x=640;
//             timeLabel.node.y=380;
//             timeLabel.fontSize=55; 
//             timeLabel.node.color=cc.color(255,255,255);
//             //timeLabel.enabled=false;

//             if(this.countdown==0)
//             {
                
//                 timeLabel.destroy();//倒计时结束 销毁文本节点
//                 this.tag=true;
//                 this.player.newDropping(this.now);
//                 //this.board.play(); 继续游戏 
//             }
//         }
//     }
    


//     //画棋盘
//     drawBoard()
//     {
//         let ctx = this.node.getComponent(cc.Graphics);

//         //左侧界面画竖线
//         for(let i=0;i<=5;i++)
//         {
//             ctx.moveTo(-340+25*i,-250)
//             ctx.lineTo(-340+25*i,250);
//             ctx.fill();
//             ctx.stroke();

//             ctx.moveTo(-340-25*i,-250);
//             ctx.lineTo(-340-25*i,250);
//             ctx.fill();
//             ctx.stroke();
//         }

//         //画横线
//         for(let i=0;i<=20;i++)
//         {
//             ctx.moveTo(-125-340,250-i*25)
//             ctx.lineTo(125-340,250-i*25);
//             ctx.fill();
//             ctx.stroke();
//         }

//         //右侧界面画线
//         for(let i=0;i<=5;i++)
//         {
//             ctx.moveTo(340+25*i,-250)
//             ctx.lineTo(340+25*i,250);
//             ctx.fill();
//             ctx.stroke();

//             ctx.moveTo(340-25*i,-250);
//             ctx.lineTo(340-25*i,250);
//             ctx.fill();
//             ctx.stroke();
//         }

//         //画横线
//         for(let i=0;i<=20;i++)
//         {
//             ctx.moveTo(-125+340,250-i*25)
//             ctx.lineTo(125+340,250-i*25);
//             ctx.fill();
//             ctx.stroke();
//         }
//     }

//     OnKeyDown(event)
//     {
//         switch(event.keyCode)
//         {
//             case cc.macro.KEY.left:
//                 this.isLeft=true;
//                 cc.log("left");
//                 this.player.left();
//                 break;
//             case cc.macro.KEY.right:
//                 this.isRight=true;
//                 cc.log("right");
//                 this.player.right();
//                 break;
//             case cc.macro.KEY.up:
//                 this.isUp=true;
//                 cc.log("up");
//                 this.player.up();
//                 break;
//             case cc.macro.KEY.down:
//                 this.isDown=true;
//                 cc.log("down");
//                 this.player.down();
//                 break;
//             case cc.macro.KEY.space:
//                 this.isPlaying ? this.player.pause() : this.player.play();
//     }
//     }

//     //键盘松开时关闭开关
//     OnKeyUp(event)
//     {
//         switch(event.keyCode)
//         {
//             case cc.macro.KEY.left:
//                  this.isLeft=false;
//                  break;
//             case cc.macro.KEY.right:
//                  this.isRight=false;
//                  break;
//             case cc.macro.KEY.up:
//                  this.isUp=false;
//                  break;
//             case cc.macro.KEY.down:
//                  this.isDown=false;
//                  break;
//         }
//     }

//     //关闭键盘监听
//     onDestroy()
//     {
//         cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN,this.OnKeyDown,this);
//         cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,this.OnKeyUp,this);
//     }
//     //获取范围内的随机整数
//     getRandomInt( min,max)
//     {  
//         var Range = max - min;  
//         var Rand = Math.random();  
//         return(min + Math.round(Rand * Range));  
//     }

    

    

//     // onLoad () {}


//     // update (dt) {}
// }
