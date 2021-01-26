var Module = {
    postRun: [],
    print: (function() {
        return function(text) {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
            console.log(text);

            if(text != "emsc")
                term.writeln(text);
        };
    })(),
    printErr: function(text) {
        if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
        if (0) { // XXX disabled for safety typeof dump == 'function') {
            dump(text + '\n'); // fast, straight to the real console
        } else {
            switch(text) {
                case 'trying binaryen method: native-wasm':
                    break;
                
                case 'asynchronously preparing wasm':
                    break;

                case 'binaryen method succeeded.':
                    break;

                default:
                    term.writeln(text);
                    break;
            }
        }
    }
        
};

var xhr = new XMLHttpRequest();
xhr.open('GET', 'main.wasm', true);
xhr.responseType = 'arraybuffer';
xhr.overrideMimeType("application/javascript");
xhr.onload = function() {
    Module.wasmBinary = xhr.response;

    var script = document.createElement('script');
    script.src = "mainlua.js";
    document.body.appendChild(script);
};
xhr.send(null);

const luaRun = async (context) => {
    const { stdout, args } = context;
    window.showPrompt = false;
    let code = '';
    if(window.directory == '') {
        // handle branches off of root
        if(window.virtualDrive[''][args[0]]) {
            if(window.virtualDrive[''][args[0]] instanceof(VirtualFile)) {
                code = window.virtualDrive[''][args[0]].content
            } else {
                stdout.writeln('lua: ' + args[0] + ': is a directory.');
                return;
            }
        } else {
            stdout.writeln('lua: ' + args[0] + ': no such file or directory');
            return;
        }
    } else {
        // handle everything else
        let workingdirectorysplit = window.directory.slice(1).split('/');
                
        let completestring = `window.virtualDrive['']`;
        workingdirectorysplit.forEach(element => {
           completestring += `['${element}']`;
        });


        if(eval(completestring + `['${args[0]}']`)) {
            if(eval(completestring + `['${args[0]}']`) instanceof(VirtualFile)) {
                code = eval(completestring + `['${args[0]}']`).content;
            } else {
                stdout.writeln('lua: ' + args[0] + ': is a directory.');
                return;
            }
        } else {
            stdout.writeln('lua: ' + args[0] + ': no such file or directory');
            return;
        }
    }
    

    Module.ccall("run_lua", 'number', ['string'], [code]);
    window.showPrompt = true;
}

window.Packages['lua'] = luaRun;