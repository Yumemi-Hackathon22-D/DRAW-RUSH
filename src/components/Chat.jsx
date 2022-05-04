import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { firestore, db, storage } from '../firebase/index';
import { ref, push, set, serverTimestamp, onValue, off, onChildAdded } from 'firebase/database';
import { collection, doc, addDoc, getDoc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
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
import { Lock, LockOpen, PlayCircleOutline, Send } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DrawZone from './DrawZone';
import { ref as storageRef, uploadString, getBlob } from 'firebase/storage';
import useCacheState from '../CacheState'
import Balloon from './Balloon';

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
    const allRoomRef = collection(firestore, 'rooms');
    //呼び出せる関数はDrawZone.jsxのL14らへんに定義してあります。
    const drawZoneRef = useRef();
    const [getGameState, setGameState, stateGameState] = useCacheState('');
    //const painter = useRef('');
    const [getPainter, setPainter, statePainter] = useCacheState('');
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
    const balloonRef = useRef();
    const [imgUrl, setImgUrl] = useState('');
    const [ansLocked, setAnsLocked] = useState(false);
    const [answer, setAnswer] = useState('');
    const [answerDatas, setAnswerDatas] = useState([]);
    const storageReference = storageRef(
        storage,
        roomId.current + '.jpg'
    );
    const roomRef = useRef();
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
        }
    }, []);
    //ゲームの進行状態を監視
    useEffect(() => {
        console.log(getGameState());
        switch (getGameState()) {
            case GameState.WAIT_MORE_MEMBER: {
                break;
            }
            case GameState.WAIT_START: {
                //キレイキレイ
                setImgUrl("")
                break;
            }
            case GameState.DRAW: {
                break;
            }
            case GameState.CHAT: {
                getBlob(storageReference).then((blob) => {
                    const url = window.URL || window.webkitURL
                    setImgUrl(url.createObjectURL(blob));
                })
                break;
            }
            case GameState.CHECK_ANSWER: {
                break;
            }
            case GameState.RESULT: {
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

    const Checked = async () => {
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 1000);
    };
    const ShowChat = () => {
        let result = [];
        if (messages === '') return;
        for (let [key, i] of Object.entries(messages)) {
            result.push(
                <tr key={key}>
                    <th>{userDictionary[i.userId] || 'Unknown太郎'}</th>
                    <td>{i.msg}</td>
                    <td>{new Date(i.timeStamp).toLocaleTimeString('ja-JP')}</td>
                </tr>
            );
        }
        return (
            <table>
                <tbody>{result}</tbody>
            </table>
        );
    };
    const SetGameState = (state, then = () => {
    }) => {
        console.log(state);
        console.log(roomRef);
        updateDoc(roomRef.current, { State: state }).then(() => {
            setGameState(state)
            then();
        });
    };
    const Join = useCallback(() => {
        let createSelf = false;
        if (
            (userName === '' || roomName === '') &&
            !cookie.userId &&
            !cookie.roomId
        ) {
            alert('ルーム名かユーザー名を入力してください');
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
                    State === GameState.WAIT_START
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
            roomRef.current = await doc(allRoomRef, roomId);
            if (cookie === null || cookie === '' || !Object.keys(cookie).length) {
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
                        console.log(balloonRef);
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
                                if (
                                    getGameState() === GameState.WAIT_MORE_MEMBER
                                ) {
                                    SetGameState(GameState.WAIT_START);
                                } else if (GameState.CHAT) {
                                    if (querySnapshot.docs.every(doc => doc.data().answer || getPainter() === doc.id)) {
                                        console.log("WTF")
                                        SetGameState(GameState.CHECK_ANSWER, () => {
                                            let tmp_answerDatas = [];
                                            querySnapshot.forEach((doc) => {
                                                if (getPainter() !== doc.id) {
                                                    const data = doc.data()
                                                    tmp_answerDatas.push({
                                                        answer: data.answer,
                                                        userId: doc.id,
                                                        name: data.name,
                                                        isCorrect: false
                                                    });
                                                }
                                            });
                                            setAnswerDatas(tmp_answerDatas);
                                        })
                                    }
                                }
                            }
                        }
                    },
                })
            );
            JoinChat(id);
            setIsJoined(true);
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
            const Ref = ref(db, 'rooms/' + roomId.current + '/messages');
            off(Ref);
            roomId.current = '';
            userId.current = '';
            setUserDictionary({});
            balloonRef.current.syncUsers({});
            setMessages('');
            setGameState('');
            setroomName("");
            setUserName("");
            removeCookie('userId');
            removeCookie('roomId');
            setIsJoined(false);
        });
    }, [userDictionary, userName, messages, stateGameState, roomName, isJoined]);

    const LockAnswer = useCallback(() => {
        updateDoc(doc(collection(roomRef.current, '/members/'), userId.current), {
            answer: answer
        }).then(() => {
            setAnsLocked(true)
        })

    }, [answer]);
    return (
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
                    <Button variant='contained' color='error' onClick={Left}>
                        Left
                    </Button>
                ) : (
                    <Button variant='contained' onClick={Join}>
                        Join
                    </Button>
                )}
            </div>
            {isJoined ? (
                <>
                    <div>
                        <TextField
                            value={sendMessage}
                            onChange={(e) => {
                                setSendMessage(e.target.value);
                            }}
                            variant='filled'
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <IconButton
                                            onClick={handleSubmit}
                                            edge='end'
                                            color='primary'
                                            disabled={sendMessage === ''}
                                        >
                                            {<Send />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        ></TextField>
                    </div>
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
                        </span>
                    </div>
                    <ShowChat></ShowChat>
                </>
            ) : (
                <></>
            )}
            {isPainter && (
                <>
                    <h3>メンバー数:{Object.keys(userDictionary).length}</h3>
                    <DrawZone
                        ref={drawZoneRef}
                        penRadius={5}
                        odai={'くるま！！！！'}
                        onDrawEnd={(imageDataUrl) => {

                            // Data URL string
                            uploadString(storageReference, imageDataUrl, 'data_url').then(
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
                                            SetGameState(GameState.DRAW, () => {
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
                    <img src={imgUrl} alt={"書かれたもの"} />
                    {!isPainter && <TextField
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
                    ></TextField>}
                </>
            }
            {getGameState() === GameState.CHECK_ANSWER && answerDatas.length !== 0 &&
                <>
                    <div>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>名前</TableCell>
                                        <TableCell>回答</TableCell>
                                        <TableCell>正誤</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {answerDatas.map((ans, index) => (

                                        <TableRow
                                            key={ans.userId}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {ans.name}
                                            </TableCell>
                                            <TableCell>
                                                {ans.answer}
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    checked={ans.isCorrect}
                                                    onChange={(event) => {
                                                        setAnswerDatas((prevState) =>
                                                            prevState.map((preAns, i) => (i === index ? {
                                                                ...preAns,
                                                                isCorrect: event.target.checked
                                                            } : preAns))
                                                        )
                                                    }}
                                                    inputProps={{ 'aria-label': 'controlled' }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button variant={"contained"} onClick={() => {
                        }}>送信</Button>
                    </div>
                </>
            }
        </div>
    );
};

export default Room;
