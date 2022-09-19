import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, } from 'react';
import { useCookies } from 'react-cookie';
import { firestore, db, storage } from '../firebase/index';
import { ref, push, set, serverTimestamp, onValue, off, onChildAdded } from 'firebase/database';
import { collection, doc, addDoc, getDoc, onSnapshot, updateDoc, deleteDoc, getDocs, deleteField } from 'firebase/firestore';
import {
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Typography,
    TableContainer,
    Paper,
    Table,
    TableHead, TableRow, TableCell, TableBody, Checkbox
} from '@mui/material';
import { Lock, LockOpen, PlayCircleOutline, Send, Link } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DrawZone, {DrawZoneRef} from './DrawZone';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import useCacheState from '../CacheState'
import Balloon from './Balloon';
import ClearIcon from '@mui/icons-material/Clear'
import { getRandomOdai } from '../odaiLoader'
import './../test.css'
import getParam from '../getParam'
import {DocumentReference} from "@firebase/firestore"
const GameState = {
    //enum風
    WAIT_MORE_MEMBER: 'waitMember', //独りぼっち　さみしい

    WAIT_START: 'waitStart', //スタート待ち
    DRAW: 'draw', //お絵描き中、画像アップロード待ち
    CHAT: 'chat', //話し合い中
    CHECK_ANSWER: 'checkAnswer', //答え合わせ
    RESULT: 'result', //結果ー＞goto DRAW or END

    END: 'end', //ゲーム終了
};

