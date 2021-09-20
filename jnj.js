kaboom({
    global:true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0,0,0,1],
})
loadSprite('coin', 'sprites/coin.png')
loadSprite('evil-shroom', 'sprites/evil-shroom-1.png')
loadSprite('brick', 'sprites/brick.png')
loadSprite('block', 'sprites/block.png')
loadSprite('mario', 'sprites/mario-standing.png')
loadSprite('mushroom', 'sprites/mushroom.png')
loadSprite('surprise', 'sprites/question.png')
loadSprite('unboxed', 'sprites/unboxed.png')
loadSprite('pipe-top-left', 'sprites/pipe-top-left-side.png')
loadSprite('pipe-top-right', 'sprites/pipe-top-right-side.png')
loadSprite('pipe-bottom-left', 'sprites/pipe-left.png')
loadSprite('pipe-bottom-right', 'sprites/pipe-right.png')
loadSprite('blue-block', 'sprites/blue-block.png')
loadSprite('blue-brick', 'sprites/blue-brick.png')
loadSprite('blue-steel', 'sprites/blue-steel.png')
loadSprite('blue-evil-shroom', 'sprites/blue-evil-shroom.png')
loadSprite('blue-surprise', 'sprites/blue-surprise.png')

const speed=120
const jumpforce=360
const bigjumpforce = 550
let CURRENT_JUMP_FORCE = jumpforce
const FALL_DEATH = 400
const ENEMY_SPEED = 20
let isBig

scene("game",({level,score})=>{
    layers(['bg', 'obj', 'ui'], 'obj')
    const maps=
    [
        [
            '                                       ',
            '                                       ',
            '                                       ',
            '                                       ',
            '                                       ',
            '     %   =*=%=                         ',
            '                                       ',
            '                             -+        ',
            '                       ^   ^ ()        ',   
            '===============================   =====',
        ],
        [
            '£                                       £',
            '£                                       £',
            '£                                       £',
            '£                                       £',
            '£                                       £',
            '£        @@@@@@              x x        £',
            '£                          x x x        £',
            '£                        x x x x  x   -+£',
            '£               z   z  x x x x x  x   ()£',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
          ]
    ]

    const player=add([
        sprite('mario'),
        body(),
        pos(20,20),
        solid(),
        origin('bot'),
        big(),
    ])
    keyDown('right',()=>{player.move(speed,0)})
    keyDown('left',()=>{player.move(-speed,0)})
    keyPress('space',()=>{
        if(player.grounded())
        {
            player.jump(CURRENT_JUMP_FORCE)
        }
    })

    const scorelabel=add([
        text(score),
        pos(30,6),
        scale(2),
        layer('ui'),
        {
            value:score
        }
    ])

    add([text('level'+parseInt(level+1)),scale(2),pos(46,6)])
    
    //original big
    function big()
    {
        let timer = 0
        isBig = false
        CURRENT_JUMP_FORCE = jumpforce
        return {
            update() 
            {
            if (isBig) {
                timer -= dt()
                if (timer <= 0) {
                this.smallify()
                }
            }
            },
            isBig() {
            return isBig
            },
            smallify() {
                CURRENT_JUMP_FORCE = jumpforce
                player.scale = vec2(1)
                timer = 0
                isBig = false
            },
            biggify(time) {
                CURRENT_JUMP_FORCE=bigjumpforce
                this.scale = vec2(2)
                timer = time
                isBig = true     
            }
        }
    }

    player.action(()=>{
        camPos(player.pos)
        {
            if(player.pos.y>=500)
            {
                //scorelabel.text=scorelabel.value
                go('lose',{score:scorelabel.value})
            }
        }
    }
    )

    player.on("headbump",(obj)=>{
        if(obj.is('coin-surprise'))
        {
            gamelvl.spawn('$', obj.gridPos.sub(0, 1))
            gamelvl.spawn('}', obj.gridPos.sub(0,0))
            destroy(obj)
        }
        else if(obj.is('mushroom-surprise'))
        {
            gamelvl.spawn('#', obj.gridPos.sub(0, 1))
            gamelvl.spawn('}', obj.gridPos.sub(0,0))
            destroy(obj)
        }
    })
    player.collides('pipe',()=>{
            keyPress('down',()=>{
            go('game',({level:(level+1)%maps.length,score:scorelabel.value}))
        })
    })
    player.collides('mushroom',(m)=>{
        destroy(m)
        player.biggify(6)
    })
    player.collides('coin',(c)=>{
        destroy(c)
        scorelabel.value++
        scorelabel.text=scorelabel.value
    })
    // collide('dangerous','brick')
    // {
    //     dangerous.move(20,0)
    // }
    player.collides('dangerous',(d)=>{
        if(isBig)
        {
            player.smallify()
        }
        else if(player.grounded())
        {
            go('lose',{score:scorelabel.value})
        }
        else{
            destroy(d)
        }
    })
    action('mushroom',(m)=>{
        m.move(20,0)
    })
    action('dangerous',(d)=>{
        d.move(-20,0)
    })
    const levelcfg={
        width:20,
        height:20,
        '=': [sprite('brick'),solid(),'brick'],   
        '$': [sprite('coin'),'coin'],
        '*': [sprite('surprise'),solid(),'mushroom-surprise'],
        '%': [sprite('surprise'),solid(),'coin-surprise'],
        '}': [sprite('unboxed'),solid()],
        '(': [sprite('pipe-bottom-left'),solid(),scale(0.5)],
        ')': [sprite('pipe-bottom-right'),solid(),scale(0.5)],
        '-': [sprite('pipe-top-left'),solid(),scale(0.5),'pipe'],
        '+': [sprite('pipe-top-left'),solid(),scale(0.5),'pipe'],
        '^': [sprite('evil-shroom'),'dangerous'],
        '#': [sprite('mushroom'),body(),'mushroom'],
        '!': [sprite('blue-block'), solid(), scale(0.5)],
        '£': [sprite('blue-brick'), solid(), scale(0.5),'brick'],
        'z': [sprite('blue-evil-shroom'), scale(0.5), 'dangerous'],
        '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
        'x': [sprite('blue-steel'), solid(), scale(0.5)],
    }
    const gamelvl= addLevel(maps[level],levelcfg)
})
scene("lose",({score})=>{
    add([
        text(score, 50),
        origin('center'),
        pos(width()/2, height()/ 2)
    ])
})
start("game",{level:0,score:0})
