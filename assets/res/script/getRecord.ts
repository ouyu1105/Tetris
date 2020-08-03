const {ccclass, property} = cc._decorator;
import { DATA } from './Global.js';
import { recordGame } from './recordGame.js';
import { WS } from './ws';
@ccclass
export class getRecord extends cc.Component {

    onLoad ()
    {
        DATA.init();
        this.showList();
    }

    start () {
        //进入某个回放
        DATA.Record.recordGetCallback = data =>
        {

            if(data.ok)
            {
                DATA.record = data.record;
                if (data.record.length) 
                    cc.director.loadScene("RecordGameView");
            }
        }
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
    showList()
    {
        let content = cc.find("Canvas/recordList/view/content");

        content.setContentSize(900, DATA.ids.length * 130);
        cc.assetManager.loadBundle('texture',(err, bundle) => {
            bundle.load('img',cc.SpriteFrame,(err,img)=>
            {
                DATA.ids.forEach((recordId, i) =>
                {
                    let sprNode = new cc.Node();
                    let spr = sprNode.addComponent(cc.Sprite);
                    spr.spriteFrame = img;
                    spr.type = cc.Sprite.Type.FILLED;
                    spr.fillType = cc.Sprite.FillType.RADIAL;
                    spr.fillStart = 1;
                    spr.fillRange = 1;
                    spr.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                    sprNode.setContentSize(860,120);
                    sprNode.x = 450;
                    sprNode.y = -60-i*130;
                    sprNode.color = cc.Color.WHITE;
                    content.addChild(sprNode);

                    let node = new cc.Node();
                    let button = node.addComponent(cc.Button);
                    let label = button.addComponent(cc.Label);
                    label.string = DATA.uid1s[i]+"  "+DATA.uid2s[i]+"  "+DATA.uid3s[i]+"  "+DATA.uid4s[i]+"      "+DATA.dates[i];
                    label.fontSize = 35;
                    label.lineHeight = 30;
                    node.x = 450;
                    node.y = -60-i*130;
                    node.setContentSize(860, 120);
                    node.color = cc.Color.BLACK;
                    content.addChild(node);
                    node.on("click", ()=>{
                        DATA.ws.send({desc:"recordGet", data: {recordId:recordId}});
                    }, this);
                });       
            });      
        }); 
    }

    



    //

    // update (dt) {}
}
