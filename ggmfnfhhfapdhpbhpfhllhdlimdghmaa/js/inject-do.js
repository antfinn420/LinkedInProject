function er_init(){if(document.head){for(var e,t=0;t<scripts_path.length;t++)e=document.createElement("script"),e.type="text/javascript",e.src=chrome.extension.getURL(scripts_path[t]),console.log("trying to add script = "+scripts_path[t]),document.head.appendChild(e),console.log("script added");var s=document.createElement("link");s.type="text/css",s.rel="stylesheet",s.href=chrome.extension.getURL("/styles/er_injected.css"),document.head.appendChild(s),console.log(document)}else setTimeout(er_init,100)}console.log("my inject-do");var scripts_path=["/js/er_injected.js"];er_init();