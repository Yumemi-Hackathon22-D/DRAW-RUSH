import {Button, IconButton, TextField} from "@mui/material";
import React, {useState} from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import {Link} from "@mui/icons-material";

export default function JoinForm(props: {
    roomName: string,
    userName: string,
    isJoined: boolean,
    onRoomNameChange: (value: string) => void,
    onUserNameChanged: (value: string) => void,
    Join: ()=>Promise<void>,
    Left: () => void
}) {
    const [isJoinPressed, setIsJoinPressed] = useState(false);
    return (
        <><TextField
            disabled={props.isJoined}
            value={props.roomName}
            onChange={(e) => {
                let tmpRoomname = e.target.value;
                console.log(tmpRoomname);
                props.onRoomNameChange(e.target.value);
            }}
            label='ルーム名/ID'
            variant='filled'
        ></TextField><TextField
            value={props.userName}
            disabled={props.isJoined}
            label='ユーザー名'
            onChange={(e) => props.onUserNameChanged(e.target.value)}
            variant='filled'
        ></TextField>
            {props.isJoined ?
                (<Button variant='contained' color='error' onClick={props.Left}>
                    Left
                </Button>)
                :
                (<Button variant='contained' onClick={async () => {
                    setIsJoinPressed(true)
                    await props.Join()
                    setIsJoinPressed(false)
                }} disabled={isJoinPressed}>
                    Join
                </Button>)
            }


        </>)
}
