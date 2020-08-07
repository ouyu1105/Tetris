
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

    password: string;
    ID: number; 

    

    onLoad ()
    {
        
    }


    start ()
    {
        DATA.init();
        DATA.Login.loginCallback = data =>
        {

            if (data.ok)
            {
                // 登录成功
                DATA.rid = data.rid;
                DATA.record = data.record;
                cc.sys.localStorage.setItem("ID",DATA.uid);
                let node = cc.find("Canvas/LoginBackGround");
                let check = node.getChildByName("remPassword").getComponent(cc.Toggle);
                cc.sys.localStorage.setItem("remPassword",check.isChecked);
                if (check.isChecked == true)
                {
                    cc.sys.localStorage.setItem("password",this.password); 
                }

                check = node.getChildByName("autoLogin").getComponent(cc.Toggle);
                cc.sys.localStorage.setItem("autoLogin",check.isChecked);
                if (DATA.record && data.record.length)
                {
                    cc.director.loadScene("MatchingGameView"); // 加载游戏场景
                }
                else
                {
                    cc.director.loadScene("GameHallView",this.showID);
                }

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
                cc.sys.localStorage.setItem("ID",data.uid);
                cc.sys.localStorage.setItem("password","");
                cc.sys.localStorage.setItem("remPassword",false);
                cc.sys.localStorage.setItem("autoLogin",false);
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

        this.ID =  parseInt(cc.sys.localStorage.getItem("ID") || "0") ;
        this.password = cc.sys.localStorage.getItem("password") || "";

        if (this.ID) this.loginAccount.string = this.ID.toString();

        let autoLogin = cc.sys.localStorage.getItem("autoLogin")  == "true";

        if(autoLogin && this.password != "")
        {
            let node = cc.find("Canvas/LoginBackGround");
            let check = node.getChildByName("autoLogin").getComponent(cc.Toggle);
            check.isChecked = true;
            DATA.uid = this.ID;
            DATA.Login.wsopenCallback = ()=>
            {
                DATA.ws.send({desc: "signin", data: {uid:this.ID, password: this.password}});
                DATA.Login.wsopenCallback = null;
            }  
        }
        
        let remPassword = cc.sys.localStorage.getItem("remPassword")  == "true";
        if(remPassword)
        {
            let node = cc.find("Canvas/LoginBackGround");
            let check = node.getChildByName("remPassword").getComponent(cc.Toggle);
            check.isChecked = true;
            this.loginPassword.string = this.password;
        }     
    }

    Change()
    {
        this.password = "";
    }



    //记住密码
    rememberPassword(event)
    {
        if(event.isChecked == false)
        {
            let node = cc.find("Canvas/LoginBackGround");
            let check = node.getChildByName("autoLogin").getComponent(cc.Toggle);
            check.isChecked = false;
        }
    }

    //自动登录
    autoLogin(event)
    {
        if(event.isChecked == true)
        {
            let node = cc.find("Canvas/LoginBackGround");
            let check = node.getChildByName("remPassword").getComponent(cc.Toggle);
            check.isChecked = true;
        }
    }

    //从初始界面点击注册 切换到注册界面
    onClickRegisterButtonToRegisterView()
    {
        cc.log("进入注册界面");
        let node = cc.find("Canvas/LoginBackGround");
        node.active = false;

        node = cc.find("Canvas/RegisterBackGround");
        node.active = true; 

        node = cc.find("Canvas/PasswordError");
        node.active = false; 

        node = cc.find("Canvas/warnLabel");
        node.active = false;
    }

    //从注册界面注册成功后返回登录界面
    onClickIsSureButtonToLoginView()
    {
        cc.director.loadScene("LoginView");
    }

    //登录界面点击确定
    onClickIsSureOfLoginView()
    {
        // this.onClickIsSureButtonToGameHallView();
        let node = cc.find("Canvas/PasswordError");
        node.active = false;
        node = cc.find("Canvas/warnLabel");
        node.active = false;
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

        if(this.password == "")
        {
            this.ID = parseInt(this.loginAccount.string);
            // 用id登录
            this.password = md5pw(this.loginPassword.string);
        }

        
        if (this.password != "")
        {
            DATA.uid = this.ID;
            DATA.ws.send({desc: "signin", data: {uid:this.ID, password: this.password}});
        }
        else 
        {
            this.tips("密码不合格[长度6~16, 包含字母、数字]!");
            let node = cc.find("Canvas/warnLabel");
            node.active = true;       
        }
            
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