export const Room = () => {
    const chatscrollRef = useRef<HTMLDivElement>();
    const allRoomRef = collection(firestore, 'rooms');
    //呼び出せる関数はDrawZone.jsxのL14らへんに定義してあります。
    const drawZoneRef = useRef<DrawZoneRef>();
    const [getGameState, setGameState, stateGameState] = useCacheState('');
    const [getPainter, setPainter] = useCacheState('');
    const [isJoined, setIsJoined] = useState(false);
    const [roomName, setroomName] = useState('');
    const roomId = useRef('');
    const userId = useRef('');
    const [messages, setMessages] = useState('');
    const [sendMessage, setSendMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [cookie, setCookie, removeCookie] = useCookies();
    const [userDictionary, setUserDictionary] = useState({});
    const firestoreListenersRef = useRef([]);
    const [isCopied, setIsCopied] = useState(false);
    const [isUrlCopied, setIsUrlCopied] = useState(false);
    const balloonRef = useRef();
    const [imgUrl, setImgUrl] = useState('');
    const [ansLocked, setAnsLocked] = useState(false);
    const [sentAnswer, setSentAnswer] = useState(false);
    const [answer, setAnswer] = useState('');
    const [answerDatas, setAnswerDatas] = useState<{
        answer: string,
        userId: string,
        isCorrect: boolean
    }[]>([]);
    const [odai, setOdai] = useState('');
    const [isCompositionend, setIsCompositionend] = useState(false);
    const [isJoinPressed, setIsJoinPressed] = useState(false);

    const roomRef = useRef<DocumentReference>();
    const isPainter =
        getPainter() === userId.current && getPainter() !== '';
    const SetRoomID = (value) => {
        roomId.current = value;
        setCookie('roomId', value);
    };
    const SetUserId = (value) => {
        userId.current = value;
        setCookie('userId', value);
    };
    useEffect(() => {
        //Cookieの管理 Cookieがあれば入り直す
        if (cookie.userId && cookie.roomId) {
            roomId.current = cookie.roomId;
            userId.current = cookie.userId;
            Join();
        } else {
            setroomName(getParam("roomId") ?? "")
        }
    }, []);
    const Clean = () => {
        balloonRef.current = undefined;
        setImgUrl("");
        setAnsLocked(false);
        setSentAnswer(false);
        setAnswer('');
        setAnswerDatas([]);
        setOdai('')
    }

    //ゲームの進行状態を監視
    useEffect(() => {
        console.log(getGameState());
        switch (getGameState()) {
            case GameState.WAIT_MORE_MEMBER: {
                break;
            }
            case GameState.WAIT_START: {
                //キレイキレイ
                Clean();
                setOdai(getRandomOdai())

                break;
            }
            case GameState.DRAW: {
                break;
            }
            case GameState.CHAT: {
                /*getBlob().then((blob) => {
                    const url = window.URL || window.webkitURL
url.createObjectURL(blob)
                });*/
                getDownloadURL(storageRef(
                    storage,
                    roomId.current + '.jpg'
                ))
                    .then((url) => {
                        const xhr = new XMLHttpRequest();
                        xhr.responseType = 'blob';
                        xhr.onload = (event) => {
                            const blob = xhr.response;
                        };
                        xhr.open('GET', url);
                        xhr.send();
                        setImgUrl(url);
                    })
                    .catch((error) => {
                        console.error(error)
                        // Handle any errors
                    });
                break;
            }
            case GameState.CHECK_ANSWER: {
                break;
            }
            case GameState.RESULT: {
                if (isPainter) {

                } else {
                    //正解データを同期
                    getDocs(collection(roomRef.current!, "members")).then((querySnapshot) => {
                        let tmp_answerDatas = [];
                        querySnapshot.forEach((doc) => {
                            if (getPainter() !== doc.id) {
                                const data = doc.data()
                                tmp_answerDatas.push({
                                    answer: data.answer,
                                    userId: doc.id,
                                    isCorrect: data.isCorrect
                                });
                                updateDoc(doc.ref, {
                                    answer: deleteField(),
                                    userId: deleteField(),
                                    isCorrect: deleteField()
                                });
                            }
                        });
                        setAnswerDatas(tmp_answerDatas);

                    })
                }
                break;
            }
            case GameState.END: {
                break;
            }
            default:
                break;
        }
    }, [stateGameState]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const messageRef = push(ref(db, 'rooms/' + roomId.current + '/messages/'), {
            userId: userId.current,
            msg: sendMessage,
            timeStamp: serverTimestamp(),
        });
        setSendMessage('');
    };

    const jaRegexp = /^[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+$/

    const handleSubmitKey = async (e) => {
        e.preventDefault();
        if (sendMessage.trim() === '') return
        if (sendMessage.match(jaRegexp) && !isCompositionend) {
            return
        }
        {
            setIsCompositionend(false);
            let messageRef = push(ref(db, 'rooms/' + roomId.current + '/messages/'), {
                userId: userId.current,
                msg: sendMessage,
                timeStamp: serverTimestamp(),
            });
            setSendMessage('');
        }
    };

    const Checked = async () => {
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 1000);
    };
    const CheckedUrl = async () => {
        setIsUrlCopied(true);
        setTimeout(() => {
            setIsUrlCopied(false);
        }, 1000);
    };
    const GetUserNameById = (uid) => {
        return (userDictionary[uid] || 'Unknown太郎');
    }

    const ShowChat = () => {
        let result = [];
        useLayoutEffect(() => {
            if (chatscrollRef.current) chatscrollRef.current.scrollIntoView()
        })
        if (messages === '') return;
        for (let [key, i] of Object.entries(messages)) {
            const info=i as unknown as{userId:string,msg:string,timeStamp:number}
            let articleClass = info.userId === userId.current ? "msg-self" : "msg-remote"
            articleClass += " msg-container"
            result.push(
                <article className={articleClass}>
                    <div className="msg-box">
                        <div className="flr">
                            <p className="msg" id="msg-0">{info.msg}</p>
                        </div>
                        <span className="timestamp"><span className="username">{GetUserNameById(info.userId)}</span>-<span
                            className="posttime">{new Date(info.timeStamp).toLocaleTimeString('ja-JP')}</span></span>
                    </div>
                </article>
            );
        }

        return (
            <section className="chat-window" >{result}
                <div ref={chatscrollRef}></div>
            </section>

        )

    };
    const SetGameState = async (state) => {
        console.log(state);
        console.log(roomRef.current);
        await updateDoc(roomRef.current, { State: state });
        setGameState(state)
    };


    const Join = useCallback(() => {
        setIsJoinPressed(true)
        let createSelf = false;
        if (
            (userName === '' || roomName === '') &&
            !cookie.userId &&
            !cookie.roomId
        ) {
            alert('ルーム名かユーザー名を入力してください');
            setIsJoinPressed(false);
            return;
        }
        const CheckRoom = async () => {
            //Cookieから取り出す
            let rN = roomName;
            if (rN === '') {
                rN = roomId.current;
            }
            let Ref = await doc(allRoomRef, rN);
            let docSnap = await getDoc(Ref);
            if (!docSnap.exists()) {
                let Id = await CreateRoom();
                SetRoomID(Id);
                return Id;
            } else {
                const State = docSnap.data().State;
                if (
                    State === GameState.WAIT_MORE_MEMBER ||
                    State === GameState.WAIT_START || (roomId.current && userId.current)
                ) {
                    setGameState(State)
                    SetRoomID(rN);
                    return rN;
                }

                return '';
            }
        };

        const CreateRoom = async () => {
            let res = await addDoc(allRoomRef, { Name: roomName });
            SetRoomID(res.id);
            await set(ref(db, 'rooms/' + res.id), { messages: '' });
            console.log(res.id);
            createSelf = true;
            return res.id;
        };
        const SetRoom = async (roomId) => {
            console.log(roomId);
            roomRef.current = doc(allRoomRef, roomId);
            if (cookie.roomId === undefined || cookie.roomId === '' || cookie.userId === undefined || cookie.userId === "" || !Object.keys(cookie).length) {
                const userRef = await addDoc(collection(roomRef.current, '/members/'), {
                    name: userName,
                });
                SetUserId(userRef.id);
            }
            if (createSelf) {
                //自分が作成者ならPainterを自分に
                await updateDoc(roomRef.current, { Painter: userId.current });
                setPainter(userId.current);
            }
        };

        const JoinRoom = async () => {
            let id = await CheckRoom();
            if (id === '') {
                return '';
            }
            await SetRoom(id);
            setIsJoinPressed(false);
            return id;
        };

        JoinRoom().then((id) => {
            if (id === '') {
                alert('待機状態でなかったため、入れませんでした');
                return;
            }
            const roomDoc = doc(allRoomRef, id); //Not
            const q = collection(roomDoc, '/members/');


            firestoreListenersRef.current.push(
                onSnapshot(roomDoc, {
                    next: (doc) => {
                        const data = doc.data();
                        console.log(data);
                        setroomName(data.Name);
                        setGameState(data.State);

                        setPainter(data.Painter);
                    },
                })
            );

            firestoreListenersRef.current.push(
                onSnapshot(q, {
                    next: (querySnapshot) => {
                        let tmp = {};

                        querySnapshot.forEach((doc) => {
                            console.log(doc.id);
                            console.log(doc.data());
                            tmp[doc.id] = doc.data().name;
                        });
                        setUserName(tmp[userId.current]);
                        setUserDictionary(tmp);
                        // console.log(balloonRef);
                        // balloonRef.current.syncUsers(tmp);

                        const Alone = async () => {
                            if (getPainter() !== userId.current) {
                                await updateDoc(roomRef.current, {
                                    Painter: userId.current,
                                }).then(() => {
                                    //setPainter(userId.userId)
                                });
                            }
                            SetGameState(GameState.WAIT_MORE_MEMBER);
                        };

                        const userIds = Object.keys(tmp)
                        if (userIds.length <= 1) {
                            Alone(); //独りぼっちならPainterを自分にかつ状態をWAIT_MORE_MEMBERに
                        } else {
                            console.log(getGameState())

                            if (!userIds.includes(getPainter()) && userIds[0] === userId.current) {
                                updateDoc(roomRef.current, {
                                    Painter: userId.current,
                                }).then(() => {
                                    SetGameState(GameState.WAIT_START)
                                });
                            }
                            if (getPainter() === userId.current) {
                                if (getGameState() === GameState.WAIT_MORE_MEMBER) {
                                    SetGameState(GameState.WAIT_START);
                                } else if (getGameState() === GameState.CHAT) {
                                    if (querySnapshot.docs.every(doc => doc.data().answer || getPainter() === doc.id)) {
                                        SetGameState(GameState.CHECK_ANSWER).then(() => {
                                            let tmp_answerDatas = [];
                                            querySnapshot.forEach((doc) => {
                                                if (getPainter() !== doc.id) {
                                                    const data = doc.data()
                                                    tmp_answerDatas.push({
                                                        answer: data.answer,
                                                        userId: doc.id,
                                                        isCorrect: false
                                                    });
                                                }
                                            });
                                            setAnswerDatas(tmp_answerDatas);
                                        })
                                    }
                                }
                            } else if (getGameState() === GameState.CHAT) {
                                if (querySnapshot.docs.every(doc => doc.data().answer || getPainter() === doc.id)) {
                                    SetGameState(GameState.CHECK_ANSWER).then(() => {
                                        let tmp_answerDatas = [];
                                        querySnapshot.forEach((doc) => {
                                            if (getPainter() !== doc.id) {
                                                const data = doc.data()
                                                tmp_answerDatas.push({
                                                    answer: data.answer,
                                                    userId: doc.id,
                                                    isCorrect: false
                                                });
                                            }
                                        });
                                        setAnswerDatas(tmp_answerDatas);
                                    })
                                }
                            }

                        }
                    },
                })
            );
            JoinChat(id);
            setIsJoined(true);
        }).finally(() => {
            setIsJoinPressed(false);
        });
        const JoinChat = (id) => {
            const chatRef = ref(db, 'rooms/' + id + '/messages');
            onChildAdded(chatRef, (snapshot) => {
                console.log(snapshot.val());

            })
            onValue(chatRef, (snapshot) => {
                console.log(snapshot.val());
                let selfmessages = snapshot.val();
                setMessages(selfmessages);

            });
        };
    }, [roomName, userName]);
    const Left = useCallback(() => {
        firestoreListenersRef.current.forEach((l) => {
            l();
        });
        deleteDoc(
            doc(allRoomRef, roomId.current + '/members/' + userId.current)
        ).finally(() => {
            roomId.current = '';
            userId.current = '';
            setUserDictionary({});
            // balloonRef.current.syncUsers({});
            setMessages('');
            setGameState('');
            setroomName("");
            setUserName("");
            removeCookie('userId');
            removeCookie('roomId');
            setIsJoined(false);
            setAnsLocked(false)
            setAnswer('');
            setSentAnswer(false);
            const Ref = ref(db, 'rooms/' + roomId.current + '/messages');
            off(Ref);
        });
    }, [sentAnswer, userDictionary, userName, messages, stateGameState, roomName, isJoined, ansLocked, answer]);

    const LockAnswer = useCallback(() => {
        updateDoc(doc(collection(roomRef.current, '/members/'), userId.current), {
            answer: answer
        }).then(() => {
            setAnsLocked(true)
            setSentAnswer(true)
        })

    }, [answer]);
    const SubmitResult = () => {
        setSentAnswer(true);
        const Async = async () => {
            for (const ans of answerDatas) {
                await updateDoc(doc(collection(roomRef.current, '/members/'), ans.userId), {
                    isCorrect: ans.isCorrect
                })
            }
        }
        Async().then(() => {
            SetGameState(GameState.RESULT)
        })
    }
    const StartNewGame = useCallback(() => {
        const uids = Object.keys(userDictionary).filter(uid => uid !== getPainter())
        updateDoc(roomRef.current, {
            Painter: uids[Math.floor(Math.random() * uids.length)]
        }).then(() => {
            SetGameState(GameState.WAIT_START);
        })
    }, [userDictionary])
    return (
        <div>
            <div style={{ width: '50%', flex: 1, flexDirection: 'row' }}>
                <div>

                    <div>
                        <TextField
                            disabled={isJoined}
                            value={roomName}
                            onChange={(e) => {
                                let tmpRoomname = e.target.value;
                                console.log(tmpRoomname)
                                setroomName(e.target.value);
                            }}
                            label='ルーム名/ID'
                            variant='filled'
                        ></TextField>
                        <TextField
                            value={userName}
                            disabled={isJoined}
                            label='ユーザー名'
                            onChange={(e) => setUserName(e.target.value)}
                            variant='filled'
                        ></TextField>
                        {isJoined ? (
                            <div>
                                <Button variant='contained' color='error' onClick={Left}>
                                    Left
                                </Button>
                                <div>
                                    <span>
                                        この部屋のID: {roomId.current}
                                        <IconButton
                                            aria-label='copy'
                                            onClick={() => {
                                                navigator.clipboard.writeText(roomId.current);
                                                Checked();
                                            }}
                                        >
                                            {' '}
                                            {!isCopied ? <ContentCopyIcon /> : <CheckIcon />}
                                        </IconButton>
                                        <IconButton
                                            aria-label='copyLink'
                                            onClick={() => {
                                                const shareUrl = window.location.origin + "?roomId=" + roomId.current
                                                navigator.clipboard.writeText(shareUrl);
                                                CheckedUrl();
                                            }}
                                        >

                                            {' '}
                                            {!isUrlCopied ?
                                                <Link /> :
                                                <CheckIcon />
                                            }
                                        </IconButton>
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <Button variant='contained' onClick={Join} disabled={isJoinPressed}>
                                Join
                            </Button>
                        )}
                        <div>

                        </div>
                    </div>

                </div>
                {isJoined ? (
                    <>
                        <div style={{
                            width: '35%',
                            height: '100%',
                            flex: 1,
                            flexDirection: 'column',
                            position: 'fixed',
                            right: 0,
                            backgroundColor: "#2f323b",
                        }}>
                            <ShowChat></ShowChat>
                            {/* <div> */}
                            <TextField
                                label="お話しよう！"
                                style={{ display: 'flex', width: '35%', position: 'fixed', bottom: 0, backgroundColor: 'white' }}
                                value={sendMessage}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSubmitKey(e)
                                }}
                                onChange={(e) => {
                                    setSendMessage(e.target.value);
                                }}
                                onCompositionEnd={() => {
                                    setIsCompositionend(true)
                                }}
                                variant='filled'
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton
                                                onClick={handleSubmit}
                                                edge='end'
                                                color='primary'
                                                disabled={sendMessage.trim() === ''}
                                            >
                                                {<Send />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            ></TextField>
                            {/* </div> */}

                        </div>
                    </>
                ) : (
                    <></>
                )}</div>
            <div style={{ width: '65%' }}>
                {isPainter && (
                    <>
                        <h3>メンバー数:{Object.keys(userDictionary).length}</h3>
                        <DrawZone
                            ref={drawZoneRef}
                            penRadius={5}
                            odai={odai}
                            onDrawEnd={(imageDataUrl) => {

                                // Data URL string
                                uploadString(storageRef(
                                    storage,
                                    roomId.current + '.jpg',
                                ), imageDataUrl, 'data_url',{ cacheControl: "no-cache" }).then(
                                    (snapshot) => {

                                        SetGameState(GameState.CHAT);
                                    }
                                );
                            }}
                            canvasOverRay={() => {
                                return (<>
                                    <Typography

                                        variant={"h6"}>
                                        <Balloon ref={balloonRef}></Balloon>
                                        {GameState.WAIT_START !== stateGameState ?
                                            "メンバーが集まるまでお待ちください" :
                                            "今から3秒間の間に上のお題を描いてください。当ててもらえるように頑張って！！"
                                        }

                                    </Typography>
                                    <p>
                                        <Button variant={"contained"}
                                            disabled={GameState.WAIT_START !== stateGameState}
                                            onClick={() => {
                                                SetGameState(GameState.DRAW).then(() => {
                                                    drawZoneRef.current.start();
                                                })
                                            }}><PlayCircleOutline></PlayCircleOutline>ここをクリックでスタート</Button>
                                    </p></>
                                )
                            }}
                        />
                    </>
                )}
                {getGameState() === GameState.CHAT && imgUrl !== '' &&
                    <>

                        {!isPainter ?

                            <div style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <img className={"image"} src={imgUrl} alt={"書かれたもの"} />
                                <TextField
                                    value={answer}
                                    onChange={(e) => {
                                        setAnswer(e.target.value);
                                    }}
                                    label={"回答"}
                                    disabled={ansLocked}
                                    variant='filled'
                                    InputProps={{
                                        endAdornment: (

                                            <InputAdornment position='end'>
                                                <IconButton
                                                    onClick={LockAnswer}
                                                    edge='end'
                                                    color='primary'
                                                    disabled={answer === '' || ansLocked}
                                                >
                                                    {ansLocked ? <Lock /> : <LockOpen />}
                                                </IconButton>
                                            </InputAdornment>

                                        ),
                                    }}
                                ></TextField>
                            </div> : <></>}
                    </>
                }
                {(getGameState() === GameState.CHECK_ANSWER || getGameState() === GameState.RESULT) && answerDatas.length !== 0 &&
                    <>
                        <div>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>名前</TableCell>
                                            <TableCell>回答</TableCell>
                                            {(isPainter || getGameState() === GameState.RESULT) ? <TableCell>正誤(正しければ<Checkbox checked={true} />)</TableCell> : <></>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {answerDatas.map((ans , index) => (

                                            <TableRow
                                                style={{ backgroundColor: (ans.userId === userId.current ? getGameState() === GameState.RESULT ? ans.isCorrect ? '#90ee90' : '#ffa07a' : '#add8e6' : '') }}
                                                key={ans.userId}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {GetUserNameById(ans.userId)}
                                                </TableCell>
                                                <TableCell>
                                                    {ans.answer}
                                                </TableCell>
                                                {(isPainter || getGameState() === GameState.RESULT) ? <TableCell>
                                                    <Checkbox
                                                        checked={ans.isCorrect}
                                                        disabled={getGameState() === GameState.RESULT}
                                                        onChange={(event,checked) => {
                                                            setAnswerDatas((prevState) =>
                                                                prevState.map((preAns, i) => (i === index ? {
                                                                    ...preAns,
                                                                    isCorrect: event.target.checked
                                                                } : preAns))
                                                            )
                                                        }}
                                                        inputProps={{ 'aria-label': 'controlled' }}
                                                        icon={<IconButton>{ans.isCorrect ? <CheckIcon /> :
                                                            <ClearIcon />}</IconButton>}

                                                    ></Checkbox>
                                                </TableCell> : <></>}
                                            </TableRow>
                                        ))
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {(!(sentAnswer && !isPainter) || isPainter) && getGameState() === GameState.CHECK_ANSWER ?
                                <Button variant={"contained"} onClick={SubmitResult}>結果を送信</Button> : <></>}
                            {(getGameState() === GameState.RESULT && isPainter) &&
                                <Button variant={"contained"} onClick={StartNewGame}>次のゲーム</Button>
                            }
                        </div>
                    </>
                }
            </div>
        </div>
    );
};

export default Room;
