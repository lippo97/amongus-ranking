import React, { useState } from 'react';
import { RankingDatabase, Player } from '../scripts/ranking';
import { applyAsTuple, combine, crewmatePercentage, formatScore, formatRecord, getScore, impostorPercentage, increasing, nonIncreasing, pair, totalPercentage, Extractor } from './utils';
import { EnhancedPlayer, SortCombined, SortOrder, SortType } from './types';
import Selector from './selector';
import { flow, pipe } from 'fp-ts/lib/function';

import './style.css';

type RankingProps = {
    ranking: RankingDatabase
};


function enhancePlayer(player: Player): EnhancedPlayer {
    const totalGames = player.impostorGames + player.crewmateGames
    const totalWins = player.impostorWins + player.crewmateWins
    return {
        ...player,
        totalGames,
        totalWins,
        totalPercentage: getScore(totalWins, totalGames),
        impostorPercentage: getScore(player.impostorWins, player.impostorGames),
        crewmatePercentage: getScore(player.crewmateWins, player.crewmateGames),
    };
}

function renderPlayer(p?: EnhancedPlayer) {
    return p && (
        <tr>
            <td>{ p.name }</td>
            <td>{ formatRecord(p.impostorWins, p.impostorGames) }</td>
            <td>{ formatScore(p.impostorPercentage) }</td>
            <td>{ formatRecord(p.crewmateWins, p.crewmateGames) }</td>
            <td>{ formatScore(p.crewmatePercentage) }</td>
            <td>{ formatRecord(p.totalWins, p.totalGames) }</td>
            <td>{ formatScore(p.totalPercentage) }</td>
        </tr>
    )
}

function inverse(order: SortOrder): SortOrder {
    return order === 'increasing' ? 'nonIncreasing' : 'increasing';
}

const selectSortType = (_type: SortType): Extractor => {
    switch(_type) {
        case 'total':
            return totalPercentage;
        case 'impostor':
            return impostorPercentage;
        case 'crewmate':
            return crewmatePercentage;
        default:
            return totalPercentage;
    }
}

const selectSortOrder = ({ _type, order }: SortCombined):
    (a: EnhancedPlayer, b: EnhancedPlayer) => number => {

    const selectedOrder = order === 'increasing' ? increasing : nonIncreasing;
    const extractor: Extractor = selectSortType(_type);

    return applyAsTuple(flow(
        extractor,
        selectedOrder,
    ));
}

export default function Ranking({ ranking }: RankingProps) {
    const players: Player[] = Object.values(ranking).map(p => p as Player); // I wanna cry
    const enhancedPlayers = players.map(enhancePlayer);

    const [ sortOrder, setSortOrder ] = useState<SortCombined>({
        _type: 'total',
        order: 'nonIncreasing',
    });

    const setSortType = (newType: SortType) => {
        const { _type, order } = sortOrder;
        if (_type === newType) {
            return setSortOrder({ _type, order: inverse(order)});
        }
        return setSortOrder({ _type: newType, order: 'nonIncreasing' });
    }


    return (
        <div className="table-responsive">
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Impostor record</th>
                        <th>
                            <Selector
                                _type='impostor'
                                current={sortOrder._type}
                                setSortType={setSortType}
                            >
                                Impostor score
                            </Selector>
                        </th>
                        <th>Crewmate record</th>
                        <th>
                            <Selector
                                _type='crewmate'
                                current={sortOrder._type}
                                setSortType={setSortType}
                            >
                                Crewmate score
                            </Selector>
                        </th>
                        <th>Total record</th>
                        <th>
                            <Selector
                                _type='total'
                                current={sortOrder._type}
                                setSortType={setSortType}
                            >
                                Total score
                            </Selector>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        enhancedPlayers
                            .sort(selectSortOrder(sortOrder))
                            .map(renderPlayer)
                    }
                </tbody>
            </table>
        </div>
    );
}
