import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef} from 'react';
import * as React from "react";

//例. <DrawZone penRadius={10}></DrawZone>
const DrawZone = forwardRef((props,ref) => {
  const canvasRef = React.createRef();
  const [click, setClick] = React.useState(false);
  const [lastX, setLastX] = React.useState(0);
  const [lastY, setLastY] = React.useState(0);
  let canvasContext = useRef(null);
  useImperativeHandle(ref,()=>{
    return{
      clearCanvas() {
        console.log("がいぶからー")
        clear();
      }

    }
  })

  useEffect(()=>{
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.clientWidth;
      canvasRef.current.height = 9*canvasRef.current.clientWidth/16;
    }
  },[ canvasRef.current?.clientWidth,canvasRef.current?.clientHeight]);
  useEffect(() => {

    if (canvasRef.current) {
      canvasContext.current = canvasRef.current.getContext('2d');
    }
    if (canvasContext.current != null) {
      canvasContext.current.lineWidth = props.penRadius;
      canvasContext.current.strokeStyle = 'black';
      canvasContext.current.lineJoin = 'round';
      canvasContext.current.lineCap = 'round';
    }
  }, [canvasContext.current, canvasRef.current]);
  const clickHandler = useCallback(
    (e) => {
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;

      const isClick = e.buttons === 1;

      if (canvasContext.current != null && isClick) {
        canvasContext.current.beginPath();
        canvasContext.current.moveTo(x, y);
        canvasContext.current.lineTo(x, y);
        canvasContext.current.stroke();
        canvasContext.current.closePath();
        setLastX(x);
        setLastY(y);
      }
      if (isClick) {
        setClick(isClick);
      }
    },
    [click, lastX, lastY]
  );
  const pointerOutHandler = useCallback(
    (e) => {
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
    },
    [click, lastX, lastY]
  );
  const pointerMoveHandler = useCallback(
    (e) => {
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
    },
    [click, lastX, lastY]
  );

  function clear() {
    canvasContext.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
  }
  return (
    <div>
      <p className={"Timer"}>5.00</p>
      <canvas
          className={'Canvas'}
          ref={canvasRef}
          onPointerDown={clickHandler}
          onPointerEnter={clickHandler}
          onPointerUp={pointerOutHandler}
          onPointerOut={pointerOutHandler}
          onPointerMove={pointerMoveHandler}
      ></canvas>
      <button onClick={clear}>クリア</button>
    </div>
  );
});


export default DrawZone;