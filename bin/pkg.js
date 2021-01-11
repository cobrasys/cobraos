let localPackageList = [
    'java',
    'g++'
]

import Gpp from 'bin/g++.js';

window.Packages = {
    'g++': Gpp.Run,
}
