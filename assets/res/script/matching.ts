const {ccclass, property} = cc._decorator;

import { DATA } from './Global.js';

//定义练习模式难度
const MODEL=["hell","hard","normal","easy","match"];

const COLORS=[
    cc.Color.GREEN,
    cc.Color.YELLOW,
    cc.Color.RED,
    cc.Color.MAGENTA,
    cc.Color.CYAN,
    cc.Color.ORANGE
];


@ccclass
export class Matching extends cc.Component {

    @property(cc.Prefab)
    Matching_Prefab:cc.Prefab;//匹配预制体

    model:string = null;//传递速度的全局变量

    matchingTag:boolean = false;//标记是否在匹配
    
  

    //从游戏大厅进入匹配界面   动态创建文本框
    FromGameHallToMatching()
    {
        //向服务器申请匹配
        if(this.matchingTag)
            return;
        this.matchingTag = true;
        DATA.ws.send({desc: "matching"});
        //cc.log("申请匹配");
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

    //从游戏大厅进入练习模式难度选择
    FromGameHallToPracticeModel()
    {
        if(this.matchingTag)
            return;
        DATA.mod = DATA.MOD[0];
        cc.director.loadScene("ModelView");
    }

    //申请进入回放界面
    onClickToRecord()
    {
        if(this.matchingTag)
            return;
        DATA.ws.send({desc:"recordList"});
    }

    //申请进入排行榜
    onClickRank()
    {
        if(this.matchingTag)
            return;
        DATA.ws.send({desc:"rank"});
    }

    //退出登录
    exit()
    {
        DATA.ws.send({desc:"logout"}); 
    }

    closeAutoLogin()
    {
        let node = cc.find("Canvas/LoginBackGround");
        let check = node.getChildByName("autoLogin").getComponent(cc.Toggle);
        check.isChecked = false;
    }

    noRecord()
    {
        cc.find("Canvas/noRecord").active = false;

        let node = cc.find("Canvas/GameHallBackGround");
        node.opacity = 255;
    }

    noRank()
    {
        cc.find("Canvas/noRank").active = false;

        let node = cc.find("Canvas/GameHallBackGround");
        node.opacity = 255;
    }
    onLoad()
    {

    }


    

    start ()
    {

        DATA.information = {};
        DATA.init();

        //匹配回调 成功则进入匹配
        DATA.Login.logoutCallback = () =>
        {
            cc.sys.localStorage.setItem("autoLogin","false");
            cc.director.loadScene("LoginView",this.closeAutoLogin);
        }
        DATA.Matching.matchingCallback = data =>
        {
            //cc.log("进入匹配");
            if(data.ok)
            {
                //弹匹配框：正在匹配.....背景虚化一下
                let node = cc.find("Canvas/matchingLayout");
                node.active = true;
                node = cc.find("Canvas/GameHallBackGround");
                node.opacity = 200;
            }
            else{}  
        }

        //匹配成功回调 成功则进入房间 可点确定
        DATA.Matching.matchingSucceedCallback = data =>
        {
            //匹配框出现确定 显示确定几人
            //uids[..4人] 用于记录每个棋盘对应的人
            let node = cc.find("Canvas/matchingLayout");
            node.active = false;

            node = cc.find("Canvas/matchingSucceedLayout");
            node.active = true;

            node = cc.find("Canvas/matchingSucceedLayout/isSure");
            node.active = false;

            node = cc.find("Canvas/matchingSucceedLayout/sureMatching");
            node.active = true;

            node = cc.find("Canvas/GameHallBackGround");
            node.opacity = 200;
        }

        //匹配确定回调
        DATA.Matching.matchingSureCallback = data =>
        {
            if(data.ok)
            {
                DATA.uidNum++;
                //确定人数增加
                cc.log("点击确定人数:"+DATA.uidNum);

                if(data.uid == DATA.uid)
                {
                    
                    let node = cc.find("Canvas/matchingSucceedLayout/isSure");
                    node.active = true;

                    node = cc.find("Canvas/matchingSucceedLayout/sureMatching");
                    node.active = false;
                }
            }
            else{}
        }

        //匹配失败回调
        DATA.Matching.matchingCancelCallback = () =>
        {
            this.matchingTag = false;
            //匹配结束 匹配框消失
            let node = cc.find("Canvas/matchingSucceedLayout");
            node.active = false;
            
            node = cc.find("Canvas/GameHallBackGround");
            node.opacity = 255;
        }

        //玩家取消
        DATA.Matching.playerCancelCallback = data =>
        {
            this.matchingTag = false;
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
            this.matchingTag = false;
            //cc.log(data.unn);
            //let startNowX = 437, startNextX = 592;
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
            }
            cc.director.loadScene("MatchingGameView");
        }


        //获取回放列表后回调
        DATA.Record.recordListCallback = data =>
        {
            if(data.ok)
            {
                if (data.ids)
                {
                    DATA.ids = data.ids;
                    DATA.uid1s = data.uid1s;
                    DATA.uid2s = data.uid2s;
                    DATA.uid3s = data.uid3s;
                    DATA.uid4s = data.uid4s;
                    DATA.dates = data.dates;
                    DATA.ids.reverse();
                    DATA.uid1s.reverse();
                    DATA.uid2s.reverse();
                    DATA.uid3s.reverse();
                    DATA.uid4s.reverse();
                    DATA.dates.reverse();


                    cc.director.loadScene("RecordView");
                }
                else
                {
                    DATA.ids = [];
                    DATA.uid1s = [];
                    DATA.uid2s = [];
                    DATA.uid3s = [];
                    DATA.uid4s = [];
                    DATA.dates = [];
                    cc.find("Canvas/noRecord").active = true;
                    let node = cc.find("Canvas/GameHallBackGround");
                    node.opacity = 200;
                }
                


                //动态生成一个按钮 显示用户id  存储获得的ids       
            }
            else
            {
                cc.log("error");
            }
        }
        

        DATA.rankCallback = data =>
        {
            //解码
            if(!data.rank)// Uint8Array
            {
                cc.find("Canvas/noRank").active = true;
                let node = cc.find("Canvas/GameHallBackGround");
                node.opacity = 200;
                return ;
            }
                
            let getNumberFromUint8Array = (bin: Uint8Array, ptr: number): number => {
                return bin[ptr] + bin[ptr+1]*256 + bin[ptr+2]*256*256 + bin[ptr+3]*256*256*256;
            }
            let dataUids = [];
            let dataScores = [];
            for (let i = 0; i < data.rank.length; i += 8) {
                dataUids.push(getNumberFromUint8Array(data.rank, i));
                dataScores.push(getNumberFromUint8Array(data.rank, i+4));
            }
            let maxScore = 0;
            let maxPos = 0;
            let length;

            DATA.scores = [];
            DATA.rankUids = [];

            if( dataUids.length >= 10)
                length = 10;
            else
                length = dataUids.length;

            for(let i=0;i<length;i++)
            {
                dataScores.forEach((score,pos) =>{
                    if(score > maxScore) {
                        maxScore = score;
                        maxPos = pos;
                    }
                });
                DATA.scores.push(maxScore);
                DATA.rankUids.push(dataUids[maxPos]);
                maxScore = 0;
                dataScores[maxPos] = 0;
            }
            cc.director.loadScene("RankView");
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
