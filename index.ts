const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 3
const scGap : number = 0.02 / parts 
const triSizeFactor : number = 3.4 
const barSizeFactor : number = 8.8 
const delay : number = 20 
const backColor : string = "#bdbdbd"
const colors : Array<string> = [
    "#f44336",
    "#03A9F4",
    "#006064",
    "#E65100",
    "#00C853"
]

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawBarPath(context : CanvasRenderingContext2D, barH : number, triSize : number) {
        context.beginPath()
        context.moveTo(-w / 2, -barH)
        context.lineTo(-w / 2 + (w / 2 - triSize), -barH)
        context.lineTo(0, 0)
        context.lineTo(-w / 2, 0)
        context.lineTo(-w / 2, -barH)
        context.clip()
    }

    static drawTriPath(context : CanvasRenderingContext2D, triSize : number, scale : number) {
        context.moveTo(0, 0)
        context.lineTo(-triSize, -triSize)
        context.lineTo(triSize, -triSize)
        context.lineTo(0, 0)
        context.clip()
        context.fillRect(-triSize, -triSize * scale, 2 * triSize, triSize * scale)
    }
    static drawWedgeSideBar(context : CanvasRenderingContext2D, scale : number) {
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, parts)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, parts)
        const barH : number = h / barSizeFactor 
        const triSize : number = Math.min(w, h) / triSizeFactor 
        context.save()
        context.translate(w / 2, h)
        for (var j = 0; j < 2; j++) {
            context.save()
            context.scale(1 - 2 * j, 1)
            DrawingUtil.drawBarPath(context, barH, triSize)
            context.fillRect(-w / 2, -barH, w / 2  * sf1, barH)
            context.restore()
        }
        DrawingUtil.drawTriPath(context, triSize, scale)
        context.restore()
    }

    static drawWSBNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.fillStyle = colors[i]
        DrawingUtil.drawWedgeSideBar(context, scale)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    dir : number = 0
    prevScale : number = 0 

    update(cb : Function) {
        this.scale += scGap * this.dir 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0
            this.prevScale = this.scale 
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }
}

class Animator {

    animated : boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}

class WSBNode {

    prev : WSBNode 
    next : WSBNode 
    state : State = new State() 

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new WSBNode(this.i + 1)
            this.next.prev = this 
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawWSBNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }
    
    getNext(dir : number, cb : Function) : WSBNode {
        var curr : WSBNode = this.prev 
        if (dir == 1) {
            curr = this.next 
        }
        if (curr) {
            return curr 
        }
        cb()
        return this 
    }
}

class WedgeSideBar {

    curr : WSBNode = new WSBNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {

    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    } 
    
    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    wsb : WedgeSideBar = new WedgeSideBar()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.wsb.draw(context)
    }

    handleTap(cb : Function)  {
        this.wsb.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.wsb.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}