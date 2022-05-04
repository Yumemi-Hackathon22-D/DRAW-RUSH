import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Button, Typography} from "@mui/material";
import {PlayCircleOutline} from "@mui/icons-material";
import * as React from "react"
const aspectRatio = 9 / 16
//例. <DrawZone penRadius={10}></DrawZone>
const DrawZone = forwardRef((props, drawZoneRef) => {
    const canvasRef = React.useRef();
    const [click, setClick] = React.useState(false);
    const [lastX, setLastX] = React.useState(0);
    const [lastY, setLastY] = React.useState(0);
    let canvasContext = useRef(null);
    useImperativeHandle(drawZoneRef, () => {
        return {
            //ここに関数を定義すれば外部からもよびだせるよ～～～ん
            clearCanvas() {
                clear();
            }

        }
    })

    useEffect(() => {
        // コンストラクタとコールバック
        const observer = new ResizeObserver((entries) => {

            console.log("ここが何回も予備だあsれる")
            canvasRef.current.width = entries[0].contentRect.width;
            canvasRef.current.height = aspectRatio * entries[0].contentRect.width;

            if (canvasContext.current != null) {
                clear();
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
    }, [/*canvasRef.current*/]);
    useEffect(() => {

        if (canvasRef.current) {
            canvasContext.current = canvasRef.current.getContext('2d');

            canvasRef.current.width = canvasRef.current.clientWidth;
            canvasRef.current.height = aspectRatio * canvasRef.current.clientWidth;
        }
        if (canvasContext.current != null) {
            clear();
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
        canvasContext.current.fillStyle = "#FFFFFF";
        canvasContext.current.fillRect(0,0,canvasRef.current.width, canvasRef.current.height);

    }
    const [beforeStart,setBeforeStart]=useState(true);
    const [time,setTime]=useState(3);
    const timeRef = useRef(time);
    timeRef.current = time;
    const startTimer=useCallback(()=>{

        setTime(3)
        setBeforeStart(false)
       let timer= setInterval(()=>{
            setTime(timeRef.current-0.1)
            if (timeRef.current-0.1<= 0) {
                setBeforeStart(true);
                const imageDataUrl=canvasRef.current?.toDataURL("image/jpeg",0);
                console.log(imageDataUrl);
                props.onDrawEnd(imageDataUrl);
                clear();
                clearInterval(timer);
            }
        }, 100);
    },[time])

    return (
        <div>
            <Typography variant={"h5"}>お題:{props.odai} <span className={"timer"}>{time.toFixed(1)}</span></Typography>

            {beforeStart &&
            <div className={"blocker"}>

                    <Typography variant={"h6"}>今から3秒間の間に上のお題を描いてください。当ててもらえるように頑張って！！</Typography>

                <p>
                    <Button variant={"contained"} onClick={startTimer}><PlayCircleOutline></PlayCircleOutline>ここをクリックでスタート</Button>
                </p>

            </div>
            }
            <canvas
                className={'canvas'}
                ref={canvasRef}
                onPointerDown={clickHandler}
                onPointerEnter={clickHandler}
                onPointerUp={pointerOutHandler}
                onPointerOut={pointerOutHandler}
                onPointerMove={pointerMoveHandler}
            ></canvas>
            <button onClick={clear}>clear</button>
        </div>
    );
});


export default DrawZone;