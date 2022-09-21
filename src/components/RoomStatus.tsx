import {Button, IconButton} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import {Link} from "@mui/icons-material";
import React from "react";

export default function RoomStatus(props: {
    isJoined:boolean
}) {
    if (props.isJoined) {
        return (<div>

            <div>
                  <span>
                    この部屋のID: {roomId.current}
                      <IconButton
                          aria-label='copy'
                          onClick={() => {
                              navigator.clipboard.writeText(roomId.current).then(() => Checked());

                          }}
                      >
                                            {' '}
                          {!isCopied ? <ContentCopyIcon/> : <CheckIcon/>}
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
                                                <Link/> :
                                                <CheckIcon/>
                                            }
                                        </IconButton>
                                    </span>
            </div>
        </div>)
    }

    return ()

}
