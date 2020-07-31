const {ccclass, property} = cc._decorator;

import { DATA } from './Global.js';

//定义练习模式难度
const MODEL=["hell","hard","normal","easy","match"];

const COLORS=[
    cc.Color.GREEN,
    cc.Color.YELLOW,
    cc.Color.RED,
    cc.Color.GRAY,
    cc.Color.CYAN,
    cc.Color.ORANGE
];


@ccclass
export class Matching extends cc.Component {

    @property(cc.Prefab)
    Matching_Prefab:cc.Prefab;//匹配预制体

    model:string = null;//传递速度的全局变量
    
  

    //从游戏大厅进入匹配界面   动态创建文本框
    FromGameHallToMatching()
    {
        //向服务器申请匹配
        DATA.ws.send({desc: "matching"});
        cc.log("申请匹配");    
    }

    //从匹配界面进入游戏界面
    SureToMatchingGameView()
    {
        DATA.mod = DATA.MOD[2];
        cc.director.loadScene("MatchingGameView");
    }

    //从匹配界面取消
    onClickCancelMatching()
    {
        DATA.ws.send({desc:"playerCancel"});
        //cc.director.loadScene("GameHallView");
    }


    //匹配成功点击确定
    onClickSure()
    {
        DATA.ws.send({desc:"matchingSure"});
    }

    //从游戏大厅进入人机对战
    FromGameHallToAI()
    {
        DATA.mod = DATA.MOD[1];
        cc.director.loadScene("AIGameView");
    }

    //从游戏大厅进入练习模式难度选择
    FromGameHallToPracticeModel()
    {
        DATA.mod = DATA.MOD[0];
        cc.director.loadScene("ModelView");
    }

    //进入回放界面
    onClickToRecord()
    {
        cc.director.loadScene("RecordView");
    }
    

    start ()
    {
        let tag = false; //标记是否已经匹配成功
        DATA.init();

        //匹配回调 成功则进入匹配
        DATA.Matching.matchingCallback = data =>
        {
            cc.log("进入匹配");
            if(tag == true)
                return ;
            if(data.ok)
            {
                //弹匹配框：正在匹配.....背景虚化一下
                let node = cc.find("Canvas/matchingLayout");
                node.active = true;
                node = cc.find("Canvas/GameHallBackGround");
                node.opacity = 200;
                //this.onClickCancelMatching();
            }
            else{}  
        }

        //匹配成功回调 成功则进入房间 可点确定
        DATA.Matching.matchingSucceedCallback = data =>
        {
            //匹配框出现确定 显示确定几人
            //uids[..4人] 用于记录每个棋盘对应的人
            tag = true;
            let node = cc.find("Canvas/matchingLayout");
            if(node.active == true)
            {

                node.active = false;
            }
            node = cc.find("Canvas/matchingSucceedLayout");
            node.active = true;    
        }

        //匹配确定回调
        DATA.Matching.matchingSureCallback = data =>
        {
            if(data.ok)
            {
                DATA.uidNum++;
                //确定人数增加
                cc.log("点击确定人数:"+DATA.uidNum);
            }
            else{}
        }

        //匹配失败回调
        DATA.Matching.matchingCancelCallback = () =>
        {
            tag = false;
            //匹配结束 匹配框消失
            let node = cc.find("Canvas/matchingSucceedLayout");
            node.active = false;
            
            node = cc.find("Canvas/GameHallBackGround");
            node.opacity = 255;
        }

        //玩家取消
        DATA.Matching.playerCancelCallback = data =>
        {
            tag = false;
            if(data.ok)
            {
                DATA.uidNum = 0;
                DATA.uids = [0,0,0,0];
                let node = cc.find("Canvas/matchingLayout");
                node.active = false;
                node = cc.find("Canvas/GameHallBackGround");
                node.opacity = 255;
            }
            else{}
        }

        //游戏开始 存储uid，now，next
        DATA.Matching.gameStartCallback = data =>
        {
            tag = false;
            //cc.log(data.unn);
            let startNowX = 437, startNextX = 592;
            //切换场景 存储
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
                DATA.information[data.unn[i]].debuffTag = false;
                if(data.unn[i] == DATA.uid)
                {
                    DATA.information[data.unn[i]].drawNowX = 70;
                    DATA.information[data.unn[i]].drawNextX = 225;
                }
                else
                {
                    DATA.information[data.unn[i]].drawNowX = startNowX;
                    DATA.information[data.unn[i]].drawNextX = startNextX;
                    startNowX += 305;
                    startNextX += 305;
                }

            }
            cc.director.loadScene("MatchingGameView");
        }
    }

    //获取范围内的随机整数
    getRandomInt(min:number,max:number)
    {  
        let Range = max - min;  
        let Rand = Math.random();  
        return(min + Math.round(Rand * Range));  
    }

    // update (dt) {}

    
}
