import { DATA } from './Global.js';
import { WS } from './ws';
const {ccclass, property} = cc._decorator;

@ccclass
export class NewClass extends cc.Component {



    start () {

    }


    backToHall()
    {
        cc.director.loadScene("GameHallView",this.showID);
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

}
