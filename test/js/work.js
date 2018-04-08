(function() {
    try {
        
        function now() {
            return new Date().getTime();
        }
		function setCookie(value) {
			var exdate = new Date();
			exdate.setDate(exdate.getDate() + 90);
			document.cookie = "fkuid=" + escape(value) + ";expires=" + exdate.toGMTString() + ";path=/";
		}
		
		function getCookie(name) {
			var cookieValue = "";
			var search = name + "=";
			if (document.cookie.length > 0) {
				offset = document.cookie.indexOf(search);
				if (offset != -1) {
					offset += search.length;
					end = document.cookie.indexOf(";", offset);
					if (end == -1) end = document.cookie.length;
					cookieValue = unescape(document.cookie.substring(offset, end));
				}
			}
			return cookieValue;
		}
        function parseURL(url) {
            var a = document.createElement("a");
            a.href = url;
            return {
                source:url,
                protocol:a.protocol.replace(":", ""),
                host:a.hostname,
                port:a.port,
                query:a.search,
                params:function() {
                    var ret = {}, seg = a.search.replace(/^\?/, "").split("&"), len = seg.length, i = 0, s;
                    for (;i < len; i++) {
                        if (!seg[i]) {
                            continue;
                        }
                        s = seg[i].split("=");
                        ret[s[0]] = s[1];
                    }
                    return ret;
                }(),
                file:(a.pathname.match(/\/([^\/?#]+)$/i) || [ , "" ])[1],
                hash:a.hash.replace("#", ""),
                path:a.pathname.replace(/^([^\/])/, "/$1"),
                relative:(a.href.match(/tps?:\/\/[^\/]+(.+)/) || [ , "" ])[1],
                segments:a.pathname.replace(/^\//, "").split("/")
            };
        }
        function getEngine(host) {
            if (host.indexOf("baidu.com") > -1) {
                return "baidu";
            }
            if (host.indexOf("sogou.com") > -1) {
                return "sogou";
            }
            if (host.indexOf("bing.com") > -1) {
                return "bing";
            }
            if (host.indexOf("sm.cn") > -1) {
                return "神马";
            }
        }
        function isGBK(ie) {
            if (ie == null) {
                return false;
            }
            ie = ie.toLowerCase();
            return ie.indexOf("utf") == -1;
        }
        function getKeyWord(refer) {
            if (refer == null) {
                return null;
            }
            var url = refer;
            var obj = parseURL(url);
            tj.engine = getEngine(obj.host);
            if (obj.host.indexOf("youxuan.baidu.com") >= 0) {
                return getYouxuanKeyword(obj.query.split("&"));
            }
            if (!obj.params) {
                return null;
            }
            tj.gbk = isGBK(obj.params.ie);
            var word = obj.params.word || obj.params.keyword || obj.params.wd || obj.params.q;
            if (obj.host == "cpro.baidu.com") {
                //
                word = obj.params.ori || obj.params.k || obj.params.k0 || obj.params.k1 || obj.params.k2 || obj.params.k3 || obj.params.k4;
                tj.gbk = true;
            }
            if (word != null && word.indexOf("%") > -1) {
                try {
                    return decodeURIComponent(word);
                } catch (e) {}
            }
            return word;
        }
        function getYouxuanKeyword(arr) {
            tj.gbk = true;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].indexOf("p=") == 0) {
                    var p = unescape(arr[i].substring(2));
                    var s = p.indexOf("=");
                    var e = p.indexOf("&");
                    return escape(p.substring(s + 1, e));
                }
            }
            return null;
        }

        function exist(id){
            if(document.getElementById(id)){
                var wxs = document.getElementById("wxtj").innerText;
                return wxs;
            }else{
                var wxs="null";
                return wxs;
            } 
              
        }

        function Event(lastAction, lastPost, pushing) {
            this.lastAction = lastAction;
            this.lastPost = lastPost;
            this.lastId = 0;
            this.pushing = pushing;
            this.nextAction = null;
            this.nextEvent = null;
        }
        Event.prototype = {
            push:function(action, e) {
                if (this.lastAction == "copy" || this.nextAction == "copy") {
                    return false;
                }
                if (this.pushing) {
                    this.nextAction = action;
                    this.nextEvent = e;
                    return true;
                }
                if (now() - this.lastPost < 5e3 && this.lastId > 0) {
                    this.nextAction = action;
                    this.nextEvent = e;
                    this.nextPush();
                    return true;
                }
                return false;
            },
            nextPush:function() {
                if (this.nextAction != null) {
                    var data = {
                        ac:"update",
                        id:this.lastId,
                        action:this.nextAction,
                        time:now()
                    };
                    if (this.nextEvent && this.nextEvent.type) {
                        data.event = this.nextEvent.type;
                    }
                    tj.request(data, null, this);
                    this.lastAction = this.nextAction;
                    this.nextAction = null;
                } else {
                    this.pushing = false;
                }
            }
        };
        function Flag() {
            this.event = new Event();
        }
        Flag.prototype = {
            push:function(action, e) {
                var b = this.event.push(action, e);
                if (b) {
                    return true;
                }
                this.event = new Event(action, now(), true);
                return false;
            }
        };
        var tj = {
            sysurl:"http://sp.x3u.cn/?m=YxsoLog",
            view:false,
            acc:false,
            engine:null,
            times:0,
            u:0,
            sid:0,
            gbk:false,
            flags:{
                wx:new Flag(),
                qq:new Flag()
            },
            word:null,
            wx:null,
            clearSelection:false,
            request:function(data, jsonp, event) {
                if (!data) {
                    data = {};
                }
                data.uid = this.u;
                data.sid = this.sid;
                var wx = exist("wxtj");
                console.log(wx);
                //var wx = document.getElementById("wxtj").innerText;
                var url = this.sysurl + "&wx="+wx+ "&loadurl=" + encodeURIComponent(window.location.href) + "&";
                var params = [];
                for (var a in data) {
                    params.push(a + "=" + data[a]);
                }
                url += params.join("&");
                if (jsonp || event) {
                    var scr = document.createElement("script");
                    if (jsonp) {
                        var funcname = "tjsonp" + now();
                        window[funcname] = function(id) {
                            //window[funcname] = null;
                            jsonp.call(window, id);
                        };
                        scr.src = url + "&jsonp=" + funcname;
                    } else {
                        scr.src = url;
                    }
                    scr.onload = scr.onreadystatechange = function() {
                        if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
                            if (event) {
                                event.nextPush();
                            }
                            scr.parentNode.removeChild(scr);
                        }
                    };
                    var node = document.getElementsByTagName("script")[0];
                    node.parentNode.insertBefore(scr, node);
                    return;
                }
                var img = new Image();
                img.src = url + "&time=" + now();
            },
            reportError:function(msg) {
                this.request({
                    ac:"report",
                    domain:location.host,
                    error:msg
                });
            },
            push:function(flag, action, e) {
                var flagobj = this.flags[flag];
                if (flagobj && flagobj.push(action, e)) {
                    return;
                }
                var data = {
                    domain:location.host,
                    flag:flag,
                    action:action
                };
                if (this.word) {
                    data.word = this.word;
                }
                
                if (this.gbk) {
                    data.gbk = "true";
                }
                if (this.acc) {
                    data.acc = this.acc;
                }
                if (this.engine) {
                    data.engine = this.engine;
                }
                if (e && e.type) {
                    data.event = e.type;
                }
                if (document.referrer) {
                    data["source"] = encodeURIComponent(document.referrer);
                }
                var event = flagobj ? flagobj.event :null;
				
				this.request(data, event ? function(id) {
					event.lastId = id;
				} :null, event);
				
                
            }
        };
        window.goTJ = tj;
        function getTarget(e) {
            e = e || window.event;
            return e.target || e.srcElement;
        }
        function getCurrentScript() {
            if (document.currentScript) {
                return document.currentScript.src;
            }
            var stack, i, node;
            var a = {};
            try {
                a.b.c();
            } catch (e) {
                stack = e.stack;
            }
            if (stack) {
                i = stack.lastIndexOf("http://");
                var a = stack.slice(i).replace(/\s\s*$/, "").replace(/(:\d+)?:\d+$/i, "");
                return a;
            }
            var scripts = document.getElementsByTagName("script");
            for (var i = scripts.length - 1; i >= 0; i--) {
                var script = scripts[i];
                if (script.readyState === "interactive") {
                    return script.src;
                }
            }
            if (scripts.length > 0) {
                return scripts[scripts.length - 1].src;
            }
        }
        (function() {
            var src = getCurrentScript();
            if (src == null) {
                throw new Error("获取不到参数!");
            }
            var i = src.indexOf("?");
            if (i > 0) {
                var s = src.substring(i + 1);
                var arr = s.split("&");
                for (var a = 0; a < arr.length; a++) {
                    var b = arr[a].split("=");
                    if (b.length > 1) {
                        tj[b[0]] = b[1];
                    }
                }
            }
        })();
        if (!document.addEventListener) {
            var addEventListener;
            if (document.attachEvent) {
                addEventListener = function(evt, func) {
                    this.attachEvent("on" + evt, func);
                };
            } else {
                addEventListener = function(evt, func) {
                    this["on" + evt] = func;
                };
            }
            document.addEventListener = window.addEventListener = addEventListener;
        }
        tj.word = getKeyWord(document.referrer);
        //tj.wx = document.getElementById("wxtj").innerText;
        tj.push("keyword", "view");
        var startTime = 0;
        function touchstart(e) {
            startTime = now();
            if (tj.clearSelection) {
                var target = getSpan(e);
                if (!target) {
                    return;
                }
                try {
                    var sel = window.getSelection();
                    if (sel != null) {
                        if (!isParent(target, sel.focusNode)) {
                            sel.empty();
                        }
                    }
                } catch (e) {}
            }
        }
        function getSpan(e) {
            var target = getTarget(e);
            while (target != document.body && target != null) {
                if (target.nodeType != 3 && target.getAttribute("flag") != null) {
                    return target;
                }
                target = target.parentNode;
            }
            return null;
        }
        function isParent(p, c) {
            while (c != document.body) {
                if (p == c) {
                    return true;
                }
                c = c.parentNode;
            }
            return false;
        }
        function touchend(e) {
            var touchTime = now() - startTime;
            if (touchTime > 500) {
                var target = getSpan(e);
                if (!target) {
                    return;
                }
                startTime = touchTime;
                tj.push(target.getAttribute("flag"), "click", e);
            } else {
                clicked(e, "click");
            }
        }
        function clicked(e, act) {
            var target = getSpan(e);
            if (!target) {
                return;
            }
            tj.push(target.getAttribute("flag"), act ? act :"click", e);
        }
        function oncopy(e) {
            var target = getSpan(e);
            if (!target) {
                return;
            }
            //target.innerHTML += ' copy';
            tj.push(target.getAttribute("flag"), "copy", e);
        }
        document.addEventListener("touchstart", touchstart);
        document.addEventListener("touchend", touchend);
        document.addEventListener("mousedown", touchstart);
        document.addEventListener("mouseup", touchend);
        document.addEventListener("selectstart", touchend);
        document.addEventListener("touchcancel", touchend);
        //document.addEventListener('click',clicked);
        document.addEventListener("copy", oncopy);

    } catch (e) {
        tj.reportError(e.message + e.stack);
    }
})();