import { useState } from 'react'

export default function useCacheState(initialValue) {
    const [state, setState] = useState(initialValue);
    let tmp = state;
    const Setter=(value)=>{
        tmp=value;
        setState(value);
    }
    const Getter=()=>{
        return tmp;
    }

    return [Getter,Setter,state]
}