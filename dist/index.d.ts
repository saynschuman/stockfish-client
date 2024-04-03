export interface Deferred<A> {
    promise: Promise<A>;
    resolve(a: A | PromiseLike<A>): void;
    reject(err: unknown): void;
    state: "pending" | "fulfilled" | "rejected";
}
export declare function defer<A>(): Deferred<A>;
export interface PvData {
    readonly moves: ReadonlyArray<string>;
    mate?: number;
    cp?: number;
}
export interface ClientEval {
    depth?: number;
    knps?: number;
    nodes?: number;
    millis?: number;
    pvs?: PvData[];
    cloud?: boolean;
    cp?: number;
    mate?: number;
    retried?: boolean;
    gameOver?: boolean;
}
export default class StockfishClient {
    curEval?: ClientEval;
    private expectedPvs;
    private ready;
    constructor(expectedPvs: number);
    isSearching(): boolean;
    processOutput(message: MessageEvent): ClientEval | void;
}
