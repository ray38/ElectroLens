export function arrayToIdenticalObject(array){
	var result = {}
	for (var i = 0; i < array.length; i++) {
		result[array[i]] = array[i];
	}
	return result;
}

export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function getHexColor(number){
    return "#"+((number)>>>0).toString(16).slice(-6);
}

export function colorToRgb(color) {
	var hex = getHexColor(color);
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(color) {
    return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
}


export function makeTextSprite( message, parameters ){
    
    if ( parameters === undefined ) parameters = {};
    
    var fontface = parameters.hasOwnProperty("fontface") ? 
        parameters["fontface"] : "Arial";
    
    var fontsize = parameters.hasOwnProperty("fontsize") ? 
        parameters["fontsize"] : 18;
    
    var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
        parameters["borderThickness"] : 4;
    
    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
    
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

    //var spriteAlignment = THREE.SpriteAlignment.topLeft;
        
    //var canvas = document.createElement('canvas');
    //var context = canvas.getContext('2d');
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var contextWidth = context.canvas.clientWidth;
    var contextHeight = context.canvas.clientHeight;
    console.log("canvas: " + canvas.width + ", " + canvas.height );
    console.log("context: " + contextWidth + ", " + contextHeight );
    canvas.height = fontsize*2;
    canvas.width = fontsize*2;
    /*console.log("canvas: " + canvas.width + ", " + canvas.height );
    console.log("context: " + contextWidth + ", " + contextHeight );*/
    context.font = "Bold " + fontsize + "px " + fontface;
    
    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;
    
    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                                  + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                                  + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.
    
    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);
    //context.fillText( message, (contextWidth - textWidth) / 2, (contextHeight - textHeight) / 2);
    
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true;

    //var spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false, alignment: spriteAlignment });
    var spriteMaterial = new THREE.SpriteMaterial({ map: texture});
    var sprite = new THREE.Sprite( spriteMaterial );
    //sprite.scale.set(10,5,1.0);
    sprite.scale.set(textWidth,fontsize,1.0);
    sprite.position.normalize();
    return sprite;  

    /*if ( parameters === undefined ) parameters = {};



        var fontface = parameters.hasOwnProperty("fontface") ?

            parameters["fontface"] : "Arial";



        var fontsize = parameters.hasOwnProperty("fontsize") ?

            parameters["fontsize"] : 18;



        var borderThickness = parameters.hasOwnProperty("borderThickness") ?

            parameters["borderThickness"] : 4;



        var borderColor = parameters.hasOwnProperty("borderColor") ?

            parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };



        var fillColor = parameters.hasOwnProperty("fillColor") ?

            parameters["fillColor"] : undefined;



        var textColor = parameters.hasOwnProperty("textColor") ?

            parameters["textColor"] : { r:0, g:0, b:255, a:1.0 };



        var radius = parameters.hasOwnProperty("radius") ?

                    parameters["radius"] : 6;



        var vAlign = parameters.hasOwnProperty("vAlign") ?

                            parameters["vAlign"] : "center";



        var hAlign = parameters.hasOwnProperty("hAlign") ?

                            parameters["hAlign"] : "center";



        var canvas = document.createElement('canvas');

        var context = canvas.getContext('2d');



        // set a large-enough fixed-size canvas.  Both dimensions should be powers of 2.
        canvas.width  = 2048;
        canvas.height = 1024;

        context.font = fontsize + "px " + fontface;
        context.textBaseline = "alphabetic";
        context.textAlign = "left";

        // get size data (height depends only on font size)
        var metrics = context.measureText( message );
        var textWidth = metrics.width;


        // find the center of the canvas and the half of the font width and height
        // we do it this way because the sprite's position is the CENTER of the sprite
        var cx = canvas.width / 2;
        var cy = canvas.height / 2;
        var tx = textWidth/ 2.0;
        var ty = fontsize / 2.0;



        // then adjust for the justification

        if ( vAlign === "bottom")
            ty = 0;

        else if (vAlign === "top")
            ty = fontsize;

        if (hAlign === "left")
            tx = 0;

        else if (hAlign === "right")
            tx = textWidth;



        // the DESCENDER_ADJUST is extra height factor for text below baseline: g,j,p,q. since we don't know the true bbox
        roundRect(context, cx - tx , cy + ty + 0.28 * fontsize,
                textWidth, fontsize, radius, borderThickness, borderColor, fillColor);


        // text color.  Note that we have to do this AFTER the round-rect as it also uses the "fillstyle" of the canvas

        context.fillStyle = getCanvasColor(textColor);
        context.fillText( message, cx - tx, cy + ty);

        // draw some visual references - debug only
        drawCrossHairs( context, cx, cy );
        // outlineCanvas(context, canvas);
        //addSphere(x,y,z);


        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
        var sprite = new THREE.Sprite( spriteMaterial );

        // we MUST set the scale to 2:1.  The canvas is already at a 2:1 scale,
        // but the sprite itself is square: 1.0 by 1.0
        // Note also that the size of the scale factors controls the actual size of the text-label
        sprite.scale.set(4,2,1);

        return sprite;*/
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();   
}

function drawCrossHairs ( context, cx, cy ) {

        context.strokeStyle = "rgba(0,255,0,1)";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(cx-150,cy);
        context.lineTo(cx+150,cy);
        context.stroke();

        context.strokeStyle = "rgba(0,255,0,1)";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(cx,cy-150);
        context.lineTo(cx,cy+150);
        context.stroke();
        context.strokeStyle = "rgba(0,255,0,1)";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(cx-150,cy);
        context.lineTo(cx+150,cy);
        context.stroke();

        context.strokeStyle = "rgba(0,255,0,1)";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(cx,cy-150);
        context.lineTo(cx,cy+150);
        context.stroke();
    }

function getCanvasColor ( color ) {

        return "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")";

    }