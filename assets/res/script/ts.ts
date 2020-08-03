
import { md5pw } from './md5';
import { DATA } from './Global.js';

const {ccclass, property} = cc._decorator;


@ccclass
export class Login extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    ////////////////////////////////////////
    @property(cc.EditBox)
    loginAccount:cc.EditBox;//登陆界面的账号

    @property(cc.EditBox)
    loginPassword:cc.EditBox;//登陆界面的密码

    /////////////////////////////////////////
    @property(cc.EditBox)
    registerAccount:cc.EditBox;//注册界面的账号

    @property(cc.EditBox)
    registerPassword:cc.EditBox;//注册界面的密码

    @property(cc.EditBox)
    registerPasswordAgain:cc.EditBox;//注册界面再次输入的密码

    //////////////////////////////////////////
    @property(cc.Prefab)
    passwordAgainFail_prefab:cc.Prefab;//两次密码不一致的预制体

    @property(cc.Prefab)
    isSureRegister_prefab:cc.Prefab;//注册成功

    

    // onLoad () {}


    start () {

        DATA.init();
        

        DATA.Login.loginCallback = data =>
        {
            cc.log(data);
            if (data.ok)
            {
                // 登录成功
                DATA.rid = data.rid;
                DATA.record = data.record;
                if (DATA.record)
                {
                    cc.director.loadScene("MatchingGameView"); // 加载游戏场景
                }
                else
                    cc.director.loadScene("GameHallView",this.showID);
            }
            else
            {
                // 登录失败
                DATA.uid = 0;
                let node = cc.find("Canvas/PasswordError");
                node.active = true;       
            }
        }

        DATA.Login.signupCallback = data =>
        { 
            if (data.ok)
            {
                // 注册成功
                this.tips("注册成功， 你的ID是" + data.uid);
                cc.find("Canvas/SucceedRegister").active = true;
                let label = cc.find("Canvas/SucceedRegister/SucceedRegisterLayout").children[0].getComponent(cc.Label);
                label.string = "注册成功,ID:" + data.uid;
            }
            else
            {
                // 注册失败
                this.tips(data.msg);
            }
        };

        
    }

    //从初始界面点击注册 切换到注册界面
    onClickRegisterButtonToRegisterView()
    {
        cc.log("进入注册界面");
        let node = cc.find("Canvas/LoginBackGround");
        node.active = false;

        node = cc.find("Canvas/RegisterBackGround");
        node.active = true; 
    }

    //从注册界面注册成功后返回登录界面
    onClickIsSureButtonToLoginView()
    {
        //cc.director.loadScene("LoginView");
        cc.find("Canvas/SucceedRegister").active = false;

        let node = cc.find("Canvas/RegisterBackGround");
        node.active = false;
 
        node = cc.find("Canvas/LoginBackGround");
        node.active = true;
    }

    //登录界面点击确定
    onClickIsSureOfLoginView()
    {
        // this.onClickIsSureButtonToGameHallView();
        this.getAccountAndPassword();
    }

    //从注册返回登录
    onClickBackToLogin()
    {
        cc.find("Canvas/RegisterBackGround").active = false;
        cc.find("Canvas/LoginBackGround").active = true;
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

    //在登陆界面获得输入的账号和密码
    getAccountAndPassword()
    {
        //将用户名和密码存储到全局变量
        var uid:number|string = this.loginAccount.string,
            password = this.loginPassword.string;
        // 检查uid是否是数字  这里假设是

        uid = parseInt(uid);
        password = md5pw(password);
        if (password.length === 32) {
            DATA.uid = uid;
            DATA.myUid = uid;
            DATA.ws.send({desc: "signin", data: {uid: uid, password: password}});
        }
        else 
            this.tips("密码不合格[长度6~16, 包含字母、数字]!");
    }

    tips(msg:string) {
        // 提示
        cc.log(msg);
        

    }
     //在注册界面获得输入的账号和密码
     getAccountAndPasswordAndAgainPassword()
     {
        var uname = this.registerAccount.string, 
            password = this.registerPassword.string;
        // ws发送
        if (password !== this.registerPasswordAgain.string)
        {
            this.tips("密码不一致!");
            let label = cc.find("Canvas/warnLabel");
            label.active = false;

            label = cc.find("Canvas/passwordAgain");
            label.active = true;
        }
        else
        {
            password = md5pw(password); // 加密
            if (password.length == 32)
            {
                DATA.ws.send({desc: "signup", data: {uname: uname, password: password}});
                let label = cc.find("Canvas/warnLabel");
                label.active = false;
                label = cc.find("Canvas/passwordAgain");
                label.active = false;
            }
            else
            {
                this.tips("密码不合格[长度6~16, 包含字母、数字]!");
                let label = cc.find("Canvas/warnLabel");
                label.active = true;

                label = cc.find("Canvas/passwordAgain");
                label.active = false;
            }
                

        } 
     }

    //判断注册时的两次密码是否一致
    isAgainPasswordLegal()
    {
        this.getAccountAndPasswordAndAgainPassword();
    }
    
    // update (dt) {}
}
