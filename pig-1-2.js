var chzh = {

    //儲存小豬在垂直方向的移动位置（相對游戲頁面頂部）
    pigY: 0,

    //障礙物頁面水平方向移动位置（相對游戲頁面最左邊）
    cubeX: 800,

    //儲存小豬垂直方向的速度，向下爲正，向上為負
    pigV: 0,

    //储存按键时获得的速度，向上为负，向下为正
    keyV: -500,

    //储存障碍物水平方向的速度，向左为正，向右为负
    cubeV: 500,

    //储存上一帧动画开始的时间（小猪动画）
    pigLT: null,

    //储存上一帧动画开始的时间（障碍物动画）
    cubeLT: null,

    //储存小猪的加速度（向下为正）
    pigG: 5000,


    //储存障碍物页面的最长width
    maxX: null,

    //储存已经通过多少障碍物（只计算一边）
    cubeCount: 0,

    //储存生成障碍物间距的DOM数据
    distance: null,

    //储存生成上障碍物高度的数据
    upHeight: null,

    //储存生成下障碍物高度的数据
    downHeight: null,

    //储存所有未被经过的障碍物的DOM节点
    unPassed: null,

    //生成障碍物的默认数量
    cubes: 32,

    //判断游戏是否结束
    isOver: false,

    //判断是否通过关卡
    isPass: false,


    //是否通关模式 
    isLevel: true,

    //向右速度控制
    cubeVcontrol: 0,

    //纪录通关
    level: 0

}

var receivedData = {
    G: null,
    keyV: null,
    cubeV: null,
    cubes: null
}
var defaultData = {
    idxs: [40, 1000],
    par: tubebg,
    tag: 'div',
    classes: ['up', 'down']
}

var levelData = {
    0: {
        G: 4000,
        keyV: -500,
        cubeV: 500,
        cubes: 32
    },

    1: {
        G: 4000,
        keyV: -500,
        cubeV: 600,
        cubes: 42
    },

    2: {
        G: 4000,
        keyV: -500,
        cubeV: 600,
        cubes: 56
    }
}

var constData = {
    picTop: mainbg.getBoundingClientRect().top,
    picLeft: mainbg.getBoundingClientRect().left,
}


var animation = {
    pigMove: function() {
        if (chzh.isPass || isOver()) {
            return
        }
        var now = Date.now()
        if (chzh.pigLT) {
            var t = (now - chzh.pigLT) / 2000
            chzh.pigY += chzh.pigV * t + 0.5 * chzh.pigG * t * t
            chzh.pigY = chzh.pigY <= 530 ? chzh.pigY : 530
            chzh.pigV += chzh.pigG * t
            pig.style.transform = `translateY(${chzh.pigY}px)`
        }
        chzh.pigLT = now
        requestAnimationFrame(animation.pigMove)
    },

    cubeMove: function() {

        if (chzh.isPass) {
            return
        }
        if (isOver()) {
            gameover()
            return
        }
        var now = Date.now()
        if (chzh.cubeLT) {
            var t = (now - chzh.cubeLT) / 2000
            chzh.cubeX = chzh.cubeX - chzh.cubeV * t
            tubebg.style.transform = `translateX(${chzh.cubeX}px)`

        }

        chzh.cubeLT = now

        if (getXpos(chzh.unPassed[0]) < 175) {
            chzh.cubeCount++;
            if (chzh.cubeCount == chzh.cubeVcontrol + 4) {
                chzh.cubeVcontrol = chzh.cubeCount
                chzh.cubeV += 50
            }
            chzh.unPassed.shift();
        }
        if (chzh.unPassed.length === 0) {
            pass()
            return
        }

        requestAnimationFrame(animation.cubeMove)

    }
}


function getXpos(it) {
    return it.getBoundingClientRect().left - constData.picLeft
}

function getYpos(it) {
    return it.getBoundingClientRect().top - constData.picTop
}

function getDistance(idx) {
    chzh.distance = new Array(chzh.cubes).fill(0)
    chzh.distance.reduce((result, _, index) => {
        var r = (10 * Math.random()) | 0
        if (!index) {
            result = r * idx
        } else {
            result += (8 + ((r / 3) | 0)) * idx
        }
        chzh.distance[index] = result
        return result

    }, 0)
}

function getUpHeight(idx) {
    chzh.upHeight = chzh.distance.map(it => sinfy(it, idx) | 0)

}

function getDownHeight() {
    chzh.upHeight.forEach((val, index) => {
        var val2 = 480 - val - (((Math.random() * 10) | 0) * 20)
        val2 = val2 > 0 ? val2 : 0
        chzh.downHeight[index] = val2
    })
}

function sinfy(val, idx) {
    return Math.sin(val / idx * 2 * Math.PI) * 100 + 200
}

function addChild(par, tag, style, ...classes) {
    var node = document.createElement(tag)
    par.appendChild(node)
    if (classes) {
        node.classList.add(...classes)
    }
    node.style.left = `${style[0]}px`
    node.style.height = `${style[1]}px`
}

