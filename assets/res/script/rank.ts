import { DATA } from './Global.js';
import { WS } from './ws';
const {ccclass, property} = cc._decorator;



function makeRank(uid: number, score: number) : string {
    let space = "            ";
    let suid = String(uid), sscore = String(score);
    let sp = suid.length + sscore.length - 9;
    return suid + space.substr(0, space.length - sp * 2) + sscore;
}


@ccclass
export class NewClass extends cc.Component {



    start () {
        DATA.init();
        this.showRankList();
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

    
    //显示回放列表
    showRankList()
    {
        let content = cc.find("Canvas/rankList/view/content");
        content.setContentSize(450, DATA.scores.length * 60 + 20);
        cc.assetManager.loadBundle('texture',(err, bundle) => {
            bundle.load('img',cc.SpriteFrame,(err,img)=>
            {
                DATA.scores.forEach((score, i) =>
                {
                    let sprNode = new cc.Node();
                    let spr = sprNode.addComponent(cc.Sprite);
                    spr.spriteFrame = img;
                    spr.type = cc.Sprite.Type.FILLED;
                    spr.fillType = cc.Sprite.FillType.RADIAL;
                    spr.fillStart = 1;
                    spr.fillRange = 1;
                    spr.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                    sprNode.setContentSize(400,55);
                    sprNode.x = 450;
                    sprNode.y = -40-i*60;
                    sprNode.color = cc.Color.WHITE;
                    content.addChild(sprNode);

                    let node = new cc.Node();
                    let button = node.addComponent(cc.Button);
                    let label = button.addComponent(cc.Label);
                    label.string = makeRank(DATA.rankUids[i], score);
                    label.fontSize = 35;
                    label.lineHeight = 30;
                    node.x = 450;
                    node.y = -40-i*60;
                    node.setContentSize(400, 55);
                    node.color = cc.Color.BLACK;
                    content.addChild(node);
                });       
            });      
        }); 
    }

}
