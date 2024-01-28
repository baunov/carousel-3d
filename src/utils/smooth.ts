
export type SmoothedFn = (nextValue: number, frames?: number) => { value: number; done: boolean };
export function smooth(initialValue: number, smoothFactor: number = 20, stopThreshold = 0.0001): SmoothedFn {
  const multiplier = 1 / smoothFactor;
  let prevValue = initialValue;
  return (nextValue: number, frames: number = 1) => {
    const delta = (nextValue - prevValue) * frames;
    let newValue = prevValue + delta * multiplier;
    if (Math.abs(nextValue - newValue) <= stopThreshold) {
      newValue = nextValue;
    }
    prevValue = newValue;
    return {value: newValue, done: newValue === nextValue};
  };
}
