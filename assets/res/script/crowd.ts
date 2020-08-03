const {ccclass, property} = cc._decorator;

import { DATA } from './Global.js';

@ccclass
export class NewClass extends cc.Component {


    onLoad ()
    {
        cc.game.addPersistRootNode(this.node);

        DATA.crowdCallback = () => 
        {
            cc.log("被顶号");
            cc.director.loadScene("LoginView",this.show);       
        }
    }

    start () {

    }

    show()
    {
        cc.find("crowd/crowdLayout").active = true;
    }
    
    onClickSure()
    {
        cc.find("crowd/crowdLayout").active = false;
    }
    // update (dt) {}
}
