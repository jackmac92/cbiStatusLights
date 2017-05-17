#! /bin/bash -exu

cleanUp() {
    rm -rf ~/bitbar
    mkdir  ~/bitbar
    [[ -f bitbar.zip ]] && rm bitbar.zip
    rm -rf /Applications/BitBar.app
}

insertSheBang() {
    nodePath=$(which node)
    echo "#! /usr/bin/env $nodePath" | cat - "$1" > temp && mv -f temp "$1"
}

installMonitor() {
    yarn
    webpack index.js bitbar.20s.js --config webpack.config.js --optimize-minimize
    insertSheBang bitbar.20s.js
    mv -f bitbar.20s.js ~/bitbar
    sudo chmod +x ~/bitbar/bitbar.20s.js
}

installBitBar() {
    [[ -d /Applications/BitBar.app ]] && rm -rf /Applications/BitBar.app
    node installBitBar.js
    unzip ./bitbar.zip
    mv ./BitBar.app /Applications/BitBar.app
    defaults write com.matryer.BitBar pluginsDirectory "$HOME/bitbar"
    defaults write com.matryer.BitBar appHasRun -bool false
    defaults write com.matryer.BitBar userConfigDisabled -bool false

    open -a BitBar
}

cleanUp
installMonitor
installBitBar
