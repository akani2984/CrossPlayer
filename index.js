const express = require('express')
const app = express()
const fs = require('fs')
head = `<!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no">
                <meta name="renderer" content="webkit">
                <!-- MDUI CSS -->
                <link rel="stylesheet" href="https://unpkg.com/mdui@1.0.2/dist/css/mdui.min.css">
                <title>交火播放器</title>
            </head>
            <body class="mdui-appbar-with-toolbar mdui-bottom-nav-fixed">
                <div class="mdui-appbar mdui-appbar-fixed">
                    <div class="mdui-toolbar mdui-color-white">
                      <a  class="mdui-typo-title">交火播放器</a>
                    </div>
                  </div>
                    <div class="mdui-container">`
tail = `            </div>
                <script src="https://unpkg.com/mdui@1.0.2/dist/js/mdui.min.js"></script>
            </body>
        </html>`                
            
main()
function main() {
    app.get('/musicplayer', function(req,res) {
        musicplayer(res)
    })
    app.get('/videoselector', function(req,res) {
        videoselector(res)
    })
    app.get('/videoplayer', function(req,res) {
        videoplayer(req,res)
    })
    app.get('/history', function(req,res) {
        txt = fs.readFileSync('history.txt' ,{ encoding: 'utf8', flag: 'r' })
        query = JSON.parse(txt)
        url = `/videoplayer?name=${query.name}&id=${query.id}&time=${query.time}&history=true`
        res.redirect(302, url)
    })
    app.get('/upload', function(req,res) {
        historydata = JSON.stringify(req.query)
        fs.writeFileSync('history.txt',historydata)
    	res.send('done!')
	})
    app.get('/', function(req,res) {
        res.redirect(301, '/musicplayer')
    })
    app.use(express.static('library/'))
}
function getname(filename) {
    extensionLength = filename.length - filename.lastIndexOf('.');
    result = filename.substring(0, filename.length - extensionLength)
    return result
}
function videoselector (res) {
    fs.readdir('library/video',function (err, files) {
        if(err) {
            console.log(err)
        }
        selectorhead = `<table id="table" class="mdui-table-col-numeric mdui-table" id="table" ><thead><tr><th>库</th><th>操作</th></tr></thead><tbody></tr><tr><td>上次观看</td><td><a id='his' class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink" href="/history">播放</a></td></tr>`
        selectortail = `<tr><td>其他视频</td><td><a href="/videoplayer?local=true" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink">播放</a></td></table>`
        selectorbody = ''
        for(i in files) {
            selectorbody = selectorbody + `<tr><td>${files[i]}</td><td><a href="/videoplayer?name=${files[i]}" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink">播放</a></td></tr>`
        }
        res.send(head + selectorhead + selectorbody + selectortail + navbar('video') + tail)
    })
   
}
function musicplayer(res) {
    fs.readdir('library/music',function (err, files) {
        if(err) {
            console.log(err)
        }
        sum = files.length
        playerhead =  `
            <input type="file" id="reader" style="display: none;" multiple/>
            <label class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink" for="reader">打开其他音乐</label>
            <a href="/musicplayer" id="back" style="display: none;" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink"  >返回云音乐</a>
            <br>
            <audio autoplay id='play' controls class='mdui-center' autoplay></audio>
            <h3 id='current'></h3>
          
            <a onclick="luanxu()" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink">乱序播放</a>
            <a onclick="xunhuan()" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink">循环播放</a>
            <a onclick="shunxu()" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink">顺序播放</a>
            <table id="table" class="mdui-table-col-numeric mdui-table" id="table" ><thead><tr><th>名称</th><th>操作</th></tr></thead><tbody>`
        playertail = `
            </table>
            </div>
            <script>
                    sum = ${sum}
                    uid = 0 
                    mode = 'shunxu';
                    function luanxu() {
                        mode = 'luanxu';
                    }
                    function xunhuan() {
                        mode = 'xunhuan';
                    }
                    function shunxu() {
                        mode = 'shunxu';
                    }
                    function getname(filename) {
                        extensionLength = filename.length - filename.lastIndexOf('.');
                        return filename.substring(0, filename.length - extensionLength);
                    }
                    function play(uuid) {
                        document.getElementById('current').innerHTML = '正在播放：' + document.getElementById(uuid).getAttribute('name')
                        document.getElementById('play').src = document.getElementById(uuid).getAttribute('url')
                        uid = Number(uuid)
                    }
                    reader = document.getElementById('reader')
                    reader.addEventListener('change', function () {
                        document.getElementById('back').style.display = ''
                        document.getElementById('play').src = ''
                        files = reader.files
                        sum = files.length
                        table = document.getElementById('table')
                        table.innerHTML = '<thead><tr><th>名称</th><th>操作</th></tr></thead><tbody>'
                        for(i in files) {
                            bloburl = URL.createObjectURL(files[i])
                            name = getname(files[i].name)
                            table.innerHTML = table.innerHTML + \`<tr><td>\${name}</td><td><a id="\${i}" url="\${bloburl}" name="\${name}" onclick="play('\${i}')" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink">播放</a></td></tr>\`
                        }
                    })
                    function luanxuhelper() {
                        sid = Math.floor(Math.random()*sum)
                        if (sid === uid) {
                            sid = luanxuhelper()
                        }
                        return sid
                    }
                    document.getElementById("play").addEventListener('ended', function () {
                       if(mode=='luanxu') {
                            newid = luanxuhelper()
                            play(newid)
                       }
                       if(mode=='shunxu') {
                            uid = uid + 1
                            play(uid)
                       }
                       if(mode=='xunhuan') {
                            play(uid)
                       }
                    }, false);
            </script>
                `    
        playerbody = ''
        for(i in files) {
            name = getname(files[i])
            playerbody = playerbody + `<tr><td>${name}</td><td><a id="${i}" name="${name}" url="/music/${files[i]}" onclick="play('${i}')" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink">播放</a></td></tr>`
        }
        res.send(head + playerhead  + playerbody + playertail + navbar('music') + tail)
    })
}
function videoplayer(req,res) {
        videoplayerbody = '<table class="mdui-table-col-numeric mdui-table"  id="table"></table>'
        if (req.query.name) {
            videoplayerbody = '<table class="mdui-table-col-numeric mdui-table" id="table" ><thead><tr><th>名称</th><th>操作</th></tr></thead><tbody>'
            files = fs.readdirSync('library/video' + '/' + req.query['name'])
            for(i in files) {
                name = getname(files[i])
                videoplayerbody = videoplayerbody + `<tr><td>${name}</td><td><a id="${i}" name="${name}"  url="video/${req.query.name}/${files[i]}" onclick="play('${i}')" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink">播放</a></td></tr>`
            }
        }
        videoplayerhead =  `
            <label style="display: none" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink" id="readerbtn" for="reader" multiple>打开</label>
            
            <video width="80%"  height="80%"  autoplay id='play' controls class='mdui-center' ></video>
            <h3 id='current'></h3>
           
            <input type="file"   id="reader" style="display: none;" multiple/>
            <a onclick="xunhuan()" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink">循环播放</a>
            <a onclick="shunxu()" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink">顺序播放</a>
            `
        videoplayertail = `
            </table>
            </div>
            <script>
                    let hiss;
                    reader = document.getElementById('reader')
                    reader.addEventListener('change', function () {
                        document.getElementById('play').src = ''
                        files = reader.files
                        sum = files.length
                        table = document.getElementById('table')
                        table.innerHTML = '<thead><tr><th>名称</th><th>操作</th></tr></thead><tbody>'
                        for(i in files) {
                            bloburl = URL.createObjectURL(files[i])
                            name = getname(files[i].name)
                            table.innerHTML = table.innerHTML + \`<tr><td>\${name}</td><td><a id="\${i}" url="\${bloburl}" name="\${name}" onclick="play('\${i}')" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink">播放</a></td></tr>\`
                        }
                    })
                    const query = new URLSearchParams(window.location.search)
                    function getname(filename) {
                        extensionLength = filename.length - filename.lastIndexOf('.');
                        return filename.substring(0, filename.length - extensionLength);
                    }
                    if (query.get('local') == 'true')  {
                        document.getElementById('readerbtn').style.display = ''
                    }
                    reader = document.getElementById('reader')
                    reader.addEventListener('change', function () {
                        document.getElementById('play').src = ''
                        files = reader.files
                        sum = files.length
                        table = document.getElementById('table')
                        table.innerHTML = '<thead><tr><th>名称</th><th>操作</th></tr></thead><tbody>'
                        for(i in files) {
                            bloburl = URL.createObjectURL(files[i])
                            name = getname(files[i].name)
                            table.innerHTML = table.innerHTML + \`<tr><td>\${name}</td><td><a id="\${i}" url="\${bloburl}" name="\${name}" onclick="play('\${i}')" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink">播放</a></td></tr>\`
                        }
                    })
                    uid = 0 
                    mode = 'shunxu';
                    function xunhuan() {
                        mode = 'xunhuan';
                    }
                    function shunxu() {
                        mode = 'shunxu';
                    }
                    function play(uuid, time) {
                        document.getElementById('current').innerHTML = '正在播放：' + document.getElementById(uuid).getAttribute('name')
                        document.getElementById('play').src = document.getElementById(uuid).getAttribute('url') 
                        // document.getElementById('play').currentTime = time
                        
                        //document.getElementById('play').play()                    
                        //document.getElementById('play').onplay = function () { document.getElementById('play').currentTime = time }

                    uid = Number(uuid) 

		            if (query.get('local') != 'true') {
                        saver()
                    }
                    
}
	                //.document.addEventListener('touchend', function () { document.getElementById('play').play() })
                    document.getElementById("play").addEventListener('ended', function () {
                        if(mode=='shunxu') {
                            uid = uid + 1
                            play(uid)
                        }
                        if(mode=='xunhuan') {
                            play(uid)
                        }
                    }, false);
                    if (query.get('history') == 'true')  {
                        //document.getElementById('play').onplay = function () { document.getElementById('play').currentTime = time }
                        play(query.get('id'))
                        //document.getElementById('play').currentTime =  query.get('time')
                        //document.getElementById('play').addEventListener('playing', hhis)
                        hiss = setInterval(hhis , 100);
                    }
                        document.getElementById('play').addEventListener('canplay', function () { document.getElementById('play').play(); })
                    function hhis() {
                        console.log(query.get('time'))
                        document.getElementById('play').currentTime =  query.get('time');
                        if (document.getElementById('play').currentTime >= query.get('time')) {
                            clearInterval(hiss)
                            }
                    }

                    function save() {
                        xhr = new XMLHttpRequest()
                        name = query.get('name')
                        time = document.getElementById('play').currentTime
                        xhr.open("GET", \`/upload?name=\${name}&id=\${uid}&time=\${time}\`)
                        xhr.send()
                        console.log('savedone')
                    }
                    function saver() {
                    if (query.get('local') != 'true') {
                        setInterval(save, 90000)
                         }
                    }

            </script>
                `    
        res.send(head + videoplayerhead  + videoplayerbody + videoplayertail + navbar('video') + tail)
}
function navbar(active) {
    let activehtml = 'mdui-bottom-nav-active'
    let navbar = {
        'musicactive': '' ,
        'videoactive': '' ,
        'libraryactive': ''
    }
    if (active == 'music') {
        navbar.musicactive = activehtml
    }
    if (active == 'video') {
        navbar.videoactive = activehtml
    }
    return `<div class="mdui-bottom-nav mdui-color-white">
            <a href="/musicplayer"  class="mdui-ripple ${navbar.musicactive}">
                    <i class="mdui-icon material-icons">library_music</i>
                    <label>音乐</label>
            </a>
            <a href="/videoselector" class="mdui-ripple  ${navbar.videoactive}">
                    <i class="mdui-icon material-icons">video_library</i>
                    <label>视频</label>
            </a>
            </div>`
}
if(process.argv[2]) {
    port = process.argv[2]
} else {
    port = 8020
}
console.log(`浏览器访问\"http://本机IP:${port}\"来使用本程序`)
app.listen(port)
