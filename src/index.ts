export interface Deferred<A> {
  promise: Promise<A>;
  resolve(a: A | PromiseLike<A>): void;
  reject(err: unknown): void;
  state: "pending" | "fulfilled" | "rejected";
}

export function defer<A>(): Deferred<A> {
  const deferred: Partial<Deferred<A>> = {
    state: "pending",
  };
  deferred.promise = new Promise<A>((resolve, reject) => {
    deferred.resolve = (v: A) => {
      deferred.state = "fulfilled";
      resolve(v);
    };
    deferred.reject = () => {
      deferred.state = "rejected";
      reject();
    };
  });
  return deferred as Deferred<A>;
}

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

const EVAL_REGEX = new RegExp(
  "" +
    /^info depth (\d+) seldepth \d+ multipv (\d+) /.source +
    /score (cp|mate) ([-\d]+) /.source +
    /(?:(upper|lower)bound )?nodes (\d+) nps \S+ /.source +
    /(?:hashfull \d+ )?(?:tbhits \d+ )?time (\S+) /.source +
    /pv (.+)/.source
);

export default class StockfishClient {
  public curEval?: ClientEval;
  private expectedPvs;
  private ready: Deferred<void>;

  constructor(expectedPvs: number) {
    this.ready = defer();
    this.ready.resolve();
    this.expectedPvs = expectedPvs;
  }

  public isSearching(): boolean {
    return this.ready.state === "pending";
  }

  /*
   * Stockfish output processing done here
   * Calls the 'resolve' function of the 'ready' Promise when 'bestmove' uci
   * command is sent by stockfish
   */
  public processOutput(message: MessageEvent): ClientEval | void {
    const text = message.data;

    if (text === "info depth 0 score mate 0") {
      return { gameOver: true };
    }

    if (text.indexOf("bestmove") === 0) {
      this.ready?.resolve();
    }

    const matches = EVAL_REGEX.exec(text);
    if (!matches) return;

    const depth = parseInt(matches[1]),
      multiPv = parseInt(matches[2]),
      isMate = matches[3] === "mate",
      povEv = parseInt(matches[4]),
      evalType = matches[5],
      nodes = parseInt(matches[6]),
      elapsedMs: number = parseInt(matches[7]),
      moves = matches[8].split(" ");

    // Sometimes we get #0. Let's just skip it.
    if (isMate && !povEv) return;

    // Track max pv index to determine when pv prints are done.
    if (this.expectedPvs < multiPv) this.expectedPvs = multiPv;

    // const pivot = 1
    const ev = -povEv;

    // For now, ignore most upperbound/lowerbound messages.
    // The exception is for multiPV, sometimes non-primary PVs
    // only have an upperbound.
    // See: https://github.com/ddugovic/Stockfish/issues/228
    if (evalType && multiPv === 1) return;

    const pvData = {
      moves,
      cp: isMate ? undefined : ev,
      mate: isMate ? ev : undefined,
      depth,
    };

    if (multiPv === 1) {
      this.curEval = {
        depth,
        knps: nodes / elapsedMs,
        nodes,
        cp: pvData.cp,
        mate: pvData.mate,
        pvs: [pvData],
        millis: elapsedMs,
      };
    } else if (this.curEval) {
      this.curEval.pvs?.length && this.curEval.pvs.push(pvData);
      this.curEval.depth = Math.min(this.curEval.depth || 0, depth);
    }

    if (this.curEval) {
      return this.curEval;
    }
  }
}
