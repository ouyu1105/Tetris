import { DATA } from './Global.js';
import { WS } from './ws';
const {ccclass, property} = cc._decorator;
import {GRecord} from './record';

const COLORS=[
    cc.Color.GREEN,
    cc.Color.YELLOW,
    cc.Color.RED,
    cc.Color.MAGENTA,
    cc.Color.CYAN,
    cc.Color.ORANGE
];

//定义等级对应积分
const SCORE=[100,300,600,1000,1500,2100,2800,3600,4500,6000];

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


@ccclass
export class recordGame extends cc.Component {

    img: cc.SpriteFrame;

    speed = 1;

    record = new GRecord();

    ready= false;

    onLoad ()
    { 
        let x,y;
        DATA.init();
       
        
        this.record.setSpeed(this.speed);

        this.record.on("gameStart",(data)=>
        {
            let node5 = new cc.Node();
            let timeLabel = node5.addComponent(cc.Label);
            timeLabel.node.x = 640;
            timeLabel.node.y = 380;
            timeLabel.fontSize = 55; 
            timeLabel.node.color = cc.color(255,255,255); 
            timeLabel.string = "3";
            cc.director.getScene().addChild(node5);
            let countdown = 3;//倒计时时间
            let it = setInterval(() => {
                if(countdown >= 1)
                {
                    countdown--;
                    timeLabel.string = countdown.toString();
                    if(countdown == 0 )
                    {
                        clearInterval(it);
                        node5.destroy();
                        this.ready = true;
                    }
                }
            }, 1000);
            
            for(let i=0;i<12;i+=3)
            {
                DATA.information[data.unn[i]] = {};
                DATA.information[data.unn[i]].id = data.unn[i];
                DATA.information[data.unn[i]].Now = data.unn[i+1];
                DATA.information[data.unn[i]].Next = data.unn[i+2];
                DATA.information[data.unn[i]].y = 0;
                DATA.information[data.unn[i]].x = 9;
                DATA.information[data.unn[i]].nowColor = COLORS[this.getRandomInt(0,5)];
                DATA.information[data.unn[i]].nextColor = COLORS[this.getRandomInt(0,5)];
                DATA.information[data.unn[i]].score = 0;
                DATA.information[data.unn[i]].level = 1;
            }

            

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
    
            let drawXStart = 397;
            for (var k in DATA.information)
            {
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
                                node.setPosition(info.drawX+x*25,582-y*25);
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
               
    

        });

        this.record.on("newDropping",(data)=>
        {
            var DATA_UID = DATA.information[data.uid];
            DATA_UID.Now = DATA_UID.Next;
            DATA_UID.Next = data.next;
            DATA_UID.nowColor = DATA_UID.nextColor;
            DATA_UID.nextColor = COLORS[this.getRandomInt(0,5)];
            DATA_UID.y = 0;
            DATA_UID.x = 9;
            DATA_UID.score += 5;
            DATA_UID.level = this.getLevel(DATA_UID.score);

            DATA_UID.nowContainer.forEach((node, i) => {
                y = BlockShape[DATA_UID.Now][i][0];
                x = BlockShape[DATA_UID.Now][i][1];
                node.setPosition(DATA_UID.drawX+40+x*350/20,647-y*350/20);
                node.color = DATA_UID.nowColor;
            });

            DATA_UID.nextContainer.forEach((node, i) => {
                y = BlockShape[DATA_UID.Next][i][0];
                x = BlockShape[DATA_UID.Next][i][1];
                node.setPosition(DATA_UID.drawX+180+x*350/20,647-y*350/20);
                node.color = DATA_UID.nextColor;
            });    

            DATA_UID.scoreLabel.string = DATA_UID.score.toString();
            DATA_UID.levelLabel.string = DATA_UID.level.toString();
        });

        let s = [0,50,150,450,950];
        this.record.on("reduce",(data)=>
        {
            var rd = DATA.arrayToMap(data.reduce);
            var DATA_UID = DATA.information[data.uid];
            rd.forEach(v => {
                v.forEach((row, count) => {
                    for (var r = row + count; r > count; r--) {
                        DATA_UID.container[r].forEach((node, x) => {
                            node.color = DATA_UID.container[r-1][x].color;    
                            node.opacity = DATA_UID.container[r-1][x].opacity;
                        });
                    }
                    DATA_UID.container[count].forEach(node => {
                        node.opacity = 0;
                    });
                });
                DATA_UID.score += s[v.length];      
            });       

            DATA_UID.scoreLabel.string = DATA_UID.score.toString();
            DATA_UID.levelLabel.string = DATA_UID.level.toString();  
        });

        this.record.on("posChanged",(data)=>
        {
            this.record.setSpeed(this.speed);
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
        });

        this.record.on("droppingChanged",(data)=>
        {
            let DATA_UID = DATA.information[data.uid];
            BlockShape[DATA_UID.Now].forEach(v => {
                
                y = v[0] + DATA_UID.y, x = v[1] + DATA_UID.x;
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
        });

        let overs = [];
        this.record.on("gameOver",(data)=>
        {
            if(data.uid == 0 )
            {

                overs.forEach(node => {
                    node.destroy();
                });
                cc.find("Canvas/buttons").active = false;
                let score:Array<number> = new Array<number>();
                let id:Array<number> = new Array<number>();


                for(let k in DATA.information)
                {
                    let info = DATA.information[k];
                    score.push(info.score);
                    id.push(info.id);
                }
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
                    //cc.log(id[i]);
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
            else
            {
                let node = new cc.Node();
                let overLabel = node.addComponent(cc.Label);
                overLabel.string = "Game Over";
                node.x = DATA.information[data.uid].drawX+125;
                node.y = 360;
                overLabel.fontSize = 40;
                cc.director.getScene().addChild(node);
                overs.push(node);
            }
        });


        this.record.load(DATA.record);
        DATA.record = "";
        this.record.play();
        

        

    }

    start ()
    {
        this.drawBoard();
        this.showScoreAndLevel();
    }

    onClickBack()
    {
        cc.director.loadScene("GameHallView",this.showID);
    }

    onClickButton(target,data)
    {
        if (!this.ready) return;
        if(data == "speedUp")
        {
            this.speed++;
        }
        else if(data == "speedDown")
        {
            if(this.speed >= 2)
                this.speed--;
        }
        else if(data == "pause")
        {
            this.record.pause();
        }
        else if(data == "continue")
        {
            this.record.play();
        }
        else if(data == "back")
        {
            this.record.clear();
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


    showScoreAndLevel()
    {
        let x,y;
        for(let k in DATA.information)
        {
            let info = DATA.information[k];

            info.nowContainer.forEach((node, i) => {
                // 长度4
                y = BlockShape[info.Now][i][0];
                x = BlockShape[info.Now][i][1];
                node.setPosition(info.drawX+50+x*350/20,642-y*350/20);
                node.color = info.nowColor;
            });

            info.nextContainer.forEach((node, i) => {
                // 长度4
                y = BlockShape[info.Next][i][0];
                x = BlockShape[info.Next][i][1];
                node.setPosition(info.drawX+180+x*350/20,642-y*350/20);
                node.color = info.nextColor;
            });

            info.scoreLabel.string = "0";
            info.scoreLabel.fontSize = 30;
            info.scoreLabel.node.x = 180 + info.drawX;
            info.scoreLabel.node.y = 30;
            info.scoreLabel.node.color = cc.color(255,255,255);

            //计算等级并显示
            info.levelLabel.string = "1";
            info.levelLabel.fontSize = 30;   
            info.levelLabel.node.x = 30 + info.drawX;
            info.levelLabel.node.y = 30;
            info.levelLabel.node.color = cc.color(255,255,255);
        } 
    }

    drawBoard()
    {
        let ctx = this.node.getComponent(cc.Graphics);

        //画竖线
        for(let i = 0;i <= 10;i++)
        {
            ctx.moveTo(-615+250/10*i,-265);
            ctx.lineTo(-615+250/10*i,235);
            ctx.fill();
            ctx.stroke();
        }

        //画横线
        for(let i = 0;i <= 20;i++)
        {
            ctx.moveTo(-615,235-250/10*i);
            ctx.lineTo(-365,235-250/10*i);
            ctx.fill();
            ctx.stroke();
        }

        for(let i = 0;i < 3;i++)
        {
            for(let j = 0;j <= 10;j++)
            {
                ctx.moveTo(-255+250/10*j+305*i,-265);
                ctx.lineTo(-255+250/10*j+305*i,235);
                ctx.fill();
                ctx.stroke();
            }
        }

        for(let i = 0;i < 3;i++)
        {
            for(let j = 0;j <=20;j++)
            {
                ctx.moveTo(-255+305*i,235-250/10*j);
                ctx.lineTo(-5+305*i,235-250/10*j);
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
    
    

    // update (dt) {}
}
