import React from 'react';
import { SortType } from "./types";

type SelectorProps = {
    _type: SortType,
    current: SortType,
    setSortType: (_: SortType) => void
    children: React.ReactNode
}

export default function Selector({ _type, current, setSortType, children }: SelectorProps) {
    return (
        <a
            className={`selector ${_type === current ? 'selected text-danger' : ''}`}
            onClick={() => setSortType(_type)}
        >
            { children }
        </a>
    )
}
