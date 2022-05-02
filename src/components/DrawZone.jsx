import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef} from 'react';
import * as React from "react";
import {Button, Typography} from "@mui/material";
import {PlayCircleOutline} from "@mui/icons-material";

//例. <DrawZone penRadius={10}></DrawZone>
const DrawZone = forwardRef((props,ref) => {
  const canvasRef = React.useRef();
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

  useEffect(() => {
    // コンストラクタとコールバック
    const observer = new ResizeObserver((entries) => {
      canvasRef.current.width = entries[0].contentRect.width;
        canvasRef.current.height = 9 * entries[0].contentRect.width / 16;

      if (canvasContext.current != null) {
        canvasContext.current.lineWidth = props.penRadius;
      }
    });
    if (canvasRef.current) {
      // 要素を監視
      canvasRef.current && observer.observe(canvasRef.current);
    }
    // クリーンアップ関数で監視を解く
    return () => {
      observer.disconnect();
    };
  }, [canvasRef]);
  useEffect(() => {

    if (canvasRef.current) {
      canvasContext.current = canvasRef.current.getContext('2d');

      canvasRef.current.width = canvasRef.current.clientWidth;
      canvasRef.current.height = 9 * canvasRef.current.clientWidth / 16;
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
      <p className={"timer"}>5.00</p>
      <div className={"blocker"}>
        <Typography variant={"h3"}>お題:???</Typography>
        <Typography variant={"body1"}>今から5秒間の間に上のお題を描いてください。当ててもらえるように頑張りましょう！！</Typography>
        <Button variant={"contained"}><PlayCircleOutline></PlayCircleOutline>ここをクリックでスタート</Button>

      </div>
      <canvas
          className={'canvas'}
          ref={canvasRef}
          onPointerDown={clickHandler}
          onPointerEnter={clickHandler}
          onPointerUp={pointerOutHandler}
          onPointerOut={pointerOutHandler}
          onPointerMove={pointerMoveHandler}
      ></canvas><button>clear</button>
    </div>
  );
});


export default DrawZone;