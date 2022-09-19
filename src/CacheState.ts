import { useState } from 'react'

export default function useCacheState<T>(initialValue:T):[()=>T,(value:T)=>void,T] {
    const [state, setState] = useState(initialValue);
    let tmp = state;
    const Setter=(value:T)=>{
        tmp=value;
        setState(value);
    }
    const Getter=()=>{
        return tmp;
    }
    return [Getter,Setter,state];
}