function buildUpTube(par, tag, ...classes) {
    var add = addChild.bind(null, par, tag)
    chzh.distance.forEach((val, index) => {
        var style = [val, chzh.upHeight[index]]
        add(style, ...classes)
    })
}

function buildDownTube(par, tag, ...classes) {
    var add = addChild.bind(null, par, tag)
    chzh.distance.forEach((val, index) => {
        var style = [val, chzh.downHeight[index]]
        add(style, ...classes)
    })
}

function buildTube(idxs, par, tag, ...classes) {
    getDistance(idxs[0])
    getUpHeight(idxs[1])
    getDownHeight()
    buildUpTube(par, tag, classes[0])
    buildDownTube(par, tag, classes[1])
    chzh.maxX = chzh.distance[chzh.distance.length - 1] + 400
    tubebg.style.width = `${chzh.maxX}px`
    chzh.unPassed = Array.from(par.querySelectorAll('.' + classes[0]))

}

function isOver() {
    var pigY = getYpos(pig)
    var tubeX = getXpos(chzh.unPassed[0])

    if (pigY < 0 || pigY >= 530) {
        return true
    }
    if (tubeX >= 175 && tubeX <= 230) {
        if (pigY <= chzh.upHeight[chzh.cubeCount] || pigY >= 530 - chzh.downHeight[chzh.cubeCount]) {
            return true
        }
    }
    return false
}

function gameover() {
    chzh.isOver = true
    overpage.classList.remove('hidden')
}

function pass() {
    chzh.isPass = true
    passpage.classList.remove('hidden')
}

function space(e) {
    if (e.key == ' ') {
        e.preventDefault()
        chzh.pigLT = null
        chzh.pigV = chzh.pigV > 0 ? chzh.keyV : chzh.keyV + chzh.pigV / 2
    }
}

function resetData() {
    chzh.pigY = 0
    chzh.cubeX = 800
    chzh.pigV = 0
    chzh.cubeV = 500
    chzh.keyV = -500
    chzh.cubeCount = 0
    chzh.pigLT = null
    chzh.cubeLT = null
    chzh.distance = null
    chzh.upHeight = null
    chzh.downHeight = null
    chzh.isOver = false
    chzh.isPass = false
    chzh.unPassed = null
    chzh.cubeVcontrol = 0
}

function resetCss() {
    overpage.classList.add('hidden')
    pig.style.transform = ``
    tubebg.style.transform = ``
    tubebg.innerHTML = ''
    tubebg.style.width = `0px`
}

function recieve() {
    receivedData = {
        G: +setg.value,
        keyV: +setkey.value,
        cubeV: +setcubev.value,
        cubes: +setcubes.value
    }

}

function setLevel(lv) {
    chzh.pigG = levelData[lv].G
    chzh.keyV = levelData[lv].keyV
    chzh.cubeV = levelData[lv].cubeV
    chzh.cubes = levelData[lv].cubes
}

function action(a) {
    if (!chzh.distance) {
        if (chzh.isLevel) {
            setLevel(chzh.level)
        } else {
            recieve()
            chzh.pigG = receivedData.G ? receivedData.G : chzh.pigG
            chzh.keyV = receivedData.keyV ? receivedData.keyV : chzh.keyV
            chzh.cubeV = receivedData.cubeV ? receivedData.cubeV : chzh.cubeV
            chzh.cubes = receivedData.cubes ? receivedData.cubes : chzh.cubes
        }

        chzh.upHeight = new Array(chzh.cubes).fill(0)
        chzh.downHeight = new Array(chzh.cubes).fill(0)
        chzh.distance = new Array(chzh.cubes).fill(0)
        buildTube(...a)
        requestAnimationFrame(animation.pigMove)
        requestAnimationFrame(animation.cubeMove)
    }


}
window.addEventListener('keydown', space, false)
reset.addEventListener('click', e => {
    resetData()
    resetCss()

})


document.querySelectorAll('.restart').forEach(val => {
    val.addEventListener('click', e => {
        var a = [defaultData.idxs, defaultData.par, defaultData.tag, ...defaultData.classes]
        if (val.parentNode === overpage || val.parentNode === passpage || val.parentNode === loadpage) {
            val.parentNode.classList.add('hidden')
            resetData()
            resetCss()
            chzh.level = 0
        }
        action(a)
    })
})
document.querySelectorAll('.relevel').forEach(val => {
    val.addEventListener('click', e => {
        var a = [defaultData.idxs, defaultData.par, defaultData.tag, ...defaultData.classes]
        if (val.parentNode === overpage || val.parentNode === passpage) {
            val.parentNode.classList.add('hidden')
            resetData()
            resetCss()
        }
        setLevel(chzh.level)
        action(a)
    })
})
document.querySelectorAll('.nextlevel').forEach(val => {
    val.addEventListener('click', e => {
        var a = [defaultData.idxs, defaultData.par, defaultData.tag, ...defaultData.classes]
        if (val.parentNode === overpage || val.parentNode === passpage) {
            val.parentNode.classList.add('hidden')
            resetData()
            resetCss()
        }
        chzh.level++;
        setLevel(chzh.level)
        action(a)
    })
})
