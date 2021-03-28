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
}