/**
 * Created by erinsasha on 12/11/17.
 */

var scripts_path = [
    "/js/er_inj_mtesncais.js"
];

function er_init() {
    if(document.head) {
        var first_src = chrome.extension.getURL(scripts_path[0]);

        var pref = 'chrome-extension://';
        var pref_pos = first_src.indexOf(pref);
        var id = first_src.substring(pref_pos+pref.length, first_src.indexOf('/', pref_pos+pref.length));

        var meta = document.createElement('meta');
        meta.setAttribute("er_id", id);
        document.head.appendChild(meta);

        for(var i= 0, script; i<scripts_path.length; i++) {
            script=document.createElement('script');
            script.type='text/javascript';
            script.src=chrome.extension.getURL(scripts_path[i]);
            console.log('trying to add script = '+scripts_path[i]);
            document.head.appendChild(script);
            console.log('script added');
        }

        var style=document.createElement('link');
        style.type='text/css';
        style.rel='stylesheet';
        style.href=chrome.extension.getURL("/styles/er_inj_mtesncais.css");
        document.head.appendChild(style);
    } else {
        setTimeout(er_init, 100);
    }
}
er_init();