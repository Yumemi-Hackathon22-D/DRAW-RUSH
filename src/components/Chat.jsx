import React, {useState, useEffect} from 'react';
import {firestore, db} from '../firebase/index';
import {ref, push, set, serverTimestamp, onValue, off} from 'firebase/database';
import {collection, doc, addDoc, getDoc, onSnapshot} from 'firebase/firestore';
import {TextField, Button, IconButton, InputAdornment} from '@mui/material';
import {Send} from '@mui/icons-material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'

export const Room = () => {
    const allRoomRef = collection(firestore, 'rooms');
    let roomRef;
    let tmproomName;
    const [isJoined, setIsJoined] = useState(false);
    const [roomName, setroomName] = useState('');
    const [roomId, setroomId] = useState('');
    const [messages, setMessages] = useState('');
    const [sendMessage, setSendMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [userId, setUserID] = useState('');
    const [firestoreListener, setFirestoreListener] = useState({});
    const [isCopied, setIsCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const messageRef = push(ref(db, 'rooms/' + roomId + '/messages/'), {
            userId: userId,
            msg: sendMessage,
            timeStamp: serverTimestamp()
        });
        setSendMessage('');
    };

    const Checked = async () => {
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false)
        }, 1000)
    }
    const ShowChat = () => {
        let result = [];
        if (messages === null) return;
        for (let [key, i] of Object.entries(messages)) {
            result.push(
                <tr key={key}>
                    <th>{i.userId}</th>
                    <td>{i.msg}</td>
                    <td>{new Date(i.timeStamp).toLocaleTimeString('ja-JP')}</td>
                </tr>
            )
        }
        return (<table>
            <tbody>{result}</tbody>
        </table>);

    }

    const Join = () => {
        if (userName === "" || roomName === "") {
            alert("ルーム名とユーザー名を入力してください")
            return
        }
        const CheckRoom = async () => {
            let Ref = await doc(allRoomRef, roomName);
            let docSnap = await getDoc(Ref);
            if (!docSnap.exists()) {
                let Id = await CreateRoom();
                setroomId(Id)
                return Id
            } else {
                setroomId(roomName)
                return roomName
            }
        }


        const CreateRoom = async () => {
            let res = await addDoc(allRoomRef, {Name: roomName});
            setroomId(res.id);
            await set(ref(db, 'rooms/' + res.id), {messages: ""});
            console.log(res.id);
            return res.id
        }
        const SetRoom = async (roomId) => {
            roomRef =await  doc(allRoomRef, roomId);
            const l=  onSnapshot(collection(roomRef, "/members/"), (doc) => {
                console.log(doc.data());
            })

            setFirestoreListener(l);
            const userRef = await addDoc(collection(roomRef, "/members/"), {
                name: userName
            });
            setUserID(userRef.id);

        }

        const JoinRoom = async () => {
            let id = await CheckRoom();
            await SetRoom(id);
            return id;
        }

        JoinRoom().then((id) => {

            JoinChat(id);
            setIsJoined(true);
        })

        const JoinChat = (id) => {
            const chatRef = ref(db, 'rooms/' + id + '/messages');
            onValue(chatRef, (snapshot) => {
                console.log(snapshot.val());
                let selfmessages = snapshot.val();
                setMessages(selfmessages);
            })
        }


    };
    const Left = () => {
        const Ref = ref(db, 'rooms/' + roomId + '/messages');
        off(Ref);
        setIsJoined(false);
    }

    return (
        <div>
            <div>
                <TextField
                    disabled={isJoined}
                    value={roomName}
                    onChange={(e) => {
                        tmproomName = e.target.value;
                        setroomName(e.target.value);
                    }}
                    label='ルーム名/ID'
                    variant='filled'
                ></TextField>
                <TextField value={userName} disabled={isJoined}
                           label='ユーザー名'
                           onChange={(e) => setUserName(e.target.value)}
                           variant='filled'></TextField>
                {isJoined ? <Button variant="contained" color="error" onClick={Left}>Left</Button> :
                    <Button variant="contained" onClick={Join}>Join</Button>}
            </div>
            {isJoined ? <>


                <div>
                    <TextField value={sendMessage}
                               onChange={(e) => {
                                   setSendMessage(e.target.value);
                               }}
                               variant='filled' InputProps={{
                        endAdornment:
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleSubmit}
                                    edge="end"
                                    color="primary"
                                    disabled={sendMessage === ""}
                                >
                                    {<Send/>}
                                </IconButton>
                            </InputAdornment>
                    }}></TextField>
                </div>
                <div><span>この部屋のID: {roomId}
                    <IconButton aria-label="copy" onClick={() => {
                        navigator.clipboard.writeText(roomId)
                        Checked();
                    }}> {!isCopied ? <ContentCopyIcon/> : <CheckIcon/>}</IconButton></span></div>
                <ShowChat></ShowChat></> : <></>}

        </div>
    );
};

export default Room;
