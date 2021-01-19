var __compressalgor = document.createElement('script');

__compressalgor.setAttribute('src','bin/compressionalgorithm.js');

document.head.appendChild(__compressalgor);

const zpack = (context) => {
    const { stdout, args } = context;

    let completestring = `window.virtualDrive['']`;
    if(window.directory != '') {
        let workingdirectorysplit = window.directory.slice(1).split('/');

        workingdirectorysplit.forEach(element => {
            // build eval string
            completestring += `['${element}']`;
        });
    }

    if(eval(completestring)) {
        var directory = eval(completestring);
        if(directory[args.slice(-1)[0]] instanceof VirtualFile) {
            const zfile = {
                name: directory[args.slice(-1)[0]].name,
                content: directory[args.slice(-1)[0]].content
            }
            var out = jsonpack.pack(zfile);
            directory[args.slice(-1)[0] + '.zpck'] = new VirtualFile(args.slice(-1)[0] + '.zpck', out);
            return;
        
        } else {
            stdout.writeln('zpack: ' + args.slice(-1)[0] + ': is not a file')
            return;
        }
    }
    
	
}

window.Packages['zpack'] = zpack;

const unzpack = (context) => {
    const { stdout, args } = context;

    let completestring = `window.virtualDrive['']`;
    if(window.directory != '') {
        let workingdirectorysplit = window.directory.slice(1).split('/');

        workingdirectorysplit.forEach(element => {
            // build eval string
            completestring += `['${element}']`;
        });
    }

    if(eval(completestring)) {
        var directory = eval(completestring);
        if(directory[args.slice(-1)[0]] instanceof VirtualFile) {
            var out = jsonpack.unpack(directory[args.slice(-1)[0]].content);
            directory[out.name] = new VirtualFile(out.name, out.content);
            return;
        
        } else {
            stdout.writeln('unzpack: ' + args.slice(-1)[0] + ': is not a file')
            return;
        }
    }
    
	
}

window.Packages['unzpack'] = unzpack;