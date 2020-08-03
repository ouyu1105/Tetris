import { createCipher } from 'crypto';
import { connect } from 'http2';
import { inherits } from 'util';
import { WS } from './ws';

const DATA = {};
// 其他需要一次性初始化的变量在这块初始化
// ....


//单机、AI、匹配模式
DATA.mod = null;
DATA.MOD = ["single","AI","matching"];


//隐形模式存储方块
//DATA.activeContainer = new Array;

DATA.inited = false;
DATA.mapToArray = function(map)
{
    var array = [];
    map.forEach(v => {
        var m = 3;
        var s = 0;
        v.reverse();
        v.forEach(v => {
            s += v * Math.pow(256, m);
            m--;
        });
        v.reverse();
        array.push(s);
    });
    return array;
}
DATA.arrayToMap = function (array) {
    var map = [];
    array.forEach(v => {
        if (v === 0) {
            map.push([0]);
            return;
        }
        var m = 3;
        var a = [];
        while(v) {
            a.push(parseInt(v / Math.pow(256, m)));
            v %= Math.pow(256, m);
            m--;
        }
        a.reverse();
        map.push(a);
    });
    return map;
}


DATA.init = function() {
    if (DATA.inited) return;    // 防止反复初始化
    DATA.inited = true;
    ws = new WS(); // 创建通信对象

    DATA.Login = {};
    DATA.Game = {};
    DATA.Record = {};
    DATA.Matching = {};
    DATA.AI = {};
    DATA.uid = 0; 
    DATA.myUid = 0;  
    DATA.rid = 0;
    DATA.uids = [0,0,0,0];
    DATA.uidNum = 0;
    //DATA.unn = [0,0,0,0,0,0,0,0,0,0,0,0];
    //DATA.next = 0;
    DATA.reduce = null;
    DATA.blocks = [0,0,0,0];
    DATA.ids = [];
    DATA.uid1s = [];
    DATA.uid2s = [];
    DATA.uid3s = [];
    DATA.uid4s = [];
    DATA.dates = [];
    //DATA.now = -1;
    //DATA.next = -1;
    //DATA.Now = [-1,-1,-1,-1];
    //DATA.Next = [-1,-1,-1,-1];
    DATA.information = {};
    DATA.record = undefined;
    

    ws.on("wsopen", () => {
        console.log("ws 启动了");
    });

    ws.on("signin", data => {
        DATA.Login.loginCallback && DATA.Login.loginCallback(data);
    });

    ws.on("signup", data => {
        DATA.Login.signupCallback && DATA.Login.signupCallback(data);
    });

    ws.on("matching", data => {
        DATA.Matching.matchingCallback && DATA.Matching.matchingCallback(data);
    });

    ws.on("matchingSucceed",data => {
        DATA.Matching.matchingSucceedCallback && DATA.Matching.matchingSucceedCallback(data);
    });

    ws.on("matchingSure",data => {
        DATA.Matching.matchingSureCallback && DATA.Matching.matchingSureCallback(data);
    });

    ws.on("matchingCancel",() => {
        DATA.Matching.matchingCancelCallback && DATA.Matching.matchingCancelCallback();
    });

    ws.on("playerCancel",data => {
        DATA.Matching.playerCancelCallback && DATA.Matching.playerCancelCallback(data);
    });

    ws.on("gameStart", data => {
        DATA.Matching.gameStartCallback && DATA.Matching.gameStartCallback(data);
    });

    ws.on("gameOver", data => {
        DATA.Game.gameOverCallback && DATA.Game.gameOverCallback(data);
    });

    ws.on("newDropping", data=> {
        DATA.Game.newDroppingCallback && DATA.Game.newDroppingCallback(data);
    });

    ws.on("reduce", data=> {
        DATA.Game.reduceCallback && DATA.Game.reduceCallback(data);
    });

    ws.on("blockSet", data=> {
        DATA.Game.blockSetCallback && DATA.Game.blockSetCallback(data);
    });

    ws.on("blockRm", data=> {
        DATA.Game.blockRmCallback && DATA.Game.blockRmCallback(data);
    });

    ws.on("posChanged", data=> {
        DATA.Game.posChangedCallback && DATA.Game.posChangedCallback(data);
    });

    ws.on("wsjso", data => {
        
    });

    ws.on("droppingChanged",data =>{
        DATA.Game.droppingChangedCallback && DATA.Game.droppingChangedCallback(data);
    });

    //rc.on("gameOver gameStart newDropping reduce posChanged droppingChanged ")
    ws.on("recordList",data =>{
        DATA.Record.recordListCallback && DATA.Record.recordListCallback(data);
    });

    ws.on("recordGet",data =>{
        DATA.Record.recordGetCallback && DATA.Record.recordGetCallback(data);
    });

    ws.on("crowd",()=>
    {
        DATA.crowdCallback && DATA.crowdCallback();
    });


    DATA.ws = ws;

}


export {DATA as DATA}; //把该文件的变量导出 可以在其他文件使用