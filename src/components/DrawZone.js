import React, { useCallback, useEffect, useRef } from "react";

//例. <DrawZone penRadius={10}></DrawZone>
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

        const isClick=e.buttons===1;

        if (canvasContext.current != null&&isClick) {

            canvasContext.current.beginPath();
            canvasContext.current.moveTo(x, y);
            canvasContext.current.lineTo(x, y);
            canvasContext.current.stroke();
            canvasContext.current.closePath();
            setLastX(x);
            setLastY(y);
        }
        if (isClick){
            setClick(isClick)
        }

    }, [click,lastX,lastY]);
    const pointerOutHandler = useCallback((e) => {
        if (click) {
            const x = e.nativeEvent.offsetX;
            const y = e.nativeEvent.offsetY;
            canvasContext.current.beginPath();
            canvasContext.current.moveTo(lastX, lastY);
            canvasContext.current.lineTo(x, y);
            canvasContext.current.stroke();
            canvasContext.current.closePath();
            setLastX(x);
            setLastY(y);
            setClick(false);
        }
    }, [click,lastX,lastY]);
    const pointerMoveHandler = useCallback((e) => {

        if (click) {
            const x = e.nativeEvent.offsetX;
            const y = e.nativeEvent.offsetY;
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


    function clear() {
        canvasContext.current.clearRect(0, 0, ref.current.width, ref.current.height);
    }
    return (
        <div>
            <canvas className={"Canvas"} width={800} height={600} ref={ref}
                    onPointerDown={clickHandler}
                    onPointerEnter={clickHandler}
                    onPointerUp={pointerOutHandler}
                    onPointerOut={pointerOutHandler}
                    onPointerMove={pointerMoveHandler}
            ></canvas>
        </div>)
}
export default DrawZone;
