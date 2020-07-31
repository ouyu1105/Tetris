const {ccclass, property} = cc._decorator;
import { DATA } from './Global.js';
import { WS } from './ws';
@ccclass
export class getRecord extends cc.Component {



    onLoad ()
    {
        DATA.init();
    }

    start () {

    }

    //获取回放列表
    sendRecordList()
    {
        DATA.rc.send({desc:"recordList"});
    }

    // update (dt) {}
}
