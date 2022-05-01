import React, { useCallback, useEffect, useRef } from "react";


const DrawZone = (props) => {
    const ref = React.createRef();
    const [click, setClick] = React.useState(false);
    const [lastX, setLastX] = React.useState(0);
    const [lastY, setLastY] = React.useState(0);
    let canvasContext = useRef(null)
    useEffect(() => {
        if (ref.current) {
            canvasContext.current = ref.current.getContext("2d");
        }
        if (canvasContext.current != null) {
            canvasContext.current.lineWidth = props.penRadius;
            canvasContext.current.strokeStyle = "black";
            canvasContext.current.lineJoin = "round";
            canvasContext.current.lineCap = "round";
        }
    }, [canvasContext, ref])
    const clickHandler = useCallback((e) => {
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        console.log(`Click:${x},${y}`);
        setClick(true);
        if (canvasContext.current != null) {
            setLastX(x);
            setLastY(y);
            canvasContext.current.beginPath();
            canvasContext.current.moveTo(x, y);
            canvasContext.current.lineTo(x, y);
            canvasContext.current.stroke();
            canvasContext.current.closePath();
        }

    }, []);
    const pointerOutHandler = useCallback((e) => {
        if (click) {

            console.log(`Out:${e.nativeEvent.offsetX},${e.nativeEvent.offsetY}`);
            setClick(false);
        }
    }, [click]);
    const pointerMoveHandler = useCallback((e) => {
        if (click) {
            const x = e.nativeEvent.offsetX;
            const y = e.nativeEvent.offsetY;
            console.log(`${x},${y}`);
            if (canvasContext.current != null) {

                canvasContext.current.beginPath();
                canvasContext.current.moveTo(lastX, lastY);
                canvasContext.current.lineTo(x, y);
                canvasContext.current.stroke();
                canvasContext.current.closePath();
                setLastX(x);
                setLastY(y);
            }
        }
    }, [click, lastX, lastY]);


    return (
        <div>
            <canvas className={"Canvas"} width={800} height={600} ref={ref}
                    onPointerDown={clickHandler}
                    onPointerUp={pointerOutHandler}
                    onPointerMove={pointerMoveHandler}
            ></canvas>
        </div>)
}
export default DrawZone;
