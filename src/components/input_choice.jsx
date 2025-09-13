import React, { useEffect, useRef, useState } from "react";
import { formatTime } from "../utils/formart_time";
import { COLOR_CLASSES } from "../utils/class_css";
const COLS = 4;
const ROWS = 3;
const TOTAL = COLS * ROWS;
function InputChoice() {
   const solved = Array.from({ length: TOTAL }, (_, i) =>
    i < TOTAL - 1 ? i + 1 : null
  );
   const [board, setBoard] = useState(solved);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState([]);
  const [win, setWin] = useState(false);
  const histIdRef = useRef(1);

  useEffect(() => {
    function onKey(e) {
      const k = e.key.toLowerCase();
      if (!running) return;
      if (["arrowup", "w", "arrowdown", "s", "arrowleft", "a", "arrowright", "d"].includes(e.key.toLowerCase()) || ["w","a","s","d"].includes(k)) {
        e.preventDefault();
        const key = e.key;
        if (key === "ArrowUp" || k === "w") tryMove("up");
        if (key === "ArrowDown" || k === "s") tryMove("down");
        if (key === "ArrowLeft" || k === "a") tryMove("left");
        if (key === "ArrowRight" || k === "d") tryMove("right");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [board, running]);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    // check win
    if (!running) return;
    const won = board.slice(0, TOTAL - 1).every((v, i) => v === i + 1) && board[TOTAL - 1] === null;
    if (won) {
      setWin(true);
      setRunning(false);
      // save history
      setHistory(prev => [
        { id: histIdRef.current++, steps: moves, time: formatTime(seconds) },
        ...prev,
      ]);
    }
  }, [board, running, moves, seconds]);

  function swap(i, j) {
    setBoard(prev => {
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  function idxToRC(idx) {
    return { r: Math.floor(idx / COLS), c: idx % COLS };
  }

  function rcToIdx(r, c) {
    return r * COLS + c;
  }

  function neighbors(idx) {
    const { r, c } = idxToRC(idx);
    const list = [];
    if (r > 0) list.push(rcToIdx(r - 1, c));
    if (r < ROWS - 1) list.push(rcToIdx(r + 1, c));
    if (c > 0) list.push(rcToIdx(r, c - 1));
    if (c < COLS - 1) list.push(rcToIdx(r, c + 1));
    return list;
  }

  function shuffleBoard(times = 100) {
    // perform random valid moves from solved to keep solvable-ish
    let arr = [...solved];
    let blackIdx = arr.indexOf(null);
    for (let i = 0; i < times; i++) {
      const n = neighbors(blackIdx);
      const pick = n[Math.floor(Math.random() * n.length)];
      [arr[blackIdx], arr[pick]] = [arr[pick], arr[blackIdx]];
      blackIdx = pick;
    }
    setBoard(arr);
    setMoves(0);
    setSeconds(0);
    setWin(false);
  }

  function onStartToggle() {
    if (!running) {
      // start
      shuffleBoard(100);
      setRunning(true);
    } else {
      // Kết thúc pressed: stop and reset to solved
      setRunning(false);
      setBoard(solved);
      setSeconds(0);
      setMoves(0);
      setWin(false);
    }
  }

  function tryMove(direction) {
    const bIdx = board.indexOf(null);
    const { r, c } = idxToRC(bIdx);
    let target = null;
    if (direction === "up") {
      if (r < ROWS - 1) target = rcToIdx(r + 1, c); // move black up means swap with below tile? We interpret black moves by swapping with tile in direction: user spec: move black in direction by pressing keys. We'll move black in that direction if tile exists.
      // but intuitive: pressing up moves black up -> swap with tile above (r-1). To match spec "ô đen di chuyển theo hướng tương ứng", implement: pressing up moves black up if possible (swap with tile above).
      // adjust:
    }
    // To keep correct: recompute properly:
    if (direction === "up") {
      if (r > 0) target = rcToIdx(r - 1, c);
    }
    if (direction === "down") {
      if (r < ROWS - 1) target = rcToIdx(r + 1, c);
    }
    if (direction === "left") {
      if (c > 0) target = rcToIdx(r, c - 1);
    }
    if (direction === "right") {
      if (c < COLS - 1) target = rcToIdx(r, c + 1);
    }
    if (target === null) return; // boundary guard
    // swap black with target
    const targetValue = board[target];
    if (targetValue === null) return;
    swap(bIdx, target);
    setMoves(m => m + 1);
  }

  function resetAfterWin() {
    setBoard(solved);
    setMoves(0);
    setSeconds(0);
    setWin(false);
    setRunning(false);
  }
  return (
    <>
     <div className="w-[900px]  h-screen css_mtop">
      <div className=" bg-white p-9  rounded-lg shadow-md  ">
        <div className="flex items-start ">
          <div className="flex-1 m-4">
            <div className="flex justify-center mb-4">
              <button
                className={`control-btn ${running ? "bg-red-500" : "bg-emerald-500"} rounded p-10`}
                onClick={onStartToggle}
              >
                {running ? "Kết thúc" : "Bắt đầu"}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 bg-[#f7fafb] p-2    justify-center h-[300px] w-[400px]">
              {board.map((v, i) => {
                if (v === null) {
                  return (
                    <div key={i} className="tile bg-black text-white shadow-lg "></div>
                  );
                }
                const cls = COLOR_CLASSES[v] || "bg-gray-100 text-gray-500 ";
                return (
                  <div key={i} className={`tile ${cls} flex items-center justify-center shadow-lg `}>
                    {v}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-56">
            <div className="bg-green-100  p-3 rounded-md shadow mb-4 text-center">
              <div className="text-sm text-gray-600">Đồng Hồ</div>
              <div className="text-3xl font-mono mt-2">{formatTime(seconds)}</div>
            </div>

            <div className="bg-[#f8f9fa] p-3 rounded-md shadow mb-4 ">
              <div className="text-sm font-semibold mb-2">Hướng Dẫn Di Chuyển</div>
              <div className="grid grid-cols-3 gap-2 items-center ">
                <div></div>
                <div className="text-center p-1  rounded bg-[#e1e3e7]">↑</div>
                <div></div>
                <div className="text-center p-2 rounded bg-[#e1e3e7]">←</div>
                <div className="text-center p-2 rounded bg-[#e1e3e7]">↓</div>
                <div className="text-center p-2 rounded bg-[#e1e3e7]">→</div>
                <div></div>
                
                
                <div></div>
                
              </div>
                 <div className="grid grid-cols-3 gap-2 items-center">
                <div></div>
               <div className="text-center p-2 rounded bg-[#e1e3e7]">W</div>
                <div></div>
                <div className="text-center p-2 rounded bg-[#e1e3e7]">A</div>
                <div className="text-center p-2 rounded bg-[#e1e3e7]">S</div>
                <div className="text-center p-2 rounded bg-[#e1e3e7]">D</div>
                <div></div>
                
                
                <div></div>
                
              </div>
            </div>

            <div className="bg-white p-3 rounded-md shadow">
              <div className="text-sm font-semibold mb-2">Thông tin</div>
              <div className="text-sm">Bước đi: <span className="font-medium">{moves}</span></div>
              <div className="text-sm">Trạng thái: <span className="font-medium">{win ? "YOU WIN!" : running ? "Đang chơi" : "Chưa chơi"}</span></div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <div className="text-center font-semibold mb-2">Lịch Sử Lượt Chơi</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">#</th>
                  <th className="p-2">Tổng bước</th>
                  <th className="p-2">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan="3" className="p-2 text-center text-gray-500">Chưa có lượt thắng</td></tr>
                ) : history.map((h, idx) => (
                  <tr key={h.id} className="border-t">
                    <td className="p-2">{idx+1}</td>
                    <td className="p-2">{h.steps}</td>
                    <td className="p-2">{h.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {win && (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-black/50 absolute inset-0"></div>
            <div className="relative bg-white p-6 rounded shadow-lg z-10 w-96 text-center">
              <div className="text-2xl font-bold mb-3">YOU WIN!</div>
              <div className="mb-4">Thời gian: {formatTime(seconds)} · Bước: {moves}</div>
              <div className="flex justify-center gap-3">
                <button className="px-4 py-2 bg-emerald-500 text-white rounded" onClick={resetAfterWin}>Chơi lại</button>
                <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setWin(false)}>Đóng</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  )
}

export default InputChoice
