import Cookies from "js-cookie"

export function setCacheUserInfo(info) {
    localStorage.setItem("userinfo", JSON.stringify(info));
    localStorage.setItem("tid", info.token);

    Cookies.set("userinfo", JSON.stringify(info), { expires: 365 });
    Cookies.set("tid", info.token, { expires: 365 });
}

export function getCacheUserInfo() {
    let info = localStorage.getItem("userinfo");
    let tid = localStorage.getItem("tid");

    if(!info){
        info =  Cookies.get("userinfo");
    }

    if(!tid){
        tid =  Cookies.get("tid");
    }

    return {
        tid: tid,
        userinfo: info ? JSON.parse(info) : {}
    }
}

export function clearCacheUserInfo() {
    localStorage.removeItem("userinfo");
    localStorage.removeItem("tid");
    localStorage.removeItem("openid");

    Cookies.remove("userinfo");
    Cookies.remove("tid");
}

